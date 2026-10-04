"use client";
import SearchUser from "@/components/searchUser";
import Tray from "@/components/tray";
import type { Parlament } from "@/types/parliaments";
import { EJG_CLASSES } from "@/public/getUserClass";
import { Button, Link } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { PossibleUserType } from "@/db/dbreq";
import LoginButton from "@/components/LoginButton";

interface Props {
  parlamentId: number;
  initialParlament: Parlament;
  initialParticipants: Record<string, string[]>;
  initialApplicants: Record<string, string[]>;
  usersNameByEmail: Record<string, string | { name: string; class: string }>;
  canEdit: boolean;
  selfUser: PossibleUserType;
  userClass: string | null;
}

interface Participant {
  email: string;
  class: string;
  type: "appearer" | "previous" | "applied";
}

const TRANSLATION = {
  appearer: "Jelen",
  previous: "Korábbi",
  applied: "Kérvénylő",
};

async function fetchPreviousParticipants(
  parlamentId: number,
): Promise<Record<string, string[]> | undefined> {
  try {
    const res = await fetch("/api/parliaments");
    if (!res.ok) {
      throw new Error("Failed to fetch parlaments. Status: " + res.status);
    }

    const data: Parlament[] = await res.json();
    const previousParlamentId = data
      ?.toSorted((a, b) => a.id - b.id)
      .reverse()
      .find((p) => p.id < parlamentId)?.id;

    if (!Number.isInteger(previousParlamentId)) {
      console.warn("No previous parlament found for parlamentId:", parlamentId);
      return;
    }

    if (previousParlamentId) {
      const resp = await fetch(
        `/api/parliaments/participants?parlamentId=${previousParlamentId}`,
      );
      if (resp.ok) {
        return await resp.json();
      }
    }
  } catch (error) {
    console.error("Error fetching previous participants:", error);
  }
}

function deleteParlament(parlamentId: number) {
  const confirmation = window.confirm(
    "Biztosan törölni szeretnéd ezt a parlamentet? Ez a művelet nem visszavonható.",
  );
  if (!confirmation) return;

  void fetch("/api/parliaments/parliament", {
    method: "DELETE",
    body: JSON.stringify({ parlamentId }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.ok) {
      alert("Parlament sikeresen törölve");
      window.location.href = "/parlament";
    } else {
      alert("Hiba a parlament törlése közben");
    }
  });
}

async function applyToParliament(
  parliamentId: number,
  setApplicantsHandler: () => void,
) {
  try {
    const response = await fetch("/api/parliaments/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parliamentId }),
    });

    if (response.ok) {
      setApplicantsHandler();
      alert("Sikeres jelentkezés a parlamentre");
    } else {
      const body = (await response.json()) as { error?: string };
      alert(body.error ?? "Hiba a parlamentre jelentkezés közben");
    }
  } catch (error) {
    console.error("Error applying to parlament:", error);
    alert("Hiba a parlamentre jelentkezés közben");
  }
}

const ParlamentIDClient = ({
  parlamentId,
  initialParlament,
  initialParticipants,
  initialApplicants,
  usersNameByEmail,
  canEdit,
  selfUser,
  userClass,
}: Props) => {
  const [appearerParticipants, setAppearerParticipants] =
    useState<Record<string, string[]>>(initialParticipants);
  const [previousParlamentParticipants, setPreviousParlamentParticipants] =
    useState<Record<string, string[]>>({});
  const [applicants, setApplicants] = useState(initialApplicants);
  const [isEditing, setIsEditing] = useState(false);

  const mergedParticipants = useMemo(() => {
    const merged: Participant[] = [];

    Object.entries(appearerParticipants).forEach(([group, emails]) => {
      emails.forEach((email) => {
        merged.push({ email, class: group, type: "appearer" });
      });
    });

    Object.entries(applicants).forEach(([group, emails]) => {
      emails.forEach((email) => {
        if (!appearerParticipants[group]?.includes(email))
          merged.push({ email, class: group, type: "applied" });
      });
    });

    Object.entries(previousParlamentParticipants).forEach(([group, emails]) => {
      emails.forEach((email) => {
        if (
          !appearerParticipants[group]?.includes(email) &&
          !applicants[group]?.includes(email)
        )
          merged.push({ email, class: group, type: "previous" });
      });
    });

    return merged;
  }, [appearerParticipants, previousParlamentParticipants, applicants]);

  const registerToParlament = (email: string, group: string) => {
    void fetch("/api/parliaments/participants", {
      method: "POST",
      body: JSON.stringify({
        email,
        group,
        parlamentId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.ok) {
        setAppearerParticipants((prev) => ({
          ...prev,
          [group]: [...(appearerParticipants[group] ?? []), email],
        }));
      } else {
        alert("Hiba a regisztráció közben");
      }
    });
  };

  const unregisterFromParlament = async (email: string, group: string) => {
    try {
      const res = await fetch("/api/parliaments/participants", {
        method: "DELETE",
        body: JSON.stringify({
          email,
          group,
          parlamentId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const updatedGroup = appearerParticipants[group].filter(
          (e) => e !== email,
        );
        setAppearerParticipants((prev) => ({
          ...prev,
          [group]: updatedGroup,
        }));
      } else {
        alert("Hiba a regisztráció törlésekor");
      }
    } catch (error) {
      console.error("Error unregistering from parlament:", error);
      alert("Hiba a regisztráció törlésekor");
    }
  };

  useEffect(() => {
    void fetchPreviousParticipants(parlamentId).then((data) => {
      if (data) setPreviousParlamentParticipants(data);
    });
  }, [parlamentId]);

  const getRowClasses = (type: "appearer" | "previous" | "applied") => {
    if (!isEditing && type !== "appearer") return "hidden";
    if (isEditing && type === "appearer")
      return "bg-success text-black cursor-pointer";
    if (isEditing && type === "applied")
      return "bg-warning text-black cursor-pointer";
    if (isEditing) return "cursor-pointer";
  };

  const getRowClickHandler = (
    type: "appearer" | "previous" | "applied",
    email: string,
    group: string,
  ) => {
    if (!isEditing) return undefined;
    if (type === "appearer") return () => unregisterFromParlament(email, group);
    return () => registerToParlament(email, group);
  };

  const ApplyButton = () => {
    if (!selfUser) return <LoginButton />;

    if (!userClass) {
      return (
        <Link
          href="/me"
          className="mt-1 w-full rounded-lg bg-warning p-2 text-center font-semibold text-black"
        >
          Add meg az EJG kódodat a profilodban
        </Link>
      );
    }

    // isParticipant (is_applicant is false)
    if (appearerParticipants[userClass]?.includes(selfUser?.email)) {
      return (
        <Button color="success" isDisabled={true} className="mt-1 w-full">
          Már részvevő vagy
        </Button>
      );
    }

    // isApplicant (is_applicant is true)
    if (applicants[userClass]?.includes(selfUser?.email)) {
      return (
        <Button color="warning" isDisabled={true} className="mt-1 w-full">
          Már jelentkeztél
        </Button>
      );
    }

    return (
      <Button
        color="success"
        isDisabled={!userClass}
        className="mt-1 w-full"
        onPress={() =>
          applyToParliament(parlamentId, () => {
            setApplicants((prev) => ({
              ...prev,
              [userClass]: [...(applicants[userClass] ?? []), selfUser.email],
            }));
          })
        }
      >
        Képviselő részt veszek
      </Button>
    );
  };

  return (
    <Tray title={initialParlament.title} colorVariant="dark">
      <p>
        Időpont:{" "}
        {new Date(initialParlament.date).toLocaleString("hu-HU", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </p>

      <div className="my-2 rounded-xl bg-foreground/10 p-3 text-center">
        <p>Saját adatok</p>
        <p>
          {selfUser?.email} ({userClass ?? "Osztály nem meghatározható"})
        </p>
        <ApplyButton />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          hidden={!canEdit}
          color={isEditing ? "danger" : "success"}
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Szerkesztés befejezése" : "Szerkesztés indítása"}
        </Button>

        <Button
          hidden={!canEdit}
          color="danger"
          onPress={() => deleteParlament(initialParlament.id)}
          isDisabled={
            !Object.values(appearerParticipants).every(
              (group) => group.length === 0,
            )
          }
        >
          Üres parlament törlése
        </Button>
      </div>

      <div>
        {EJG_CLASSES.map((group) => (
          <div key={group} className="my-2 border-b-1 py-2">
            <div className="flex gap-2">
              <div
                className={
                  "text-xl font-extrabold " +
                  (!appearerParticipants[group]?.length ? "bg-danger-300" : "")
                }
              >
                {group}
              </div>

              {isEditing && (
                <SearchUser
                  addCustomParticipant={true}
                  onSelectEmail={(email) => {
                    registerToParlament(email, group);
                  }}
                  usersNameByEmail={usersNameByEmail}
                  label="Képviselő keresése"
                  placeholder="Írj be egy résztvevőt..."
                  size="sm"
                />
              )}
            </div>

            <div className="my-2 overflow-hidden rounded-xl bg-foreground/10">
              {mergedParticipants
                .filter((p) => p.class === group)
                .map((p) => (
                  <button
                    key={p.email + p.type}
                    className={`flex w-full items-center gap-2 border-t-1 border-foreground/20 p-3 text-left text-sm first:border-t-0 ${getRowClasses(p.type)}`}
                    onClick={getRowClickHandler(p.type, p.email, group)}
                    disabled={!isEditing}
                    hidden={!canEdit && p.type === "previous"}
                  >
                    <div className="w-16 shrink-0">{TRANSLATION[p.type]}</div>
                    {p.email}
                  </button>
                ))}
            </div>

            {!appearerParticipants[group]?.length && !isEditing && (
              <div>
                <p>Nincs hozzáadott képviselő</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Tray>
  );
};

export default ParlamentIDClient;
