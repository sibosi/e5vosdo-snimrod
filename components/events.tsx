"use client";
import { Chip, Link } from "@nextui-org/react";
import { SideCard } from "./sidecard";
import { useState, useEffect } from "react";
import { EventType } from "@/db/event";

export const Events = ({ all = false }: { all?: boolean }) => {
  let noneEvent = false;
  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/getEvents", {
        headers: {
          module: "event",
        },
      });
      const data = await response.json();
      setEvents(data);
    };

    fetchEvents();
  }, []);

  const checkVisibility = (event: EventType) => {
    if (all) return true;
    console.log(new Date(event.hide_time) < new Date());
    if (new Date(event.hide_time) < new Date()) return false;
    if (event.show_time == undefined) return true;
    if (
      new Date(event.show_time).getTime() - 28 * 24 * 60 * 60 * 1000 >
      new Date().getTime()
    )
      return false;
    return true;
  };

  return (
    <div className="grid grid-cols-1 items-start gap-2 border-b-8 border-transparent pb-5 text-left md:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) =>
        checkVisibility(event) ? (
          <div key={index + 100} className="pb-4">
            {(noneEvent = true)}
            <SideCard
              key={index}
              title={
                typeof event.title === "object"
                  ? event.title.join(" ")
                  : event.title
              }
              details={event.description ?? undefined}
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
                ) : null}
                {event.tags != undefined
                  ? event.tags.map((tag, index) => (
                      <Chip
                        key={tag + "" + index}
                        className="bg-selfprimary-200"
                        size="sm"
                      >
                        {tag}
                      </Chip>
                    ))
                  : null}
                {event.image ? (
                  <Chip size="sm" variant="flat">
                    <Link
                      className="text-xs text-foreground"
                      href={event.image}
                    >
                      Kép forrása
                    </Link>
                  </Chip>
                ) : null}
              </div>
            </SideCard>
          </div>
        ) : (
          <></>
        ),
      )}
      {!noneEvent ? <p>Nincs esemény</p> : null}
    </div>
  );
};
