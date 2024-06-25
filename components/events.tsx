"use client";
import eventsConfig from "@/config/events.tsx";
import { Chip, Link } from "@nextui-org/react";
import { SideCard } from "./sidecard";
import { getEvents } from "@/db/dbreq";
import { useState, useEffect } from "react";

type Event = {
  id: number;
  title: string;
  time: string;
  show_time: string | null;
  hide_time: string;
  image: string | null;
  details: string | null;
  tags: string[];
};

export const Events = () => {
  let noneEvent = false;
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/db");
      const data = await response.json();
      setEvents(data);
    };

    fetchEvents();
  }, []);

  return (
    <div className="text-left items-start grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b-8 border-transparent pb-5">
      {events.map(
        (event, index) =>
          (event.show_time != undefined
            ? new Date(event.show_time) < new Date()
            : true) &&
          new Date(event.hide_time) > new Date() && (
            <div key={index + 100} className="pb-4">
              {(noneEvent = true)}
              <SideCard
                key={index}
                title={event.title}
                details={event.details}
                description={event.time}
                image={event.image ?? undefined}
                popup={true}
                button_size="sm"
              >
                <div className="flex gap-2">
                  {event.tags != undefined ? (
                    event.tags.map((tag, index) => (
                      <Chip key={tag + "" + index} color="warning" size="sm">
                        {tag}
                      </Chip>
                    ))
                  ) : (
                    <></>
                  )}
                  {event.image ? (
                    <Chip size="sm" variant="flat">
                      <Link
                        className="text-xs text-foreground"
                        href={event.image}
                      >
                        Kép forrása
                      </Link>
                    </Chip>
                  ) : (
                    <></>
                  )}
                </div>
              </SideCard>
            </div>
          )
      )}
      {!noneEvent ? <p>Nincs esemény</p> : <></>}
    </div>
  );
};
