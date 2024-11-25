"use client";
import Tray from "@/components/tray";
import { Parlament } from "@/db/parlement";
import React, { useEffect, useState } from "react";

const ParlamentsList = () => {
  const [parlaments, setParlaments] = useState<Parlament[]>();

  useEffect(() => {
    fetch("/api/getParlaments", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        module: "parlement",
      },
    }).then((res) => {
      if (res.ok) {
        res.json().then((data: Parlament[]) => {
          setParlaments(data);
          console.log(data);
        });
      } else {
        alert("Hiba a parlamentek lekérdezése közben");
      }
    });
  }, []);

  return (
    <Tray title="Parlamentek listája">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-foreground">Dátum</th>
            <th className="text-foreground">Cím</th>
          </tr>
        </thead>
        <tbody>
          {parlaments ? (
            parlaments.map((parlament) => (
              <tr key={parlament.id}>
                <td className="text-foreground">{String(parlament.date)}</td>
                <td className="text-foreground">{parlament.title}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>Betöltés...</td>
            </tr>
          )}
        </tbody>
      </table>
    </Tray>
  );
};

export default ParlamentsList;
