import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import {
  getPresentations,
  getSignupsWithParticipation,
  getPresentationSlots,
} from "@/db/presentationSignup";
import { getAllUsersNameByEmail, getAuth } from "@/db/dbreq";
import { gate } from "@/db/permissions";

export async function GET() {
  try {
    const user = await getAuth();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    try {
      gate(user, "admin");
    } catch {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const presentations = await getPresentations();
    const namesByEmail = await getAllUsersNameByEmail();
    const slots = await getPresentationSlots();
    const slotMap = new Map(slots.map((s) => [s.id, s]));

    if (!presentations || presentations.length === 0) {
      return new NextResponse("No presentations found", { status: 404 });
    }

    let tableData: Record<
      string,
      Array<{ email: string; amount: number }>
    > = {};
    let longestList = 0;
    for (const p of presentations) {
      const signups = await getSignupsWithParticipation(p.id);
      tableData[p.title] = signups.map((s) => ({
        email: s.email,
        amount: s.amount,
      }));
      longestList = Math.max(longestList, signups.length);
    }

    const workbook = new ExcelJS.Workbook();

    const createSheet = (type: "email" | "name") => {
      const sheet = workbook.addWorksheet(
        `Jelentkezések (${type === "email" ? "Email" : "Név"})`,
      );

      const headerRow = presentations.map((p) => {
        const slot = slotMap.get(p.slot_id);
        return `${p.title} (${slot?.title || "N/A"})`;
      });
      sheet.addRow(headerRow).font = { bold: true };

      sheet.addRow(presentations.map((p) => `Létszámkorlát: ${p.capacity}`));

      const totalAmounts = presentations.map((p) =>
        tableData[p.title].reduce((sum, s) => sum + s.amount, 0),
      );

      sheet.addRow(
        presentations.map(
          (p, idx) =>
            `Jelentkezések száma: ${tableData[p.title].length} (${totalAmounts[idx]} fő)`,
        ),
      );
      sheet.addRow(
        presentations.map(
          (p, idx) => `Hátralévő helyek: ${p.capacity - totalAmounts[idx]}`,
        ),
      );

      for (let i = 0; i < longestList; i++) {
        const row = presentations.map((p) => {
          const signup = tableData[p.title][i];
          if (!signup) return "";
          const emailStr = signup.email;
          const amountStr = signup.amount > 1 ? ` (${signup.amount} fő)` : "";
          const userName =
            typeof namesByEmail[emailStr] === "string"
              ? namesByEmail[emailStr]
              : namesByEmail[emailStr]?.name || emailStr;
          return type === "email" ? emailStr + amountStr : userName + amountStr;
        });
        sheet.addRow(row);
      }

      sheet.columns.forEach((col) => {
        col.width = 30;
      });
    };

    createSheet("email");
    createSheet("name");

    const buffer = await workbook.xlsx.writeBuffer();

    const currentDate = new Date().toISOString().split("T")[0];

    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="prezentaciok_jelentkezok_${currentDate}.xlsx"`,
    );

    return new NextResponse(buffer, { headers, status: 200 });
  } catch (err) {
    console.error("Excel export error:", err);
    return new NextResponse("Error generating Excel file", { status: 500 });
  }
}
