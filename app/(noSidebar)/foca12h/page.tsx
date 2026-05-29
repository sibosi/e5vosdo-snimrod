import { getAuth } from "@/db/dbreq";
import { Section } from "@/components/home/section";
import { gate } from "@/db/permissions";
import ManageTeams from "@/app/(e5vosdo)/admin/matches/manageTeams";
import ManageMatches from "@/app/(e5vosdo)/admin/matches/manageMatches";

const MatchesPage = async () => {
  const selfUser = await getAuth();
  const isOrganiser =
    (selfUser && gate(selfUser, "matchOrganiser", "boolean")) ?? false;

  return (
    <div>
      <h1 className="pb-8 pt-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Csapatok és mérkőzések
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
        <Section
          title="Csapatok megtekintése"
          defaultStatus="opened"
          savable={true}
          dropdownable={true}
        >
          <ManageTeams />
        </Section>

        <Section
          title="Mérkőzések megtekintése"
          defaultStatus="opened"
          savable={true}
          dropdownable={true}
        >
          <ManageMatches isOrganiser={isOrganiser} />
        </Section>
      </div>
    </div>
  );
};

export default MatchesPage;
