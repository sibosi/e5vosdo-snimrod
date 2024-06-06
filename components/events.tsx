"use client";
import eventsConfig from "@/config/events.tsx";
import { Chip, Link } from "@nextui-org/react";
import { SideCard } from "./sidecard";

export const Events = () => {
  let noneEvent = false;
  return (
    <div className="text-left items-start grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b-8 border-transparent pb-5">
      {eventsConfig.events.map(
        (event, index) =>
          (event._show_time_ != undefined
            ? new Date(event._show_time_) < new Date()
            : true) &&
          new Date(event._hide_time_) > new Date() && (
            <div key={index + 100} className="pb-4">
              {(noneEvent = true)}
              <SideCard
                key={index}
                title={event.title}
                details={event.details}
                description={event.time}
                image={event.image}
                popup={true}
                button_size="sm"
              >
                <div className="flex gap-2">
                  {event.tags != undefined ? (
                    event.tags.map((tag, index) => (
                      <Chip key={tag + "" + index} color="warning" size="sm">
                        {tag}
                      </Chip>
                    ))
                  ) : (
                    <></>
                  )}
                  {event._img_src_ ? (
                    <Chip size="sm" variant="flat">
                      <Link
                        className="text-xs text-foreground"
                        href={event._img_src_}
                      >
                        Kép forrása
                      </Link>
                    </Chip>
                  ) : (
                    <></>
                  )}
                </div>
              </SideCard>
            </div>
          )
      )}
      {!noneEvent ? <p>Nincs esemény</p> : <></>}
    </div>
  );
};
