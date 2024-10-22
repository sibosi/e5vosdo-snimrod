"use client";
import { Alert } from "@/components/home/alert";
import { PresentationType } from "@/db/dbreq";
import { Button, ButtonGroup } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

const fetchTableData = async () => {
  const response = await fetch("/api/presentations");
  const data = await response.json();
  return data as PresentationType[];
};

const nameBySlot = {
  11: "Csütörtök 1.",
  12: "Csütörtök 2.",
  21: "Péntek 1. (szakmai)",
  22: "Péntek 2.",
  23: "Péntek 3.",
};

const Field = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={"flex bg-selfprimary-200 p-2 md:rounded-2xl"}>
      <div className={"my-auto flex justify-center " + className}>
        {children}
      </div>
    </div>
  );
};

const Table = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>();
  const [slotId, setSlotId] = useState<number>(11);
  const [picked, setPicked] = useState<{
    [key: string]: number | undefined;
  }>({
    "11": undefined,
    "12": undefined,
    "21": undefined,
    "22": undefined,
    "23": undefined,
  });

  const signUp = async (
    slot_id: number,
    presentation_id: number | "NULL",
    smart = true,
  ) => {
    function getPair(slot_id: number, presentation_id: number | "NULL") {
      const thisPresentation = presentations?.find(
        (presentation) => presentation.id === presentation_id,
      );

      if (thisPresentation?.direct_child !== null) {
        const pair_id = thisPresentation?.direct_child;
        const pairPresentation = presentations?.find(
          (presentation) => presentation.id === pair_id,
        );
        return {
          slot_id: pairPresentation?.slot_id,
          presentation_id: pairPresentation?.id,
        };
      } else if (thisPresentation?.root_parent !== null) {
        const pair_id = thisPresentation?.root_parent;
        const pairPresentation = presentations?.find(
          (presentation) => presentation.id === pair_id,
        );
        return {
          slot_id: pairPresentation?.slot_id,
          presentation_id: pairPresentation?.id,
        };
      }
      return {
        slot_id: undefined,
        presentation_id: undefined,
      };
    }
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_id, presentation_id }),
      });

      // Ellenőrizzük, hogy sikeres volt-e a válasz
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.status} - ${errorData.error}`);
      }

      if (smart && presentation_id !== "NULL") {
        if (
          presentations?.find(
            (presentation) => presentation.id === picked[String(slotId)],
          )?.direct_child !== null
        ) {
          signUp(
            getPair(slot_id, picked[String(slotId)])?.slot_id,
            getPair(slot_id, picked[String(slotId)])?.presentation_id,
            false,
          );
        }
        if (
          presentations?.find(
            (presentation) => presentation.id === picked[String(slotId)],
          )?.root_parent !== null
        ) {
          signUp(
            getPair(slot_id, picked[String(slotId)])?.slot_id,
            getPair(slot_id, picked[String(slotId)])?.presentation_id,
            false,
          );
        }
      }

      if (smart && presentation_id === "NULL") {
        if (
          presentations?.find(
            (presentation) => presentation.id === picked[String(slotId)],
          )?.direct_child !== null
        ) {
          await signUp(
            getPair(slot_id, picked[String(slotId)])?.slot_id,
            "NULL",
            false,
          );
        }
        if (
          presentations?.find(
            (presentation) => presentation.id === picked[String(slotId)],
          )?.root_parent !== null
        ) {
          await signUp(
            getPair(slot_id, picked[String(slotId)])?.slot_id,
            "NULL",
            false,
          );
        }
      }

      const data = await response.json();

      // Jelentkezés sikerességének kezelése
      if (presentation_id === "NULL") {
        setPicked((prevPicked) => ({
          ...prevPicked,
          [String(slot_id)]: undefined,
        }));
      } else {
        setPicked((prevPicked) => ({
          ...prevPicked,
          [String(slot_id)]: presentation_id,
        }));
      }
    } catch (error) {
      // Hibakezelés: alert a felhasználónak és hiba logolása
      console.error("Jelentkezési hiba:", error);
      alert("Hiba történt a jelentkezés során. " + error.message);
    }
    fetchTableData().then(setPresentations);
  };

  useEffect(() => {
    fetchTableData().then(setPresentations);
  }, []);

  return (
    <div>
      <div className="mb-3 grid text-center max-md:gap-3 md:grid-cols-2">
        <div className="grid">
          <p>Válassz előadássávot:</p>
          <ButtonGroup className="flex flex-wrap">
            <Button
              className={slotId == 11 ? "bg-selfsecondary-300" : ""}
              onClick={() => setSlotId(11)}
            >
              Csüt. 1.
              {picked && picked["11"] !== undefined ? "✅" : "❌"}
            </Button>
            <Button
              className={slotId == 12 ? "bg-selfsecondary-300" : ""}
              onClick={() => setSlotId(12)}
            >
              Csüt. 2.
              {picked && picked["12"] !== undefined ? "✅" : "❌"}
            </Button>
            <Button
              className={slotId == 21 ? "bg-selfsecondary-300" : ""}
              onClick={() => setSlotId(21)}
            >
              Pént. 1. (szakmai)
              {picked && picked["21"] !== undefined ? "✅" : "❌"}
            </Button>
            <Button
              className={slotId == 22 ? "bg-selfsecondary-300" : ""}
              onClick={() => setSlotId(22)}
            >
              Pént. 2.
              {picked && picked["22"] !== undefined ? "✅" : "❌"}
            </Button>
            <Button
              className={slotId == 23 ? "bg-selfsecondary-300" : ""}
              onClick={() => setSlotId(23)}
            >
              Pént. 3.
              {picked && picked["23"] !== undefined ? "✅" : "❌"}
            </Button>
          </ButtonGroup>
        </div>

        <div className="ml-2 flex flex-col rounded-xl bg-selfprimary-200 p-2">
          <p>Kiválasztva:</p>
          {
            presentations?.find(
              (presentation) => presentation.id === picked[String(slotId)],
            )?.name
          }
          <Button
            disabled={!picked}
            onClick={async () => {
              await signUp(slotId, "NULL");
              await signUp(slotId, "NULL");
            }}
          >
            Kiválasztás törlése
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-2xl font-extrabold max-md:hidden">
        <Field>Név és Leírás</Field>
        <Field>Szervező</Field>
        <Field>Maradék hely</Field>
      </div>
      {presentations === undefined && (
        <div className="text-center">Betöltés...</div>
      )}
      {presentations?.map(
        (presentation) =>
          presentation.slot_id === slotId && (
            <div
              key={presentation.id}
              className="my-2 grid overflow-hidden rounded-xl bg-selfprimary-100 md:grid-cols-3 md:gap-4"
            >
              <Field>
                <div>
                  <div className="font-bold underline">{presentation.name}</div>
                  {presentation.organiser}
                </div>
              </Field>
              <Field>
                <div>
                  {String(presentation.direct_child)}
                  {presentation.description}
                  {presentation.direct_child !== null && (
                    <Alert className="border-selfsecondary-400 bg-selfsecondary-200">
                      Figyelem! Ez az előadás egy másik sávban folytatódik! (
                      <span className="font-extrabold">
                        {
                          nameBySlot[
                            presentations.find(
                              (p) => p.id === presentation.direct_child,
                            )?.slot_id
                          ]
                        }
                      </span>
                      )
                      <br />
                      Ha erre jelentkezel, a másik sávban törlődik a
                      jelentkezésed és ez lesz a kiválasztott előadásod.
                    </Alert>
                  )}
                  {presentation.root_parent !== null && (
                    <Alert className="border-selfsecondary-400 bg-selfsecondary-200">
                      Figyelem! Egy korábbi előadás folytatása! (
                      <span className="font-extrabold">
                        {
                          nameBySlot[
                            presentations.find(
                              (p) => p.id === presentation.root_parent,
                            )?.slot_id
                          ]
                        }
                      </span>
                      )
                      <br />
                      Ha erre jelentkezel, a korábbi előadás törlődik a
                      jelentkezésedből és ez lesz a kiválasztott előadásod.
                    </Alert>
                  )}
                </div>
              </Field>

              <Field>
                <div
                  className={
                    "rounded-lg p-4 " +
                    (presentation.remaining_capacity > 20
                      ? "bg-green-500"
                      : presentation.remaining_capacity > 10
                        ? "bg-yellow-500"
                        : presentation.remaining_capacity > 0
                          ? "bg-red-500"
                          : "bg-purple-500")
                  }
                >
                  <p className="text-center text-2xl font-extrabold">
                    {picked[String(slotId)] === presentation.id &&
                      "Kiválasztva"}
                  </p>
                  <p className="mx-auto max-w-min text-2xl">
                    {String(presentation.remaining_capacity)}
                  </p>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      await signUp(slotId, presentation.id)
                        .catch(() => alert("Hiba történt a jelentkezés során."))
                        .then(async () => {
                          if (
                            presentation.direct_child !== null ||
                            presentation.root_parent !== null
                          ) {
                            await signUp(slotId, presentation.id).catch(() =>
                              alert("Hiba történt a jelentkezés során."),
                            );
                          }
                        });
                    }}
                  >
                    Jelentkezés
                  </Button>
                </div>
              </Field>
            </div>
          ),
      )}
    </div>
  );
};

export default Table;
