"use client";
import { Section } from "@/components/home/section";
import Tray from "@/components/tray";
import { Parlament } from "@/db/parlament";
import { Link } from "@heroui/react";
import React, { useEffect, useState } from "react";

export default function ParlamentManager() {
  const [parlamentList, setParlamentList] = useState<Parlament[]>();

  useEffect(() => {
    fetch("/api/getParlaments", {
      headers: {
        module: "parlament",
      },
    }).then((res) => {
      if (res.ok) {
        res.json().then((data: Parlament[]) => {
          setParlamentList(data.toReversed());
        });
      } else {
        alert("Hiba a parlamentek lekérdezése közben");
      }
    });
  }, []);

  return (
    <Section title="Parlamentek listája">
      <div className="space-y-2">
        {parlamentList ? (
          parlamentList.map((parlament) => (
            <Tray key={parlament.id} title={parlament.title}>
              <Link
                className="rounded-md bg-selfsecondary-200 px-2 py-1 text-foreground"
                href={"/parlament/" + parlament.id}
              >
                Részletek
              </Link>
            </Tray>
          ))
        ) : (
          <p>Betöltés...</p>
        )}
      </div>
    </Section>
  );
}
