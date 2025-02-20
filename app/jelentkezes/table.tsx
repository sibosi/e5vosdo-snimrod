"use client";
import { Alert } from "@/components/home/alert";
import { UserType } from "@/db/dbreq";
import { PresentationType } from "@/db/presentationSignup";
import { Button } from "@heroui/react";
import React, { useEffect, useState } from "react";

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

const Field = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={
        "space-y-2 border-2 border-foreground-500 p-2 md:rounded-xl " +
        className
      }
    >
      {children}
    </div>
  );
};

const Table = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>();
  const [selectedPresentationId, setSelectedPresentationId] = useState<
    number | null
  >();

  useEffect(() => {
    fetch("/api/presentations/getPresentations").then((res) =>
      res.json().then((data) => setPresentations(data)),
    );
  }, []);

  useEffect(() => {
    fetch("/api/presentations/getMyPresentationId").then((res) =>
      res
        .json()
        .then((presentation_id) => setSelectedPresentationId(presentation_id)),
    );
  }, []);

  const signup = async (presentation_id: number) => {
    fetch("/api/presentations/signUpForPresentation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ presentation_id }),
    }).then((res) => {
      if (res.status === 200) {
        setSelectedPresentationId(presentation_id);
        alert("Sikeres jelentkezés");
      } else {
        alert("Sikertelen jelentkezés");
      }
    });
  };

  return (
    <div>
      <div className="mb-3 grid text-center max-md:gap-3 md:grid-cols-2">
        <div className="ml-2 flex flex-col rounded-xl bg-selfprimary-200 p-2">
          <p>Kiválasztva:</p>
          <p className="text-xl font-bold">
            {
              presentations?.find(
                (presentation) => presentation.id === selectedPresentationId,
              )?.name
            }
            {selectedPresentationId === null && "Nincs kiválasztva"}
          </p>
          <Button
            color="primary"
            isDisabled={
              selectedPresentationId === null ||
              selectedPresentationId === undefined
            }
            onPress={async () => {
              return fetch("/api/presentations/signUpForPresentation", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ presentation_id: "NULL" }),
              }).then((res) => {
                if (res.status === 200) {
                  setSelectedPresentationId(null);
                  alert("Sikeres törlés");
                } else {
                  alert("Sikertelen törlés");
                }
              });
            }}
          >
            Kiválasztás törlése
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 text-2xl font-extrabold max-md:hidden">
        <Field className="md:col-span-2">Név és Leírás</Field>
        <Field className="md:col-span-2">Részletek</Field>
        <Field>Jelentkezés</Field>
      </div>
      {presentations === undefined && (
        <div className="text-center">Betöltés...</div>
      )}
      {presentations?.map((presentation) => (
        <div
          key={presentation.id}
          className="my-2 grid rounded-xl border-2 border-selfprimary-400 bg-selfprimary-100 md:grid-cols-5 md:gap-4"
        >
          <Field className="md:col-span-2">
            <div>
              <div className="font-bold underline">{presentation.name}</div>
              {presentation.organiser}
            </div>
          </Field>
          <Field className="md:col-span-2">
            <div>
              <p>ID: {presentation.id}</p>

              {presentation.description}
            </div>
          </Field>
          <Field className="bg-selfprimary-200 text-center">
            <p className="text-xl font-bold">
              {presentation.remaining_capacity}
            </p>
            <Button
              color={
                selectedPresentationId === presentation.id
                  ? "success"
                  : "default"
              }
              isDisabled={selectedPresentationId === presentation.id}
              onPress={() => signup(presentation.id)}
            >
              {selectedPresentationId === presentation.id
                ? "Jelentkezve"
                : "Jelentkezés"}
            </Button>
          </Field>
        </div>
      ))}
    </div>
  );
};

export default Table;
