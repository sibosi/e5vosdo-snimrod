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

type RenderItem = {
  type: "month" | "date";
  month?: string;
  date: string;
  key: string;
};

type EventData = {
  [date: string]: Array<{
    id: number;
    title: string | string[];
    description: string | null;
    image: string | null;
    show_time: string | null;
    time: string;
    tags: string[];
  }>;
};

const createItemsToRender = (
  eventData: EventData | null | undefined,
  keyPrefix: string,
): RenderItem[] => {
  if (!eventData) return [];

  const items: RenderItem[] = [];
  let currentMonth: string | null = null;

  const sortedDates = Object.keys(eventData).sort(
    (a, b) => parseDateString(a).getTime() - parseDateString(b).getTime(),
  );

  for (const dateKey of sortedDates) {
    const eventDate = parseDateString(dateKey);
    const month = eventDate.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
    });

    if (currentMonth !== month) {
      items.push({
        type: "month",
        month,
        date: "",
        key: `${keyPrefix}-month-${month}`,
      });
      currentMonth = month;
    }

    items.push({
      type: "date",
      date: dateKey,
      key: `${keyPrefix}-date-${dateKey}`,
    });
  }

  return items;
};

const renderEventCard = (
  event: EventData[string][0],
  keyPrefix: string,
  tagIndex?: number,
) => (
  <SideCard
    title={
      typeof event.title === "object" ? event.title.join(" ") : event.title
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
          {event.description ? (
            <Chip
              key={`${keyPrefix}-info-${event.id}`}
              size="sm"
              className="bg-selfprimary-50"
            >
              részletek
            </Chip>
          ) : null}
          <Chip
            key={`${keyPrefix}-time-${event.id}`}
            size="sm"
            className="bg-selfsecondary-50"
          >
            {new Date(event.time).toLocaleTimeString("hu-HU", {
              hour: "numeric",
              minute: "numeric",
            })}
          </Chip>
        </>
      ) : null}
      {event.tags?.map((tag, idx) => (
        <Chip
          key={`${keyPrefix}-tag-${event.id}-${idx}`}
          className="bg-selfprimary-200"
          size="sm"
        >
          {tag}
        </Chip>
      ))}
    </div>
  </SideCard>
);

const renderEventDate = (
  dateKey: string,
  events: EventData[string],
  keyPrefix: string,
  today?: Date,
) => {
  const currentDateObj = parseDateString(dateKey);
  const isToday = today
    ? currentDateObj.getFullYear() === today.getFullYear() &&
      currentDateObj.getMonth() === today.getMonth() &&
      currentDateObj.getDate() === today.getDate()
    : false;

  return (
    <div className="flex gap-2">
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
        {events.length === 0 && (
          <div className="w-full max-w-md rounded-2xl bg-foreground-100 p-4 py-3 text-left">
            <h2 className="text-lg font-semibold text-foreground">
              A mai napon nincs esemény
            </h2>
          </div>
        )}
        {events.map((event) => (
          <div key={`${keyPrefix}-event-${event.id}`}>
            {renderEventCard(event, keyPrefix)}
          </div>
        ))}
      </div>
    </div>
  );
};

const renderEventsSection = (
  items: RenderItem[],
  events: EventData,
  keyPrefix: string,
  today?: Date,
) => {
  return items.map((item) => {
    if (item.type === "month") {
      return (
        <div key={item.key} className="col-span-full my-4">
          <h2 className="border-b border-selfprimary-200 pb-2 text-xl font-semibold text-selfprimary-700">
            {item.month}
          </h2>
        </div>
      );
    } else {
      return (
        <div key={item.key}>
          {renderEventDate(item.date, events[item.date], keyPrefix, today)}
        </div>
      );
    }
  });
};

export const Events = ({ all = false }: { all?: boolean }) => {
  const { events, archivedEvents, futureEvents, isLoading } = useEvents(all);

  if (isLoading) return <p>Betöltés...</p>;
  if (!events || Object.keys(events).length === 0) return <p>Nincs esemény</p>;

  const itemsToRender = createItemsToRender(events, "current");
  const archivedItemsToRender = createItemsToRender(archivedEvents, "archived");
  const futureItemsToRender = createItemsToRender(futureEvents, "future");

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
            {renderEventsSection(
              archivedItemsToRender,
              archivedEvents,
              "archived",
            )}
          </div>
        </Section>
      )}

      {renderEventsSection(itemsToRender, events, "current", today)}

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
            {renderEventsSection(futureItemsToRender, futureEvents, "future")}
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
