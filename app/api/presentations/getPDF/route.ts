import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getPresentations,
  getSignupsWithParticipation,
} from "@/db/presentationSignup";
import { getAuth, getUser } from "@/db/dbreq";
import PDFDocumentWithTables from "pdfkit-table";
import getUserClass from "@/public/getUserClass";

// A helper function to clean up unwanted control characters.
// This regex keeps basic Latin characters, extended Latin (common in Hungarian),
// and newline/carriage return.
function sanitizeText(text: string): string {
  return text.replaceAll(/[^\x20-\x7E\u00A0-\u017F\n\r]/g, "");
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
  const doc = new PDFDocumentWithTables({
    margins: { top: 20, bottom: 10, left: 40, right: 40 },
  });
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

    // Retrieve presentations.
    const presentations = await getPresentations();

    let i = 0;

    const signupsByPresentation = new Map<
      number,
      Array<{ email: string; participated: boolean }>
    >();
    await Promise.all(
      presentations.map(async (presentation) => {
        const signups = await getSignupsWithParticipation(presentation.id);
        signupsByPresentation.set(
          presentation.id,
          signups.map((s) => ({
            email: s.email,
            participated: s.participated,
          })),
        );
      }),
    );

    for (const presentation of presentations) {
      i += 1;
      console.log(`Processing presentation ${i}/${presentations.length}`);
      // Sanitize presentation fields.
      const presTitle = sanitizeText(presentation.title);
      const presPerformerPre = sanitizeText(presentation.performer || "N/A");
      const presPerformer =
        presPerformerPre.length > 146
          ? `${presPerformerPre.slice(0, 143)}...`
          : presPerformerPre;
      const presAddress = sanitizeText(presentation.address);
      const presMaxCapacity = presentation.capacity;

      // Retrieve signup data with participation status
      const signups = signupsByPresentation.get(presentation.id) || [];
      signups.sort((a, b) => a.email.localeCompare(b.email));

      const presSignuped = signups.length;
      const presParticipated = signups.filter((s) => s.participated).length;

      // Write presentation details.
      doc.registerFont("Outfit", fontPath, "bold");
      doc
        .fontSize(14)
        .font("Outfit")
        .text(`${presentation.id}: ${presTitle}`, { underline: true });
      doc.text(`Előadó: ${presPerformer}`);
      doc.text(`Helyszín: ${presAddress} | Jelentkezők száma: ${presSignuped} (max. ${presMaxCapacity} fő) | Résztvevők száma: ${presParticipated}`);
      doc.moveDown(0.5);

      if (signups.length > 0) {
        // Build the table rows as objects.
        const rows = [];
        let j = 0;
        for (const signup of signups) {
          j += 1;
          const emailStr = sanitizeText(String(signup.email));
          const user = await getUser(emailStr);
          const name =
            user && typeof user.name === "string"
              ? sanitizeText(user.full_name ?? "*" + user.name)
              : "Unknown";
          rows.push({
            index: `${j}.`,
            name: name,
            class: getUserClass(user) || "N/A",
            email: emailStr,
            participated: signup.participated ? "✓" : "",
          });
        }

        // Calculate available width.
        const availableWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;

        const indexWidth = availableWidth * 0.03;
        const nameWidth = availableWidth * 0.35;
        const classWidth = availableWidth * 0.07;
        const emailWidth = availableWidth * 0.45;
        const participatedWidth = availableWidth * 0.1;

        // Define the table with headers and data.
        const table = {
          headers: [
            {
              label: "#",
              property: "index",
              width: indexWidth,
              renderer: undefined,
            },
            {
              label: "Név",
              property: "name",
              width: nameWidth,
              renderer: undefined,
            },
            {
              label: "Oszály",
              property: "class",
              width: classWidth,
              renderer: undefined,
            },
            {
              label: "Email",
              property: "email",
              width: emailWidth,
              renderer: undefined,
            },
            {
              label: "Részt vett",
              property: "participated",
              width: participatedWidth,
              renderer: undefined,
            },
          ],
          datas: rows,
        };

        // Draw the table.
        await doc.table(table, {
          prepareHeader: () => doc.font("Outfit").fontSize(12),
          prepareRow: (row, i) => doc.font("Outfit").fontSize(10),
        });

        // Reset the font after drawing the table.
        if (customFontUsed) doc.font("Outfit");
        else doc.font("Helvetica");
      } else {
        doc.text("Signups: None");
      }
      doc.moveDown();
      if (i < presentations.length) doc.addPage();
    }

    // Finalize the PDF.
    doc.end();
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: any) => reject(err as Error));
    });

    // Convert the buffer to a Uint8Array
    const pdfArrayBuffer = new Uint8Array(pdfBuffer);

    const fileName = `jelentkezesek ${new Date().toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })} ${new Date().toLocaleTimeString("hu-HU", {
      hour: "2-digit",
      minute: "2-digit",
    })}.pdf`
      .replaceAll(". ", "-")
      .replaceAll(":", "-");

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Failed to generate PDF.", { status: 500 });
  }
}
