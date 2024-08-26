import { clubsConfig } from "@/config/groups";
import PopupCards from "@/components/popupcards";

export default function ClubsPage() {
  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Klubok és szakkörök
      </h1>

      <PopupCards cards={clubsConfig} />
    </>
  );
}
