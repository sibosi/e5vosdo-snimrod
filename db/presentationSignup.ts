import { dbreq, multipledbreq } from "./db";

export interface PresentationType {
  id: number;
  name: string;
  organiser: string;
  description: string;
  capacity: number;
  remaining_capacity: number;
}

export interface SignupType {
  email: string;
  presentation_id: number;
}

export async function getPresentations(): Promise<PresentationType[]> {
  return await dbreq("SELECT * FROM presentations");
}

export async function getPresentationsCapacity(): Promise<{
  [key: number]: number;
}> {
  // current time
  // console.log("CALLED " + new Date().toISOString());
  const rows: { id: number; remaining_capacity: number }[] = await dbreq(
    "SELECT id, remaining_capacity FROM presentations",
  );
  const result: { [key: number]: number } = {};
  for (const row of rows) {
    result[row.id] = row.remaining_capacity;
  }
  return result;
}

export async function getMyPresentationId(
  email: string | null | undefined,
): Promise<number | null> {
  const [result] = await dbreq(
    `SELECT presentation_id FROM signups WHERE email = ?`,
    [email],
  );
  // undefined | { presentation_id: number }
  console.log(result);
  return result?.presentation_id ?? null;
}

export async function getMyPresentation(
  email: string | null | undefined,
): Promise<PresentationType[]> {
  return (
    await dbreq(
      `SELECT * FROM presentations WHERE id IN (SELECT presentation_id FROM signups WHERE email = ?)`,
      [email],
    )
  )[0];
}

export async function getMembersAtPresentation(
  email: string | null | undefined,
  presentation_id: number,
): Promise<string[]> {
  return await dbreq(`SELECT email FROM signups WHERE presentation_id = ?`, [
    presentation_id,
  ]);
}

export async function signUpForPresentation(
  email: string | null | undefined,
  presentation_id: number | "NULL",
  retries = 3,
): Promise<any> {
  try {
    const result = await multipledbreq(async (conn) => {
      // Ha NULL, akkor töröljük a jelentkezést
      if (presentation_id === "NULL") {
        const [selResult] = await conn.execute(
          `SELECT presentation_id FROM signups WHERE email = ? FOR UPDATE`,
          [email],
        );
        const rows = Array.isArray(selResult)
          ? (selResult as { presentation_id: number }[])
          : [];
        if (rows.length === 0)
          return { success: true, message: "Nincs törlendő jelentkezés" };

        const prevPresentationId = rows[0].presentation_id;
        await conn.execute(`DELETE FROM signups WHERE email = ?`, [email]);
        await conn.execute(
          `UPDATE presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = ?`,
          [prevPresentationId],
        );
        return { success: true, message: "Jelentkezés törölve" };
      } else {
        // Ha nem NULL, akkor jelentkezünk
        const [existingResult] = await conn.execute(
          `SELECT presentation_id FROM signups WHERE email = ? FOR UPDATE`,
          [email],
        );
        const existing = Array.isArray(existingResult)
          ? (existingResult as { presentation_id: number }[])
          : [];
        const isUpdate = existing.length > 0;
        let previousPresentationId: number | null = null;
        if (isUpdate) previousPresentationId = existing[0].presentation_id;

        const [updateResult]: any = await conn.execute(
          `UPDATE presentations SET remaining_capacity = remaining_capacity - 1
             WHERE id = ? AND remaining_capacity > 0`,
          [presentation_id],
        );
        if (updateResult.affectedRows === 0)
          return { success: true, message: "Nincs elegendő kapacitás" };

        if (isUpdate) {
          await conn.execute(
            `UPDATE signups SET presentation_id = ? WHERE email = ?`,
            [presentation_id, email],
          );
          await conn.execute(
            `UPDATE presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = ?`,
            [previousPresentationId],
          );
          return { success: true, message: "Jelentkezés módosítva" };
        } else {
          await conn.execute(
            `INSERT INTO signups (email, presentation_id) VALUES (?, ?)`,
            [email, presentation_id],
          );
          return { success: true, message: "Jelentkezés sikeres" };
        }
      }
    });
    return result;
  } catch (error: any) {
    if (retries > 0 && error.message.includes("Deadlock")) {
      console.warn(
        `Deadlock történt, újrapróbálom a tranzakciót. Hátralévő próbálkozások: ${retries}`,
      );
      return signUpForPresentation(email, presentation_id, retries - 1);
    }
    console.error("Hiba a signUpForPresentation-ben:", error);
    throw new Error("Hiba a jelentkezés során");
  }
}
