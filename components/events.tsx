"use client";
import { eventsConfig } from "@/config/events";
import { Chip } from "@nextui-org/react";
import { SideCard } from "./sidecard";

export const Events = () => {
  return (
    <div className="text-left items-start grid grid-cols-1 md:grid-cols-2 border-b-8 border-transparent pb-5">
      {eventsConfig.events.map(
        (event, index) =>
          new Date(event._hide_time_) > new Date() && (
            <div key={index + 0.1} className="pb-4">
              <SideCard
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
              </SideCard>
            </div>
          )
      )}
    </div>
  );
};
