"use client";
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
    <div className="my-5">
      <div className="mx-1 rounded-2xl bg-selfprimary-100 bg-gradient-to-r p-3">
        <h2 className="text-2xl font-semibold text-foreground">
          Parlamentek listája
        </h2>
        <div className="my-2">
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
                    <td className="text-foreground">
                      {String(parlament.date)}
                    </td>
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
        </div>
      </div>
    </div>
  );
};

export default ParlamentsList;
