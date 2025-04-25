import { getAuth } from "@/db/dbreq";
import { Section } from "@/components/home/section";
import { gate } from "@/db/permissions";
import ManageTeams from "../admin/matches/manageTeams";
import ManageMatches from "../admin/matches/manageMatches";

const MatchesPage = async () => {
  const selfUser = await getAuth();
  const isOrganiser =
    (selfUser && gate(selfUser, "matchOrganiser", "boolean")) ?? false;

  return (
    <div>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Mérkőzések kezelése
      </h1>

      <Section
        title="Csapatok megtekintése"
        defaultStatus="closed"
        savable={false}
        dropdownable={true}
      >
        <ManageTeams />
      </Section>

      <Section
        title="Mérkőzések kezelése"
        defaultStatus="opened"
        savable={false}
        dropdownable={true}
      >
        <ManageMatches isOrganiser={isOrganiser} />
      </Section>
    </div>
  );
};

export default MatchesPage;
