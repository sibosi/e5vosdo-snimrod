"use client";
import { PresentationType } from "@/db/dbreq";
import { Button } from "@nextui-org/react";
import React, { useState } from "react";

async function fetchSignupers(presentation_id: number) {
  const resp = await fetch("/api/getMembersAtPresentation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ presentation_id }),
  });
  console.log(resp);
  const data = await resp.json();
  return data;
}

async function fetchPresentationsByIds(presentation_ids: number[]) {
  const resp = await fetch("/api/getPresentationsByIds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ presentation_ids }),
  });
  console.log(resp);
  const data = await resp.json();
  return data as PresentationType[];
}

const SeeSignupers = () => {
  const [my_ids, setMy_ids] = useState<number[]>([150, 151, 152]);
  const [signupers, setSignupers] = useState<string[]>([]);
  const [presentation_id, setPresentation_id] = useState(100);
  const [presentations, setPresentations] = useState<PresentationType[]>([]);

  return (
    <div>
      <h1>Signupers</h1>
      <div>
        <h2>Elérhető prezentációk:</h2>
        <ul>
          {my_ids.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
        <div>
          <Button
            onPress={async () =>
              setPresentations(await fetchPresentationsByIds(my_ids))
            }
          >
            Get Presentations
          </Button>
          <ul>
            {presentations.map((presentation) => (
              <div key={presentation.id}>
                <h3>{presentation.name}</h3>
                <p>{presentation.organiser}</p>
              </div>
            ))}
          </ul>
        </div>
      </div>
      <input
        type="number"
        value={presentation_id}
        onChange={(e) => setPresentation_id(Number(e.target.value))}
      />
      <Button
        onPress={async () =>
          setSignupers(await fetchSignupers(presentation_id))
        }
      >
        Get Signupers
      </Button>
      <ul>
        {signupers.map((signuper) => (
          <li key={signuper}>{signuper}</li>
        ))}
      </ul>
    </div>
  );
};

export default SeeSignupers;
