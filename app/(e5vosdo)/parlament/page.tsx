import { addLog, getAuth } from "@/db/dbreq";
import NewParlament from "./components/newParlament";
import ParlamentsList from "./components/parlamentsList";

const ParlamentPage = async () => {
  const selfUser = await getAuth();
  addLog("parlament", selfUser?.email ?? "unknown");

  if (!selfUser?.permissions.includes("head_of_parlament"))
    return (
      <div className="font-semibold text-foreground">
        <h1>Hozzáférés megtagadva!</h1>
      </div>
    );

  return (
    <div className="space-y-4 font-semibold text-foreground">
      <NewParlament />
      <ParlamentsList />
    </div>
  );
};

export default ParlamentPage;
