"use client";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";
import { teachersConfig } from "@/config/teachers";
import { useState, useEffect } from "react";

type rowType = string[];
const columns = teachersConfig.showHeaders;
const rows: rowType[] = [];

export const TeacherTable = () => {
  const [tableData, setTableData] = useState<rowType[]>(rows);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api"); // Adjust path if needed
      if (res.status != 200) {
        return;
      }
      const data = await res.json();
      setTableData(
        data.filter((_: any, index: any) =>
          teachersConfig.showIndexes.includes(index),
        ),
      );
    };

    fetchData();
  }, []);

  return (
    <div className="max-h-max max-w-max text-foreground">
      <Table
        aria-label="Example table with dynamic content"
        className="max-h-max max-w-max text-foreground"
      >
        <TableHeader>
          {columns.map((column, colIndex) => (
            <TableColumn key={colIndex}>{column}</TableColumn>
          ))}
        </TableHeader>
        <TableBody emptyContent={"Úgy látszik minden tanár órára kész!"}>
          {tableData.map((row: rowType, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {(columnKey: any) => (
                <TableCell>{getKeyValue(row[columnKey], columnKey)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
