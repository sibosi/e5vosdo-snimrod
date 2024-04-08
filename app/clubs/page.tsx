import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { getData } from "./getTable.mjs";
import { Table } from "./table";

export async function fetchData() {
  const tableData = await getData();
  return tableData;
}

export default async function ClubsPage() {
  const tableData = fetchData();
  return (
    <div>
      <h1
        className={clsx(
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        Klubok
      </h1>

      <Table />
    </div>
  );
}
