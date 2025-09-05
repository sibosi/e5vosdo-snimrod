import { redirect } from "next/navigation";
import { getAuth } from "@/apps/web/db/dbreq";
import { Section } from "@/apps/web/components/home/section";
import { gate } from "@/apps/web/db/permissions";
import ManageTeams from "./manageTeams";
import ManageMatches from "./manageMatches";

const MatchesPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");
  if (!gate(selfUser, "matchOrganiser", "boolean"))
    return <h2>Permission denied</h2>;

  return (
    <div>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Mérkőzések kezelése
      </h1>

      <Section
        title="Csapatok kezelése"
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
        <ManageMatches isOrganiser={true} />
      </Section>
    </div>
  );
};

export default MatchesPage;
