"use client";
import { Chip, Link } from "@nextui-org/react";
import { SideCard } from "./sidecard";
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
      const response = await fetch("/api/getEvents");
      const data = await response.json();
      setEvents(data);
    };

    fetchEvents();
  }, []);

  return (
    <div className="grid grid-cols-1 items-start gap-2 border-b-8 border-transparent pb-5 text-left md:grid-cols-2 lg:grid-cols-3">
      {events.map(
        (event, index) =>
          (event.show_time != undefined
            ? new Date(event.show_time).getTime() - 21 * 24 * 60 * 60 * 1000 <
              new Date().getTime()
            : true) &&
          new Date(event.hide_time) > new Date() && (
            <div key={index + 100} className="pb-4">
              {(noneEvent = true)}
              <SideCard
                key={index}
                title={event.title}
                details={event.details ?? undefined}
                description={event.time}
                image={event.image ?? "/events/default.jpg"}
                popup={true}
                button_size="sm"
                makeStringToHTML={true}
              >
                <div className="flex gap-2">
                  {event.show_time ? (
                    <Chip
                      key={"day of week"}
                      size="sm"
                      className="bg-selfsecondary-200"
                    >
                      {new Date(event.show_time).toLocaleDateString("hu-HU", {
                        weekday: "long",
                      })}
                    </Chip>
                  ) : (
                    <></>
                  )}
                  {event.tags != undefined ? (
                    event.tags.map((tag, index) => (
                      <Chip
                        key={tag + "" + index}
                        className="bg-selfprimary-200"
                        size="sm"
                      >
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
          ),
      )}
      {!noneEvent ? <p>Nincs esemény</p> : <></>}
    </div>
  );
};
