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
  ButtonGroup,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import VersionTable from "./versionTable";
import { Section } from "@/components/home/section";
import CacheManager from "@/components/PWA/cacheManager";
import VersionManager from "@/components/PWA/versionManager";
import {
  ThemePickerPrimary,
  ThemePickerSecondary,
  ThemeTemplatePrimary,
  ThemeTemplateSecondary,
} from "@/components/themePicker";

function updateCacheMethod(cacheMethod: "always" | "offline" | "never") {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: "updateCacheMethod",
      cacheMethod: cacheMethod,
    });
  }
}

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
  const [menu, setMenu] = useState<string>(selfUser.food_menu);
  const [EJG_code, setEJG_code] = useState<string>(selfUser.EJG_code ?? "");
  const [nickname, setNickname] = useState<string>(selfUser.nickname);
  const [nicknameError, setNicknameError] = useState<string>("");
  const [EJG_codeError, setEJG_codeError] = useState<string>("");
  const [cacheMethod, setCacheMethod] = useState<
    "always" | "offline" | "never"
  >(
    (localStorage.getItem("cacheMethod") as "always" | "offline" | "never") ??
      "always",
  );

  useEffect(() => {
    updateCacheMethod(cacheMethod as any);
    localStorage.setItem("cacheMethod", cacheMethod);
  }, [cacheMethod]);

  const [sureQuestion, setSureQuestion] = useState<boolean>(false);

  const isAlphabetic = (username: string): boolean => {
    const regex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/;
    return regex.test(username);
  };

  const isValidEJGCode = (code: string): boolean => {
    const regex = /^[A-Z0-9]+$/;
    return regex.test(code);
  };

  async function save() {
    const response = await fetch("/api/editMySettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settings: {
          food_menu: menu == "?" ? null : menu,
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

  return (
    <>
      <div className="mx-auto max-w-xl gap-3 rounded-2xl bg-default-100 px-5 pb-16 pt-5">
        <p className="">
          Itt állíthatod a profilodat, és nézheted az oldalra vonatkozó
          beállításaidat.
        </p>

        <SettingsSection title="">
          <table className="table gap-y-2">
            <tbody>
              <tr>
                <th className="font-semibold">Név:</th>
                <th>{selfUser.name}</th>
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
                    isDisabled={!selfUser.tickets.includes("EJG_code_edit")}
                  />
                  {EJG_codeError && (
                    <p className="text-danger-600">{EJG_codeError}</p>
                  )}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">Menza menü:</th>
                <th>
                  <RadioGroup
                    value={!["A", "B"].includes(menu) ? "?" : menu}
                    onChange={(e) => {
                      setMenu(e.target.value);
                    }}
                    color="primary"
                  >
                    <Radio value="?">{"Nincs megadva"}</Radio>
                    <Radio value="A">{'"A" menü'}</Radio>
                    <Radio value="B">{'"B" menü'}</Radio>
                  </RadioGroup>
                </th>
              </tr>
            </tbody>
          </table>
        </SettingsSection>

        <SettingsSection title="Értesítési preferenciák">
          Hamarosan
        </SettingsSection>

        <SettingsSection
          title="Megjelenés"
          defaultStatus="closed"
          dropdownable={true}
        >
          <ThemeTemplatePrimary />
          <ThemeTemplateSecondary />
        </SettingsSection>

        <SettingsSection
          title="Haladó beállítások"
          defaultStatus="closed"
          dropdownable={true}
        >
          <table className="table gap-y-2">
            <tr>
              <th className="font-semibold">Gyorsítótár használata</th>
              <th>
                <RadioGroup
                  value={cacheMethod}
                  onChange={(e) => setCacheMethod(e.target.value as any)}
                >
                  <Radio value="always">Mindig</Radio>
                  <Radio value="offline">Csak offline</Radio>
                  <Radio value="never">Soha</Radio>
                </RadioGroup>

                <Button
                  color="warning"
                  onClick={() =>
                    caches.keys().then((keys) => {
                      keys.forEach((key) => {
                        caches.delete(key);
                      });
                      alert("A gyorsítótár kiürítve.");
                    })
                  }
                >
                  Gyorsítótár kiürítése
                </Button>
              </th>
            </tr>
          </table>
          <VersionManager />

          <VersionTable />

          <Button
            className="my-4"
            color="warning"
            onClick={() => {
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

          <CacheManager />
        </SettingsSection>

        <div
          className={
            "fixed inset-x-0 z-50 mx-auto flex h-14 w-36 border-2 border-foreground-500 bg-foreground-100 transition-all duration-300 max-md:rounded-b-2xl max-md:border-t-0 xs:w-72 md:rounded-t-2xl md:border-b-0 " +
            (!(EJG_code &&
            EJG_code.length === 13 &&
            nickname &&
            (EJG_code !== selfUser.EJG_code ||
              nickname !== selfUser.nickname ||
              menu !== selfUser.food_menu) &&
            !nicknameError
              ? false
              : true)
              ? "max-md:top-0 md:bottom-0"
              : "max-md:-top-16 md:-bottom-16")
          }
        >
          <Button
            onClick={() => {
              EJG_code !== selfUser.EJG_code ? setSureQuestion(true) : save();
            }}
            // make the button to be on the right side
            className="m-auto bg-selfsecondary"
            isDisabled={
              EJG_code &&
              EJG_code.length === 13 &&
              nickname &&
              (EJG_code !== selfUser.EJG_code ||
                nickname !== selfUser.nickname ||
                menu !== selfUser.food_menu) &&
              !nicknameError // Hozzáadva a hibaellenőrzés
                ? false
                : true
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
              onClick={() => {
                setSureQuestion(false);
              }}
            >
              Mégse
            </Button>
            <Button
              color="success"
              onClick={() => {
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
