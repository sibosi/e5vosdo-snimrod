import { clubsConfig, clubsOrder } from "@/config/groups";
import PopupCards from "@/components/popupcards";
import { Alert } from "@/components/home/alert";
import { Link } from "@nextui-org/react";

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

      <Alert className="border-selfprimary-300 bg-selfprimary-100">
        <Link href="https://map.barnagoz.com/">
          Interaktív térképen is megtalálod a klubokat! (Itt)
        </Link>{" "}
      </Alert>

      <Alert className="border-selfprimary-300 bg-selfprimary-100">
        A kártyákra kattintva további információkat találsz a klubokról.
      </Alert>

      <PopupCards cards={sortClubs()} />
    </>
  );
}
