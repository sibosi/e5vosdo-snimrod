import { addLog, getAuth } from "@/db/dbreq";
import Table from "./table";

const E5NPage = async () => {
  const selfUser = await getAuth();
  addLog("clearCache", selfUser?.email ?? "unknown");

  return (
    <div className="font-semibold text-foreground">
      <Table />
    </div>
  );
};

export default E5NPage;
