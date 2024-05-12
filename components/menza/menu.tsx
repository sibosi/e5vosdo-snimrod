"use client";
import { Button } from "@nextui-org/react";
import { useState, useEffect } from "react";

type RowType = {
  [date: string]: {
    [x: string]: any;
    A: string[];
    B: string[];
    nap: string;
  };
};

const rows: RowType[] = [];

function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0");
}

export const Menu = () => {
  const [tableData, setTableData] = useState<RowType[]>(rows);
  const now = new Date();
  const date: any = [
    now.getFullYear(),
    padTo2Digits(now.getMonth() + 1),
    now.getDate(),
  ].join(".");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/storage/mindenkorimenu.json"); // Adjust path if needed
      const data = await res.json();
      setTableData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="py-2">
      <h1 className="text-2xl font-medium py-1">
        Mi a mai menü?
        <p className="text-sm">{date}</p>
      </h1>

      <div className="gap-2 grid grid-cols-2 max-w-max overflow-hidden">
        <div>
          <Button key={"Amenu1"} color="primary" variant="solid">
            🍴 A menü:
          </Button>
          {tableData[date] && tableData[date].A ? (
            tableData[date].A.map((fogas: string, rowIndex: number) => (
              <div key={rowIndex}>
                <Button key={rowIndex} color="primary" variant="flat">
                  {fogas}
                </Button>
              </div>
            ))
          ) : (
            <Button key={"Amenu2"} color="warning" variant="solid">
              <p>Nincs információ</p>
            </Button>
          )}
        </div>
        <div>
          <Button key={"Bmenu1"} color="secondary" variant="solid">
            🍴 B menü:
          </Button>
          {tableData[date] && tableData[date].A ? (
            tableData[date].B.map((fogas: string, rowIndex: number) => (
              <div key={rowIndex}>
                <Button key={rowIndex} color="secondary" variant="flat">
                  {fogas}
                </Button>
              </div>
            ))
          ) : (
            <Button key={"Bmenu2"} color="warning" variant="solid">
              <p>Nincs információ</p>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
