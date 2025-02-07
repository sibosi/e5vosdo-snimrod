// Commented by ChatGPT
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import readline from "readline";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/auth/callback/google";

const TOKEN_PATH = path.join(__dirname, "token.json");

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

/**
 * Megpróbálja beállítani a meglévő token-t a token.json fájlból.
 * Ha nem találja, akkor elindítja az engedélyezési folyamatot.
 */
function authorize(callback: (authClient: any) => void) {
  if (fs.existsSync(TOKEN_PATH)) {
    // Ha van token, beolvassuk és beállítjuk
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    callback(oAuth2Client);
  } else {
    // Ha nincs token, kérjük a felhasználót, hogy engedélyezze az alkalmazást
    getAccessToken(oAuth2Client, callback);
  }
}

// Elindítja a felhasználói engedélyezési folyamatot.
function getAccessToken(
  oAuth2Client: any,
  callback: (authClient: any) => void,
) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.file"], // Vagy egyéb szükséges scope-ok
  });
  console.log("Engedélyezd az alkalmazást az alábbi URL-en:");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    "Add meg az URL megnyitása után kapott kódot: ",
    (code: string) => {
      rl.close();
      oAuth2Client.getToken(code, (err: any, token: any) => {
        if (err) {
          return console.error("Hiba a token beszerzésekor:", err);
        }
        oAuth2Client.setCredentials(token);
        // Mentjük a token-t a jövőbeli használathoz
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log("Token elmentve a:", TOKEN_PATH);
        callback(oAuth2Client);
      });
    },
  );
}

// Példa: Google Drive API kliens létrehozása OAuth2 hitelesítéssel
function getDriveClient(callback: (drive: any) => void) {
  authorize((authClient) => {
    const drive = google.drive({ version: "v3", auth: authClient });
    callback(drive);
  });
}

// Példa függvény a Google Drive feltöltésére (pl. egy backup fájl feltöltése)
async function uploadToGoogleDrive(filePath: string) {
  getDriveClient(async (drive: any) => {
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
  });
}

// Példa függvény a teljes backup és feltöltési folyamatra
async function backupAndUpload(): Promise<void> {
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
