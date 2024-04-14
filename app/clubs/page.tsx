import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";

import { groupsConfig } from "@/config/groups";
import { InfoCard } from "@/components/infocard";

export default async function ClubsPage() {
  return (
    <div>
      <h1
        className={clsx(
          "flex-col items-center justify-center gap-4 py-8 md:py-10 inline-block max-w-lg text-center",
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        Klubok
      </h1>
      <br />
      <div className="gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center">
        {groupsConfig.clubs.map((groups, index) => (
          <InfoCard
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
