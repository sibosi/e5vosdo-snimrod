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

export interface PresentationType {
  id: number;
  slot: string;
  title: string;
  performer: string | null;
  description: string;
  address: string;
  requirements: string;
  capacity: number;
  remaining_capacity: number;
}

export interface SignupType {
  id: number;
  email: string;
  presentation_id: number;
}

export async function getPresentations(): Promise<PresentationType[]> {
  return await dbreq("SELECT * FROM presentations");
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
  slot: string,
  retries = 3,
): Promise<any> {
  try {
    const result = await multipledbreq(async (conn) => {
      // Ha NULL, akkor töröljük a jelentkezést
      if (presentation_id === "NULL") {
        // if the signuped presentation is NULL, then the signup period is over, so do nothing

        const [selResult] = await conn.execute(
          `SELECT presentation_id FROM signups WHERE email = ? AND slot = ? FOR UPDATE`,
          [email, slot],
        );
        const signupRows = Array.isArray(selResult)
          ? (selResult as { presentation_id: number }[])
          : [];

        if (signupRows.length > 0) {
          const [isNull] = await conn.execute(
            `SELECT remaining_capacity FROM presentations WHERE id = ?`,
            [signupRows[0].presentation_id],
          );
          const isNullCapacity = Array.isArray(isNull)
            ? (isNull as { remaining_capacity: number }[])
            : [];
          if (isNullCapacity[0].remaining_capacity === null)
            return { success: false, message: "Jelentkezési időszak lezárva" };
        }
        if (signupRows.length === 0)
          return { success: true, message: "Nincs törlendő jelentkezés" };

        const prevPresentationId = signupRows[0].presentation_id;
        await conn.execute(`DELETE FROM signups WHERE email = ? AND slot = ?`, [
          email,
          slot,
        ]);
        await conn.execute(
          `UPDATE presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = ?`,
          [prevPresentationId],
        );
        return { success: true, message: "Jelentkezés törölve" };
      } else {
        // Ha nem NULL, akkor jelentkezünk
        const [existingResult] = await conn.execute(
          `SELECT presentation_id FROM signups WHERE email = ? AND slot = ? FOR UPDATE`,
          [email, slot],
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
          return { success: false, message: "Nincs elegendő kapacitás" };

        if (isUpdate) {
          await conn.execute(
            `UPDATE signups SET presentation_id = ? WHERE email = ? AND slot = ?`,
            [presentation_id, email, slot],
          );
          await conn.execute(
            `UPDATE presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = ?`,
            [previousPresentationId],
          );
          return { success: true, message: "Jelentkezés módosítva" };
        } else {
          await conn.execute(
            `INSERT INTO signups (email, presentation_id, slot) VALUES (?, ?, ?)`,
            [email, presentation_id, slot],
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
      return signUpForPresentation(email, presentation_id, slot, retries - 1);
    }
    console.error("Hiba a signUpForPresentation-ben:", error);
    throw new Error("Hiba a jelentkezés során");
  }
}

export async function makeUserSignedUp(
  email: string,
  presentation_id: number,
  slot: string,
) {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "admin", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");
  return await multipledbreq(async (conn) => {
    const [currentSignups]: any = await conn.execute(
      `SELECT presentation_id FROM signups WHERE email = ? AND slot = ? FOR UPDATE`,
      [email, slot],
    );

    if (currentSignups.length > 0)
      throw new Error("A felhasználó már jelentkezett ebben a sávban");

    const [updateResult]: any = await conn.execute(
      `UPDATE presentations SET remaining_capacity = remaining_capacity - 1
         WHERE id = ? AND remaining_capacity > 0`,
      [presentation_id],
    );
    if (updateResult.affectedRows === 0)
      throw new Error("Nincs elegendő kapacitás");

    await conn.execute(
      `INSERT INTO signups (email, presentation_id, slot) VALUES (?, ?, ?)`,
      [email, presentation_id, slot],
    );
  });
}

export async function adminForceUserSignUp(
  email: string,
  presentation_id: number,
  slot: string,
) {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "admin", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  return await multipledbreq(async (conn) => {
    // Ellenőrizzük, hogy a felhasználó már jelentkezett-e ebben a sávban
    const [currentSignups]: any = await conn.execute(
      `SELECT presentation_id FROM signups WHERE email = ? AND slot = ? FOR UPDATE`,
      [email, slot],
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
        `UPDATE presentations SET remaining_capacity = remaining_capacity - 1 WHERE id = ?`,
        [presentation_id],
      );
    }

    await conn.execute(
      `INSERT INTO signups (email, presentation_id, slot) VALUES (?, ?, ?)`,
      [email, presentation_id, slot],
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
    `UPDATE presentations SET remaining_capacity = capacity - (SELECT COUNT(*) FROM signups WHERE presentation_id = presentations.id)`,
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

let slotsCache: { value: string[]; expires: number } | null = null;
export async function getSlots(): Promise<string[]> {
  const now = Date.now();
  if (slotsCache && slotsCache.expires > now) return slotsCache.value;

  const slots = (
    await dbreq("SELECT slot FROM presentations GROUP BY slot ORDER BY slot")
  ).map((row: any) => row.slot);

  const orderBeginings = ["H", "K", "Sz", "S", "Cs", "C", "P", "Szo", "V"];

  slots.sort((a: string, b: string) => {
    const aMatch = RegExp(/^([A-Za-z]+)(\d+)$/).exec(a);
    const bMatch = RegExp(/^([A-Za-z]+)(\d+)$/).exec(b);
    if (!aMatch || !bMatch) return a.localeCompare(b);
    const aPrefix = aMatch[1];
    const aNumber = parseInt(aMatch[2], 10);
    const bPrefix = bMatch[1];
    const bNumber = parseInt(bMatch[2], 10);
    const prefixComparison =
      orderBeginings.indexOf(aPrefix) - orderBeginings.indexOf(bPrefix);
    if (prefixComparison !== 0) return prefixComparison;
    return aNumber - bNumber;
  });

  slotsCache = { value: slots, expires: now + 60 * 1000 };
  return slots;
}
