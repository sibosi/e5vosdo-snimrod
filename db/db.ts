import mysql from "mysql2/promise";

interface MyGlobal {
  __mysqlPool?: mysql.Pool;
}

const g = globalThis as MyGlobal;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool =
  g.__mysqlPool ??
  mysql.createPool({
    uri: DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

g.__mysqlPool = pool;

const RETRYABLE_CONNECTION_ERRORS = new Set([
  "PROTOCOL_CONNECTION_LOST",
  "ECONNRESET",
  "EPIPE",
]);

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

export async function dbreq<T = any>(
  query: string,
  params?: any[],
): Promise<T> {
  try {
    const [result] = await pool.execute(query, params);
    return result as T;
  } catch (error: any) {
    if (
      !RETRYABLE_CONNECTION_ERRORS.has(error?.code) ||
      !/^\s*select\b/i.test(query)
    ) {
      throw error;
    }

    const [result] = await pool.execute(query, params);
    return result as T;
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
