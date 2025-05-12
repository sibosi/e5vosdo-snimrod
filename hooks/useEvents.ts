"use client";
import useSWR from "swr";
import { EventType } from "@/db/event";

interface EventByDateType {
  [date: string]: EventType[];
}

interface UseEventsReturn {
  events: EventByDateType | undefined;
  archivedEvents: EventByDateType | undefined;
  futureEvents: EventByDateType | undefined;
  nextEvent: EventType | undefined;
  isLoading: boolean;
  isError: any;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      module: "event",
    },
  });
  return response.json();
};

export const useEvents = (all = false): UseEventsReturn => {
  const { data, error } = useSWR<EventType[]>("/api/getAllEvent", fetcher);

  if (error)
    return {
      events: undefined,
      archivedEvents: undefined,
      futureEvents: undefined,
      nextEvent: undefined,
      isLoading: false,
      isError: error,
    };

  if (!data)
    return {
      events: undefined,
      archivedEvents: undefined,
      futureEvents: undefined,
      nextEvent: undefined,
      isLoading: true,
      isError: null,
    };

  let sortedEvents = data.toSorted(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  sortedEvents = sortedEvents.filter((event) => checkVisibility(event, all));

  const today = new Date().toLocaleDateString(undefined, {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  let eventsByDate: EventByDateType = {};
  let archivedEventsByDate: EventByDateType = {};
  let futureEventsByDate: EventByDateType = {};

  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  twoWeeksFromNow.setHours(0, 0, 0, 0);

  sortedEvents.forEach((event) => {
    const date = new Date(event.time).toLocaleDateString(undefined, {
      timeZone: "Europe/Budapest",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const eventDate = new Date(date);

    if (eventDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
      archivedEventsByDate[date] ??= [];
      archivedEventsByDate[date].push(event);
    } else if (eventDate.getTime() >= twoWeeksFromNow.getTime()) {
      futureEventsByDate[date] ??= [];
      futureEventsByDate[date].push(event);
    } else {
      eventsByDate[date] ??= [];
      eventsByDate[date].push(event);
    }
  });

  if (eventsByDate[today] == undefined)
    eventsByDate = { [today]: [], ...eventsByDate };

  const now = new Date();
  const nextEvent = sortedEvents.find((event) => new Date(event.time) > now);

  return {
    events: eventsByDate,
    archivedEvents: archivedEventsByDate,
    futureEvents: futureEventsByDate,
    nextEvent,
    isLoading: false,
    isError: null,
  };
};

const checkVisibility = (event: EventType, all: boolean) => {
  if (all) return true;
  if (new Date(event.time).getTime() < new Date().setHours(0, 0, 0, 0))
    return false;
  if (event.show_time == undefined) return true;
  if (
    new Date(event.show_time).getTime() - 28 * 24 * 60 * 60 * 1000 >
    new Date().getTime()
  )
    return false;
  if (
    new Date(event.time).getTime() - 14 * 24 * 60 * 60 * 1000 >
    new Date().getTime()
  )
    return false;
  return true;
};
