"use client";
import Tray from "@/components/tray";
import { Button } from "@heroui/react";
import React, { useState } from "react";

const NewParlament = () => {
  const [newParlamentDate, setNewParlamentDate] = useState(() => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  function createParlament(date?: string) {
    const selectedDate = date ?? newParlamentDate;
    const startDate = new Date(selectedDate);
    const parlamentTitle = `Diákparlament - \n${startDate.toLocaleString(
      "hu-HU",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
    void fetch("/api/parliaments", {
      method: "POST",
      body: JSON.stringify({
        date: startDate.toISOString(),
        title: parlamentTitle,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          alert("Parlament sikeresen létrehozva");
          window.location.reload();
        } else {
          alert("Hiba a parlament létrehozása közben");
        }
      })
      .catch(() => {
        alert("Hiba a parlament létrehozása közben");
      });
  }

  return (
    <Tray title="Parlament létrehozása">
      <label className="text-foreground" htmlFor="newParlamentDate">
        Kérjük adja meg a parlament kezdési időpontját:
      </label>
      <input
        className="w-full rounded-md p-1"
        type="datetime-local"
        id="newParlamentDate"
        value={newParlamentDate}
        onChange={(e) => setNewParlamentDate(e.target.value)}
      />

      <Button
        className="mt-2"
        color="primary"
        onPress={() => createParlament()}
        isDisabled={!newParlamentDate}
      >
        Létrehozás -{" "}
        {new Date(newParlamentDate).toLocaleString("hu-HU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Button>
    </Tray>
  );
};

export default NewParlament;
