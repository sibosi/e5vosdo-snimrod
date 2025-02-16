import mysql from "mysql2/promise";

async function test({
  t_connectionLimit = 10,
  t_queueLimit = 0,
  t_NUM_TEST_USERS = 550,
  t_REQUESTS_PER_USER = 1,
}: {
  t_connectionLimit: number;
  t_queueLimit: number;
  t_NUM_TEST_USERS: number;
  t_REQUESTS_PER_USER: number;
}) {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: t_connectionLimit ?? 10,
    queueLimit: t_queueLimit ?? 0,
  });

  let deadlockRetries = 0;

  async function dbreq<T = any>(query: string, params: any[] = []): Promise<T> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      return result as T;
    } finally {
      connection.release();
    }
  }

  async function multipledbreq<T>(
    queries:
      | { query: string; params?: any[] }[]
      | ((conn: mysql.PoolConnection) => Promise<T>),
  ): Promise<T> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      let result: any;
      if (typeof queries === "function") {
        result = await queries(connection);
      } else {
        result = [];
        for (const { query, params } of queries) {
          const [res] = await connection.execute(query, params || []);
          result.push(res);
        }
      }
      await connection.commit();
      return result;
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  }

  async function createTestTables() {
    const dropQueries = [
      `DROP TABLE IF EXISTS test_signups_new;`,
      `DROP TABLE IF EXISTS test_presentations;`,
    ];
    for (const q of dropQueries) {
      await dbreq(q);
    }

    const createPresentations = `
      CREATE TABLE test_presentations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        capacity INT,
        remaining_capacity INT
      );
    `;
    await dbreq(createPresentations);

    let insertValues = [];
    for (let i = 1; i <= 20; i++) {
      insertValues.push(`('Presentation ${i}', 30, 30)`);
    }
    const insertPresentations = `
      INSERT INTO test_presentations (title, capacity, remaining_capacity)
      VALUES ${insertValues.join(", ")};
    `;
    await dbreq(insertPresentations);

    const createSignups = `
      CREATE TABLE test_signups_new (
        email VARCHAR(255) PRIMARY KEY,
        presentation_id INT,
        FOREIGN KEY (presentation_id) REFERENCES test_presentations(id)
      );
    `;
    await dbreq(createSignups);

    console.log("Teszt táblák létrehozva, teszt adatok beszúrva.");
  }

  const NUM_TEST_USERS = t_NUM_TEST_USERS ?? 550;
  const REQUESTS_PER_USER = t_REQUESTS_PER_USER ?? 1;
  const totalRequests = NUM_TEST_USERS * REQUESTS_PER_USER;
  const testEmails: string[] = Array.from(
    { length: NUM_TEST_USERS },
    (_, i) => `user${i}@example.com`,
  );

  let requestEmails: string[] = [];
  for (const email of testEmails) {
    for (let i = 0; i < REQUESTS_PER_USER; i++) {
      requestEmails.push(email);
    }
  }

  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  requestEmails = shuffle(requestEmails);

  let currentRequestIndex = 0;
  async function getAuth() {
    const email = requestEmails[currentRequestIndex];
    currentRequestIndex++;
    currentRequestIndex %= NUM_TEST_USERS;
    return { email };
  }

  async function signUpForPresentation(
    presentation_id: number | "NULL",
    retries = 3,
  ): Promise<any> {
    const auth = await getAuth();
    const email = auth.email;
    if (!email) {
      return { success: false, message: "Nincs bejelentkezett felhasználó" };
    }

    try {
      const result = await multipledbreq(async (conn) => {
        if (presentation_id === "NULL") {
          const [selResult] = await conn.execute(
            `SELECT presentation_id FROM test_signups_new WHERE email = ? FOR UPDATE`,
            [email],
          );
          const rows = Array.isArray(selResult) ? selResult : [];
          if (rows.length === 0) {
            return { success: true, message: "Nincs törlendő jelentkezés" };
          }
          // @ts-ignore
          const prevPresentationId = rows[0].presentation_id;
          await conn.execute(`DELETE FROM test_signups_new WHERE email = ?`, [
            email,
          ]);
          await conn.execute(
            `UPDATE test_presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = ?`,
            [prevPresentationId],
          );
          return { success: true, message: "Jelentkezés törölve" };
        } else {
          const [existingResult] = await conn.execute(
            `SELECT presentation_id FROM test_signups_new WHERE email = ? FOR UPDATE`,
            [email],
          );
          const existing = Array.isArray(existingResult) ? existingResult : [];
          const isUpdate = existing.length > 0;
          let previousPresentationId: number | null = null;
          if (isUpdate) {
            // @ts-ignore
            previousPresentationId = existing[0].presentation_id;
          }
          const [updateResult]: any = await conn.execute(
            `UPDATE test_presentations SET remaining_capacity = remaining_capacity - 1
             WHERE id = ? AND remaining_capacity > 0`,
            [presentation_id],
          );
          if (updateResult.affectedRows === 0) {
            return { success: true, message: "Nincs elegendő kapacitás" };
          }
          if (isUpdate) {
            await conn.execute(
              `UPDATE test_signups_new SET presentation_id = ? WHERE email = ?`,
              [presentation_id, email],
            );
            await conn.execute(
              `UPDATE test_presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = ?`,
              [previousPresentationId],
            );
            return { success: true, message: "Jelentkezés módosítva" };
          } else {
            await conn.execute(
              `INSERT INTO test_signups_new (email, presentation_id) VALUES (?, ?)`,
              [email, presentation_id],
            );
            return { success: true, message: "Jelentkezés sikeres" };
          }
        }
      });
      return result;
    } catch (error: any) {
      if (retries > 0 && error.message.includes("Deadlock")) {
        deadlockRetries++;
        console.warn(
          `Deadlock történt, újrapróbálom a tranzakciót. Hátralévő próbálkozások: ${retries}`,
        );
        return signUpForPresentation(presentation_id, retries - 1);
      }
      console.error("Hiba a signUpForPresentation-ben:", error);
      return {
        success: false,
        message: "SQL hiba történt",
        error: error.message + " " + error.sql,
      };
    }
  }

  async function simulateLoad() {
    console.log(
      `Indul a szimuláció: ${totalRequests} kérés (${NUM_TEST_USERS} email, emailenként ${REQUESTS_PER_USER} kérés)`,
    );
    console.time("Teljes futási idő");
    const start = process.hrtime.bigint();
    const promises: Promise<any>[] = [];
    for (let i = 0; i < totalRequests; i++) {
      const presentation_id = Math.floor(Math.random() * 20) + 1;
      promises.push(signUpForPresentation(presentation_id));
    }
    const results = await Promise.all(promises);
    console.timeEnd("Teljes futási idő");
    const testTime = process.hrtime.bigint() - start;
    console.log("Szimuláció eredményei:");
    console.dir(results, { depth: null });
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    const successRate = (successCount / totalRequests) * 100;

    const errorTypesAndCounts = results.reduce(
      (acc, r) => {
        if (!r.success) {
          acc[r.error] = (acc[r.error] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      testTime: Number(testTime) / 1e6 / 1000,
      totalRequests,
      successCount,
      failureCount,
      successRate,
      errorTypesAndCounts,
      deadlockRetries,
    };
  }

  async function main() {
    let results;
    try {
      await createTestTables();
      results = await simulateLoad();
    } catch (error) {
      console.error("Tesztelés közben hiba történt:", error);
    } finally {
      await pool.end();
      return results;
    }
  }

  return await main();
}

export default test;
