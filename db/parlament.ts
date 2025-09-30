import { dbreq } from "./db";
import { UserType, getAllUsersNameByEmail } from "./dbreq";
import { gate } from "./permissions";
import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

export interface Parlament {
  id: number;
  date: string;
  title: string;
}

export interface ParlamentParticipant {
  id: number;
  email: string;
  class: string;
  parlament_id: number;
}

export async function createParlament(
  selfUser: UserType,
  date: string,
  title?: string,
) {
  gate(selfUser, "head_of_parlament");
  console.log("createParlament", date, title);
  return await dbreq(
    `INSERT INTO parlaments (date, title) VALUES ("${date}", "${title}");`,
  );
}

export async function deleteParlament(selfUser: UserType, parlamentId: number) {
  gate(selfUser, "admin");
  return await dbreq(`DELETE FROM parlaments WHERE id = ${parlamentId};`);
}

export async function getParlaments(selfUser: UserType) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  return await dbreq(`SELECT * FROM parlaments;`);
}

export async function getParlament(selfUser: UserType, parlamentId: number) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  return (
    await dbreq(`SELECT * FROM parlaments WHERE id = ${parlamentId};`)
  )[0] as Parlament;
}

export async function registerToParlament(
  selfUser: UserType,
  email: string,
  group: string,
  parlamentId: number,
) {
  gate(selfUser, "delegate_counter");
  return await dbreq(
    `INSERT INTO parlament_participants (email, class, parlament_id) VALUES ("${email}", "${group}", ${parlamentId});`,
  );
}

export async function unregisterFromParlament(
  selfUser: UserType,
  email: string,
  group: string,
  parlamentId: number,
) {
  gate(selfUser, "delegate_counter");
  return await dbreq(
    `DELETE FROM parlament_participants WHERE email = "${email}" AND class = "${group}" AND parlament_id = ${parlamentId};`,
  );
}

export async function getParlamentParticipants(
  selfUser: UserType,
  parlamentId: number,
) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  const data = (await dbreq(
    `SELECT * FROM parlament_participants WHERE parlament_id = ${parlamentId};`,
  )) as ParlamentParticipant[];

  const response: Record<string, string[]> = {};
  data.forEach((participant) => {
    if (!response[participant.class]) response[participant.class] = [];
    response[participant.class].push(participant.email);
  });

  return response;
}

export async function exportParlamentToPDF(
  selfUser: UserType,
  parlamentId: number,
) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);

  // Get parlament details
  const parlament = await getParlament(selfUser, parlamentId);
  if (!parlament) {
    throw new Error("Parlament not found");
  }

  // Get participants
  const participants = await getParlamentParticipants(selfUser, parlamentId);

  // Get all users' names by email
  const usersNameByEmail = await getAllUsersNameByEmail();

  // Create PDF
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  doc.font("Times-Roman");

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });

    doc.on("error", reject);

    // Use fonts that support Hungarian characters
    // The built-in Helvetica font supports Latin characters including Hungarian accents
    const regularFont = "Helvetica";
    const boldFont = "Helvetica-Bold";

    // PDF Header
    doc
      .font(boldFont)
      .fontSize(20)
      .text("Parlament Résztvevők", { align: "center" });
    doc.moveDown();

    doc
      .font(regularFont)
      .fontSize(16)
      .text(`Parlament: ${parlament.title}`, { align: "left" });
    doc.fontSize(14).text(`Időpont: ${parlament.date}`, { align: "left" });
    doc.moveDown(2);

    // Table-like layout using manual positioning
    const startX = 50;
    const startY = doc.y;
    const rowHeight = 25;
    const col1Width = 80;
    const col2Width = 60;
    const col3Width = 350;

    // Table headers
    doc.fontSize(12).font(boldFont);
    doc
      .rect(startX, startY, col1Width + col2Width + col3Width, rowHeight)
      .stroke();

    // Header cells
    doc.rect(startX, startY, col1Width, rowHeight).stroke();
    doc.rect(startX + col1Width, startY, col2Width, rowHeight).stroke();
    doc
      .rect(startX + col1Width + col2Width, startY, col3Width, rowHeight)
      .stroke();

    // Header text
    doc.text("Osztály", startX + 5, startY + 8);
    doc.text("Létszám", startX + col1Width + 5, startY + 8);
    doc.text("Résztvevők", startX + col1Width + col2Width + 5, startY + 8);

    let currentY = startY + rowHeight;

    // Sort classes and add rows
    const sortedClasses = Object.keys(participants).sort((a, b) =>
      a.localeCompare(b, "hu"),
    );

    doc.font(regularFont).fontSize(10);

    sortedClasses.forEach((className, index) => {
      const classParticipants = participants[className];
      const participantNames = classParticipants
        .map((email) => usersNameByEmail[email] || email)
        .join(", ");

      // Calculate row height based on content
      const participantText = participantNames || "Nincs regisztrált";
      const textHeight = Math.max(
        rowHeight,
        doc.heightOfString(participantText, { width: col3Width - 10 }) + 10,
      );

      // Draw row borders
      doc.rect(startX, currentY, col1Width, textHeight).stroke();
      doc.rect(startX + col1Width, currentY, col2Width, textHeight).stroke();
      doc
        .rect(startX + col1Width + col2Width, currentY, col3Width, textHeight)
        .stroke();

      // Add text content
      doc.text(className, startX + 5, currentY + 5, { width: col1Width - 10 });
      doc.text(
        classParticipants.length.toString() + " fő",
        startX + col1Width + 5,
        currentY + 5,
        { width: col2Width - 10 },
      );
      doc.text(
        participantText,
        startX + col1Width + col2Width + 5,
        currentY + 5,
        { width: col3Width - 10 },
      );

      currentY += textHeight;

      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
      }
    });

    // Add total count
    const totalParticipants = Object.values(participants).reduce(
      (sum, classParticipants) => sum + classParticipants.length,
      0,
    );

    doc.moveDown(2);
    doc.y = currentY + 20;
    doc
      .fontSize(12)
      .font(boldFont)
      .text(`Összes résztvevő: ${totalParticipants} fő`, { align: "left" });

    // Footer
    doc
      .fontSize(8)
      .font(regularFont)
      .text(
        `Generálva: ${new Date().toLocaleString("hu-HU")}`,
        50,
        doc.page.height - 50,
        { align: "center" },
      );

    doc.end();
  });
}
