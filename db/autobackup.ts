import { google } from "googleapis";
import fs from "fs";
import path from "path";

// A service account fájl elérési útja környezeti változóból
const SERVICE_ACCOUNT_KEY_PATH = process.env.SERVICE_ACCOUNT_KEY_PATH;

if (!SERVICE_ACCOUNT_KEY_PATH || !fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
  throw new Error(
    "A service account fájl nem található. Ellenőrizd a SERVICE_ACCOUNT_KEY_PATH környezeti változót.",
  );
}

const serviceAccount = JSON.parse(
  fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, "utf8"),
);

/**
 * Google Drive kliens létrehozása Service Account használatával
 */
function getDriveClient() {
  const auth = new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    serviceAccount.private_key,
    ["https://www.googleapis.com/auth/drive.file"],
  );

  return google.drive({ version: "v3", auth });
}

// Példa függvény a Google Drive feltöltésére (pl. egy backup fájl feltöltése)
async function uploadToGoogleDrive(filePath: string) {
  const drive = getDriveClient();
  const fileName = path.basename(filePath);
  const fileMetadata = {
    name: fileName,
    // Opcionálisan megadhatsz egy mappát is: parents: ['<YOUR_FOLDER_ID>'],
  };
  const media = {
    mimeType: "application/sql",
    body: fs.createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log("Fájl feltöltve. Google Drive ID:", response.data.id);
    return response.data;
  } catch (error) {
    console.error("Hiba a Google Drive feltöltésekor:", error);
  }
}

// Példa függvény a teljes backup és feltöltési folyamatra
async function backupAndUpload() {
  try {
    // Például itt készítenéd a mysqldump backupot
    const dumpFileName = `backup-${Date.now()}.sql`;
    const dumpFilePath = path.join(__dirname, dumpFileName);
    const dumpCommand = `mysqldump --ssl=0 -h ${process.env.MYSQL_HOST} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > ${dumpFilePath}`;

    // A mysqldump futtatása
    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);
    await execPromise(dumpCommand);
    console.log("Adatbázis mentés elkészült:", dumpFileName);

    // Feltöltés a Google Drive-ra
    const resp = await uploadToGoogleDrive(dumpFilePath);

    // Lokális fájl törlése, ha már nincs rá szükség
    fs.unlinkSync(dumpFilePath);
    console.log("Lokális backup fájl törölve.");
    return resp;
  } catch (error) {
    console.error("Hiba a backup és feltöltési folyamatban:", error);
  }
}

export async function backup() {
  return await backupAndUpload();
}
