"use client";

import { Alert } from "@/components/home/alert";
import { UserType } from "@/db/dbreq";
import { Button, Input, InputOtp, Link } from "@heroui/react";
import { useState } from "react";

export default function VerifyStudentData({
  selfUser,
}: {
  selfUser: UserType;
}) {
  const [EJGCode, setEJGCode] = useState(selfUser.EJG_code ?? "");
  const [OM5, setOM5] = useState(selfUser.OM5 ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function verify() {
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/verify-student-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EJG_code: EJGCode, OM5 }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Az adatok ellenőrzése sikertelen.");
        return;
      }
      window.location.href = "/me";
    } catch (verificationError) {
      console.error(verificationError);
      setError("Az adatok ellenőrzése sikertelen. Próbáld újra később.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl space-y-5 px-4 pb-12 pt-5 text-foreground">
      <Link href="/me" className="text-sm text-selfprimary">
        ← Vissza a beállításokhoz
      </Link>
      <div>
        <h1 className="text-3xl font-semibold">Tanulói adatok ellenőrzése</h1>
        <p className="mt-2 opacity-75">
          Az órarended lekérésével ellenőrizzük az EJG-kódodat és az OM
          azonosítód <strong>utolsó 5 számjegyét</strong>. Sikeres ellenőrzés után ezeket az adatokat már nem lehet
          a beállítások között módosítani.
        </p>
      </div>
      <div
        className={`rounded-2xl border-2 p-4 ${
          selfUser.is_verified
            ? "border-success-300 bg-success-50"
            : "border-warning-300 bg-warning-50"
        }`}
      >
        <p
          className={`font-semibold ${
            selfUser.is_verified ? "text-success-700" : "text-warning-700"
          }`}
        >
          {selfUser.is_verified
            ? "Az adataid ellenőrizve és elmentve."
            : "Az adataid még nincsenek ellenőrizve."}
        </p>
        <p className="mt-1 text-sm">
          {selfUser.is_verified
            ? "Az EJG-kódod és az OM-azonosítód érvényes, a tanulói státuszod aktív."
            : "Add meg az adataidat, majd ellenőrizd őket az órarend lekérésével."}
        </p>
      </div>
      {error && <Alert color="warning">{error}</Alert>}
      <div className="space-y-4 rounded-2xl border-2 p-5">
        <Input
          label="EJG-kód"
          value={EJGCode}
          onValueChange={(value) => setEJGCode(value.toUpperCase())}
          maxLength={13}
          isInvalid={EJGCode.length > 0 && EJGCode.length !== 13}
          errorMessage="Az EJG-kódnak 13 karakterből kell állnia."
        />
        <div>
          <InputOtp
            label="OM azonosító utolsó 5 számjegye"
            length={5}
            value={OM5}
            onValueChange={setOM5}
          />
        </div>
        <Button
          color="primary"
          className="w-full"
          isLoading={isSaving}
          isDisabled={
            selfUser.is_verified || EJGCode.length !== 13 || OM5.length !== 5
          }
          onPress={verify}
        >
          {selfUser.is_verified
            ? "Az adatok már ellenőrizve vannak"
            : "Adatok ellenőrzése és mentése"}
        </Button>
      </div>
    </main>
  );
}
