import { google } from "googleapis";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function getDriveClient() {
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

  const auth = new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    serviceAccount.private_key,
    ["https://www.googleapis.com/auth/drive.file"],
  );

  return google.drive({ version: "v3", auth });
}

/**
 * Fájl titkosítása AES-256-CBC algoritmussal.
 * A titkosított fájl elejére beírjuk az IV-t, hogy később visszafejthető legyen.
 * @param inputPath - Az eredeti (titkosítandó) fájl elérési útja.
 * @param outputPath - A titkosított fájl elérési útja.
 * @param password - A titkosítás jelszava.
 */
async function encryptFile(
  inputPath: string,
  outputPath: string,
  password: string,
) {
  const algorithm = "aes-256-gcm";
  const key = crypto.scryptSync(password, "salt", 32);
  // Ajánlott iv hosszúság GCM esetén: 12 byte
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // GCM mód nem igényli az explicit padding beállítást

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  // Először írjuk ki az iv-t a kimeneti fájlba, mert szükséges lesz a dekódoláskor
  output.write(iv);

  // Az adatok titkosítása folytonosan zajlik
  input.pipe(cipher).pipe(output, { end: false });

  // Amikor a titkosítás befejeződött, lekérjük az auth tag-et és hozzáfűzzük a kimenethez
  cipher.on("end", () => {
    const authTag = cipher.getAuthTag();
    output.write(authTag);
    output.end();
  });

  return new Promise<void>((resolve, reject) => {
    output.on("finish", () => resolve());
    output.on("error", (err) => reject(err));
  });
}

/**
 * Fájl feltöltése a Google Drive adott mappájába.
 * @param filePath - A feltöltendő fájl elérési útja.
 * @param folderId - A célmappa ID-je.
 */
async function uploadToGoogleDrive(filePath: string, folderId: string) {
  const drive = getDriveClient();
  const fileName = path.basename(filePath);
  const fileMetadata = {
    name: fileName,
    parents: [folderId], // A célmappa ID-je
  };
  const media = {
    mimeType: "application/octet-stream", // titkosított fájl esetén általános mime-type
    body: fs.createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
      supportsAllDrives: true,
    });
    console.log("Fájl feltöltve. Google Drive ID:", response.data.id);
    return response.data;
  } catch (error: any) {
    console.error("Hiba a Google Drive feltöltésekor:", error);
    throw error;
  }
}

/**
 * Teljes backup, titkosítás és feltöltési folyamat.
 */
async function backupAndUpload() {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  try {
    // 1. Adatbázis backup készítése
    const dumpFileName = `backup-${timestamp}.sql`;
    const dumpFilePath = path.join(__dirname, dumpFileName);
    const dumpCommand = `/usr/bin/mariadb-dump --ssl-mode=DISABLED -h ${process.env.MYSQL_HOST} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > ${dumpFilePath}`;

    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);
    await execPromise(dumpCommand);
    console.log("Adatbázis mentés elkészült:", dumpFileName);

    // 2. Fájl titkosítása
    if (!process.env.ENCRYPTION_PASSWORD)
      throw new Error(
        "ENCRYPTION_PASSWORD környezeti változó nincs beállítva.",
      );

    const encryptionPassword = process.env.ENCRYPTION_PASSWORD;
    const encryptedFileName = dumpFileName + ".enc";
    const encryptedFilePath = path.join(__dirname, encryptedFileName);
    await encryptFile(dumpFilePath, encryptedFilePath, encryptionPassword);
    console.log("Fájl titkosítva:", encryptedFileName);

    // 3. Feltöltés a Google Drive megadott mappájába
    if (!process.env.BACKUP_FOLDER_ID)
      throw new Error("BACKUP_FOLDER_ID környezeti változó nincs beállítva.");
    const folderId = process.env.BACKUP_FOLDER_ID; // Célmappa ID
    const resp = await uploadToGoogleDrive(encryptedFilePath, folderId);

    // 4. Lokális fájlok törlése
    fs.unlinkSync(dumpFilePath);
    fs.unlinkSync(encryptedFilePath);
    console.log("Lokális backup és titkosított fájl törölve.");

    return resp;
  } catch (error) {
    console.error(
      "Hiba a backup, titkosítás és feltöltési folyamatban:",
      error,
    );
    throw error;
  }
}

export async function backup() {
  return await backupAndUpload();
}
