"use client";
import SearchUser from "@/components/searchUser";
import Tray from "@/components/tray";
import { Parlament } from "@/db/parlament";
import { EJG_CLASSES } from "@/public/getUserClass";
import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

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

export default function ParlamentManager() {
  const [parlamentList, setParlamentList] = useState<Parlament[]>();
  const [selectedParlament, setSelectedParlament] = useState<Parlament>();
  const [usersNameByEmail, setUsersNameByEmail] =
    useState<Record<string, string>>();
  const [selectedUser, setSelectedUser] = useState<Record<string, string[]>>(
    {},
  );

  const [previousParlamentDelegates, setPreviousParlamentDelegates] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    fetch("/api/getParlaments", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        module: "parlement",
      },
    }).then((res) => {
      if (res.ok) {
        res.json().then((data: Parlament[]) => {
          setParlamentList(data);
        });
      } else {
        alert("Hiba a parlamentek lekérdezése közben");
      }
    });

    fetch("/api/getAllUsersNameByEmail", {
      method: "GET",
    }).then((res) => {
      if (res.ok) {
        res.json().then((data: Record<string, string>) => {
          setUsersNameByEmail(data);
        });
      } else {
        alert("Hiba a felhasználók lekérdezése közben");
      }
    });
  }, []);

  async function getParlamentParticipants(parlamentId: number) {
    const resp = await fetch("/api/getParlamentParticipants", {
      method: "POST",
      body: JSON.stringify({ parlamentId }),
      headers: {
        module: "parlement",
      },
    });
    return (await resp.json()) as Record<string, string[]>;
  }

  useEffect(() => {
    setSelectedUser({});
    EJG_CLASSES.forEach((group) => {
      setSelectedUser((prev) => ({
        ...prev,
        [group]: [],
      }));
    });

    if (selectedParlament) {
      fetch("/api/getParlamentParticipants", {
        method: "POST",
        body: JSON.stringify({ parlamentId: selectedParlament.id }),
        headers: {
          module: "parlement",
        },
      }).then((res) => {
        if (res.ok) {
          res.json().then((data: Record<string, string[]>) => {
            setSelectedUser(data);
          });
        } else {
          alert("Hiba a parlamentek lekérdezése közben");
        }
      });

      const previousParlamentId = parlamentList
        ?.sort()
        .reverse()
        .find((p) => p.id < selectedParlament.id)?.id;

      if (previousParlamentId)
        getParlamentParticipants(previousParlamentId).then((data) => {
          setPreviousParlamentDelegates(data);
        });
    }
  }, [parlamentList, selectedParlament]);

  function deleteParlament(parlamentId: number) {
    fetch("/api/deleteParlament", {
      method: "POST",
      body: JSON.stringify({ parlamentId }),
      headers: {
        module: "parlement",
      },
    }).then((res) => {
      if (res.ok) {
        alert("Parlament sikeresen törölve");
        window.location.reload();
      } else {
        alert("Hiba a parlament törlése közben");
      }
    });
  }

  async function registerToParlament(email: string, group: string) {
    fetch("/api/registerToParlament", {
      method: "POST",
      body: JSON.stringify({
        email,
        group,
        parlamentId: selectedParlament?.id,
      }),
      headers: {
        module: "parlement",
      },
    }).then((res) => {
      if (res.ok) {
        setSelectedUser((prev) => ({
          ...prev,
          [group]: [...(selectedUser[group] ?? []), email],
        }));
      } else {
        alert("Hiba a regisztráció közben");
      }
    });
  }

  async function unregisterFromParlament(email: string, group: string) {
    fetch("/api/unregisterFromParlament", {
      method: "POST",
      body: JSON.stringify({
        email,
        group,
        parlamentId: selectedParlament?.id,
      }),
      headers: {
        module: "parlement",
      },
    }).then((res) => {
      if (res.ok) {
        setSelectedUser((prev) => ({
          ...prev,
          [group]: selectedUser[group].filter((e) => e !== email),
        }));
        return true;
      } else {
        return false;
      }
    });
  }

  if (!selectedParlament)
    return (
      <Tray title="Parlamentek listája">
        {parlamentList ? (
          parlamentList.map((parlament) => (
            <Tray
              key={parlament.id}
              title={parlament.title}
              colorVariant="dark"
            >
              <p>Időpont: {parlament.date}</p>

              <Button
                radius="sm"
                className="mt-2 bg-selfsecondary-200 px-1 text-foreground"
                onPress={() => setSelectedParlament(parlament)}
              >
                Részletek
              </Button>
            </Tray>
          ))
        ) : (
          <p>Betöltés...</p>
        )}
      </Tray>
    );

  return (
    <Tray title={selectedParlament.title} colorVariant="dark">
      <p>Időpont: {selectedParlament.date}</p>
      <Button
        radius="sm"
        className="mt-2 bg-selfsecondary-200 px-1 text-foreground"
        onPress={() => setSelectedParlament(undefined)}
      >
        Vissza
      </Button>

      <div>
        {EJG_CLASSES.map((group) => (
          <div key={group} className="my-2 border-b-1 py-2">
            <div className="flex gap-2">
              <div
                className={
                  "text-xl font-extrabold " +
                  (!selectedUser[group]?.length ? "bg-danger-300" : "")
                }
              >
                {group}
              </div>
              {usersNameByEmail ? (
                <SearchUser
                  onSelectEmail={(email) => {
                    registerToParlament(email, group);
                  }}
                  usersNameByEmail={usersNameByEmail}
                  label="Képviselő keresése"
                  placeholder="Képviselő neve"
                  size="sm"
                />
              ) : (
                <p>Betöltés...</p>
              )}
            </div>

            <div>
              {previousParlamentDelegates[group]?.length ? (
                <div>
                  {previousParlamentDelegates[group]
                    .filter((email) => !selectedUser[group]?.includes(email))
                    .map((email) => (
                      <Button
                        key={email}
                        color="default"
                        variant="faded"
                        onPress={() => registerToParlament(email, group)}
                      >
                        {MagicIcon} {email}
                      </Button>
                    ))}
                </div>
              ) : null}
            </div>

            <div>
              {selectedUser[group]?.length ? (
                <div>
                  {selectedUser[group].map((email) => (
                    <Button
                      key={email}
                      color="success"
                      onPress={() => unregisterFromParlament(email, group)}
                    >
                      {email}
                    </Button>
                  ))}
                </div>
              ) : (
                <p>Nincs kiválasztva</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        radius="sm"
        className="mt-2 bg-selfsecondary-200 px-1 text-foreground"
        onPress={() => deleteParlament(selectedParlament.id)}
      >
        Parlament törlése
      </Button>
    </Tray>
  );
}
