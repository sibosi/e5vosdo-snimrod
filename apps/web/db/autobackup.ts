import { google } from "googleapis";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export function getDriveClient() {
  // Prefer SERVICE_ACCOUNT_KEY (inline JSON or base64 JSON); fallback to SERVICE_ACCOUNT_KEY_PATH
  const inline = (process.env.SERVICE_ACCOUNT_KEY || "").trim();
  const keyPath = (process.env.SERVICE_ACCOUNT_KEY_PATH || "").trim();

  if (!inline && !keyPath) {
    throw new Error(
      "SERVICE_ACCOUNT_KEY vagy SERVICE_ACCOUNT_KEY_PATH nincs beállítva (Google Drive service account).",
    );
  }

  let raw = inline;
  if (!raw && keyPath) {
    try {
      raw = fs.readFileSync(keyPath, "utf8");
    } catch (e: any) {
      throw new Error(
        `SERVICE_ACCOUNT_KEY_PATH olvasási hiba: ${keyPath} — ${e?.message || e}`,
      );
    }
  }

  if (!raw?.trim()) {
    throw new Error(
      "SERVICE_ACCOUNT_KEY üres. Adj meg érvényes JSON-t vagy használd a SERVICE_ACCOUNT_KEY_PATH változót.",
    );
  }

  // raw lehet: JSON szöveg vagy base64-kódolt JSON
  let jsonText = raw.trim();
  if (!jsonText.startsWith("{") || !jsonText.endsWith("}")) {
    // próbáljuk base64-ként értelmezni
    try {
      jsonText = Buffer.from(jsonText, "base64").toString("utf8");
    } catch {
      // ha nem base64, megyünk tovább és majd a JSON.parse dob pontos hibát
    }
  }

  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(jsonText);
  } catch (e: any) {
    throw new Error(
      `SERVICE_ACCOUNT_KEY érvénytelen JSON. Ellenőrizd az értéket vagy a fájlt: ${e?.message || e}`,
    );
  }

  const privateKey = (
    serviceAccount.private_key as string | undefined
  )?.replace(/\\n/g, "\n");
  if (!serviceAccount.client_email || !privateKey) {
    throw new Error(
      "A service account JSON hiányos (client_email vagy private_key hiányzik).",
    );
  }

  const scopes = ["https://www.googleapis.com/auth/drive"]; // full Drive access; adjust if needed
  const subject = process.env.GOOGLE_IMPERSONATE_EMAIL || undefined; // optional domain-wide delegation
  const auth = new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    privateKey,
    scopes,
    subject,
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
    const dumpCommand = `/usr/bin/mariadb-dump --ssl=0 -h ${process.env.MYSQL_HOST} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > ${dumpFilePath}`;

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
