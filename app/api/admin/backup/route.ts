import { backup } from "@/db/autobackup";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";

const BACKUP_API_TOKEN = (process.env.BACKUP_API_TOKEN || "").trim();

function getBackupToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch?.[1]) return bearerMatch[1].trim();

  return (request.headers.get("x-backup-token") || "").trim();
}

export async function GET(request: Request) {
  const token = getBackupToken(request);
  const tokenIsValid = Boolean(
    BACKUP_API_TOKEN && token && token === BACKUP_API_TOKEN,
  );

  const selfUser = tokenIsValid ? null : await getAuth();

  if (!tokenIsValid && !hasPermission(selfUser, ["backup", "admin"])) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Nincs jogosultságod a backup művelet végrehajtásához.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const data = await backup();
    return new Response(
      JSON.stringify({
        success: true,
        message: `Created backup's drive ID: ${data}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Hiba a backup folyamat során:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Hiba történt a backup folyamat során.",
        error: error.message || "Ismeretlen hiba",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
