import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/db/dbreq";
import { exportParlamentToPDF } from "@/db/parlament";

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get("Authorization");
    const selfUser = authHeader
      ? await getAuth(undefined, authHeader.replace("Bearer ", ""))
      : await getAuth();

    if (!selfUser) {
      return NextResponse.json(
        { error: "Please log in to use this API" },
        { status: 401 },
      );
    }

    // Get parlament ID from params
    const { id } = await context.params;
    const parlamentId = parseInt(id);

    if (isNaN(parlamentId)) {
      return NextResponse.json(
        { error: "Invalid parlament ID" },
        { status: 400 },
      );
    }

    // Generate PDF
    const pdfBuffer = await exportParlamentToPDF(selfUser, parlamentId);

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="parlament_${parlamentId}_resztvevok.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error exporting parlament to PDF:", error);
    return NextResponse.json(
      { error: "Failed to export parlament to PDF" },
      { status: 500 },
    );
  }
}
