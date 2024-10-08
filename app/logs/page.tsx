import { getAuth, getLogs } from "@/db/dbreq";
import { redirect } from "next/navigation";
import LogTable from "./table";
import { LineChartLogin24 } from "@/app/logs/login24h";
import { LineChartLogin1h } from "./login1h";
import { LineChartLoginBetween } from "./loginAuto";

const LogsPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");
  if (!selfUser.permissions.includes("admin")) redirect("/");

  const logs = await getLogs(50000);

  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Logok
      </h1>

      {logs && (
        <>
          <LineChartLogin24 logs={logs} />
          <LineChartLogin1h
            logs={logs}
            hour={
              // Now time
              new Date().getHours() - 1
            }
          />
          <LineChartLoginBetween logs={logs} />
          <LogTable logs={logs} />
        </>
      )}
    </>
  );
};

export default LogsPage;
