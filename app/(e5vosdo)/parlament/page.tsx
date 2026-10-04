import { getAuth } from "@/db/dbreq";
import NewParlament from "./components/newParliament";
import ParlamentsList from "./components/parliamentsList";
import { hasPermission } from "@/db/permissions";

const ParliamentPage = async () => {
  const selfUser = await getAuth();

  if (!hasPermission(selfUser, "head_of_parlament")) return <ParlamentsList />;

  return (
    <div className="space-y-4 font-semibold text-foreground">
      <NewParlament />
      <ParlamentsList />
    </div>
  );
};

export default ParliamentPage;
