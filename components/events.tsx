"use client";
import { Chip, Link } from "@heroui/react";
import { SideCard } from "./sidecard";
import { useState, useEffect } from "react";
import { EventType } from "@/db/event";

interface EventByDateType {
  [date: string]: EventType[];
}

const shortWeekday: { [key: string]: string } = {
  hétfő: "hétf.",
  kedd: "kedd",
  szerda: "szer.",
  csütörtök: "csüt.",
  péntek: "pént.",
  szombat: "szom.",
  vasárnap: "vas.",
};

export const Events = ({ all = false }: { all?: boolean }) => {
  const [events, setEvents] = useState<EventByDateType>();
  const today = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/getEventEvents", {
        headers: {
          module: "event",
        },
      });
      const data = (await response.json()) as EventType[];
      let events = data.toSorted(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      events = events.filter((event) => {
        if (checkVisibility(event)) return true;
        return false;
      });

      let eventsByDate: EventByDateType = {};
      events.forEach((event) => {
        const date = new Date(event.time).toLocaleDateString("hu-HU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        if (eventsByDate[date] == undefined) eventsByDate[date] = [];
        eventsByDate[date].push(event);
      });
      if (eventsByDate[today] == undefined)
        eventsByDate = { [today]: [], ...eventsByDate };
      setEvents(eventsByDate);
    };

    fetchEvents();
  }, []);

  const checkVisibility = (event: EventType) => {
    if (all) return true;
    if (new Date(event.hide_time) < new Date()) return false;
    if (event.show_time == undefined) return true;
    if (
      new Date(event.show_time).getTime() - 28 * 24 * 60 * 60 * 1000 >
      new Date().getTime()
    )
      return false;
    return true;
  };

  if (events == undefined) return <p>Loading...</p>;
  if (Object.keys(events).length == 0) return <p>Nincs esemény</p>;

  return (
    <div className="grid grid-cols-1 items-start space-y-4 border-b-8 border-transparent pb-5 text-left md:grid-cols-2 lg:grid-cols-3">
      {Object.keys(events).map((date) => (
        <div key={date} className="flex gap-2">
          <div>
            <p className="text-center text-sm text-selfprimary-700">
              {
                shortWeekday[
                  new Date(date).toLocaleDateString("hu-HU", {
                    weekday: "long",
                  })
                ]
              }
            </p>
            <h2 className="mx-auto grid h-10 w-10 grid-cols-1 rounded-full bg-selfprimary-700 text-xl font-normal text-selfprimary-bg">
              <span className="m-auto">
                {new Date(date).toLocaleDateString("hu-HU", {
                  day: "numeric",
                })}
              </span>
            </h2>
          </div>
          <div className="w-full space-y-4">
            {events[date].length == 0 && (
              <div className="mt-5 flex h-10 max-w-md rounded-2xl bg-foreground-100">
                <p className="my-auto pl-6">A mai napon nincs esemény</p>
              </div>
            )}

            {events[date].map((event) => (
              <div key={`event-${event.id}`}>
                <SideCard
                  title={
                    typeof event.title === "object"
                      ? event.title.join(" ")
                      : event.title
                  }
                  details={event.description ?? undefined}
                  description={""}
                  image={event.image ?? "/events/default.jpg"}
                  popup={true}
                  button_size="sm"
                  makeStringToHTML={true}
                >
                  <div className="flex gap-2">
                    {event.show_time ? (
                      <>
                        <Chip
                          key={`day-of-week-${event.id}`}
                          size="sm"
                          className="bg-selfsecondary-50"
                        >
                          {new Date(event.time).toLocaleTimeString("hu-HU", {
                            hour: "numeric",
                            minute: "numeric",
                          })}
                        </Chip>
                        <Chip
                          key={`day-of-week-${event.id}-info`}
                          size="sm"
                          className="bg-selfprimary-50"
                        >
                          &nbsp;ⓘ&nbsp;
                        </Chip>
                      </>
                    ) : null}
                    {event.tags != undefined
                      ? event.tags.map((tag, tagIndex) => (
                          <Chip
                            key={`tag-${event.id}-${tagIndex}`}
                            className="bg-selfprimary-200"
                            size="sm"
                          >
                            {tag}
                          </Chip>
                        ))
                      : null}
                  </div>
                </SideCard>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
