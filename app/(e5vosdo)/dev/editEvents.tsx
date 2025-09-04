"use client";
import { EventType } from "@/db/event";
import React, { useEffect, useState } from "react";

const EditEvents = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  function fixEventDate(event?: EventType) {
    if (event) {
      const newEvent = { ...event };
      for (const key in newEvent) {
        if (
          ["show_time", "start_time", "end_time", "hide_time"].includes(key)
        ) {
          (newEvent as any)[key] = new Date((newEvent as any)[key])
            .toLocaleDateString("hu-HU", {
              // "YYYY-MM-DD HH:MM:SS"
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
            .replace(". ", "-")
            .replace(". ", "-")
            .replace(". ", " ");
        } else if (key === "tags") {
          (newEvent as any)[key] =
            '["' + (newEvent as any)[key].join('", "') + '"]';
        }
      }
      return newEvent as EventType;
    }
  }

  function updateEvent(event: EventType) {
    fetch("/api/updateEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        module: "event",
      },
      body: JSON.stringify({ event: event }),
    });
  }

  useEffect(() => {
    fetch("/api/getEvents", { headers: { module: "event" } })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setEvents(data);
      });
  }, []);

  return (
    <div className="my-2 rounded-xl bg-selfprimary-100 p-2">
      <h2 className="text-foreground">Események</h2>
      <div>
        {selectedEvent && (
          <div className="my-2 bg-selfprimary-200 p-2">
            {Object.entries(selectedEvent).map(([key, value]) => (
              <div key={key} className="flex">
                <span>{key}</span>:
                <textarea
                  value={value ?? ""}
                  onChange={(e) => {
                    setSelectedEvent({
                      ...selectedEvent,
                      [key]: e.target.value,
                    });
                  }}
                  title={key}
                  placeholder={`Enter ${key}`}
                  // Set input square size
                  className={
                    "ml-1 w-full " +
                    (String(value).length > 50 ? "h-64" : "h-6")
                  }
                />
              </div>
            ))}
            <button onClick={() => updateEvent(selectedEvent)}>Update</button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap">
        {events.map((event) => (
          <button
            type="button"
            key={event.id}
            onClick={() => {
              setSelectedEvent(fixEventDate(event) ?? null);
            }}
            className="m-2 h-40 w-40 bg-selfprimary-200 font-bold text-foreground lg:h-80"
            style={
              // Bg image
              {
                backgroundImage: `url(${event.image ?? "/events/default.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            }
          >
            <div
              className="h-full w-full"
              style={{
                backgroundColor:
                  selectedEvent?.id === event.id
                    ? "rgba(200, 200, 200, 0.2)"
                    : "rgba(200, 200, 200, 0.5)",
              }}
            >
              <span>{event.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditEvents;
