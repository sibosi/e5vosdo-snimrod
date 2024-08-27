"use client";
import { Button } from "@nextui-org/react";
import nyersMenu from "@/public/storage/mindenkorimenu.json";

type RowType = {
  [x: string]: any;
  A: string[];
  B: string[];
  nap: string;
};

const mindenkorimenu = nyersMenu as unknown as RowType[];

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

const MenuCard = ({ menu, items }: { menu: "A" | "B"; items: string[] }) => {
  return (
    <div
      className="max-xs:text-center xs:flex gap-2 rounded-md bg-foreground-200 p-4"
      key={0.031}
    >
      <div
        className={
          "mx-auto mb-2 grid h-10 w-10 grid-cols-1 rounded-xl " +
          (menu == "A" ? "bg-selfprimary" : "bg-selfsecondary")
        }
      >
        <div className="m-auto max-h-fit max-w-fit text-lg font-bold text-white">
          {menu}
        </div>
      </div>
      <div>
        {items.length !== 0 ? (
          items.map((fogas: string, rowIndex: number) =>
            fogas ? (
              <div
                key={rowIndex + 0.01}
                className={
                  "p-1 " +
                  (rowIndex !== 0 ? "border-t-1 border-foreground-400" : "")
                }
              >
                {fogas}
              </div>
            ) : (
              <div key={rowIndex + 0.04} />
            ),
          )
        ) : (
          <Button disabled key={"Amenu2"} color="default" variant="solid">
            <p>Nincs információ</p>
          </Button>
        )}
      </div>
    </div>
  );
};

export const Menu = ({ menu }: { menu: "A" | "B" | undefined }) => {
  const tableData = mindenkorimenu;
  const now = new Date();
  const date: any = [
    now.getFullYear(),
    padTo2Digits(now.getMonth() + 1),
    padTo2Digits(now.getDate()),
  ].join(".");

  return (
    <div className="text-foreground">
      <p className="pb-1 text-sm font-medium">{date}</p>
      <div className="grid max-w-max grid-cols-2 gap-2 overflow-hidden rounded-xl bg-foreground-100 p-2">
        {menu != "B" && (
          <MenuCard
            menu="A"
            items={
              tableData[date] && tableData[date].A ? tableData[date].A : []
            }
          />
        )}

        {menu != "A" && (
          <MenuCard
            menu="B"
            items={
              tableData[date] && tableData[date].B ? tableData[date].B : []
            }
          />
        )}
      </div>
    </div>
  );
};
