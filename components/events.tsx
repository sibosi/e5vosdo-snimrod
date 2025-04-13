"use client";
import { Chip } from "@heroui/react";
import { SideCard } from "./sidecard";
import { useState, useEffect } from "react";
import { EventType } from "@/db/event";
import { Section } from "./home/section";

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
  const [archivedEvents, setArchivedEvents] = useState<EventByDateType>();
  const today = new Date().toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/getAllEvent", {
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
      let archivedEventsByDate: EventByDateType = {};

      events.forEach((event) => {
        const date = new Date(event.time).toLocaleDateString("hu-HU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        if (new Date(date).getTime() < new Date().setHours(0, 0, 0, 0)) {
          if (archivedEventsByDate[date] == undefined)
            archivedEventsByDate[date] = [];
          archivedEventsByDate[date].push(event);
        } else {
          if (eventsByDate[date] == undefined) eventsByDate[date] = [];
          eventsByDate[date].push(event);
        }
      });

      if (eventsByDate[today] == undefined)
        eventsByDate = { [today]: [], ...eventsByDate };

      setEvents(eventsByDate);
      setArchivedEvents(archivedEventsByDate);
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

  const sortedDates = Object.keys(events).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  const itemsToRender: Array<{
    type: "month" | "date";
    month?: string;
    date: string;
    key: string;
  }> = [];
  let currentMonth: any = null;

  sortedDates.forEach((date) => {
    const eventDate = new Date(date);
    const month = eventDate.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
    });

    if (currentMonth !== month) {
      itemsToRender.push({
        type: "month",
        month,
        date: "",
        key: `month-${month}`,
      });
      currentMonth = month;
    }

    itemsToRender.push({
      type: "date",
      date,
      key: `date-${date}`,
    });
  });

  const archivedItemsToRender: Array<{
    type: "month" | "date";
    month?: string;
    date: string;
    key: string;
  }> = [];

  if (archivedEvents) {
    let archivedCurrentMonth: any = null;
    const archivedSortedDates = Object.keys(archivedEvents).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(), // Reverse chronological
    );

    archivedSortedDates.forEach((date) => {
      const eventDate = new Date(date);
      const month = eventDate.toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
      });

      if (archivedCurrentMonth !== month) {
        archivedItemsToRender.push({
          type: "month",
          month,
          date: "",
          key: `archived-month-${month}`,
        });
        archivedCurrentMonth = month;
      }

      archivedItemsToRender.push({
        type: "date",
        date,
        key: `archived-date-${date}`,
      });
    });
  }

  return (
    <div className="-md:grid-cols-2 -lg:grid-cols-3 grid grid-cols-1 items-start space-y-4 border-b-8 border-transparent pb-5 text-left">
      {archivedEvents && Object.keys(archivedEvents).length > 0 && (
        <Section
          title="Korábbi események"
          dropdownable
          defaultStatus="closed"
          savable={false}
        >
          <div className="-md:grid-cols-2 -lg:grid-cols-3 grid grid-cols-1 items-start space-y-4 border-b-8 border-transparent pb-5 text-left">
            {archivedItemsToRender.map((item) => {
              if (item.type === "month") {
                return (
                  <div key={item.key} className="col-span-full my-4">
                    <h2 className="border-b border-selfprimary-200 pb-2 text-xl font-semibold text-selfprimary-700">
                      {item.month}
                    </h2>
                  </div>
                );
              } else {
                const date = item.date;
                return (
                  <div key={item.key} className="flex gap-2">
                    <div>
                      <p className="text-center text-xs font-semibold text-selfprimary-700">
                        {
                          shortWeekday[
                            new Date(date).toLocaleDateString("hu-HU", {
                              weekday: "long",
                            })
                          ]
                        }
                      </p>
                      <h2 className="mx-auto grid w-9 grid-cols-1 rounded-full text-xl font-normal text-selfprimary-700">
                        <span className="m-auto">
                          {new Date(date).toLocaleDateString("hu-HU", {
                            day: "numeric",
                          })}
                        </span>
                      </h2>
                    </div>
                    <div className="w-full space-y-2">
                      {archivedEvents[date].map((event) => (
                        <div key={`archived-event-${event.id}`}>
                          <SideCard
                            title={
                              typeof event.title === "object"
                                ? event.title.join(" ")
                                : event.title
                            }
                            details={event.description ?? undefined}
                            description={""}
                            image={event.image ?? undefined}
                            popup={true}
                            makeStringToHTML={true}
                          >
                            <div className="flex gap-2">
                              {event.show_time ? (
                                <>
                                  <Chip
                                    key={`archived-time-${event.id}`}
                                    size="sm"
                                    className="bg-selfsecondary-50"
                                  >
                                    {new Date(event.time).toLocaleTimeString(
                                      "hu-HU",
                                      {
                                        hour: "numeric",
                                        minute: "numeric",
                                      },
                                    )}
                                  </Chip>
                                  <Chip
                                    key={`archived-info-${event.id}`}
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
                                      key={`archived-tag-${event.id}-${tagIndex}`}
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
                );
              }
            })}
          </div>
        </Section>
      )}

      {itemsToRender.map((item) => {
        if (item.type === "month") {
          return (
            <div key={item.key} className="col-span-full my-4">
              <h2 className="border-b border-selfprimary-200 pb-2 text-xl font-semibold text-selfprimary-700">
                {item.month}
              </h2>
            </div>
          );
        } else {
          const date = item.date;
          const isToday =
            date ===
            new Date().toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });

          return (
            <div key={item.key} className="flex gap-2">
              <div>
                <p className="text-center text-xs font-semibold text-selfprimary-700">
                  {
                    shortWeekday[
                      new Date(date).toLocaleDateString("hu-HU", {
                        weekday: "long",
                      })
                    ]
                  }
                </p>
                <h2
                  className={`mx-auto grid w-9 grid-cols-1 rounded-full ${isToday ? "h-9 bg-selfprimary-700 text-selfprimary-bg" : "text-selfprimary-700"} text-xl font-normal`}
                >
                  <span className="m-auto">
                    {new Date(date).toLocaleDateString("hu-HU", {
                      day: "numeric",
                    })}
                  </span>
                </h2>
              </div>
              <div className="w-full space-y-2">
                {events[date].length == 0 && (
                  <div className="w-full max-w-md rounded-2xl bg-foreground-100 p-4 py-3 text-left">
                    <h2 className="text-lg font-semibold text-foreground">
                      A mai napon nincs esemény
                    </h2>
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
                      image={event.image ?? undefined}
                      popup={true}
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
                              {new Date(event.time).toLocaleTimeString(
                                "hu-HU",
                                {
                                  hour: "numeric",
                                  minute: "numeric",
                                },
                              )}
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
          );
        }
      })}
    </div>
  );
};
