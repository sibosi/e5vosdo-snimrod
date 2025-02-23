"use client";
import { PresentationType } from "@/db/presentationSignup";
import { Button } from "@heroui/react";
import React, { useEffect, useState } from "react";

const Field = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={"space-y-2 p-2 " + className}>{children}</div>;
};

const Table = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>();
  const [selectedPresentationId, setSelectedPresentationId] = useState<
    number | null
  >();
  const [isFetchingAutomatically, setIsFetchingAutomatically] = useState(false);

  async function initData() {
    const presRes = await fetch("/api/presentations/getPresentations");
    const presData = await presRes.json();
    setPresentations(presData);

    const myPresRes = await fetch("/api/presentations/getMyPresentationId");
    const myPres = await myPresRes.json();
    setSelectedPresentationId(myPres);
  }

  const setupSSE = () => {
    const evtSource = new EventSource("/api/presentations/sseCapacity");
    setIsFetchingAutomatically(true);

    evtSource.onmessage = (event) => {
      try {
        const capacityData: { [key: number]: number } | { message: string } =
          JSON.parse(event.data);

        if (!("message" in capacityData))
          setPresentations((prev) =>
            prev?.map((p) => ({
              ...p,
              remaining_capacity: capacityData[p.id],
            })),
          );
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    evtSource.onerror = (err) => {
      console.error("EventSource encountered an error:", err);
      evtSource.close();
      setIsFetchingAutomatically(false);
    };

    return () => {
      evtSource.close();
      setIsFetchingAutomatically(false);
    };
  };

  useEffect(() => {
    if (!isFetchingAutomatically) setupSSE();
  }, [isFetchingAutomatically]);

  useEffect(() => {
    initData().then(() => setupSSE());
  }, []);

  const signup = async (presentation_id: number) => {
    const response = await fetch("/api/presentations/signUpForPresentation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presentation_id }),
    });

    if (response.ok) {
      setSelectedPresentationId(presentation_id);
      alert("Sikeres jelentkezés");
    } else {
      alert("Sikertelen jelentkezés");
    }
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
              const response = await fetch(
                "/api/presentations/signUpForPresentation",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ presentation_id: "NULL" }),
                },
              );
              if (response.ok) {
                setSelectedPresentationId(null);
                alert("Sikeres törlés");
              } else {
                alert("Sikertelen törlés");
              }
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
          className="my-2 grid overflow-hidden rounded-xl border-2 border-selfprimary-400 bg-selfprimary-100 md:grid-cols-5 md:gap-4"
        >
          <Field className="bg-selfprimary-200 md:col-span-2">
            <div>
              <div className="font-bold underline">
                {presentation.id}. {presentation.name}
              </div>
              <p>{presentation.requirements}</p>
              <br />
              <p className="info">{presentation.adress}</p>
            </div>
          </Field>
          <Field className="md:col-span-2">
            <div>{presentation.description}</div>
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
