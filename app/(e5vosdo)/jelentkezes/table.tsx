"use client";
import { PresentationType } from "@/db/presentationSignup";
import { Button, ButtonGroup } from "@heroui/react";
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

const Table = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>();
  const [isFetchingAutomatically, setIsFetchingAutomatically] = useState<
    boolean | null
  >(null);
  const [slots, setSlots] = useState<string[]>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  // Slot-onkénti kiválasztott előadások: {slot: presentation_id}
  const [selectedBySlot, setSelectedBySlot] = useState<{
    [slot: string]: number | null;
  }>({});

  async function initData() {
    const presRes = await fetch("/api/presentations/getPresentations");
    const presData = await presRes.json();
    setPresentations(presData);

    const myPresRes = await fetch("/api/presentations/getMyPresentations");
    const myPres = await myPresRes.json();

    // Slot-alapú kiválasztások feltöltése
    const slotSelections: { [slot: string]: number | null } = {};
    if (Array.isArray(myPres)) {
      myPres.forEach((pres: PresentationType) => {
        slotSelections[pres.slot] = pres.id;
      });
    }

    const slotsRes = await fetch("/api/presentations/getSlots");
    const slotsData = await slotsRes.json();
    setSlots(slotsData);

    // Inicializáljuk az összes slot-ot null-lal, ha nincs kiválasztás
    slotsData.forEach((slot: string) => {
      if (!(slot in slotSelections)) {
        slotSelections[slot] = null;
      }
    });

    setSelectedBySlot(slotSelections);
    setSelectedSlot(slotsData[0] || null);
  }

  const setupSSE = () => {
    const evtSource = new EventSource("/api/presentations/sseCapacity");
    setIsFetchingAutomatically(null);

    evtSource.onmessage = (event) => {
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
    };

    evtSource.onerror = (err) => {
      console.error("EventSource encountered an error:", err);
      evtSource.close();
      setIsFetchingAutomatically(false);
    };

    return () => {
      evtSource.close();
      setIsFetchingAutomatically(false);
    };
  };

  useEffect(() => {
    if (isFetchingAutomatically === false) setupSSE();
  }, [isFetchingAutomatically]);

  useEffect(() => {
    initData().then(() => setupSSE());
  }, []);

  const signup = async (presentation_id: number) => {
    if (!selectedSlot) return;

    const response = await fetch("/api/presentations/signUpForPresentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presentation_id, slot: selectedSlot }),
    });

    if (response.ok) {
      setSelectedBySlot((prev) => ({
        ...prev,
        [selectedSlot]: presentation_id,
      }));
      alert("Sikeres jelentkezés");
    } else {
      const errorData = await response.json();
      alert(
        `Sikertelen jelentkezés: ${errorData.error?.message || "Ismeretlen hiba"}`,
      );
    }
  };

  return (
    <div>
      <div className="mb-3 grid text-center max-md:gap-3 md:grid-cols-2">
        <div className="ml-2 flex flex-col rounded-xl bg-selfprimary-200 p-2">
          <p>Kiválasztva ({selectedSlot}):</p>
          <p className="text-xl font-bold">
            {
              presentations?.find(
                (presentation) =>
                  presentation.id === selectedBySlot[selectedSlot || ""],
              )?.title
            }
            {(selectedBySlot[selectedSlot || ""] === null ||
              selectedBySlot[selectedSlot || ""] === undefined) &&
              "Nincs kiválasztva"}
          </p>
          <Button
            color="primary"
            isDisabled={
              selectedBySlot[selectedSlot || ""] === null ||
              selectedBySlot[selectedSlot || ""] === undefined
            }
            onPress={async () => {
              if (!selectedSlot) return;

              const response = await fetch(
                "/api/presentations/signUpForPresentation",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    presentation_id: "NULL",
                    slot: selectedSlot,
                  }),
                },
              );
              if (response.ok) {
                setSelectedBySlot((prev) => ({
                  ...prev,
                  [selectedSlot]: null,
                }));
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

        <div className="mb-3 grid grid-cols-2">
          <div className="ml-2 flex flex-col rounded-xl bg-selfprimary-200 p-2">
            <p>Automatikus frissítés:</p>
            <p className="text-xl font-bold">
              {isFetchingAutomatically ? "Be" : "Ki"}
            </p>
          </div>
          <div className="ml-2 flex flex-col rounded-xl bg-selfprimary-200 p-2">
            <p>Előadássáv:</p>
            <ButtonGroup>
              {slots?.map((slot) => {
                let buttonColor: "success" | "primary" | undefined = undefined;
                if (selectedSlot === slot) {
                  buttonColor = "success";
                } else if (selectedBySlot[slot]) {
                  buttonColor = "primary";
                }

                return (
                  <Button
                    key={slot}
                    isDisabled={selectedSlot === slot}
                    color={buttonColor}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    {slot} {selectedBySlot[slot] ? "✓" : ""}
                  </Button>
                );
              })}
            </ButtonGroup>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 text-2xl font-extrabold max-md:hidden">
        <Field className="md:col-span-2">Név és Leírás</Field>
        <Field className="md:col-span-2">Részletek</Field>
        <Field>Szabad helyek</Field>
      </div>
      {presentations === undefined && (
        <div className="text-center">Betöltés...</div>
      )}
      {presentations
        ?.filter((presentation) => presentation.slot === selectedSlot)
        ?.map((presentation) => (
          <div
            key={presentation.id}
            className="my-2 grid overflow-hidden rounded-xl border-2 border-selfprimary-400 bg-selfprimary-100 md:grid-cols-5 md:gap-4"
          >
            <Field className="bg-selfprimary-200 md:col-span-2">
              <div>
                <div className="font-bold underline">
                  {presentation.id}. {presentation.title}
                </div>
                <p>{presentation.requirements}</p>
                <br />
                <p className="info">
                  Maximális létszám: {presentation.capacity}
                </p>
                <p className="info">{presentation.address}</p>
              </div>
            </Field>
            <Field className="md:col-span-2">
              <div>
                {presentation.performer && (
                  <p className="font-semibold">
                    Előadó: {presentation.performer}
                  </p>
                )}
                <div>{presentation.description}</div>
              </div>
            </Field>
            <Field className="bg-selfprimary-200 text-center">
              <p className="md:hidden">Szabad helyek:</p>
              <p className="text-xl font-bold">
                {presentation.remaining_capacity ?? "-"}
              </p>
              <Button
                color={
                  selectedBySlot[selectedSlot || ""] === presentation.id
                    ? "success"
                    : undefined
                }
                style={
                  selectedBySlot[selectedSlot || ""] !== presentation.id
                    ? {
                        backgroundSize: "100% 100%",
                        backgroundPosition: "0 0",
                        backgroundRepeat: "no-repeat",
                        backgroundImage: `linear-gradient(90deg, var(--color-secondary-300) ${
                          100 -
                          (presentation.remaining_capacity /
                            presentation.capacity) *
                            100
                        }%, var(--color-secondary-50) ${
                          100 -
                          (presentation.remaining_capacity /
                            presentation.capacity) *
                            100
                        }%)`,
                      }
                    : {}
                }
                isDisabled={
                  selectedBySlot[selectedSlot || ""] === presentation.id
                }
                onPress={() => signup(presentation.id)}
              >
                {selectedBySlot[selectedSlot || ""] === presentation.id
                  ? "Jelentkezve"
                  : "Jelentkezés"}
              </Button>
            </Field>
          </div>
        ))}
    </div>
  );
};

export default Table;
