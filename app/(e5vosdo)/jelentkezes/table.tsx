"use client";
import { siteConfig } from "@/config/site";
import { PossibleUserType } from "@/db/dbreq";
import {
  PresentationType,
  PresentationSlotType,
  SignupType,
} from "@/db/presentationSignup";
import {
  addToast,
  Button,
  ButtonGroup,
  closeAll,
  Select,
  SelectItem,
  ToastProvider,
} from "@heroui/react";
import React, { useEffect, useState } from "react";

const Field = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={"space-y-2 p-2 " + className}>{children}</div>;
};

const Table = ({
  selfUser,
  EXTERNAL_SIGNUPS,
  EXTERNAL_SIGNUPS_PRESENTATION_LIMIT,
}: {
  selfUser: PossibleUserType;
  EXTERNAL_SIGNUPS: boolean;
  EXTERNAL_SIGNUPS_PRESENTATION_LIMIT: number | null;
}) => {
  const [presentations, setPresentations] = useState<PresentationType[]>();
  const [isFetchingAutomatically, setIsFetchingAutomatically] = useState<
    boolean | null
  >(null);
  const [slots, setSlots] = useState<PresentationSlotType[]>();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  // Slot-onkénti kiválasztott előadások: {slot_id: presentation_id}
  const [selectedBySlot, setSelectedBySlot] = useState<{
    [slot_id: number]: number | null;
  }>({});
  const [signupAmounts, setSignupAmounts] = useState<{
    [slot_id: number]: number;
  }>({});
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  // External signup data
  const [omId, setOmId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const isVerified = selfUser?.is_verified;

  const presName = EXTERNAL_SIGNUPS ? "Óra" : "Előadás";
  const presNamePrep = EXTERNAL_SIGNUPS ? "órára" : "előadásra";
  const presNamePlural = EXTERNAL_SIGNUPS ? "Órák" : "Előadások";

  async function initData() {
    const presRes = await fetch("/api/presentations/getPresentations");
    const presData = await presRes.json();
    setPresentations(presData);

    if (!EXTERNAL_SIGNUPS) await loadMySignups();

    const slotsRes = await fetch("/api/presentations/getPresentationSlots");
    const slotsData = await slotsRes.json();
    setSlots(slotsData);

    for (const slot of slotsData as PresentationSlotType[]) {
      setSelectedBySlot((prev) => {
        // Only set to null if not already set (preserves signups loaded earlier)
        if (slot.id in prev) return prev;
        return { ...prev, [slot.id]: null };
      });
      setSignupAmounts((prev) => {
        if (slot.id in prev) return prev;
        return { ...prev, [slot.id]: 1 };
      });
    }

    setSelectedSlot(slotsData[0]?.id || null);
  }

  async function loadMySignups() {
    let mySignupsData = [];
    if (EXTERNAL_SIGNUPS && omId) {
      const details = JSON.stringify({
        omId: omId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
      });
      const mySignupsRes = await fetch("/api/presentations/getMySignups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details }),
      });
      mySignupsData = await mySignupsRes.json();
    } else if (!EXTERNAL_SIGNUPS) {
      const mySignupsRes = await fetch("/api/presentations/getMySignups");
      mySignupsData = await mySignupsRes.json();
    }

    // Slot-alapú kiválasztások és mennyiségek feltöltése
    const slotSelections: { [slot_id: number]: number | null } = {};
    const amounts: { [slot_id: number]: number } = {};
    if (Array.isArray(mySignupsData)) {
      for (const signup of mySignupsData as SignupType[]) {
        console.log("Hi");
        setSelectedBySlot((prev) => ({
          ...prev,
          [signup.slot_id]: signup.presentation_id,
        }));
        slotSelections[signup.slot_id] = signup.presentation_id;
        amounts[signup.slot_id] = signup.amount;
      }
    }

    // setSelectedBySlot((prev) => ({ ...prev, ...slotSelections }));
    setSignupAmounts((prev) => ({ ...prev, ...amounts }));

    console.log(JSON.stringify(mySignupsData));
    console.log(JSON.stringify(slotSelections));
    console.log(JSON.stringify(selectedBySlot));
  }

  // imételje 5 mp enként
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log(JSON.stringify(selectedBySlot));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const [evtSource, setEvtSource] = useState<EventSource | null>(null);

  const setupSSE = () => {
    // Clean up existing connection if any
    if (evtSource) {
      console.log(
        "Cleaning up existing SSE connection before creating new one",
      );
      evtSource.close();
    }

    console.log("Setting up new SSE connection");
    const newEvtSource = new EventSource("/api/presentations/sseCapacity");
    setEvtSource(newEvtSource);
    setIsFetchingAutomatically(null);

    newEvtSource.onmessage = (event) => {
      setIsFetchingAutomatically(true);
      try {
        const capacityData: { [key: number]: number } | { message: string } =
          JSON.parse(event.data);

        if (!("message" in capacityData))
          setPresentations((prev) =>
            prev?.map((p) => ({
              ...p,
              remaining_capacity: capacityData[p.id],
            })),
          );
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }

      setLastUpdated(Date.now());
    };

    newEvtSource.onerror = (err) => {
      console.error("EventSource encountered an error:", err);
      newEvtSource.close();
      setEvtSource(null);
      setIsFetchingAutomatically(false);
    };

    return () => {
      console.log("Cleaning up SSE connection");
      newEvtSource.close();
      setEvtSource(null);
      setIsFetchingAutomatically(false);
    };
  };

  useEffect(() => {
    if (lastUpdated === null) return;

    const timeoutId = setTimeout(() => {
      if (Date.now() - lastUpdated > 20000) {
        setIsFetchingAutomatically(false);
        console.warn("Automatic fetching seems to have stopped.");
      }
    }, 20000);

    return () => clearTimeout(timeoutId);
  }, [lastUpdated]);

  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    if (isFetchingAutomatically === false) {
      // Add exponential backoff for reconnection attempts
      const reconnectDelay = Math.min(
        1000 * Math.pow(2, reconnectAttempts),
        12000,
      ); // Max 12 second delay

      console.log(
        `Scheduling reconnection attempt ${reconnectAttempts + 1} in ${reconnectDelay}ms`,
      );

      const timeoutId = setTimeout(() => {
        setReconnectAttempts((prev) => prev + 1);
        setupSSE();
      }, reconnectDelay);

      if (!isToastVisible) {
        setIsToastVisible(true);
        addToast({
          title: "Az automatikus frissítés leállt. Újrakapcsolódás...",
          timeout: Infinity,
          color: "warning",
        });
      }

      return () => clearTimeout(timeoutId);
    }

    if (isFetchingAutomatically === true) {
      setReconnectAttempts(0);
      setIsToastVisible(false);
      closeAll();
    }
  }, [isFetchingAutomatically]);

  useEffect(() => {
    initData().then(() => setupSSE());

    // Cleanup on component unmount
    return () => {
      if (evtSource) {
        console.log("Component unmounting - cleaning up SSE connection");
        evtSource.close();
      }
    };
  }, []);

  const [isValidExternalData, setIsValidExternalData] = useState(false);
  useEffect(() => {
    setIsValidExternalData(() => {
      if (!EXTERNAL_SIGNUPS) return true;

      return (
        /^\d{11}$/.test(omId.trim()) &&
        fullName.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      );
    });
  }, [EXTERNAL_SIGNUPS, omId, fullName, email]);

  useEffect(() => {
    if (!EXTERNAL_SIGNUPS) return;
    if (isValidExternalData) loadMySignups();
    else setSelectedBySlot({});
  }, [EXTERNAL_SIGNUPS, isValidExternalData]);

  const signup = async (presentation_id: number) => {
    if (!EXTERNAL_SIGNUPS && !isVerified) {
      alert(
        `Csak igazolt diákok jelentkezhetnek előadásra. Probléma esetén értesítendő: ${siteConfig.developer} (${siteConfig.developerEmail})`,
      );
      return;
    }

    if (!selectedSlot) return;

    const amount = signupAmounts[selectedSlot] || 1;
    let details = null;

    // External signups: validate and prepare details
    if (EXTERNAL_SIGNUPS) {
      if (!omId.trim() || !fullName.trim() || !email.trim()) {
        alert("Kérjük, töltsd ki az összes mezőt (OM azonosító, Név, Email)!");
        return;
      }

      // Validate OM ID format (11 digits)
      if (!/^\d{11}$/.test(omId.trim())) {
        alert("Az OM azonosító 11 számjegyből kell álljon!");
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        alert("Kérjük, adj meg egy érvényes email címet!");
        return;
      }

      details = JSON.stringify({
        omId: omId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
      });
    }

    let signupsCount = 0;

    for (const pres of Object.values(selectedBySlot)) {
      if (pres !== null) signupsCount++;
    }

    if (
      selectedBySlot[selectedSlot] === null ||
      selectedBySlot[selectedSlot] === undefined
    ) {
      signupsCount++;
    } else if (
      !confirm(
        `Ebben a sávban már jelentkeztél az alábbira: ${
          presentations?.find((p) => p.id === selectedBySlot[selectedSlot])
            ?.title
        }. Felülírod a jelentkezésed?`,
      )
    ) {
      return;
    }

    if (
      EXTERNAL_SIGNUPS &&
      EXTERNAL_SIGNUPS_PRESENTATION_LIMIT !== null &&
      signupsCount > EXTERNAL_SIGNUPS_PRESENTATION_LIMIT
    ) {
      alert(
        `Legfeljebb ${EXTERNAL_SIGNUPS_PRESENTATION_LIMIT} előadásra jelentkezhetsz!`,
      );
      return;
    }

    const response = await fetch("/api/presentations/signUpForPresentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        presentation_id,
        slot_id: selectedSlot,
        amount,
        details,
      }),
    });

    if (response.ok) {
      setSelectedBySlot((prev) => ({
        ...prev,
        [selectedSlot]: presentation_id,
      }));

      if (EXTERNAL_SIGNUPS) {
        await loadMySignups();
      }

      alert("Sikeres jelentkezés");
    } else {
      const errorData = await response.json();
      alert(
        `Sikertelen jelentkezés: ${errorData.error?.message || "Ismeretlen hiba"}`,
      );
    }
  };

  function scrollToPresentationDetails() {
    const element = document.getElementById(
      "presentation-card-" +
        (selectedSlot === null ? "" : selectedBySlot[selectedSlot]),
    );
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }

  const currentSlotTitle =
    slots?.find((s) => s.id === selectedSlot)?.title || "";

  return (
    <div>
      {EXTERNAL_SIGNUPS && (
        <div className="mb-6 rounded-xl border-2 border-selfprimary-400 bg-selfprimary-100 p-4">
          <h2 className="mb-3 text-xl font-bold">Jelentkező adatai</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="om-id" className="mb-1 block font-medium">
                OM azonosító
              </label>
              <input
                id="om-id"
                type="text"
                className="w-full rounded-md border border-foreground-300 bg-foreground-100 p-2"
                placeholder="11 számjegy"
                maxLength={11}
                value={omId}
                onChange={(e) => setOmId(e.target.value.replaceAll(/\D/g, ""))}
              />
              <p className="mt-1 text-xs text-foreground-600">
                Például: 12345678901
              </p>
            </div>
            <div>
              <label htmlFor="full-name" className="mb-1 block font-medium">
                Teljes név
              </label>
              <input
                id="full-name"
                type="text"
                className="w-full rounded-md border border-foreground-300 bg-foreground-100 p-2"
                placeholder="Vezetéknév Keresztnév"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block font-medium">
                Email cím
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-md border border-foreground-300 bg-foreground-100 p-2"
                placeholder="pelda@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 grid gap-2 text-center max-md:gap-3 md:grid-cols-2">
        <div className="flex flex-col rounded-xl bg-selfprimary-200 p-2">
          <p>Kiválasztva ({currentSlotTitle}):</p>
          <p className="text-xl font-bold">
            {
              presentations?.find(
                (presentation) =>
                  selectedSlot !== null &&
                  presentation.id === selectedBySlot[selectedSlot],
              )?.title
            }
            {(selectedSlot === null ||
              selectedBySlot[selectedSlot] === null ||
              selectedBySlot[selectedSlot] === undefined) &&
              "Nincs kiválasztva"}
          </p>
          {EXTERNAL_SIGNUPS &&
            selectedSlot !== null &&
            selectedBySlot[selectedSlot] !== null &&
            selectedBySlot[selectedSlot] !== undefined && (
              <p className="mt-1 text-sm italic">
                Jelentkezett létszám: {signupAmounts[selectedSlot] || 1} fő
              </p>
            )}
          {EXTERNAL_SIGNUPS &&
            selectedSlot !== null &&
            (selectedBySlot[selectedSlot] === null ||
              selectedBySlot[selectedSlot] === undefined) && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <p className="text-sm">Létszám:</p>
                <ButtonGroup size="sm">
                  <Button
                    color={
                      signupAmounts[selectedSlot] === 1 ? "primary" : "default"
                    }
                    onPress={() =>
                      setSignupAmounts((prev) => ({
                        ...prev,
                        [selectedSlot]: 1,
                      }))
                    }
                  >
                    1 fő
                  </Button>
                  <Button
                    color={
                      signupAmounts[selectedSlot] === 2 ? "primary" : "default"
                    }
                    onPress={() =>
                      setSignupAmounts((prev) => ({
                        ...prev,
                        [selectedSlot]: 2,
                      }))
                    }
                  >
                    2 fő
                  </Button>
                </ButtonGroup>
              </div>
            )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              color="primary"
              isDisabled={
                selectedSlot === null ||
                selectedBySlot[selectedSlot] === null ||
                selectedBySlot[selectedSlot] === undefined
              }
              onPress={scrollToPresentationDetails}
            >
              {presName} részletei
            </Button>
            <Button
              variant="bordered"
              color="danger"
              isDisabled={
                selectedSlot === null ||
                selectedBySlot[selectedSlot] === null ||
                selectedBySlot[selectedSlot] === undefined
              }
              onPress={async () => {
                if (!selectedSlot) return;

                if (!confirm("Biztosan törölni szeretnéd a jelentkezésedet?"))
                  return;

                const body: any = {
                  presentation_id: "NULL",
                  slot_id: selectedSlot,
                };

                if (EXTERNAL_SIGNUPS) {
                  body.details = JSON.stringify({
                    omId: omId.trim(),
                    fullName: fullName.trim(),
                    email: email.trim(),
                  });
                }

                const response = await fetch(
                  "/api/presentations/signUpForPresentation",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  },
                );
                if (response.ok) {
                  setSelectedBySlot((prev) => ({
                    ...prev,
                    [selectedSlot]: null,
                  }));

                  if (EXTERNAL_SIGNUPS) {
                    await loadMySignups();
                  }

                  alert("Sikeres törlés");
                } else {
                  const errorData = await response.json();
                  alert(
                    `Sikertelen törlés: ${errorData.error?.message || "Ismeretlen hiba"}`,
                  );
                }
              }}
            >
              Kiválasztás törlése
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col rounded-xl bg-selfprimary-200 p-2">
            <p>Automatikus frissítés:</p>
            <p className="text-xl font-bold">
              {isFetchingAutomatically ? "Be" : "Ki"}
            </p>
          </div>
          <div className="flex flex-col rounded-xl bg-selfprimary-200 p-2">
            <p>{presName}sáv:</p>
            <Select
              aria-label="Előadássáv kiválasztása"
              selectedKeys={selectedSlot ? [selectedSlot.toString()] : []}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                if (key) {
                  setSelectedSlot(Number.parseInt(key.toString()));
                }
              }}
              placeholder="Válassz előadássávot"
              className="max-w-xs"
            >
              {slots?.map((slot) => {
                let itemClassName = "border-selfprimary ";
                let backgroundImage = undefined;

                if (selectedSlot === slot.id) itemClassName += "border-4  ";

                if (selectedBySlot[slot.id]) {
                  itemClassName += "bg-success-300 text-success-900";
                } else {
                  let remainingCapacityInThisSlot = 0;
                  let maxCapacityInThisSlot = 0;
                  for (const p of presentations ?? []) {
                    maxCapacityInThisSlot += p.capacity;
                    if (p.slot_id === slot.id)
                      remainingCapacityInThisSlot += p.remaining_capacity ?? 0;
                  }

                  backgroundImage = `linear-gradient(270deg, transparent ${
                    100 -
                    (remainingCapacityInThisSlot / maxCapacityInThisSlot) * 100
                  }%, var(--color-primary-200) ${
                    100 -
                    (remainingCapacityInThisSlot / maxCapacityInThisSlot) * 100
                  }%)`;

                  if (remainingCapacityInThisSlot === 0) {
                    backgroundImage = undefined;
                    itemClassName += "bg-danger-50 text-danger-900";
                  }
                }

                return (
                  <SelectItem
                    key={slot.id}
                    className={itemClassName}
                    style={{
                      backgroundImage: backgroundImage,
                    }}
                    color={selectedBySlot[slot.id] ? "success" : "primary"}
                    classNames={{ selectedIcon: "hidden" }}
                    endContent={selectedBySlot[slot.id] ? "✓" : ""}
                  >
                    {slot.title}
                  </SelectItem>
                );
              }) || []}
            </Select>
          </div>

          <div className="col-span-2 flex flex-col rounded-xl bg-selfprimary-200 p-2">
            <p>{presName}sáv részletei:</p>
            <p className="font-xl font-bold">
              {slots?.find((s) => s.id === selectedSlot)?.details ||
                "Nincsenek részletek"}
            </p>
          </div>
        </div>

        {Number.isInteger(EXTERNAL_SIGNUPS_PRESENTATION_LIMIT) && (
          <div className="rounded-xl bg-selfprimary-200 p-2 md:col-span-2">
            <p className="font-xl font-bold">
              Legfeljebb {EXTERNAL_SIGNUPS_PRESENTATION_LIMIT}{" "}
              {presNamePrep.toLowerCase()}ra jelentkezhetsz.
            </p>
          </div>
        )}
      </div>

      <div className="z-100 fixed">
        <ToastProvider placement="top-center" toastOffset={60} />
      </div>

      <div className="grid grid-cols-5 gap-4 text-2xl font-extrabold max-md:hidden">
        <Field className="md:col-span-2">Név és Leírás</Field>
        <Field className="md:col-span-2">Részletek</Field>
        <Field>Szabad helyek</Field>
      </div>
      {presentations === undefined && (
        <div className="text-center">Betöltés...</div>
      )}
      {presentations?.length === 0 && (
        <div className="text-center">Nincsenek elérhető {presNamePlural}.</div>
      )}
      {presentations
        ?.filter((presentation) => presentation.slot_id === selectedSlot)
        ?.map((presentation) => (
          <div
            id={`presentation-card-${presentation.id}`}
            key={presentation.id}
            className="my-2 grid overflow-hidden rounded-xl border-2 border-selfprimary-400 bg-selfprimary-100 md:grid-cols-5 md:gap-4"
          >
            <Field className="bg-selfprimary-200 md:col-span-2">
              <div>
                <div className="text-lg font-bold">{presentation.title}</div>

                {presentation.performer && (
                  <p className="italic">{presentation.performer}</p>
                )}

                {presentation.performer && (
                  <p className="font-bold text-selfsecondary">
                    {presentation.requirements}
                  </p>
                )}
                <br />
                <p className="info">
                  Maximális létszám: {presentation.capacity} fő
                </p>
                {presentation.address && (
                  <p className="info">Helyszín: {presentation.address}</p>
                )}
              </div>
            </Field>
            <Field className="md:col-span-2">
              <div>{presentation.description}</div>
            </Field>
            <Field className="bg-selfprimary-200 text-center max-md:flex max-md:items-center max-md:justify-between max-md:gap-2 max-md:space-y-0">
              <p className="h-7 md:hidden">Szabad helyek:</p>
              <p className="text-xl font-bold">
                {presentation.remaining_capacity ?? "-"}
              </p>
              <Button
                color={
                  selectedSlot !== null &&
                  selectedBySlot[selectedSlot] === presentation.id
                    ? "success"
                    : undefined
                }
                style={
                  selectedSlot === null ||
                  selectedBySlot[selectedSlot] !== presentation.id
                    ? {
                        backgroundSize: "100% 100%",
                        backgroundPosition: "0 0",
                        backgroundRepeat: "no-repeat",
                        backgroundImage: `linear-gradient(270deg, var(--color-secondary-50) ${
                          100 -
                          ((presentation.remaining_capacity ?? 0) /
                            presentation.capacity) *
                            100
                        }%, var(--color-secondary-300) ${
                          100 -
                          ((presentation.remaining_capacity ?? 0) /
                            presentation.capacity) *
                            100
                        }%)`,
                      }
                    : {}
                }
                isDisabled={
                  (selectedSlot !== null &&
                    selectedBySlot[selectedSlot] === presentation.id) ||
                  presentation.remaining_capacity === 0 ||
                  (EXTERNAL_SIGNUPS && !isValidExternalData) ||
                  presentation.remaining_capacity === null ||
                  (EXTERNAL_SIGNUPS &&
                    selectedSlot !== null &&
                    (presentation.remaining_capacity ?? 0) <
                      (signupAmounts[selectedSlot] || 1))
                }
                onPress={() => signup(presentation.id)}
              >
                {(() => {
                  if (
                    selectedSlot !== null &&
                    selectedBySlot[selectedSlot] === presentation.id
                  )
                    return "Jelentkezve";
                  if (presentation.remaining_capacity === 0) return "Betelt";
                  if (EXTERNAL_SIGNUPS && selectedSlot !== null) {
                    const amount = signupAmounts[selectedSlot] || 1;
                    return `Jelentkezés (${amount} fő)`;
                  }
                  return "Jelentkezés";
                })()}
              </Button>
            </Field>
          </div>
        ))}
    </div>
  );
};

export default Table;
