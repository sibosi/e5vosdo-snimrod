"use client";

import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

const OneTimeLoginGenerator = () => {
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    const response = await fetch("/api/auth/generate-code", { method: "POST" });
    const data = await response.json();
    setIsLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Nem sikerült kódot generálni.");
      return;
    }
    setCode(data.code);
    setExpiresAt(new Date(data.expiresAt).getTime());
    setRemaining(new Date(data.expiresAt).getTime() - Date.now());
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
        Ezzel a kóddal másik eszközön is bejelentkezhetsz Google OAuth nélkül.
      </p>
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
