import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function withConnection<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    if (connection) {
      connection.release();
    }
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

export async function multipledbreq(queries: string[]): Promise<any[]> {
  try {
    return await withConnection(async (connection) => {
      try {
        await connection.beginTransaction();
        const results: any[] = [];
        for (const query of queries) {
          const [result] = await connection.execute(query);
          results.push(result);
        }
        await connection.commit();
        return results;
      } catch (error: any) {
        console.error(
          "Hiba a tranzakció során, rollback és újrapróbálkozás:",
          error.message,
        );
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error("Rollback sikertelen:", rollbackError);
        }
        connection.destroy();
        return await withConnection(async (newConnection) => {
          await newConnection.beginTransaction();
          const results: any[] = [];
          for (const query of queries) {
            const [result] = await newConnection.execute(query);
            results.push(result);
          }
          await newConnection.commit();
          return results;
        });
      }
    });
  } catch (error) {
    console.error("Tranzakció végrehajtása sikertelen:", error);
    throw new Error("Transaction failed.");
  }
}
