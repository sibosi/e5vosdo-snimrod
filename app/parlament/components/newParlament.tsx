"use client";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";

const NewParlament = () => {
  const [newParlamentDate, setNewParlamentDate] = useState("");

  function createParlament() {
    const parlamentTitle = `Parlament - ${newParlamentDate}`;
    fetch("/api/createParlament", {
      method: "POST",
      body: JSON.stringify({
        date: newParlamentDate,
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
    <div className="my-5">
      <div className="mx-1 rounded-2xl bg-selfprimary-100 bg-gradient-to-r p-3">
        <h2 className="text-2xl font-semibold text-foreground">
          Parlament létrehozása
        </h2>
        <div className="my-2">
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
            onClick={createParlament}
          >
            Létrehozás - {newParlamentDate}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewParlament;
