"use client";

import { Button, Input } from "@heroui/react";
import React, { useState } from "react";
import SearchUser from "../searchUser";

const NewNotification = () => {
  const [notificationTitle, setNotificationTitle] = React.useState<string>();
  const [notificationMessage, setNotificationMessage] = useState<string>();
  const [notificationAddressees, setNotificationAddressees] = useState<
    string[]
  >([]);
  const [options, setOptions] = useState<string[]>([]);

  async function sendNotification(
    setTitle: (data: string) => void,
    setMessage: (data: string) => void,
    setAddressee: (data: string[]) => void,
  ) {
    const response = await fetch("/api/newNotificationByNames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: notificationTitle,
        message: notificationMessage,
        receiving_names: notificationAddressees,
      }),
    });
    if (response.status == 200) {
      alert("Sikeres küldés");
      setTitle("");
      setMessage("");
      setAddressee([]);
    }
  }

  return (
    <div className="text-foreground">
      <div className="flex w-full grid-cols-3 flex-wrap gap-4 py-2 md:mb-0 md:flex-nowrap">
        <Input
          size="md"
          type="text"
          label="Cím"
          value={notificationTitle}
          onValueChange={setNotificationTitle}
          color={notificationTitle == "" ? "danger" : "default"}
        />
        <Input
          size="md"
          type="text"
          label="Üzenet"
          value={notificationMessage}
          onValueChange={setNotificationMessage}
          color={notificationMessage == "" ? "danger" : "default"}
        />

        <SearchUser
          size="md"
          type="text"
          label="Címzett"
          onSelectEmail={(name) => {
            setNotificationAddressees([...notificationAddressees, name]);
            setOptions([]);
          }}
          className="w-full"
        />
      </div>
      <div className="mb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {notificationAddressees.map((name, index) => (
          <Button
            key={index}
            color="success"
            onPress={() =>
              setNotificationAddressees(
                notificationAddressees.filter((item) => item !== name),
              )
            }
          >
            {name}
          </Button>
        ))}
        {options.map((name, index) =>
          notificationAddressees.includes(name) ? null : (
            <Button
              key={index}
              color="default"
              onPress={() => {
                setNotificationAddressees([...notificationAddressees, name]);
                setOptions([]);
              }}
            >
              {name}
            </Button>
          ),
        )}
      </div>
      <Button
        className="fill-selfprimary"
        isDisabled={
          !notificationTitle ||
          !notificationMessage ||
          notificationAddressees.length == 0
        }
        onPress={() =>
          sendNotification(
            setNotificationTitle,
            setNotificationMessage,
            setNotificationAddressees,
          )
        }
      >
        Küldés
      </Button>
    </div>
  );
};

export default NewNotification;
