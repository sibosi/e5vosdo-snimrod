import { getData } from "./getTable.mjs";
import { teachersConfig } from "@/config/teachers";

export async function fetchData() {
  const tableData = await getData();
  return tableData;
}

export const Table = async () => {
  const tableData = fetchData();
  return (
    <div className="text-foreground">
      {tableData ? (
        <table className="border-separate p-8">
          <thead className="">
            <tr>
              {teachersConfig.showHeaders.map((head) => (
                <td className="">{head}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {(await tableData).map((row) => (
              <tr key={row.join("-")}>
                {" "}
                {/* Assuming rows have unique content */}
                {row.map((cell: string) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>Loading...</div> // Consider a loading state
      )}
    </div>
  );
};
