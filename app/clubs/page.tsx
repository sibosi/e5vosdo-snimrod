import { groupsConfig } from "@/config/groups";
import { PopupCard } from "@/components/popupcard";

export default function ClubsPage() {
  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        Klubok és szakkörök
      </h1>
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
    </>
  );
}
