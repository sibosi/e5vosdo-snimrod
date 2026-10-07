"use client";

import { Button, ButtonGroup, Input } from "@heroui/react";
import { borrowKey, returnKey, getKeyStatus } from "./keyActions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Radio, Key } from "./Vectors";
import Clock from "./Clock";
import KeyLogTable from "./KeyLogTable";

interface ClientProps {
  borrowed: number;
  borrowedBy?: string;
  borrowedAt?: Date;
  name: string;
  title: string;
  table: string;
  logTable: string;
  permission: string;
  svg: Number;
}

export default function Page({
  borrowed,
  borrowedBy,
  borrowedAt,
  name,
  title,
  table,
  logTable,
  permission,
  svg
}: ClientProps) {
  const router = useRouter();
  const [hidden, setHidden] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [keyStatus, setKeyStatus] = useState({
    borrowed: borrowed,
    borrowedBy: borrowedBy,
    borrowedAt: borrowedAt,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const readableTime = borrowedAt
    ? new Date(borrowedAt.toISOString()).toLocaleString("hu-HU", {
        timeZone: "Europe/Budapest",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Nem ismert";

  const handleBorrowKey = async () => {
    setErrorMessage("");
    try {
      await borrowKey({ permission, table, logTable });
      setHidden(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to borrow key:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba történt a kulcs kölcsönzése során.",
      );
    }
  };

  const handleReturnKey = async () => {
    setErrorMessage("");
    try {
      await returnKey({ permission, table, logTable });
      router.refresh();
    } catch (error) {
      console.error("Failed to return key:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba történt a kulcs visszatétele során.",
      );
    }
  };

  const handleShowDiagram = () => {
    setErrorMessage("");
    try {
      getKeyStatus({ table, permission, logTable }).then((status) => {
        setKeyStatus({
          borrowed: status.borrowed,
          borrowedBy: status.borrowed_by,
          borrowedAt: status.borrowed_at,
        });
        console.log("Key status CLIENT:", status);
        if (status.borrowed === 1 && status.borrowed_by === name) {
          setHidden(false);
        } else {
          router.refresh();
        }
      });
    } catch (error) {
      console.error("Failed to show diagram:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba történt az ábra megjelenítése során.",
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      <h1>{title}</h1>
      <p>Ezen a lapon tudod kölcsönvenni a kulcsot.</p>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {borrowedBy === name && (
        <>
          <div>
            <p>Te kölcsönözted ki a kulcsot.</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button onPress={handleReturnKey} className="m-4 px-4">
              Visszatétel
            </Button>
            <Button onPress={handleShowDiagram} className="m-4 px-4">
              Ábra mutatása
            </Button>
          </div>
        </>
      )}

      {borrowed == 1 ? (
        <div>
          <p>A kulcs jelenleg kölcsönben van.</p>
          <p>Kölcsönző: {borrowedBy ? borrowedBy : "Nem ismert"}</p>
          <p>Kölcsönzés ideje: {readableTime}</p>
        </div>
      ) : (
        <>
          <p>A kulcs jelenleg a helyén van.</p>
          <Button onPress={handleBorrowKey}>Kulcs kölcsönzése</Button>
        </>
      )}
      <KeyLogTable logTable={logTable} permission={permission} />

      <div
        className={`${hidden ? "hidden" : ""} fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-selfprimary-bg`}
      >
        <p className="text-center text-2xl">
          Sikeresen kölcsönvetted a kulcsot!
        </p>

        <Clock />

        {svg === 1 && <Radio />}
        {svg === 2 && <Key />}

        <Button onPress={() => setHidden(true)} className="mt-4">
          Bezárás
        </Button>
      </div>
    </div>
  );
}
