"use client";
import SearchUser from "@/components/searchUser";
import Tray from "@/components/tray";
import type { Parlament } from "@/types/parliaments";
import { EJG_CLASSES } from "@/public/getUserClass";
import { Button, Link } from "@heroui/react";
import React, { useEffect, useMemo, useState } from "react";

const MagicIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M9.5 2.672a.5.5 0 1 0 1 0V.843a.5.5 0 0 0-1 0zm4.5.035A.5.5 0 0 0 13.293 2L12 3.293a.5.5 0 1 0 .707.707zM7.293 4A.5.5 0 1 0 8 3.293L6.707 2A.5.5 0 0 0 6 2.707zm-.621 2.5a.5.5 0 1 0 0-1H4.843a.5.5 0 1 0 0 1zm8.485 0a.5.5 0 1 0 0-1h-1.829a.5.5 0 0 0 0 1zM13.293 10A.5.5 0 1 0 14 9.293L12.707 8a.5.5 0 1 0-.707.707zM9.5 11.157a.5.5 0 0 0 1 0V9.328a.5.5 0 0 0-1 0zm1.854-5.097a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L8.646 5.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0l1.293-1.293Zm-3 3a.5.5 0 0 0 0-.706l-.708-.708a.5.5 0 0 0-.707 0L.646 13.94a.5.5 0 0 0 0 .707l.708.708a.5.5 0 0 0 .707 0z" />
  </svg>
);

interface Props {
  parlamentId: number;
  initialParlament: Parlament;
  initialParticipants: Record<string, string[]>;
  usersNameByEmail: Record<string, string | { name: string; class: string }>;
  canEdit: boolean;
  canCheckIn: boolean;
}

interface Participant {
  email: string;
  class: string;
  type: "appearer" | "previous";
}

const TRANSLATION = {
  appearer: "Jelen",
  previous: "Korábbi",
  checking_in: "Kérvénylő",
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

const ParlamentIDClient = ({
  parlamentId,
  initialParlament,
  initialParticipants,
  usersNameByEmail,
  canEdit,
  canCheckIn,
}: Props) => {
  const [appearerParticipants, setAppearerParticipants] =
    useState<Record<string, string[]>>(initialParticipants);
  const [previousParlamentParticipants, setPreviousParlamentParticipants] =
    useState<Record<string, string[]>>({});
  const [isEditing, setIsEditing] = useState(false);

  const mergedParticipants = useMemo(() => {
    const merged: Participant[] = [];

    Object.entries(appearerParticipants).forEach(([group, emails]) => {
      emails.forEach((email) => {
        merged.push({ email, class: group, type: "appearer" });
      });
    });

    Object.entries(previousParlamentParticipants).forEach(([group, emails]) => {
      emails.forEach((email) => {
        if (!appearerParticipants[group]?.includes(email))
          merged.push({ email, class: group, type: "previous" });
      });
    });

    return merged;
  }, [appearerParticipants, previousParlamentParticipants]);

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

  const getRowClasses = (type: "appearer" | "previous" | "checking_in") => {
    if (!isEditing && type !== "appearer") return "hidden";
    if (isEditing && type === "appearer")
      return "bg-success text-black cursor-pointer";
    if (isEditing && type === "checking_in")
      return "bg-warning text-black cursor-pointer";
    if (isEditing) return "cursor-pointer";
  };

  const getRowClickHandler = (
    type: "appearer" | "previous" | "checking_in",
    email: string,
    group: string,
  ) => {
    if (!isEditing) return undefined;
    if (type === "appearer") return () => unregisterFromParlament(email, group);
    return () => registerToParlament(email, group);
  };

  return (
    <div className="flex flex-col gap-4">
      <Link href="/parlament">
        <span className="rotate-180">➜</span>&nbsp;Vissza a parlamentekhez
      </Link>
      <Tray title={initialParlament.title} colorVariant="dark">
        <p>Időpont: {initialParlament.date}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            isDisabled={!canEdit}
            color={isEditing ? "danger" : "success"}
            onPress={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Szerkesztés befejezése" : "Szerkesztés indítása"}
          </Button>

          <Button
            color="danger"
            onPress={() => deleteParlament(initialParlament.id)}
            isDisabled={
              !canEdit ||
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
                    (!appearerParticipants[group]?.length
                      ? "bg-danger-300"
                      : "")
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
    </div>
  );
};

export default ParlamentIDClient;
