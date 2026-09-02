"use client";

import { Button, Input, Link } from "@heroui/react";
import { FormEvent, useState } from "react";

const CodeLoginForm = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    const response = await fetch("/api/auth/redeem-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    setIsLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Nem sikerült bejelentkezni.");
      return;
    }
    window.location.href = "/";
  }

  return (
    <form onSubmit={redeem} className="flex w-full max-w-md flex-col gap-4">
      <Input
        label="Egyszer használatos kód"
        placeholder="ABCDEFGH"
        value={code}
        maxLength={8}
        autoComplete="one-time-code"
        classNames={{ input: "font-mono uppercase tracking-widest" }}
        onChange={(event) =>
          setCode(event.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))
        }
      />
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <Button
        type="submit"
        color="primary"
        isLoading={isLoading}
        isDisabled={code.length !== 8}
      >
        Bejelentkezés
      </Button>
      <Link href="/" className="self-center text-selfprimary">
        Vissza a Google-bejelentkezéshez
      </Link>
    </form>
  );
};

export default CodeLoginForm;
