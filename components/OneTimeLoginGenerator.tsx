"use client";

import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import SearchUser from "./searchUser";

const OneTimeLoginGenerator = ({
  admin = false,
  usersNameByEmail = {},
}: {
  admin?: boolean;
  usersNameByEmail?: Record<
    string,
    string | { name: string; class: string; image?: string }
  >;
}) => {
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [days, setDays] = useState("1");

  useEffect(() => {
    if (!expiresAt) return;
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  async function generateCode() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/generate-code", {
        method: "POST",
        headers: admin ? { "Content-Type": "application/json" } : undefined,
        body: admin ? JSON.stringify({ email, days: Number(days) }) : undefined,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Nem sikerült kódot generálni.");
        return;
      }
      setCode(data.code);
      setExpiresAt(new Date(data.expiresAt).getTime());
      setRemaining(new Date(data.expiresAt).getTime() - Date.now());
    } catch {
      setError("Nem sikerült kódot generálni.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      setError("A kód másolása nem sikerült. Másold ki kézzel.");
    }
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return (
    <div className="space-y-3">
      <p className="text-sm font-normal">
        {admin
          ? "Generálj belépési kódot egy felhasználó számára Google OAuth nélkül."
          : "Ezzel a kóddal másik eszközön is bejelentkezhetsz Google OAuth nélkül."}
      </p>
      {admin && (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <SearchUser
            usersNameByEmail={usersNameByEmail}
            onSelectEmail={setEmail}
            inputValue={email}
            onInputChange={setEmail}
            clearOnSelect={false}
            placeholder="Felhasználó keresése"
          />
          <select
            aria-label="Kód érvényessége"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="min-h-10 rounded-xl border border-default-200 bg-background px-3 text-sm"
          >
            {Array.from({ length: 7 }, (_, index) => index + 1).map((day) => (
              <option key={day} value={day}>
                {day} {day === 1 ? "nap" : "napig"}
              </option>
            ))}
          </select>
        </div>
      )}
      {code && remaining > 0 && (
        <div className="space-y-2 rounded-xl border border-selfprimary-300 p-3 text-center">
          <p className="font-mono text-3xl font-bold tracking-widest">{code}</p>
          <p className="text-sm font-normal">
            Lejár: {minutes}:{seconds}
          </p>
          <p className="text-sm font-normal text-danger-600">
            Ne oszd meg senkivel ezt a kódot.
          </p>
          <Button size="sm" onPress={copyCode}>
            Kód másolása
          </Button>
        </div>
      )}
      {error && <p className="text-sm font-normal text-danger-600">{error}</p>}
      <Button color="primary" isLoading={isLoading} onPress={generateCode}>
        Kód generálása
      </Button>
    </div>
  );
};

export default OneTimeLoginGenerator;
