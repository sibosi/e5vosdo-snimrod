"use client";
import { Button } from "@heroui/react";
import React, { useState } from "react";

export default function BackupButton() {
  const [isRunning, setIsRunning] = useState(false);

  const runBackup = async () => {
    if (!confirm("Biztosan létrehozod az adatbázis biztonsági mentését?"))
      return;

    setIsRunning(true);
    try {
      const response = await fetch("/api/admin/backup", { method: "GET" });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.success) {
        alert(data.message || "Biztonsági mentés elkészült!");
      } else {
        alert(data?.message || "Hiba történt a biztonsági mentés során!");
      }
    } catch (error) {
      console.error("Error calling backup:", error);
      alert("Hiba történt a biztonsági mentés során!");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button color="primary" onPress={runBackup} isDisabled={isRunning}>
      {isRunning ? "Mentés folyamatban..." : "Adatbázis mentése"}
    </Button>
  );
}
