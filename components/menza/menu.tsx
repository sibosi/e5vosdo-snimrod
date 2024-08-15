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
      className="xs:flex gap-2 bg-foreground-200 rounded-md p-4 max-xs:text-center"
      key={0.031}
    >
      <div
        className={
          "rounded-xl w-10 h-10 grid grid-cols-1 mb-2 mx-auto " +
          (menu == "A" ? "bg-primary" : "bg-secondary")
        }
      >
        <div className="max-w-fit max-h-fit m-auto text-lg font-bold text-white">
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
            )
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
      <p className="font-medium pb-1 text-sm">{date}</p>
      <div className="gap-2 grid grid-cols-2 max-w-max overflow-hidden bg-foreground-100 rounded-xl p-2">
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
