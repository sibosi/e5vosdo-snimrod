"use client";
import { User } from "@/db/dbreq";
import { RadioGroup, Radio, Input, Link, Button } from "@nextui-org/react";
import React, { useState } from "react";

const MySettings = ({ selfUser }: { selfUser: User }) => {
  const [menu, setMenu] = useState<string>(selfUser.food_menu);
  const [EJG_code, setEJG_code] = useState<string>(selfUser.EJG_code);
  const [nickname, setNickname] = useState<string>(selfUser.nickname);

  async function save() {
    const response = await fetch("/api/editMySettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settings: { food_menu: menu, EJG_code: EJG_code, nickname: nickname },
      }),
    });
    if (response.status === 200) {
      alert("Sikeresen mentetted a beállításaidat!");
    } else {
      alert("Hiba történt a mentés során.");
    }
    location.reload();
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
                  color="primary"
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

        <Button
          onClick={() => {
            save();
          }}
          color="primary"
          // make the button to be on the right side
          className="float-right mt-2"
        >
          Mentés
        </Button>
      </div>
      <p className="text-xs text-foreground-300 mx-auto px-5 max-w-xl">
        Amennyiben problémád adódik a fiókoddal kapcsolatban, vedd fel a
        kapcsolatot a fejlesztővel!
      </p>
    </>
  );
};

export default MySettings;
