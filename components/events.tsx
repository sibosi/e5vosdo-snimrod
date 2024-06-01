"use client";
import { eventsConfig } from "@/config/events";
import { Chip } from "@nextui-org/react";
import { PopupCard } from "./popupcard";

export const Events = () => {
  return (
    <div className="text-left gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center pb-5">
      {eventsConfig.events.map(
        (event, index) =>
          new Date(event._hide_time_) > new Date() && (
            <PopupCard
              key={index}
              title={event.title}
              details={event.details}
              description={event.time}
              image={event.image}
              popup={true}
            >
              <div className="flex gap-2">
                {event.tags.map((tag, index) => (
                  <Chip key={tag + "" + index} color="warning" size="sm">
                    {tag}
                  </Chip>
                ))}
              </div>
            </PopupCard>
          )
      )}
    </div>
  );
};
