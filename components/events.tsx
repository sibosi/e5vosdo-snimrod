"use client";
import { Chip } from "@heroui/react";
import { SideCard } from "./sidecard";
import { EventType } from "@/db/event";
import { Section } from "./home/section";
import { useEvents } from "@/hooks/useEvents";

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
  const { events, archivedEvents, futureEvents, isLoading } = useEvents(all);

  if (isLoading) return <p>Betöltés...</p>;
  if (!events || Object.keys(events).length === 0) return <p>Nincs esemény</p>;

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

  const futureItemsToRender: Array<{
    type: "month" | "date";
    month?: string;
    date: string;
    key: string;
  }> = [];

  if (archivedEvents) {
    let archivedCurrentMonth: any = null;
    const archivedSortedDates = Object.keys(archivedEvents).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
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

  if (futureEvents) {
    let futureCurrentMonth: any = null;
    const futureSortedDates = Object.keys(futureEvents).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    futureSortedDates.forEach((date) => {
      const eventDate = new Date(date);
      const month = eventDate.toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "long",
      });

      if (futureCurrentMonth !== month) {
        futureItemsToRender.push({
          type: "month",
          month,
          date: "",
          key: `future-month-${month}`,
        });
        futureCurrentMonth = month;
      }

      futureItemsToRender.push({
        type: "date",
        date,
        key: `future-date-${date}`,
      });
    });
  }

  return (
    <div className="-md:grid-cols-2 -lg:grid-cols-3 grid grid-cols-1 items-start space-y-4 border-b-8 border-transparent pb-5 text-left">
      {all && archivedEvents && Object.keys(archivedEvents).length > 0 && (
        <Section
          title="Korábbi események"
          dropdownable
          defaultStatus="closed"
          savable={false}
          className="ml-4"
          titleClassName="text-xl"
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
          const isToday = date === new Date().toISOString().slice(0, 10);

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

      {all && futureEvents && Object.keys(futureEvents).length > 0 && (
        <Section
          title="További események"
          dropdownable
          defaultStatus="closed"
          savable={false}
          className="ml-4"
          titleClassName="text-xl"
        >
          <div className="-md:grid-cols-2 -lg:grid-cols-3 grid grid-cols-1 items-start space-y-4 border-b-8 border-transparent pb-5 text-left">
            {futureItemsToRender.map((item) => {
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
                      {futureEvents[date].map((event) => (
                        <div key={`future-event-${event.id}`}>
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
                                    key={`future-time-${event.id}`}
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
                                    key={`future-info-${event.id}`}
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
                                      key={`future-tag-${event.id}-${tagIndex}`}
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

      {!all && (
        <a
          className="w-full max-w-sm rounded-2xl bg-selfsecondary-100 px-4 py-1.5 text-left"
          href="/events"
        >
          <h2 className="text-base font-semibold text-foreground">
            Az összes esemény megtekintése ➡
          </h2>
        </a>
      )}
    </div>
  );
};
