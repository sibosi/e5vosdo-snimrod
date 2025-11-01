import mysql from "mysql2/promise";
import { getAuth } from "./dbreq";
import { gate } from "./permissions";

interface MyGlobal {
  __mysqlPool?: mysql.Pool;
}

const gPS = globalThis as MyGlobal;

const pool =
  gPS.__mysqlPool ??
  mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

gPS.__mysqlPool = pool;

export async function withConnection<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}

export async function dbreq(query: string, params?: any[]): Promise<any> {
  try {
    return await withConnection(async (connection) => {
      try {
        const [result] = await connection.execute(query, params);
        return result;
      } catch (error: any) {
        console.error(
          "Hiba a lekérdezés során, újrapróbálkozás:",
          error.message,
        );
        connection.destroy();
        return await withConnection(async (newConnection) => {
          const [result] = await newConnection.execute(query, params);
          return result;
        });
      }
    });
  } catch (error) {
    console.error("Lekérdezés végrehajtása sikertelen:", error);
    throw new Error("Failed to execute query. bug #71");
  }
}

export async function multipledbreq<T>(
  queries: ((conn: mysql.PoolConnection) => Promise<T>) | string[],
): Promise<T> {
  return await withConnection(async (connection) => {
    try {
      await connection.beginTransaction();
      let result: any;
      if (typeof queries === "function") {
        result = await queries(connection);
      } else if (Array.isArray(queries)) {
        result = [];
        for (const q of queries) {
          const [res] = await connection.execute(q);
          result.push(res);
        }
      }
      await connection.commit();
      return result;
    } catch (e) {
      await connection.rollback();
      throw e;
    }
  });
}

export interface PresentationSlotType {
  id: number;
  title: string;
  details: string | null;
}

export interface PresentationType {
  id: number;
  slot_id: number;
  title: string;
  performer: string | null;
  description: string;
  address: string;
  requirements: string;
  capacity: number;
  remaining_capacity: number | null;
}

export interface SignupType {
  id: number;
  email: string;
  presentation_id: number;
  slot_id: number;
  participated: boolean;
  amount: number;
  details: string | null;
}

export async function getPresentations(): Promise<PresentationType[]> {
  return await dbreq("SELECT * FROM presentations");
}

export async function getPresentationsBySlot(
  slot_id: number,
): Promise<PresentationType[]> {
  return await dbreq("SELECT * FROM presentations WHERE slot_id = ?", [
    slot_id,
  ]);
}

export async function getPresentationSlots(): Promise<PresentationSlotType[]> {
  return await dbreq("SELECT * FROM presentation_slots ORDER BY id");
}

export async function getPresentationsCapacity(): Promise<{
  [key: number]: number;
}> {
  const rows: { id: number; remaining_capacity: number }[] = await dbreq(
    "SELECT id, remaining_capacity FROM presentations",
  );
  const result: { [key: number]: number } = {};
  for (const row of rows) {
    result[row.id] = row.remaining_capacity;
  }
  return result;
}

export async function getMyPresentations(
  email: string | null | undefined,
): Promise<PresentationType[]> {
  return await dbreq(
    `SELECT * FROM presentations WHERE id IN (SELECT presentation_id FROM signups WHERE email = ?)`,
    [email],
  );
}

export async function getMySignups(
  email: string | null | undefined,
): Promise<SignupType[]> {
  const result = await dbreq(
    `SELECT id, email, presentation_id, slot_id, participated, amount, details FROM signups WHERE email = ?`,
    [email],
  );

  return result.map((signup: any) => ({
    ...signup,
    participated: Boolean(signup.participated),
  }));
}

export async function getSignupsBySlot(
  email: string | null | undefined,
  slot_id: number,
): Promise<SignupType | null> {
  const result = await dbreq(
    `SELECT id, email, presentation_id, slot_id, participated, amount, details FROM signups WHERE email = ? AND slot_id = ?`,
    [email, slot_id],
  );

  if (result.length === 0) return null;

  return {
    ...result[0],
    participated: Boolean(result[0].participated),
  };
}

export async function getMembersAtPresentation(
  email: string | null | undefined,
  presentation_id: number,
): Promise<string[]> {
  const result = await dbreq(
    `SELECT email FROM signups WHERE presentation_id = ?`,
    [presentation_id],
  );
  return result.map((row: { email: string }) => row.email);
}

export async function signUpForPresentation(
  email: string | null | undefined,
  presentation_id: number | "NULL",
  slot_id: number,
  amount: number = 1,
  details: string | null = null,
  retries = 3,
): Promise<any> {
  try {
    if (!email) {
      throw new Error("Email or OM ID required for signup");
    }

    const result = await multipledbreq(async (conn) => {
      const [existingSignupsRes] = await conn.execute(
        `SELECT presentation_id, amount FROM signups WHERE email = ? AND slot_id = ? FOR UPDATE`,
        [email, slot_id],
      );
      const existingSignups = Array.isArray(existingSignupsRes)
        ? (existingSignupsRes as { presentation_id: number; amount: number }[])
        : [];

      // Ha NULL, akkor töröljük a jelentkezést
      if (presentation_id === "NULL") {
        if (existingSignups.length > 0) {
          const [isNull] = await conn.execute(
            `SELECT remaining_capacity FROM presentations WHERE id = ?`,
            [existingSignups[0].presentation_id],
          );
          const isNullCapacity = Array.isArray(isNull)
            ? (isNull as { remaining_capacity: number | null }[])
            : [];
          if (isNullCapacity[0].remaining_capacity === null)
            return { success: false, message: "Jelentkezési időszak lezárva" };
        }
        if (existingSignups.length === 0)
          return { success: true, message: "Nincs törlendő jelentkezés" };

        const prevPresentationId = existingSignups[0].presentation_id;
        const prevAmount = existingSignups[0].amount;
        await conn.execute(
          `DELETE FROM signups WHERE email = ? AND slot_id = ?`,
          [email, slot_id],
        );
        await conn.execute(
          `UPDATE presentations SET remaining_capacity = remaining_capacity + ? WHERE id = ?`,
          [prevAmount, prevPresentationId],
        );
        return { success: true, message: "Jelentkezés törölve" };
      } else {
        // Ha nem NULL, akkor jelentkezünk
        const isUpdate = existingSignups.length > 0;
        let previousPresentationId: number | null = null;
        let previousAmount = 0;
        if (isUpdate) {
          previousPresentationId = existingSignups[0].presentation_id;
          previousAmount = existingSignups[0].amount;
        }

        const [updateResult]: any = await conn.execute(
          `UPDATE presentations SET remaining_capacity = remaining_capacity - ?
             WHERE id = ? AND remaining_capacity >= ?`,
          [amount, presentation_id, amount],
        );
        if (updateResult.affectedRows === 0)
          return { success: false, message: "Nincs elegendő kapacitás" };

        if (isUpdate) {
          await conn.execute(
            `UPDATE signups SET presentation_id = ?, amount = ?, details = ? WHERE email = ? AND slot_id = ?`,
            [presentation_id, amount, details, email, slot_id],
          );
          await conn.execute(
            `UPDATE presentations SET remaining_capacity = remaining_capacity + ? WHERE id = ?`,
            [previousAmount, previousPresentationId],
          );
          return { success: true, message: "Jelentkezés módosítva" };
        } else {
          await conn.execute(
            `INSERT INTO signups (email, presentation_id, slot_id, amount, details) VALUES (?, ?, ?, ?, ?)`,
            [email, presentation_id, slot_id, amount, details],
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
      return signUpForPresentation(
        email,
        presentation_id,
        slot_id,
        amount,
        details,
        retries - 1,
      );
    }
    console.error("Hiba a signUpForPresentation-ben:", error);
    throw new Error("Hiba a jelentkezés során");
  }
}

export async function makeUserSignedUp(
  email: string,
  presentation_id: number,
  slot_id: number,
  amount: number = 1,
  details: string | null = null,
) {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "admin", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");
  return await multipledbreq(async (conn) => {
    const [currentSignups]: any = await conn.execute(
      `SELECT presentation_id FROM signups WHERE email = ? AND slot_id = ? FOR UPDATE`,
      [email, slot_id],
    );

    if (currentSignups.length > 0)
      throw new Error("A felhasználó már jelentkezett ebben a sávban");

    const [updateResult]: any = await conn.execute(
      `UPDATE presentations SET remaining_capacity = remaining_capacity - ?
         WHERE id = ? AND remaining_capacity >= ?`,
      [amount, presentation_id, amount],
    );
    if (updateResult.affectedRows === 0)
      throw new Error("Nincs elegendő kapacitás");

    await conn.execute(
      `INSERT INTO signups (email, presentation_id, slot_id, amount, details) VALUES (?, ?, ?, ?, ?)`,
      [email, presentation_id, slot_id, amount, details],
    );
  });
}

export async function adminForceUserSignUp(
  email: string,
  presentation_id: number,
  slot_id: number,
  amount: number = 1,
  details: string | null = null,
) {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "admin", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  return await multipledbreq(async (conn) => {
    // Ellenőrizzük, hogy a felhasználó már jelentkezett-e ebben a sávban
    const [currentSignups]: any = await conn.execute(
      `SELECT presentation_id FROM signups WHERE email = ? AND slot_id = ? FOR UPDATE`,
      [email, slot_id],
    );

    if (currentSignups.length > 0)
      throw new Error("A felhasználó már jelentkezett ebben a sávban");

    // Ellenőrizzük, hogy létezik-e a prezentáció
    const [presentationCheck]: any = await conn.execute(
      `SELECT id, remaining_capacity FROM presentations WHERE id = ?`,
      [presentation_id],
    );

    if (presentationCheck.length === 0)
      throw new Error("A prezentáció nem található");

    // Admin jogosultsággal hozzáadjuk a felhasználót, még ha betelt is a prezentáció
    // A remaining_capacity-t csak akkor csökkentjük, ha nem NULL (jelentkezési időszak aktív)
    if (presentationCheck[0].remaining_capacity !== null) {
      await conn.execute(
        `UPDATE presentations SET remaining_capacity = remaining_capacity - ? WHERE id = ?`,
        [amount, presentation_id],
      );
    }

    await conn.execute(
      `INSERT INTO signups (email, presentation_id, slot_id, amount, details) VALUES (?, ?, ?, ?, ?)`,
      [email, presentation_id, slot_id, amount, details],
    );
  });
}

export async function pauseSignup() {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");
  // lock the signup table
  return await dbreq("UPDATE presentations SET remaining_capacity = NULL");
}

export async function startSignup() {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");
  return await dbreq(
    `UPDATE presentations SET remaining_capacity = capacity - (SELECT COALESCE(SUM(amount), 0) FROM signups WHERE presentation_id = presentations.id)`,
  );
}

export async function getAllSignups(): Promise<{
  [presentationId: number]: string[];
}> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");

  const result = await dbreq("SELECT * FROM signups ORDER BY id");

  const signupsByPresentation: { [presentationId: number]: string[] } = {};

  for (const signup of result) {
    if (!signupsByPresentation[signup.presentation_id]) {
      signupsByPresentation[signup.presentation_id] = [];
    }
    signupsByPresentation[signup.presentation_id].push(signup.email);
  }

  return signupsByPresentation;
}

export async function getAllSignupsWithAmounts(): Promise<{
  [presentationId: number]: Array<{ email: string; amount: number }>;
}> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");

  const result = await dbreq(
    "SELECT email, presentation_id, amount FROM signups ORDER BY id",
  );

  const signupsByPresentation: {
    [presentationId: number]: Array<{ email: string; amount: number }>;
  } = {};

  for (const signup of result) {
    if (!signupsByPresentation[signup.presentation_id]) {
      signupsByPresentation[signup.presentation_id] = [];
    }
    signupsByPresentation[signup.presentation_id].push({
      email: signup.email,
      amount: signup.amount,
    });
  }

  return signupsByPresentation;
}

let slotsCache: { value: PresentationSlotType[]; expires: number } | null =
  null;
export async function getSlots(): Promise<PresentationSlotType[]> {
  const now = Date.now();
  if (slotsCache && slotsCache.expires > now) return slotsCache.value;

  const slots: PresentationSlotType[] = await dbreq(
    "SELECT * FROM presentation_slots ORDER BY id",
  );

  slotsCache = { value: slots, expires: now + 60 * 1000 };
  return slots;
}

export async function getSignupsWithParticipation(
  presentation_id: number,
): Promise<SignupType[]> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "teacher", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  const result = await dbreq(
    `SELECT id, email, presentation_id, slot_id, participated, amount, details FROM signups WHERE presentation_id = ? ORDER BY email`,
    [presentation_id],
  );

  // Convert participated field to proper boolean
  return result.map((signup: any) => ({
    ...signup,
    participated: Boolean(signup.participated),
  }));
}

export async function markParticipation(
  signup_id: number,
  participated: boolean,
): Promise<void> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "teacher", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  await dbreq(`UPDATE signups SET participated = ? WHERE id = ?`, [
    participated,
    signup_id,
  ]);
}

export async function markAllParticipation(
  presentation_id: number,
  participated: boolean,
): Promise<void> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "teacher", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  await dbreq(`UPDATE signups SET participated = ? WHERE presentation_id = ?`, [
    participated,
    presentation_id,
  ]);
}

export async function updateSignupDetails(
  email: string | null | undefined,
  slot_id: number,
  amount: number,
  details: string | null,
): Promise<void> {
  await dbreq(
    `UPDATE signups SET amount = ?, details = ? WHERE email = ? AND slot_id = ?`,
    [amount, details, email, slot_id],
  );
}
