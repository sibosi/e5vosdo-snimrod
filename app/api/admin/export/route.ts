import { NextResponse } from "next/server";
import { gate } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { dbreq } from "@/db/presentationSignup";

export async function GET() {
  try {
    const user = await getAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    gate(user, "admin");

    const result = await dbreq(`
      SELECT 
        p.id,
        p.title,
        p.description,
        p.address,
        p.requirements,
        p.capacity,
        p.remaining_capacity,
        COUNT(s.email) as signup_count,
        GROUP_CONCAT(s.email SEPARATOR ', ') as signups
      FROM presentations p
      LEFT JOIN signups s ON p.id = s.presentation_id
      GROUP BY p.id, p.title, p.description, p.address, p.requirements, p.capacity, p.remaining_capacity
      ORDER BY p.id
    `);

    const csvHeaders =
      "ID,Cím,Leírás,Cím,Követelmények,Kapacitás,Szabad_helyek,Jelentkezők_száma,Jelentkezők_email\n";
    const csvRows = result
      .map((row: any) => {
        const values = [
          row.id,
          `"${row.title.replace(/"/g, '""')}"`,
          `"${row.description.replace(/"/g, '""')}"`,
          `"${row.address.replace(/"/g, '""')}"`,
          `"${row.requirements.replace(/"/g, '""')}"`,
          row.capacity,
          row.remaining_capacity ?? "NULL",
          row.signup_count,
          `"${(row.signups || "").replace(/"/g, '""')}"`,
        ];
        return values.join(",");
      })
      .join("\n");

    const csvContent = csvHeaders + csvRows;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="prezentaciok_jelentkezok_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating CSV:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate CSV" },
      { status: 500 },
    );
  }
}
