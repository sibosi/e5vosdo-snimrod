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

export async function dbreq(query: string) {
  let connection;

  try {
    connection = await pool.getConnection();

    const [result] = await connection.execute(query);

    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to execute query.");
  } finally {
    if (connection) connection.release();
  }
}

export async function multipledbreq(dbreqs: string[]) {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const results = [];
    for (const query of dbreqs) {
      const [result] = await connection.execute(query);
      results.push(result);
    }

    await connection.commit();

    return results;
  } catch (error) {
    if (connection) await connection.rollback();
    console.log(error);
    throw new Error("Transaction failed.");
  } finally {
    if (connection) connection.release();
  }
}
