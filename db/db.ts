import mysql from "mysql2/promise";

export async function ConnectDbAndRequest(query: string) {
  try {
    const db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,

      password: process.env.MYSQL_PASSWORD,
    });

    const [result] = await db.execute(query);

    await db.end();

    return result;
  } catch (error) {
    console.log(error);

    return error;
  }
}

export async function dbreq(dbreq: string) {
  try {
    const response = await ConnectDbAndRequest(dbreq);

    const data = JSON.stringify(response);

    return response;
  } catch (error) {
    console.log(error);

    throw new Error("Failed to fetch revenue data.");
  }
}
