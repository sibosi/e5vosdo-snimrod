"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Input, Link, RadioGroup, Radio } from "@heroui/react";
import { Alert } from "@/components/home/alert";
import { UserType } from "@/db/dbreq";

const PersonalDataSettings = ({
  selfUser,
  setIsSaveNeeded,
  setSaveSettings,
}: {
  selfUser: UserType;
  setIsSaveNeeded: (isSaveNeeded: boolean) => void;
  setSaveSettings: (save: () => void) => void;
}) => {
  const [nickname, setNickname] = useState<string>(selfUser.nickname);
  const [nicknameError, setNicknameError] = useState<string>("");
  const [foodMenu, setFoodMenu] = useState<string>(selfUser.food_menu);
  const [initialSettings] = useState(() => ({ nickname, foodMenu }));

  const isAlphabetic = (username: string): boolean =>
    /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/.test(username);
  const saveSettings = useCallback(() => {
    if (nicknameError) return;
    if (nickname === selfUser.nickname && foodMenu === selfUser.food_menu)
      return;

    fetch("/api/editMySettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          nickname,
          food_menu: foodMenu,
        },
      }),
    }).then(async (response) => {
      if (response.ok) window.location.reload();
      else alert("Hiba történt a mentés során.");
    });
  }, [nickname, foodMenu, selfUser, nicknameError]);

  useEffect(() => {
    setSaveSettings(() => saveSettings);
  }, [saveSettings]);

  useEffect(() => {
    const value = { nickname, foodMenu };

    setIsSaveNeeded(JSON.stringify(value) !== JSON.stringify(initialSettings));
  }, [nickname, foodMenu, initialSettings]);

  return (
    <div>
      {!selfUser.EJG_code && (
        <Alert className="mt-2 border-selfsecondary-300 bg-selfsecondary-100">
          Az EJG kódod még nincs megadva. Az EJG kód nélkül nem tudod használni
          az alkalmazás számos funkcióját, például az órarended megtekintését és
          a beállításaid módosítását.
        </Alert>
      )}

      <table className="table gap-y-2">
        <tbody>
          <tr>
            <th className="font-semibold">Név:</th>
            <td>{selfUser.name}</td>
          </tr>
          <tr>
            <th className="font-semibold">Felhasználónév:</th>
            <td>
              <Input
                color={nicknameError ? "danger" : "primary"}
                placeholder="Felhasználónév"
                value={nickname}
                onValueChange={(value) => {
                  setNickname(value.substring(0, 10));
                  if (!isAlphabetic(value)) {
                    setNicknameError(
                      "A felhasználónév csak betűket tartalmazhat.",
                    );
                  } else if (value.length < 3) {
                    setNicknameError(
                      "A felhasználónévnek legalább 3 karakter hosszúnak kell lennie.",
                    );
                  } else {
                    setNicknameError("");
                  }
                }}
                size="md"
              />
              {nicknameError && (
                <p className="text-danger-600">{nicknameError}</p>
              )}
            </td>
          </tr>
          <tr>
            <th className="font-semibold">Profilkép beállítása:</th>
            <td>
              <Link
                href="https://myaccount.google.com/personal-info?hl=hu&utm_source=OGB&utm_medium=act"
                className="text-selfprimary"
              >
                Google fiók profilképének állítása
              </Link>
            </td>
          </tr>
          <tr>
            <th className="font-semibold">EJG kód:</th>
            <td className="font-mono">
              {selfUser.EJG_code || "Nincs megadva"}
            </td>
          </tr>
          <tr>
            <th className="font-semibold">OM azonosító:</th>
            <td className="font-mono">{selfUser.OM5 || "Nincs megadva"}</td>
          </tr>
          <tr>
            <th className="font-semibold">Tanulói adatok:</th>
            <td>
              <Link
                href="/me/verify"
                className="inline-block rounded-xl bg-selfprimary px-3 py-2 text-white"
              >
                EJG- és OM-adatok ellenőrzése
              </Link>
            </td>
          </tr>
          <tr>
            <th className="font-semibold">
              Menza menü <strong>az oldalunkon</strong>:
            </th>
            <td>
              <RadioGroup
                value={!["A", "B"].includes(foodMenu) ? "?" : foodMenu}
                onChange={(e) => {
                  setFoodMenu(e.target.value);
                }}
                color="primary"
              >
                <Radio value="?">Mindkettő</Radio>
                <Radio value="A">A menü</Radio>
                <Radio value="B">B menü</Radio>
              </RadioGroup>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PersonalDataSettings;
