"use client";
import Input from "@/components/Input";
import React, { useEffect, useState } from "react";
import SelectImage from "./SelectImage";
import { EventType } from "@/db/event";
import { Button, Checkbox, CheckboxGroup, Switch } from "@nextui-org/react";
import { UserType } from "@/db/dbreq";

const CreateEvent = ({
  selfUser,
  id = undefined,
}: {
  selfUser: UserType;
  id?: number;
}) => {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventImage, setEventImage] = useState<string>(""); // módosítva
  const [showAtCarousel, setShowAtCarousel] = useState(false);
  const [showAtEvents, setShowAtEvents] = useState(false);
  const [eventDate, setEventDate] = useState<string>(""); // módosítva
  const [showAuthor, setShowAuthor] = useState(true);

  const handleCreateEvent = async () => {
    if (!eventImage || !eventName || !eventDate)
      return alert("Minden mezőt ki kell tölteni!");

    const event: EventType = {
      id: 0,
      title: eventName,
      description: eventDescription,
      image: eventImage,
      show_time: new Date().toISOString(),
      hide_time: new Date(eventDate).toISOString(),
      tags: [],
      time: new Date(eventDate).toISOString(),
      show_author: showAuthor,
      show_at_carousel: showAtCarousel,
      show_at_events: showAtEvents,
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
        setEventImage("");
        setEventDate("");
      } else {
        alert("Hiba történt az esemény létrehozása közben.");
      }
    });
  };

  useEffect(() => {
    if (id) {
      fetch("/api/getPreviewEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          module: "event",
        },
        body: JSON.stringify({ id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setEventName(data.title ?? "");
          setEventDescription(data.description ?? "");
          setEventImage(data.image ?? "");
          setEventDate(data.hide_time ?? "");
          setShowAuthor(data.show_author);
          setShowAtCarousel(data.show_at_carousel);
          setShowAtEvents(data.show_at_events);
        });
    }
  }, [id]);

  return (
    <div className="space-y-2">
      <SelectImage onChange={setEventImage} value={eventImage} />
      <div>
        <p>Az esemény neve</p>
        <Input
          label="Esemény neve"
          value={eventName}
          onChange={setEventName}
          placeholder="Az esemény / bejegyzés neve"
        />
        <p>Az esemény dátuma</p>
        <Input
          label="Esemény dátuma"
          value={eventDate}
          onChange={setEventDate}
          type="datetime-local"
        />
      </div>

      <textarea
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
        placeholder="Az esemény / bejegyzés leírása (nem kötelező)"
        className="h-32 w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
      />

      <CheckboxGroup
        value={(() => {
          if (showAtCarousel && showAtEvents) return ["carousel", "events"];
          if (showAtCarousel) return ["carousel"];
          if (showAtEvents) return ["events"];
          return [];
        })()}
        onValueChange={(value: string[]) => {
          setShowAtCarousel(value.includes("carousel"));
          setShowAtEvents(value.includes("events"));
        }}
      >
        Hol jelenjen meg az esemény?
        <Checkbox value="carousel">Főoldal tetején</Checkbox>
        <Checkbox value="events">Események fül alatt</Checkbox>
      </CheckboxGroup>

      <div>
        <p>{showAuthor ? "Feltöltő: " + selfUser.name : "Feltöltő: Anonim"}</p>
        <Switch
          isSelected={showAuthor}
          onChange={() => setShowAuthor((prev) => !prev)}
        >
          Feltöltő megjelenítése (hamarosan)
        </Switch>
      </div>
      {/* TODO: Feltöltő megjelenítése (hamarosan) */}

      <Button color="primary" onPress={handleCreateEvent}>
        Létrehozás
      </Button>
    </div>
  );
};

export default CreateEvent;
