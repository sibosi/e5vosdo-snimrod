import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { groupsConfig } from "@/config/groups";
import { PopupCard } from "@/components/popupcard";

export default function ClubsPage() {
  return (
    <div className="text-center">
      <div>
        <h1 className="py-2 text-4xl font-semibold lg:text-5xl text-foreground block">
          🚧 Klubok és szakkörök 🚧
        </h1>
      </div>
      <br />
      <div className="text-left gap-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-b-8 border-transparent justify-items-center">
        {groupsConfig.clubs.map((groups, index) => (
          <PopupCard
            key={index}
            title={groups.title}
            details={groups.details}
            description={groups.description}
            image={groups.image}
            popup={true}
          />
        ))}
      </div>
    </div>
  );
}
