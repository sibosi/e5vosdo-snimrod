"use client";
import Input from "@/components/Input";
import React, { useState } from "react";
import SelectImage from "./SelectImage";
import { EventType } from "@/db/event";
import { Button, Checkbox, CheckboxGroup, Switch } from "@nextui-org/react";
import { UserType } from "@/db/dbreq";

const CreateEvent = ({ selfUser }: { selfUser: UserType }) => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImage, setEventImage] = useState<string>();
  const [eventPlaceOnSite, setEventPlaceOnSite] = useState<
    "carousel" | "events" | "everywhere"
  >();
  const [eventDate, setEventDate] = useState<string>();
  const [showAuthor, setShowAuthor] = useState(true);

  const handleCreateEvent = async () => {
    if (!eventImage || !eventName || !eventDescription || !eventDate)
      return alert("Minden mezőt ki kell tölteni!");

    const event: EventType = {
      id: 0,
      title: eventName,
      description: eventDescription,
      image: eventImage,
      show_time: new Date().toISOString(),
      hide_time: eventDate,
      tags: [],
      time: eventDate,
    };

    fetch("/api/createEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        module: "event",
      },
      body: JSON.stringify({
        event: event,
      }),
    }).then((res) => {
      if (res.ok) {
        alert("Esemény létrehozva!");
        setEventName("");
        setEventDescription("");
        setEventImage(undefined);
        setEventDate(undefined);
      } else {
        alert("Hiba történt az esemény létrehozása közben.");
      }
    });
  };

  return (
    <div className="space-y-2">
      <SelectImage onChange={setEventImage} />
      <Input
        label="Esemény neve"
        value={eventName}
        onChange={setEventName}
        placeholder="Az esemény / bejegyzés neve"
      />
      <textarea
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
        placeholder="Az esemény / bejegyzés leírása"
        className="h-32 w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
      />

      <div className="text-sm text-selfprimary-500">
        <p>Esemény dátuma:</p>
        <Input
          label="Esemény dátuma"
          value={eventDate ?? ""}
          onChange={setEventDate}
          type="datetime-local"
        />
      </div>

      <CheckboxGroup
        value={(() => {
          if (eventPlaceOnSite === "everywhere") return ["carousel", "events"];
          if (eventPlaceOnSite === "carousel") return ["carousel"];
          if (eventPlaceOnSite === "events") return ["events"];
          return [];
        })()}
        onValueChange={(value: string[]) => {
          if (value.length === 0) setEventPlaceOnSite(undefined);
          else if (value.length === 2) setEventPlaceOnSite("everywhere");
          else if (value[0] === "carousel") setEventPlaceOnSite("carousel");
          else setEventPlaceOnSite("events");
        }}
      >
        Hol jelenjen meg az esemény?
        <Checkbox value="carousel">Főoldal tetején</Checkbox>
        <Checkbox value="events">Események fül alatt</Checkbox>
      </CheckboxGroup>

      <div>
        <p>{showAuthor ? "Szerző: " + selfUser.name : "Szerző: Anonim"}</p>
        <Switch
          isSelected={showAuthor}
          onChange={() => setShowAuthor((prev) => !prev)}
        >
          Szerző megjelenítése
        </Switch>
      </div>

      <Button color="primary" onPress={handleCreateEvent}>
        Létrehozás
      </Button>
    </div>
  );
};

export default CreateEvent;
