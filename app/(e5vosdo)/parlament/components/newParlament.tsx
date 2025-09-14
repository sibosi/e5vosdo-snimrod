"use client";
import Tray from "@/components/tray";
import { Button } from "@heroui/react";
import React, { useState } from "react";

const NewParlament = () => {
  const [newParlamentDate, setNewParlamentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  function createParlament(date?: string) {
    const parlamentTitle = `Parlament - ${date ?? newParlamentDate}`;
    fetch("/api/createParlament", {
      method: "POST",
      body: JSON.stringify({
        date: date ?? newParlamentDate,
        title: parlamentTitle,
      }),
      headers: {
        module: "parlament",
      },
    }).then((res) => {
      if (res.ok) {
        alert("Parlament sikeresen létrehozva");
        window.location.reload();
      } else {
        alert("Hiba a parlament létrehozása közben");
      }
    });
  }

  return (
    <Tray title="Parlament létrehozása">
      <label className="text-foreground" htmlFor="newParlamentDate">
        Kérjük adja meg a parlament időpontját:
      </label>
      <input
        className="w-full rounded-md p-1"
        type="date"
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
        Létrehozás - {newParlamentDate}
      </Button>
    </Tray>
  );
};

export default NewParlament;
