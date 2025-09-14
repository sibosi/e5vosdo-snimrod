import { clubsConfig, clubsOrder } from "@/config/groups";
import PopupCards from "@/components/popupcards";
import { Alert } from "@/components/home/alert";
import { Section } from "@/components/home/section";

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
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground max-md:hidden lg:text-5xl">
        Klubok és szakkörök
      </h1>

      <h2 className="pb-8 text-center text-3xl font-semibold text-foreground lg:text-4xl">
        Találkozz szeptember 5-én a KlubExpo-n a legújabb szakkör és
        klubkínálattal!
      </h2>

      <Section
        title="Tavalyi klubok"
        savable={false}
        defaultStatus="closed"
        dropdownable={true}
      >
        <Alert className="border-selfprimary-300 bg-selfprimary-100">
          A kártyákra kattintva további információkat találsz a klubokról.
        </Alert>

        <PopupCards cards={sortClubs()} />
      </Section>
    </>
  );
}
