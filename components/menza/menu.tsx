"use client";
import nyersMenu from "@/public/storage/mindenkorimenu.json";
import { useEffect, useState } from "react";
import { PossibleUserType } from "@/db/dbreq";
import { Section } from "../home/section";
import Arrow from "@/icons/arrow.svg";

type MenuType = {
  [x: string]: {
    A: string[];
    B: string[];
    nap: string;
  };
};

function formatDate(date: Date, simple = false) {
  if (simple) {
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    switch ((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) {
      case 0:
        return "Ma";
      case 1:
        return "Holnap";
      case -1:
        return "Tegnap";
    }
    return date
      .toLocaleDateString("hu", {
        month: "2-digit",
        day: "2-digit",
        weekday: "narrow",
      })
      .replaceAll(". ", "/")
      .replaceAll(".", "")
      .replaceAll("/", ".")
      .replaceAll(",", ".");
  }
  return date
    .toLocaleDateString("hu")
    .replaceAll(". ", "/")
    .replaceAll(".", "")
    .replaceAll("/", ".");
}

const mindenkorimenu = nyersMenu as unknown as MenuType;

const MenuCard = ({ menu, items }: { menu: "A" | "B"; items: string[] }) => {
  const color = menu === "A" ? "selfprimary" : "selfsecondary";
  return (
    <div
      className={`flex flex-wrap items-center justify-around gap-2 rounded-xl bg-${color}-100 p-4 text-center`}
      key={menu}
    >
      <div className="mx-2 grid h-10 w-10 grid-cols-1">
        <div
          className={`m-auto max-h-fit max-w-fit text-4xl font-bold text-${color}-700`}
        >
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
                  "info p-1 " +
                  (rowIndex !== 0 ? `border-t-1 border-${color}-400` : "")
                }
              >
                {fogas}
              </div>
            ) : (
              <div key={`empty-${rowIndex}`} />
            ),
          )
        ) : (
          <div key={"Amenu2"} className={`p-1 font-light text-${color}-700`}>
            Nincs információ
          </div>
        )}
      </div>
    </div>
  );
};

const DatePicker = ({
  date,
  setDate,
}: {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}) => {
  function changeDate(days: number) {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }
  return (
    <div className="flex h-8 items-center gap-2 rounded-full bg-selfprimary-100 px-2 text-center text-base font-medium text-selfprimary-700">
      <button className="h-full w-fit" onClick={() => changeDate(-1)}>
        <Arrow className="rotate-90" />
      </button>
      {formatDate(date, true)}
      <button className="h-full w-fit" onClick={() => changeDate(1)}>
        <Arrow className="-rotate-90" />
      </button>
    </div>
  );
};

export const Menu = ({
  menu,
  date = new Date(),
}: {
  menu: "A" | "B" | undefined;
  date: Date;
}) => {
  const tableData = mindenkorimenu;
  const [realMenu, setRealMenu] = useState(menu);

  useEffect(() => {
    fetch("/api/getAuth").then((res) => {
      res.json().then((data: PossibleUserType) => {
        if (!data) return;
        setRealMenu(data.food_menu as any);
      });
    });
  }, [menu]);

  return (
    <div className="text-foreground">
      <div className="flex w-fit gap-2 md:max-w-max">
        {realMenu !== "B" && (
          <MenuCard menu="A" items={tableData[formatDate(date)]?.A ?? []} />
        )}

        {realMenu !== "A" && (
          <MenuCard menu="B" items={tableData[formatDate(date)]?.B ?? []} />
        )}
      </div>
    </div>
  );
};

export const MenuInSection = ({
  selfUser,
  dropdownable = true,
  defaultStatus,
}: {
  selfUser: PossibleUserType | null | undefined;
  dropdownable?: boolean;
  defaultStatus?: "opened" | "closed";
}) => {
  const [date, setDate] = useState(new Date());
  return (
    <Section
      title="Mi a mai menü?"
      dropdownable={dropdownable}
      defaultStatus={defaultStatus}
      sideComponent={<DatePicker date={date} setDate={setDate} />}
    >
      <Menu
        date={date}
        menu={
          selfUser?.food_menu == "A" || selfUser?.food_menu == "B"
            ? selfUser?.food_menu
            : undefined
        }
      />
    </Section>
  );
};
