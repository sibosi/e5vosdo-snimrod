"use client";
import { Chip } from "@heroui/react";
import { SideCard } from "./sidecard";
import { Section } from "./home/section";
import { useEvents } from "@/hooks/useEvents";

const shortWeekday: { [key: string]: string } = {
  hétfő: "hétf.",
  kedd: "kedd",
  szerda: "szer.",
  csütörtök: "csüt.",
  péntek: "pént.",
  szombat: "szom.",
  vasárnap: "vas.",
};

const parseDateString = (dateStr: string): Date => {
  return new Date(dateStr.replaceAll("-", "/"));
};

export const Events = ({ all = false }: { all?: boolean }) => {
  const { events, archivedEvents, futureEvents, isLoading } = useEvents(all);

  if (isLoading) return <p>Betöltés...</p>;
  if (!events || Object.keys(events).length === 0) return <p>Nincs esemény</p>;

  const sortedDates = Object.keys(events).sort(
    (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime(),
  );

  const itemsToRender: Array<{
    type: "month" | "date";
    month?: string;
    date: string;
    key: string;
  }> = [];
  let currentMonth: string | null = null;

  sortedDates.forEach((dateKey) => {
    const eventDate = parseDateString(dateKey);
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
      date: dateKey,
      key: `date-${dateKey}`,
    });
  });

  const archivedItemsToRender: Array<{
    type: "month" | "date";
    month?: string;
    date: string;
    key: string;
  }> = [];

  if (archivedEvents) {
    let archivedCurrentMonth: string | null = null;
    const archivedSortedDates = Object.keys(archivedEvents).sort(
      (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime(),
    );

    archivedSortedDates.forEach((dateKey) => {
      const eventDate = parseDateString(dateKey);
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
        date: dateKey,
        key: `archived-date-${dateKey}`,
      });
    });
  }

  const futureItemsToRender: Array<{
    type: "month" | "date";
    month?: string;
    date: string;
    key: string;
  }> = [];

  if (futureEvents) {
    let futureCurrentMonth: string | null = null;
    const futureSortedDates = Object.keys(futureEvents).sort(
      (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime(),
    );

    futureSortedDates.forEach((dateKey) => {
      const eventDate = parseDateString(dateKey);
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
        date: dateKey,
        key: `future-date-${dateKey}`,
      });
    });
  }

  const today = new Date();

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
                const dateKey = item.date;
                const currentDateObj = parseDateString(dateKey);
                return (
                  <div key={item.key} className="flex gap-2">
                    <div>
                      <p className="text-center text-xs font-semibold text-selfprimary-700">
                        {
                          shortWeekday[
                            currentDateObj.toLocaleDateString("hu-HU", {
                              weekday: "long",
                            })
                          ]
                        }
                      </p>
                      <h2 className="mx-auto grid w-9 grid-cols-1 rounded-full text-xl font-normal text-selfprimary-700">
                        <span className="m-auto">
                          {currentDateObj.toLocaleDateString("hu-HU", {
                            day: "numeric",
                          })}
                        </span>
                      </h2>
                    </div>
                    <div className="w-full space-y-2">
                      {archivedEvents[dateKey].map((event) => (
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
                                  {event.description ? (
                                    <Chip
                                      key={`archived-info-${event.id}`}
                                      size="sm"
                                      className="bg-selfprimary-50"
                                    >
                                      részletek
                                    </Chip>
                                  ) : null}
                                </>
                              ) : null}
                              {event.tags == undefined
                                ? null
                                : event.tags.map((tag, tagIndex) => (
                                    <Chip
                                      key={`archived-tag-${event.id}-${tagIndex}`}
                                      className="bg-selfprimary-200"
                                      size="sm"
                                    >
                                      {tag}
                                    </Chip>
                                  ))}
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
          const dateKey = item.date;
          const currentDateObj = parseDateString(dateKey);

          const isToday =
            currentDateObj.getFullYear() === today.getFullYear() &&
            currentDateObj.getMonth() === today.getMonth() &&
            currentDateObj.getDate() === today.getDate();

          return (
            <div key={item.key} className="flex gap-2">
              <div>
                <p className="text-center text-xs font-semibold text-selfprimary-700">
                  {
                    shortWeekday[
                      currentDateObj.toLocaleDateString("hu-HU", {
                        weekday: "long",
                      })
                    ]
                  }
                </p>
                <h2
                  className={`mx-auto grid w-9 grid-cols-1 rounded-full ${isToday ? "h-9 bg-selfprimary-700 text-selfprimary-bg" : "text-selfprimary-700"} text-xl font-normal`}
                >
                  <span className="m-auto">
                    {currentDateObj.toLocaleDateString("hu-HU", {
                      day: "numeric",
                    })}
                  </span>
                </h2>
              </div>
              <div className="w-full space-y-2">
                {events[dateKey].length == 0 && (
                  <div className="w-full max-w-md rounded-2xl bg-foreground-100 p-4 py-3 text-left">
                    <h2 className="text-lg font-semibold text-foreground">
                      A mai napon nincs esemény
                    </h2>
                  </div>
                )}

                {events[dateKey].map((event) => (
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
                            {event.description ? (
                              <Chip
                                key={`archived-info-${event.id}`}
                                size="sm"
                                className="bg-selfprimary-50"
                              >
                                részletek
                              </Chip>
                            ) : null}
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
                const dateKey = item.date;
                const currentDateObj = parseDateString(dateKey);
                return (
                  <div key={item.key} className="flex gap-2">
                    <div>
                      <p className="text-center text-xs font-semibold text-selfprimary-700">
                        {
                          shortWeekday[
                            currentDateObj.toLocaleDateString("hu-HU", {
                              weekday: "long",
                            })
                          ]
                        }
                      </p>
                      <h2 className="mx-auto grid w-9 grid-cols-1 rounded-full text-xl font-normal text-selfprimary-700">
                        <span className="m-auto">
                          {currentDateObj.toLocaleDateString("hu-HU", {
                            day: "numeric",
                          })}
                        </span>
                      </h2>
                    </div>
                    <div className="w-full space-y-2">
                      {futureEvents[dateKey].map((event) => (
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
                                  {event.description ? (
                                    <Chip
                                      key={`archived-info-${event.id}`}
                                      size="sm"
                                      className="bg-selfprimary-50"
                                    >
                                      részletek
                                    </Chip>
                                  ) : null}
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

      <a
        className="w-full max-w-sm rounded-2xl border-2 border-dashed border-selfsecondary-400 px-4 py-1.5 text-left hover:border-selfsecondary-500"
        href="/creator"
      >
        <h2 className="text-base font-semibold text-foreground">
          Hiányolsz valamit? Tölts fel eseményt! ➜
        </h2>
      </a>

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
