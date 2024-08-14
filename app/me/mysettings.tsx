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
import React, { useState } from "react";

const MySettings = ({ selfUser }: { selfUser: User }) => {
  const [menu, setMenu] = useState<string>(selfUser.food_menu);
  const [EJG_code, setEJG_code] = useState<string>(selfUser.EJG_code ?? "");
  const [nickname, setNickname] = useState<string>(selfUser.nickname);
  const [nicknameError, setNicknameError] = useState<string>("");
  const [EJG_codeError, setEJG_codeError] = useState<string>("");

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
      <div className="bg-default-100 mx-auto px-5 pt-5 pb-16 rounded-2xl gap-3 max-w-xl">
        <p className="pb-2">
          Itt állíthatod a profilodat, és nézheted az oldalra vonatkozó
          beállításaidat.
        </p>
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
                        "A felhasználónév csak betűket tartalmazhat."
                      );
                    } else {
                      setNicknameError("");
                    }
                    if (value.length < 3) {
                      setNicknameError(
                        "A felhasználónévnek legalább 3 karakter hosszúnak kell lennie."
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
                  color="primary"
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
                        "Az EJG kód csak betűket és számokat tartalmazhat."
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
                  onChange={(e) => setMenu(e.target.value)}
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

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Értesítési preferenciák</h3>
        </div>

        <Button
          onClick={() => {
            EJG_code !== selfUser.EJG_code ? setSureQuestion(true) : save();
          }}
          color="primary"
          // make the button to be on the right side
          className="float-right mt-2"
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
      <p className="text-xs text-foreground-300 mx-auto px-5 max-w-xl">
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
          <div className="text-center py-4">
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
