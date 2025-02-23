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
  name: string;
  description: string;
  adress: string;
  requirements: string;
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
  const result = await dbreq(
    `SELECT email FROM signups WHERE presentation_id = ?`,
    [presentation_id],
  );
  return result.map((row: { email: string }) => row.email);
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
          return { success: false, message: "Nincs elegendő kapacitás" };

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
