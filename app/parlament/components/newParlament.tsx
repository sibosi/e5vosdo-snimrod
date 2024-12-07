"use client";
import Tray from "@/components/tray";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";

const NewParlament = () => {
  const [newParlamentDate, setNewParlamentDate] = useState("");

  function createParlament(date?: string) {
    const parlamentTitle = `Parlament - ${date ?? newParlamentDate}`;
    fetch("/api/createParlament", {
      method: "POST",
      body: JSON.stringify({
        date: date ?? newParlamentDate,
        title: parlamentTitle,
      }),
      headers: {
        module: "parlement",
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
      <Button
        radius="sm"
        className="mt-2 bg-selfprimary-200 px-1 text-foreground"
        onClick={() => {
          createParlament(new Date().toISOString().split("T")[0]);
        }}
      >
        Mai parlament létrehozása - {new Date().toISOString().split("T")[0]}
      </Button>
      <br />
      <label className="text-foreground" htmlFor="newParlamentDate">
        Dátum:
      </label>
      <input
        className="w-full rounded-md p-1"
        type="date"
        id="newParlamentDate"
        value={newParlamentDate}
        onChange={(e) => setNewParlamentDate(e.target.value)}
      />

      <Button
        radius="sm"
        className="mt-2 bg-selfprimary-200 px-1 text-foreground"
        onClick={() => createParlament()}
        isDisabled={!newParlamentDate}
      >
        Létrehozás - {newParlamentDate}
      </Button>
    </Tray>
  );
};

export default NewParlament;
