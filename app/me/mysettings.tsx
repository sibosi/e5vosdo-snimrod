"use client";
import { User } from "@/db/dbreq";
import {
  RadioGroup,
  Radio,
  Input,
  Link,
  Button,
  ModalContent,
  Modal,
  Switch,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import VersionTable from "./versionTable";
import { Section } from "@/components/home/section";
import CacheManager from "@/components/PWA/cacheManager";
import VersionManager from "@/components/PWA/versionManager";
import { ThemeOptions, ThemeTemplate } from "@/components/themePicker";
import { Alert } from "@/components/home/alert";
import { ReinstallServiceWorker } from "@/components/PWA/managesw";

const SettingsSection = ({
  title,
  children,
  titleClassName,
  dropdownable = false,
  defaultStatus = "opened",
  className,
}: {
  title: string;
  children: React.ReactNode;
  titleClassName?: string;
  dropdownable?: boolean;
  defaultStatus?: "opened" | "closed";
  className?: string;
}) => {
  return (
    <Section
      title={title}
      defaultStatus={defaultStatus}
      dropdownable={dropdownable}
      titleClassName="text-lg font-bold text-forground"
      className={"pt-0 " + className}
      savable={false}
    >
      {children}
    </Section>
  );
};

const MySettings = ({ selfUser }: { selfUser: User }) => {
  const [selfUserPromise, setSelfUserPromise] = useState<User>(selfUser);
  const [EJG_code, setEJG_code] = useState<string>(
    selfUserPromise.EJG_code ?? "",
  );
  const [nickname, setNickname] = useState<string>(selfUserPromise.nickname);
  const [nicknameError, setNicknameError] = useState<string>("");
  const [EJG_codeError, setEJG_codeError] = useState<string>("");
  const [isMaterialBg, setIsMaterialBg] = useState<boolean>(false);

  const [reload, setReload] = useState<boolean>(false);
  const [isPushEnabled, setIsPushEnabled] = useState<{
    value: boolean;
    reason?: string;
  }>({
    value: false,
  });

  useEffect(() => {
    setIsPushEnabled(
      ((): {
        value: boolean;
        reason?: string;
      } => {
        if (typeof window === "undefined") return { value: false };

        if (!("Notification" in window))
          return {
            value: false,
            reason:
              "A böngésződ nem támogatja az értesítéseket. Használj HTTPS-t!",
          };

        if (Notification.permission === "denied")
          return {
            value: false,
            reason: "A böngészőben letiltottad az értesítéseket.",
          };

        if (Notification.permission === "default")
          return {
            value: false,
            reason: "Nem engedélyezted az értesítéseket a böngésződben.",
          };

        if (!("serviceWorker" in navigator))
          return {
            value: false,
            reason: "A böngésződ nem támogatja a szolgáltató munkásokat.",
          };

        if (!selfUserPromise.push_permission)
          return {
            value: false,
            reason: "Az értesítések nincsenek engedélyezve a profilodban.",
          };

        return {
          value: true,
        };
      })(),
    );
  }, [selfUserPromise.push_permission]);

  useEffect(() => {
    setIsMaterialBg(localStorage.getItem("materialBg") === "true");
  }, []);

  useEffect(() => {
    if (reload) {
      setReload(false);

      console.log("Reloading...");

      fetch("api/getAuth")
        .then((res) => res.json())
        .then((data) => {
          setSelfUserPromise(data);

          console.log("Reloaded:", data);
        });
    }
  }, [reload, selfUserPromise.email]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        EJG_code &&
        EJG_code.length === 13 &&
        nickname &&
        (EJG_code !== selfUserPromise.EJG_code ||
          nickname !== selfUserPromise.nickname) &&
        !nicknameError
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    EJG_code,
    nickname,
    nicknameError,
    selfUserPromise.EJG_code,
    selfUserPromise.food_menu,
    selfUserPromise.nickname,
  ]);

  const [sureQuestion, setSureQuestion] = useState<boolean>(false);

  const isAlphabetic = (username: string): boolean => {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/;
    return regex.test(username);
  };

  const isValidEJGCode = (code: string): boolean => {
    const regex = /^[A-Z0-9]+$/;
    return regex.test(code);
  };

  async function save_settings({
    settings,
    reload,
  }: {
    settings: any;
    reload?: boolean;
  }) {
    const response = await fetch("/api/editMySettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });
    setReload(true);
    if (response.status === 200) {
      if (reload) {
        alert("Sikeresen mentetted a beállításaidat!");
        location.reload();
      }
      console.log(JSON.stringify({ settings }));
    } else {
      alert("Hiba történt a mentés során.");
    }
  }

  async function save() {
    const response = await fetch("/api/editMySettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settings: {
          EJG_code: EJG_code,
          nickname: nickname,
        },
      }),
    });
    if (response.status === 200) {
      alert("Sikeresen mentetted a beállításaidat!");
      location.reload();
    } else {
      alert("Hiba történt a mentés során.");
    }
  }

  console.log("Push permission:", selfUserPromise.push_permission);
  console.log("isPushEnabled:", isPushEnabled);

  return (
    <>
      <div className="mx-auto max-w-xl gap-3 rounded-2xl border-2 bg-transparent px-5 pb-16 pt-5">
        <p className="">
          Itt állíthatod a profilodat, és nézheted az oldalra vonatkozó
          beállításaidat.
        </p>

        {EJG_code === "" && (
          <Alert className="mt-2 border-selfsecondary-400 bg-selfsecondary-200">
            Az EJG kódod még nincs megadva. Az EJG kódod nélkül nem tudod
            használni az alkalmazás számos funkcióját, például az órarended
            megtekintését és a beállításaid módosítását.
          </Alert>
        )}

        <SettingsSection title="">
          <table className="table gap-y-2">
            <tbody>
              <tr>
                <th className="font-semibold">Név:</th>
                <th>{selfUserPromise.name}</th>
              </tr>
              <tr>
                <th className="font-semibold">Felhasználónév:</th>
                <th>
                  <Input
                    color={nicknameError ? "danger" : "primary"}
                    placeholder="Felhasználónév"
                    value={nickname}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNickname(value.substring(0, 10));
                      if (!isAlphabetic(value)) {
                        setNicknameError(
                          "A felhasználónév csak betűket tartalmazhat.",
                        );
                      } else {
                        setNicknameError("");
                      }
                      if (value.length < 3) {
                        setNicknameError(
                          "A felhasználónévnek legalább 3 karakter hosszúnak kell lennie.",
                        );
                      }
                    }}
                    size="md"
                  />
                  {nicknameError && (
                    <p className="text-danger-600">{nicknameError}</p>
                  )}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">Profilkép beállítása:</th>
                <th>
                  <Link
                    href="https://myaccount.google.com/personal-info?hl=hu&utm_source=OGB&utm_medium=act"
                    className="text-selfprimary"
                  >
                    Google fiók profilképének állítása
                  </Link>
                  <p className="text-sm">
                    {"(A profilkép jelenleg csak így változtatható)"}
                  </p>
                </th>
              </tr>
              <tr>
                <th className="font-semibold">EJG kód:</th>
                <th>
                  <Input
                    color={EJG_code.length == 13 ? "primary" : "danger"}
                    placeholder="EJG kód"
                    value={EJG_code}
                    onChange={(e) => {
                      setEJG_code(e.target.value.toUpperCase());
                      if (!isValidEJGCode(e.target.value.toUpperCase())) {
                        setEJG_codeError(
                          "Az EJG kód csak betűket és számokat tartalmazhat.",
                        );
                      } else {
                        setEJG_codeError("");
                      }
                    }}
                    isDisabled={
                      !selfUserPromise.tickets.includes("EJG_code_edit")
                    }
                  />
                  {EJG_codeError && (
                    <p className="text-danger-600">{EJG_codeError}</p>
                  )}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">
                  Menza menü <strong>az oldalunkon</strong>:
                </th>
                <th>
                  <RadioGroup
                    value={
                      !["A", "B"].includes(selfUserPromise.food_menu)
                        ? "?"
                        : selfUserPromise.food_menu
                    }
                    onChange={(e) => {
                      save_settings({
                        settings: {
                          food_menu:
                            e.target.value !== "?" ? e.target.value : "?",
                        },
                      });
                    }}
                    color="primary"
                  >
                    <Radio value="?">{"Mindkettő"}</Radio>
                    <Radio value="A">{'"A" menü'}</Radio>
                    <Radio value="B">{'"B" menü'}</Radio>
                  </RadioGroup>
                </th>
              </tr>
            </tbody>
          </table>
        </SettingsSection>

        <ThemeOptions />

        <SettingsSection
          title="Értesítési preferenciák"
          dropdownable={true}
          defaultStatus="closed"
        >
          {isPushEnabled.reason && (
            <Alert className="border-selfsecondary-400 bg-selfsecondary-200">
              {isPushEnabled.reason}
            </Alert>
          )}
          <div className="grid grid-cols-1 gap-2">
            <Switch
              isSelected={isPushEnabled.value}
              onChange={(e) => {
                if (e.target.checked) {
                  Notification.requestPermission();
                  save_settings({
                    settings: {
                      push_permission: true,
                    },
                  });
                } else
                  save_settings({
                    settings: {
                      push_permission: false,
                    },
                  });
              }}
            >
              Értesítések engedélyezése
            </Switch>

            <Switch
              isSelected={selfUserPromise.push_about_games}
              isDisabled={!isPushEnabled.value}
              onChange={(e) => {
                save_settings({
                  settings: {
                    push_about_games: e.target.checked,
                  },
                });
              }}
            >
              Értesítések bajnokságokról (kosár, foci, stb.)
            </Switch>

            <Switch
              isSelected={selfUserPromise.push_about_timetable}
              isDisabled={!isPushEnabled.value}
              onChange={(e) => {
                save_settings({
                  settings: {
                    push_about_timetable: e.target.checked,
                  },
                });
              }}
            >
              Értesítések az órarend változásakor (a funkció előreláthatólag nem
              fog megvalósulni)
            </Switch>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Megjelenés"
          defaultStatus="closed"
          dropdownable={true}
        >
          <ThemeTemplate color="primary" />
          <ThemeTemplate color="secondary" />

          <Button
            onPress={() => {
              localStorage.setItem(
                "materialBg",
                isMaterialBg ? "false" : "true",
              );
              setIsMaterialBg(!isMaterialBg);
              location.reload();
            }}
            className="fill-selfprimary"
          >
            {isMaterialBg
              ? "Színes háttér kikapcsolása"
              : "Színes háttér bekapcsolása"}
          </Button>
        </SettingsSection>

        <SettingsSection
          title="Haladó beállítások"
          defaultStatus="closed"
          dropdownable={true}
        >
          <VersionTable />

          <div className="my-2 flex gap-2">
            <VersionManager />
            <Button
              color="warning"
              onPress={() => {
                caches.keys().then((keys) => {
                  keys.forEach((key) => {
                    caches.delete(key);
                  });
                  alert("A gyorsítótár kiürítve.");
                });
              }}
            >
              Gyorsítótár kiürítése
            </Button>

            <ReinstallServiceWorker />
          </div>

          <CacheManager />
        </SettingsSection>

        <div
          className={
            "fixed inset-x-0 z-50 mx-auto flex h-14 w-36 border-2 border-foreground-500 bg-foreground-100 transition-all duration-300 max-md:rounded-b-2xl max-md:border-t-0 xs:w-72 md:rounded-t-2xl md:border-b-0 " +
            (EJG_code &&
            EJG_code.length === 13 &&
            nickname &&
            (EJG_code !== selfUserPromise.EJG_code ||
              nickname !== selfUserPromise.nickname) &&
            !nicknameError
              ? "max-md:top-0 md:bottom-0"
              : "max-md:-top-16 md:-bottom-16")
          }
        >
          <Button
            onPress={() => {
              EJG_code !== selfUserPromise.EJG_code
                ? setSureQuestion(true)
                : save();
            }}
            // make the button to be on the right side
            className="m-auto bg-selfsecondary"
            isDisabled={
              !(
                EJG_code &&
                EJG_code.length === 13 &&
                nickname &&
                (EJG_code !== selfUserPromise.EJG_code ||
                  nickname !== selfUserPromise.nickname) &&
                !nicknameError
              )
            }
          >
            Mentés
          </Button>
        </div>
      </div>

      <p className="mx-auto max-w-xl px-5 text-xs text-foreground-300">
        Amennyiben problémád adódik a fiókoddal kapcsolatban, vedd fel a
        kapcsolatot a fejlesztővel!
      </p>

      <Modal
        placement="center"
        isOpen={sureQuestion}
        onClose={() => setSureQuestion(false)}
        className="mx-5"
      >
        <ModalContent className="p-4 text-foreground">
          <h3 className="text-lg font-bold">EJG kód módosítása</h3>
          <p className="text-foreground-600">
            Adatvédelmi okokból csak EJG kódoddal tudunk beazonosítani. A kód
            befolyásolhatja az oldalon megjelenő tartalmat, illetve
            kulcsfontosságú szerepe van az E5vös Napok alatt. Figyelem, a
            kódodat később nem módosíthatod!
          </p>
          <div className="py-4 text-center">
            <p>Biztosan helyesen adtad-e meg a kódod?</p>
            <p className="text-2xl font-extrabold">{EJG_code}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              color="danger"
              onPress={() => {
                setSureQuestion(false);
              }}
            >
              Mégse
            </Button>
            <Button
              color="success"
              onPress={() => {
                setSureQuestion(false);
                save();
              }}
            >
              Igen
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MySettings;
