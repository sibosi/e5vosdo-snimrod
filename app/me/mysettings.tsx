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

  const [classGroup, setClassGroup] = useState<0 | 1 | 2>(0);

  const [sureQuestion, setSureQuestion] = useState<boolean>(false);

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
                  color="primary"
                  placeholder="Felhasználónév"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  size="md"
                />
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
                  onChange={(e) => setEJG_code(e.target.value.toUpperCase())}
                  isDisabled={!selfUser.tickets.includes("EJG_code_edit")}
                />
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

        <h2>Órarend beállítások</h2>
        <table className="table gap-y-2">
          <tbody>
            <tr>
              <th className="font-semibold">Alapértelmezett csoport</th>
              <th>
                <ButtonGroup>
                  <Button
                    color={classGroup === 0 ? "success" : undefined}
                    onClick={() => setClassGroup(0)}
                  >
                    Nincs csoport
                  </Button>
                  <Button
                    color={classGroup === 1 ? "success" : undefined}
                    onClick={() => setClassGroup(1)}
                  >
                    1-es csoport
                  </Button>
                  <Button
                    color={classGroup === 2 ? "success" : undefined}
                    onClick={() => setClassGroup(2)}
                  >
                    2-es csoport
                  </Button>
                </ButtonGroup>
              </th>
            </tr>
          </tbody>
        </table>

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
              menu !== selfUser.food_menu)
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
