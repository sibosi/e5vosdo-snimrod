"use client";

import { Button } from "@heroui/react";
import { borrowRadio, returnRadio, getRadioStatus } from "./radioActions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Clock from "./Clock";
import KeyLogTable from "./KeyLogTable";

interface ClientProps {
  borrowed: number;
  borrowedBy?: string;
  borrowedAt?: Date;
  name: string;
}

export default function Page({
  borrowed,
  borrowedBy,
  borrowedAt,
  name,
}: ClientProps) {
  const router = useRouter();
  const [hidden, setHidden] = useState(true);
  const [radioStatus, setRadioStatus] = useState({
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

  const handleBorrowRadio = async () => {
    setErrorMessage("");
    try {
      await borrowRadio();
      setHidden(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to borrow radio:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba történt a rádiókulcs kölcsönzése során.",
      );
    }
  };

  const handleReturnRadio = async () => {
    setErrorMessage("");
    try {
      await returnRadio();
      router.refresh();
    } catch (error) {
      console.error("Failed to return radio:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba történt a rádiókulcs visszatétele során.",
      );
    }
  };

  const handleShowDiagram = () => {
    setErrorMessage("");
    try {
      getRadioStatus().then((status) => {
        setRadioStatus({
          borrowed: status.borrowed,
          borrowedBy: status.borrowed_by,
          borrowedAt: status.borrowed_at,
        });
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
      <h1>Rádiókulcs kölcsönvétel</h1>
      <p>Ezen a lapon tudod kölcsönvenni a rádiókulcsot.</p>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {borrowedBy === name && (
        <>
          <div>
            <p>Te kölcsönözted ki a rádiókulcsot.</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button onPress={handleReturnRadio} className="m-4 px-4">
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
          <p>A rádiókulcs jelenleg kölcsönben van.</p>
          <p>Kölcsönző: {borrowedBy ? borrowedBy : "Nem ismert"}</p>
          <p>Kölcsönzés ideje: {readableTime}</p>
        </div>
      ) : (
        <>
          <p>A rádiókulcs jelenleg a titkárságon van.</p>
          <Button onPress={handleBorrowRadio}>Rádiókulcs kölcsönzése</Button>
        </>
      )}
      <KeyLogTable />
      <div
        className={`${hidden ? "hidden" : ""} fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black`}
      >
        <p className="text-center text-2xl">
          Sikeresen kölcsönvetted a rádiókulcsot!
        </p>

        <Clock />

        <svg
          width="300"
          height="300"
          viewBox="0 0 1024 1024"
          className="max-h-[50vh] max-w-[80vw]"
        >
          <motion.path
            d="M854.5 785.1c0 10.1-8.2 18.3-18.3 18.3h-622c-10.1 0-18.3-8.2-18.3-18.3V382.7c0-10.1 8.2-18.3 18.3-18.3h622c10.1 0 18.3 8.2 18.3 18.3v402.4z"
            fill="#96C8D1"
          />
          <motion.path
            d="M370.3 648.5c0 20.2-16.4 36.6-36.6 36.6-20.2 0-36.6-16.4-36.6-36.6 0-20.2 16.4-36.6 36.6-36.6 20.2 0 36.6 16.4 36.6 36.6zM278.3 428.8h497.3V502H278.3z"
            fill="#FAE274"
          />
          <motion.path
            d="M836.2 346.1H360.6V337c0-5.1-4.1-9.1-9.1-9.1h-29.3l221.3-148.3c4.2-2.8 5.3-8.5 2.5-12.7s-8.5-5.3-12.7-2.5l-240.4 161c-1 0.7-1.8 1.5-2.4 2.4h-48.8c-5.1 0-9.1 4.1-9.1 9.1v9.1h-18.3c-20.2 0-36.6 16.4-36.6 36.6V785c0 20.2 16.4 36.6 36.6 36.6h622c20.2 0 36.6-16.4 36.6-36.6V382.7c-0.1-20.2-16.5-36.6-36.7-36.6z m-621.9 439V382.7h622v402.4h-622z"
            fill="#211F1E"
            stroke="white"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{
              duration: 5,
              times: [0.05, 0.49, 0.51, 0.95],
              repeat: Infinity,
            }}
          />
          <motion.path
            d="M333.7 602.8c-25.2 0-45.7 20.5-45.7 45.7 0 25.2 20.5 45.7 45.7 45.7 25.2 0 45.7-20.5 45.7-45.7 0.1-25.2-20.4-45.7-45.7-45.7z m0 73.2c-15.1 0-27.4-12.3-27.4-27.4 0-15.1 12.3-27.4 27.4-27.4 15.1 0 27.4 12.3 27.4 27.4 0.1 15.1-12.2 27.4-27.4 27.4zM755.8 621.1H463.1c-5.1 0-9.1 4.1-9.1 9.1 0 5.1 4.1 9.1 9.1 9.1h292.7c5.1 0 9.1-4.1 9.1-9.1s-4.1-9.1-9.1-9.1zM755.8 584.5H463.1c-5.1 0-9.1 4.1-9.1 9.1 0 5.1 4.1 9.1 9.1 9.1h292.7c5.1 0 9.1-4.1 9.1-9.1s-4.1-9.1-9.1-9.1zM755.8 694.3H463.1c-5.1 0-9.1 4.1-9.1 9.1 0 5.1 4.1 9.1 9.1 9.1h292.7c5.1 0 9.1-4.1 9.1-9.1 0-5.1-4.1-9.1-9.1-9.1zM755.8 657.7H463.1c-5.1 0-9.1 4.1-9.1 9.1 0 5.1 4.1 9.1 9.1 9.1h292.7c5.1 0 9.1-4.1 9.1-9.1s-4.1-9.1-9.1-9.1z"
            fill="#211F1E"
          />
        </svg>
        <Button onPress={() => setHidden(true)} className="mt-4">
          Bezárás
        </Button>
      </div>
    </div>
  );
}
