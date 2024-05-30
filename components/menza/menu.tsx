import { Button } from "@nextui-org/react";

interface MenuData {
  [date: string]: {
    A: string[];
    B: string[];
    nap?: string; // Optional nap property
  };
}

import tableData from "@/src/mindenkorimenu.json";
const menuData = tableData as MenuData;

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export const Menu = () => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    padTo2Digits(now.getMonth() + 1),
    now.getDate(),
  ].join(".");

  return (
    <div className="text-foreground">
      <p className="font-medium pb-1 text-sm">{date}</p>

      <div className="gap-2 grid grid-cols-2 md:grid-cols-1 max-w-max overflow-hidden">
        <div className="overflow-auto md:flex">
          <Button disabled key={"Amenu1"} color="primary" variant="solid">
            🍴 A menü:
          </Button>
          {menuData[date] && menuData[date].A ? (
            menuData[date].A.map((fogas: string, rowIndex: number) => (
              <div key={rowIndex} className="py-1 px-0 md:py-0 md:px-1">
                <Button
                  disabled
                  key={rowIndex}
                  color="primary"
                  variant="flat"
                  className="border-1 border-blue-700"
                >
                  {fogas}
                </Button>
              </div>
            ))
          ) : (
            <Button disabled key={"Amenu2"} color="default" variant="solid">
              <p>Nincs információ</p>
            </Button>
          )}
        </div>
        <div className="overflow-auto md:flex">
          <Button disabled key={"Bmenu1"} color="secondary" variant="solid">
            🍴 B menü:
          </Button>
          {menuData[date] && menuData[date].A ? (
            menuData[date].B.map((fogas: string, rowIndex: number) => (
              <div key={rowIndex} className="py-1 px-0 md:py-0 md:px-1">
                <Button
                  disabled
                  key={rowIndex}
                  color="secondary"
                  variant="flat"
                  className="border-1 border-purple-800"
                >
                  {fogas}
                </Button>
              </div>
            ))
          ) : (
            <Button disabled key={"Bmenu2"} color="default" variant="solid">
              <p>Nincs információ</p>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
