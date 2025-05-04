"use client";

import { Button, Input } from "@heroui/react";
import React, { useState } from "react";

const NewNotification = () => {
  const [notificationTitle, setNotificationTitle] = React.useState<string>();
  const [notificationMessage, setNotificationMessage] = useState<string>();
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

    if (searchName.length < 2) {
      setOptions([]);
      return;
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
        {searchName.length > 0 && (
          <Button
            color="default"
            variant="flat"
            onPress={() => {
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
              onPress={() => {
                setNotificationAddressees([...notificationAddressees, name]);
                setSearchName("");
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
