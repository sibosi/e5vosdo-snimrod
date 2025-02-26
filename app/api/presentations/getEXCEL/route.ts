import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
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
    } catch (error) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const presentations = await getPresentations();
    const namesByEmail = await getAllUsersNameByEmail();

    if (!presentations || presentations.length === 0) {
      return new NextResponse("No presentations found", { status: 404 });
    }

    let tableData: Record<string, string[]> = {};
    let longestList = 0;
    for (const presentation of presentations) {
      const emails = await getMembersAtPresentation(
        user.email,
        presentation.id,
      );
      tableData[presentation.name] = emails;
      longestList = Math.max(longestList, emails.length);
    }

    const worksheetDataEmail = [];
    const worksheetDataName = [];

    const headerRow = [];
    for (const presentation of presentations) {
      headerRow.push(presentation.name);
    }
    worksheetDataEmail.push([...headerRow]);
    worksheetDataName.push([...headerRow]);

    const maxCapacity = [];
    for (const presentation of presentations) {
      maxCapacity.push("Létszámkorlát: " + presentation.capacity);
    }
    worksheetDataEmail.push([...maxCapacity]);
    worksheetDataName.push([...maxCapacity]);

    const signupedNum = [];
    for (const presentation of presentations) {
      signupedNum.push(
        "Jelentkezettek száma: " + tableData[presentation.name].length,
      );
    }
    worksheetDataEmail.push([...signupedNum]);
    worksheetDataName.push([...signupedNum]);

    const remainingCapacity = [];
    for (const presentation of presentations) {
      remainingCapacity.push(
        "Hátralévő helyek: " +
          (presentation.capacity - tableData[presentation.name].length),
      );
    }
    worksheetDataEmail.push([...remainingCapacity]);
    worksheetDataName.push([...remainingCapacity]);

    for (let i = 0; i < longestList; i++) {
      const emailRow = [];
      const nameRow = [];
      for (const presentation of presentations) {
        const emails = tableData[presentation.name];
        const email = emails[i] || null;
        emailRow.push(email);
        nameRow.push(email ? namesByEmail[email] || email : null);
      }
      worksheetDataEmail.push(emailRow);
      worksheetDataName.push(nameRow);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet1 = XLSX.utils.aoa_to_sheet(worksheetDataEmail);
    const worksheet2 = XLSX.utils.aoa_to_sheet(worksheetDataName);

    const wscols = [{ wch: 30 }, ...presentations.map(() => ({ wch: 30 }))];
    worksheet1["!cols"] = wscols;
    worksheet2["!cols"] = wscols;

    for (let i = 0; i < presentations.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });

      if (!worksheet1[cellRef]) worksheet1[cellRef] = { v: "", t: "s" };
      worksheet1[cellRef].s = { font: { bold: true } };

      if (!worksheet2[cellRef]) worksheet2[cellRef] = { v: "", t: "s" };
      worksheet2[cellRef].s = { font: { bold: true } };
    }

    XLSX.utils.book_append_sheet(workbook, worksheet1, "Jelentkezések (Email)");
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Jelentkezések (Név)");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

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

    return new NextResponse(excelBuffer, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return new NextResponse("Error generating Excel file", { status: 500 });
  }
}
