import mysql from "mysql2/promise";

interface MyGlobal {
  __mysqlPool?: mysql.Pool;
}

const g = globalThis as MyGlobal;

const pool =
  g.__mysqlPool ??
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

g.__mysqlPool = pool;

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
