"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Link } from "@heroui/react";
import { lockRadioKey, unlockRadioKey, forceReturnKey } from "../keyActions";
import { useRouter } from "next/navigation";
import { getWeekLabel } from "./week";

interface ClientProps {
  isAdmin: boolean;
  status: Number;
  msg: string;
}

export default function Client({ isAdmin, status, msg }: ClientProps) {
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (status === 2) {
      setMessage(msg ? msg : "Nincs üzenet");
    }
  });

  const handleLock = async () => {
    lockRadioKey({ msg: message });
    router.refresh();
  };

  const handleUnlock = async () => {
    unlockRadioKey();
    router.refresh();
  };

  const handleForce = async () => {
    forceReturnKey();
    router.refresh();
  };

  const week = getWeekLabel();

  return (
    <>
      <div className="m-4 flex flex-col items-center justify-center">
        <h1 className="m-2 text-center text-xl font-semibold">{week}</h1>
        <Link
          isExternal
          href="https://docs.google.com/spreadsheets/d/1VKtZ2-UKuXWRNvGaqBVG647DQUpv0_ZycNXwn8Xfaeg/edit?usp=sharing"
          className="m-2 text-center text-xl text-selfprimary"
        >
          Beosztás táblázat
        </Link>
      </div>
      {status == 2 && (
        <div className="flex h-40 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-center text-lg font-semibold">
              A rádiókulcs jelenleg nem elérhető.
            </p>
            <p className="text-center text-lg font-semibold">{msg}</p>
          </motion.div>
        </div>
      )}

      {status == 2 && isAdmin && (
        <>
          <p>Üzenet: {message}</p>
          <Button onPress={handleUnlock}>Tiltás levétele</Button>
        </>
      )}
      {status !== 2 && isAdmin && (
        <>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></Input>
          <Button onPress={handleLock}>Tiltás</Button>
        </>
      )}
      {status == 1 && isAdmin && (
        <>
          <Button onPress={handleForce} color="danger">
            Visszatétel kényszerítése
          </Button>
        </>
      )}
    </>
  );
}
