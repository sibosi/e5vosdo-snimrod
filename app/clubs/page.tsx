import { clubsConfig, clubsOrder } from "@/config/groups";
import PopupCards from "@/components/popupcards";

function sortClubs() {
  const sortedClubs = new Set();
  clubsOrder.forEach((club) => {
    sortedClubs.add(clubsConfig.find((c) => c.title === club));
  });
  clubsConfig.forEach((club) => {
    if (!sortedClubs.has(club)) sortedClubs.add(club);
  });
  return Array.from(sortedClubs) as typeof clubsConfig;
}

export default function ClubsPage() {
  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Klubok és szakkörök
      </h1>

      <PopupCards cards={sortClubs()} />
    </>
  );
}
