import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import {
  getPresentations,
  getMembersAtPresentation,
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

    if (!presentations || presentations.length === 0) {
      return new NextResponse("No presentations found", { status: 404 });
    }

    let tableData: Record<string, string[]> = {};
    let longestList = 0;
    for (const p of presentations) {
      const emails = await getMembersAtPresentation(user.email, p.id);
      tableData[p.title] = emails;
      longestList = Math.max(longestList, emails.length);
    }

    const workbook = new ExcelJS.Workbook();

    const createSheet = (type: "email" | "name") => {
      const sheet = workbook.addWorksheet(
        `Jelentkezések (${type === "email" ? "Email" : "Név"})`,
      );

      const headerRow = presentations.map((p) => p.title);
      sheet.addRow(headerRow).font = { bold: true };

      sheet.addRow(presentations.map((p) => `Létszámkorlát: ${p.capacity}`));
      sheet.addRow(
        presentations.map(
          (p) => `Jelentkezettek száma: ${tableData[p.title].length}`,
        ),
      );
      sheet.addRow(
        presentations.map(
          (p) => `Hátralévő helyek: ${p.capacity - tableData[p.title].length}`,
        ),
      );

      for (let i = 0; i < longestList; i++) {
        const row = presentations.map((p) => {
          const email = tableData[p.title][i];
          if (!email) return "";
          return type === "email" ? email : namesByEmail[email] || email;
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
