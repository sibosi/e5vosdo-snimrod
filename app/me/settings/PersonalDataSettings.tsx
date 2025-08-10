"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Input, Link, RadioGroup, Radio, InputOtp } from "@heroui/react";
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
  const [studentCode, setStudentCode] = useState<string>(
    selfUser.EJG_code ?? "",
  );
  const [studentCodeError, setStudentCodeError] = useState<string>("");
  const [foodMenu, setFoodMenu] = useState<string>(selfUser.food_menu);
  const [OM5, setOM5] = useState<string>(selfUser.OM5 ?? "");
  const [initialSettings] = useState(() => ({
    nickname,
    studentCode,
    foodMenu,
    OM5,
  }));

  const isAlphabetic = (username: string): boolean =>
    /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+$/.test(username);
  const isValidEJGCode = (code: string): boolean => /^[A-Z0-9]+$/.test(code);

  const saveSettings = useCallback(() => {
    if (nicknameError || studentCodeError) return;
    if (
      nickname === selfUser.nickname &&
      studentCode === selfUser.EJG_code &&
      foodMenu === selfUser.food_menu
    )
      return;

    fetch("/api/editMySettings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          nickname,
          EJG_code: studentCode.length === 13 ? studentCode : "",
          food_menu: foodMenu,
          OM5: OM5,
        },
      }),
    }).then(async (response) => {
      if (response.ok) window.location.reload();
      else alert("Hiba történt a mentés során.");
    });
  }, [nickname, studentCode, foodMenu, selfUser]);

  useEffect(() => {
    setSaveSettings(() => saveSettings);
  }, [saveSettings]);

  useEffect(() => {
    const value = {
      nickname,
      studentCode,
      foodMenu,
    };

    setIsSaveNeeded(JSON.stringify(value) !== JSON.stringify(initialSettings));
  }, [nickname, studentCode, foodMenu]);

  return (
    <div>
      {studentCode === "" && (
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
            <td>
              <Input
                color={studentCode.length === 13 ? "primary" : "danger"}
                placeholder="EJG kód"
                value={studentCode}
                onChange={(e) => {
                  const code = e.target.value.toUpperCase();
                  setStudentCode(code);
                  if (!isValidEJGCode(code)) {
                    setStudentCodeError(
                      "Az EJG kód csak betűket és számokat tartalmazhat.",
                    );
                  } else {
                    setStudentCodeError("");
                  }
                }}
                isDisabled={!selfUser.tickets.includes("EJG_code_edit")}
              />
              {studentCodeError && (
                <p className="text-danger-600">{studentCodeError}</p>
              )}
            </td>
          </tr>
          <tr>
            <th className="font-semibold">OM azonosító utolsó 5 számjegye:</th>
            <td>
              <InputOtp length={5} value={OM5} onValueChange={setOM5} />
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
