"use client";

import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";

const NewNotification = () => {
  const [notificationTitle, setNotificationTitle] = React.useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationAddressee, setNotificationAddressee] = useState("");

  async function sendNotification(
    setTitle: (data: string) => void,
    setMessage: (data: string) => void,
    setAddressee: (data: string) => void
  ) {
    const response = await fetch("/api/newNotification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: notificationTitle,
        message: notificationMessage,
        receiving_emails: [notificationAddressee],
      }),
    });
    if (response.status == 200) {
      alert("Sikeres küldés");
      setTitle("");
      setMessage("");
      setAddressee("");
    }
  }

  return (
    <div className="rounded-3xl bg-primary-50 my-4 p-6 text-foreground">
      <h2 className="text-2xl font-semibold">Új értesítés</h2>
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <Input
          size="md"
          type="text"
          label="Cím"
          value={notificationTitle}
          onValueChange={setNotificationTitle}
        />
        <Input
          size="md"
          type="text"
          label="Üzenet"
          value={notificationMessage}
          onValueChange={setNotificationMessage}
        />
        <Input
          size="md"
          type="email"
          label="Címzett email"
          onValueChange={setNotificationAddressee}
        />
      </div>
      <p>{String(notificationTitle)}</p>
      <p>{String(notificationMessage)}</p>
      <p>{String(notificationAddressee)}</p>
      <Button
        color="primary"
        onClick={() =>
          sendNotification(
            setNotificationTitle,
            setNotificationMessage,
            setNotificationAddressee
          )
        }
      >
        Küldés
      </Button>
    </div>
  );
};

export default NewNotification;
