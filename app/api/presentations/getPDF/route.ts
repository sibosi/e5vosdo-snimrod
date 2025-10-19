import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getMembersAtPresentation,
  getPresentations,
} from "@/db/presentationSignup";
import { getAuth, getUser } from "@/db/dbreq";
import PDFDocumentWithTables from "pdfkit-table";
import getUserClass from "@/public/getUserClass";

// A helper function to clean up unwanted control characters.
// This regex keeps basic Latin characters, extended Latin (common in Hungarian),
// and newline/carriage return.
function sanitizeText(text: string): string {
  return text.replace(/[^\x20-\x7E\u00A0-\u017F\n\r]/g, "");
}

// Ensure PDFKit can locate its default font files in bundled environments.
process.env.PDFKIT_FONT_DIR = path.join(
  process.cwd(),
  "node_modules",
  "pdfkit",
  "js",
  "data",
  "fonts",
);

export async function GET() {
  const selfUser = await getAuth();
  if (!selfUser?.permissions?.includes("admin"))
    return new NextResponse("Unauthorized", { status: 403 });
  // Use PDFDocumentWithTables from pdfkit-table.
  const doc = new PDFDocumentWithTables({ margin: 50 });
  let customFontUsed = false;
  const fontPath = path.join(process.cwd(), "public", "fonts", "Outfit.ttf");

  try {
    // Prepare PDF in memory.
    const chunks: Buffer[] = [];

    // Optionally register a custom font.
    if (fs.existsSync(fontPath)) {
      doc.registerFont("Outfit", fontPath);
      doc.font("Outfit");
      customFontUsed = true;
    } else {
      console.warn(
        `Custom font not found at ${fontPath}. Falling back to built-in fonts.`,
      );
      doc.font("Helvetica");
    }

    // Capture PDF output.
    doc.on("data", (chunk) => chunks.push(chunk));

    // Add a heading.
    doc.fontSize(16).text("Presentations & Signups", { underline: true });
    doc.moveDown();

    // Retrieve presentations.
    const presentations = await getPresentations();

    for (const presentation of presentations) {
      // Sanitize presentation fields.
      const presTitle = sanitizeText(presentation.title);
      const presDescription = sanitizeText(presentation.description);
      const presAddress = sanitizeText(presentation.address);
      const presCapacity = presentation.capacity ?? "N/A";

      // Write presentation details.
      doc.registerFont("Outfit", fontPath, "bold");
      doc
        .fontSize(14)
        .font("Outfit")
        .text(`${presentation.id}: ${presTitle}`, { underline: true });
      doc.fontSize(12).text(`Description: ${presDescription}`);
      doc.text(`Address: ${presAddress}`);
      doc.text(`Capacity: ${presCapacity}`);
      doc.moveDown(0.5);

      // Retrieve signup emails (expected as string[]).
      const emails: string[] = await getMembersAtPresentation(
        null,
        presentation.id,
      );
      emails.sort((a, b) => a.localeCompare(b));

      if (emails.length > 0) {
        // Build the table rows as objects.
        const rows = [];
        for (const email of emails) {
          const emailStr = sanitizeText(String(email));
          const user = await getUser(emailStr);
          const name =
            user && typeof user.name === "string"
              ? sanitizeText(user.full_name!)
              : "Unknown";
          rows.push({ name: getUserClass(user!) + " " + name, email: emailStr });
        }

        // Calculate available width.
        const availableWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;
        // Define column widths: 30% for Name and 70% for Email.
        const nameWidth = availableWidth * 0.3;
        const emailWidth = availableWidth * 0.7;

        // Define the table with headers and data.
        const table = {
          headers: [
            {
              label: "Name",
              property: "name",
              width: nameWidth,
              renderer: undefined,
            },
            {
              label: "Email",
              property: "email",
              width: emailWidth,
              renderer: undefined,
            },
          ],
          datas: rows,
        };

        // Draw the table.
        await doc.table(table, {
          prepareHeader: () => doc.font("Courier").fontSize(12),
          prepareRow: (row, i) => doc.font("Courier").fontSize(10),
        });

        // Reset the font after drawing the table.
        if (customFontUsed) doc.font("Outfit");
        else doc.font("Helvetica");
      } else {
        doc.text("Signups: None");
      }
      doc.moveDown();
      doc.addPage();
    }

    // Finalize the PDF.
    doc.end();
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="presentations.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Failed to generate PDF.", { status: 500 });
  }
}
