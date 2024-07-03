"use client";

import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";

const NewNotification = () => {
  const [notificationTitle, setNotificationTitle] = React.useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationAddressees, setNotificationAddressees] = useState<
    string[]
  >([]);
  const [searchName, setSearchName] = useState("");
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  async function search(searchName: string) {
    if (allUsers.length == 0) {
      const response = await fetch("/api/getUsersName");
      const data: string[] = await response.json();
      setAllUsers(data.sort());
    }

    let filteredUsers: string[] = [];
    allUsers.map((name: string) => {
      if (name.toLocaleLowerCase().includes(searchName.toLowerCase())) {
        filteredUsers.push(name);
      }
    });
    setOptions(filteredUsers);
  }

  async function sendNotification(
    setTitle: (data: string) => void,
    setMessage: (data: string) => void,
    setAddressee: (data: string[]) => void
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
    <div className="rounded-3xl bg-primary-50 my-4 p-6 text-foreground">
      <h2 className="text-2xl font-semibold">
        Új értesítés &middot; csak adminoknak
      </h2>
      <div className="flex w-full flex-wrap md:flex-nowrap md:mb-0 gap-4 py-2 grid-cols-3">
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
          type="text"
          label="Címzett"
          value={searchName}
          onValueChange={(name) => {
            setSearchName(name), search(name);
          }}
          placeholder={
            notificationAddressees.length > 0
              ? notificationAddressees.length + " címzett hozzáadva"
              : "Kezdj el gépelni egy nevet..."
          }
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-5">
        {notificationAddressees.map((name, index) => (
          <Button
            key={index}
            color="success"
            onClick={() =>
              setNotificationAddressees(
                notificationAddressees.filter((item) => item !== name)
              )
            }
          >
            {name}
          </Button>
        ))}
        {searchName.length > 0 && (
          <Button
            color="default"
            variant="flat"
            onClick={() => {
              setNotificationAddressees([
                ...notificationAddressees,
                searchName,
              ]);
              setSearchName("");
              setOptions([]);
            }}
          >
            {searchName}
          </Button>
        )}
        {options.map((name, index) =>
          notificationAddressees.includes(name) ? null : (
            <Button
              key={index}
              color="default"
              onClick={() => {
                setNotificationAddressees([...notificationAddressees, name]);
                setSearchName("");
                setOptions([]);
              }}
            >
              {name}
            </Button>
          )
        )}
      </div>
      <p>{String(notificationTitle)}</p>
      <p>{String(notificationMessage)}</p>
      <p>{String(notificationAddressees)}</p>
      <Button
        color="primary"
        onClick={() =>
          sendNotification(
            setNotificationTitle,
            setNotificationMessage,
            setNotificationAddressees
          )
        }
      >
        Küldés
      </Button>
    </div>
  );
};

export default NewNotification;
