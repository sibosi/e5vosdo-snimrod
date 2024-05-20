import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { TeacherTable } from "@/components/helyettesites/teachers-table";
import { PopupCard } from "@/components/popupcard";
import { eventsConfig } from "@/config/events";
import { Chip } from "@nextui-org/react";

export default function EventsPage() {
  return (
    <>
      <div className="py-2">
        <h1
          className={clsx(
            title(),
            linkStyles({ color: "foreground", isBlock: true })
          )}
        >
          🚧 Események 🚧
        </h1>
      </div>
      <div className="text-left gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center py-5">
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
      <TeacherTable />
    </>
  );
}
