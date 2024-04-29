"use client";
import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { groupsConfig } from "@/config/groups";
import { PopupCard } from "@/components/popupcard";

export default function StudyGroupsPage() {
  return (
    <div>
      <h1
        className={clsx(
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        Szakkörök
      </h1>
      <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center">
        {groupsConfig.clubs.map((groups, index) => (
          <PopupCard
            key={index}
            title={groups.title}
            details={groups.details}
            image={groups.image}
          />
        ))}
      </div>
    </div>
  );
}
