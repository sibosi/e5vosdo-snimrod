import { groupsConfig } from "@/config/groups";
import PopupCards from "@/components/popupcards";

export default function ClubsPage() {
  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        Klubok és szakkörök
      </h1>

      <PopupCards cards={groupsConfig.clubs} />
    </>
  );
}
