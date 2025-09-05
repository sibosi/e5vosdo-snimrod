import { addLog, getAuth } from "@/apps/web/db/dbreq";
import ClearCache from "./clearCache";

const ClearCachePage = async () => {
  const selfUser = await getAuth();
  addLog("clearCache", selfUser?.email ?? "unknown");

  return (
    <div className="font-semibold text-foreground">
      <ClearCache />
    </div>
  );
};

export default ClearCachePage;
