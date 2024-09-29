"use client";
import { Button } from "@nextui-org/react";
import nyersMenu from "@/public/storage/mindenkorimenu.json";
import { useState } from "react";

type MenuType = {
  [x: string]: {
    A: string[];
    B: string[];
    nap: string;
  };
};

const mindenkorimenu = nyersMenu as unknown as MenuType;

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

const MenuCard = ({ menu, items }: { menu: "A" | "B"; items: string[] }) => {
  return (
    <div
      className="gap-2 rounded-md bg-foreground-200 p-4 max-sm:text-center sm:flex"
      key={menu}
    >
      <div
        className={
          "mx-auto mb-2 grid h-10 w-10 grid-cols-1 rounded-xl " +
          (menu === "A" ? "bg-selfprimary" : "bg-selfsecondary")
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
                key={`fogas-${rowIndex}`}
                className={
                  "p-1 " +
                  (rowIndex !== 0 ? "border-t-1 border-foreground-400" : "")
                }
              >
                {fogas}
              </div>
            ) : (
              <div key={`empty-${rowIndex}`} />
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
  const [date, setDate] = useState(new Date());

  function changeDate(days: number) {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }

  function formatDate() {
    return date
      .toLocaleDateString("hu")
      .replaceAll(". ", "/")
      .replaceAll(".", "")
      .replaceAll("/", ".");
  }

  return (
    <div className="text-foreground">
      <p className="pb-1 text-sm font-medium">
        <button onClick={() => changeDate(-1)}>{"<"}&nbsp;</button>
        {formatDate()}
        <button onClick={() => changeDate(1)}>
          &nbsp;
          {">"}
        </button>
      </p>
      <div className="grid max-w-max grid-cols-2 gap-2 overflow-hidden rounded-xl bg-foreground-100 p-2">
        {menu !== "B" && (
          <MenuCard
            menu="A"
            items={
              tableData[formatDate()] && tableData[formatDate()].A
                ? tableData[formatDate()].A
                : []
            }
          />
        )}

        {menu !== "A" && (
          <MenuCard
            menu="B"
            items={
              tableData[formatDate()] && tableData[formatDate()].B
                ? tableData[formatDate()].B
                : []
            }
          />
        )}
      </div>
    </div>
  );
};
