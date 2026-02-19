"use client";
import Image from "next/image";
import React from "react";
import { Countdown } from "../home/countdown";
import { PopupButton } from "../popupbutton";
import { EventType } from "@/db/event";

const EventSpotlight = ({ eventId }: { eventId: number }) => {
  const [event, setEvent] = React.useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/getEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        module: "event",
      },
      body: JSON.stringify({ id: eventId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
      });
  }, [eventId]);

  if (!event) return <p>Betöltés...</p>;

  return (
    <>
      <div className="mb-4 flex flex-col items-center justify-center gap-4">
        <button
          className="relative overflow-hidden rounded-3xl"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={event.image!}
            alt={
              typeof event.title === "object"
                ? event.title.join(" ")
                : event.title
            }
            width={350}
            height={100}
          />
          <h2 className="bg-linear-to-t absolute bottom-0 left-0 right-0 from-black to-transparent p-2 text-center text-xl text-white">
            {event.title}
          </h2>
        </button>

        <Countdown date={event.time} />
      </div>

      <PopupButton
        title={
          typeof event.title === "object" ? event.title.join(" ") : event.title
        }
        datetime={event.time}
        image={event.image ?? undefined}
        details={event.description}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </>
  );
};

export default EventSpotlight;
