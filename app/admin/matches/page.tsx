import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import { Section } from "@/components/home/section";
import { gate } from "@/db/permissions";
import ManageTeams from "./manageTeams";
import ManageMatches from "./manageMatches";

const MatchesPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");
  if (!gate(selfUser, "matchOrganiser", "boolean")) return <h2>Permission denied</h2>;

  return (
    <div>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Mérkőzések kezelése
      </h1>

      <Section title="Csapatok kezelése" defaultStatus="opened" savable={false} dropdownable={true}>
        <ManageTeams />
      </Section>

      <Section title="Mérkőzések kezelése" defaultStatus="opened" savable={false} dropdownable={true}>
        <ManageMatches />
      </Section>
    </div>
  );
};

export default MatchesPage;
