import mysql from "mysql2/promise";
import { getAuth } from "./dbreq";
import { gate, hasPermission } from "./permissions";

interface MyGlobal {
  __mysqlPool?: mysql.Pool;
}

const gPS = globalThis as MyGlobal;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool =
  gPS.__mysqlPool ??
  mysql.createPool({
    uri: DATABASE_URL,
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
  linked_presentation_id: number | null;
  title: string;
  performer: string | null;
  description: string;
  address?: string;
  requirements: string;
  capacity: number;
  remaining_capacity: number | null;
  open_for: "everyone" | "only_priority" | "nobody";
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

export async function linkPresentations(
  presentationId: number,
  linkedPresentationId: number | null,
): Promise<void> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "admin", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  await multipledbreq(async (conn) => {
    const ids = [presentationId, linkedPresentationId]
      .filter((id): id is number => id !== null)
      .sort((a, b) => a - b);
    const [rows] = await conn.execute(
      `SELECT id, slot_id FROM presentations
       WHERE id IN (${ids.map(() => "?").join(",")}) FOR UPDATE`,
      ids,
    );
    const presentations = rows as { id: number; slot_id: number }[];
    const presentation = presentations.find((p) => p.id === presentationId);
    const linkedPresentation = linkedPresentationId
      ? presentations.find((p) => p.id === linkedPresentationId)
      : undefined;

    if (!presentation) throw new Error("A prezentáció nem található");
    if (linkedPresentationId !== null && !linkedPresentation)
      throw new Error("A kapcsolt prezentáció nem található");
    if (presentation.slot_id === linkedPresentation?.slot_id)
      throw new Error("Csak különböző sávban lévő előadások köthetők össze");

    await conn.execute(
      `UPDATE presentations SET linked_presentation_id = NULL
       WHERE linked_presentation_id IN (?, ?)`,
      [presentationId, linkedPresentationId ?? presentationId],
    );
    await conn.execute(
      `UPDATE presentations SET linked_presentation_id = ? WHERE id = ?`,
      [linkedPresentationId, presentationId],
    );
    if (linkedPresentationId !== null) {
      await conn.execute(
        `UPDATE presentations SET linked_presentation_id = ? WHERE id = ?`,
        [presentationId, linkedPresentationId],
      );
    }
  });
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

interface PresentationSignupRow {
  id: number;
  slot_id: number;
  linked_presentation_id: number | null;
  title: string;
  open_for: PresentationType["open_for"];
  remaining_capacity: number | null;
}

interface ExistingSignupRow {
  id: number;
  presentation_id: number;
  slot_id: number;
  amount: number;
}

export interface SignupChangePreview {
  targetPresentations: Array<{ id: number; title: string; slot_id: number }>;
  cancelledPresentations: Array<{
    id: number;
    title: string;
    slot_id: number;
  }>;
}

const uniqueIds = (ids: number[]) => [...new Set(ids)].sort((a, b) => a - b);

async function getPresentationRows(
  conn: mysql.PoolConnection,
  ids: number[],
  lock = false,
): Promise<PresentationSignupRow[]> {
  const uniquePresentationIds = uniqueIds(ids);
  if (uniquePresentationIds.length === 0) return [];
  const [rows] = await conn.execute(
    `SELECT id, slot_id, linked_presentation_id, title, open_for,
            remaining_capacity
     FROM presentations
     WHERE id IN (${uniquePresentationIds.map(() => "?").join(",")})
     ${lock ? "FOR UPDATE" : ""}`,
    uniquePresentationIds,
  );
  return rows as PresentationSignupRow[];
}

async function getUserSignupRows(
  conn: mysql.PoolConnection,
  email: string,
  lock = false,
): Promise<ExistingSignupRow[]> {
  const [rows] = await conn.execute(
    `SELECT id, presentation_id, slot_id, amount
     FROM signups
     WHERE email = ?
     ${lock ? "FOR UPDATE" : ""}`,
    [email],
  );
  return rows as ExistingSignupRow[];
}

function groupIds(presentation: PresentationSignupRow): number[] {
  return uniqueIds([
    presentation.id,
    ...(presentation.linked_presentation_id === null
      ? []
      : [presentation.linked_presentation_id]),
  ]);
}

async function calculateSignupChange(
  conn: mysql.PoolConnection,
  email: string,
  presentationId: number,
  lock: boolean,
) {
  const target = (await getPresentationRows(conn, [presentationId], lock))[0];
  if (!target) throw new Error("A prezentáció nem található");

  const targetPresentations = await getPresentationRows(
    conn,
    groupIds(target),
    lock,
  );
  const targetSlots = new Set(
    targetPresentations.map((presentation) => presentation.slot_id),
  );
  const existingSignups = await getUserSignupRows(conn, email, lock);
  const conflictingSignupIds = existingSignups
    .filter((signup) => targetSlots.has(signup.slot_id))
    .map((signup) => signup.presentation_id);
  const conflictingPresentations = await getPresentationRows(
    conn,
    conflictingSignupIds,
    lock,
  );
  const allPresentations = await getPresentationRows(
    conn,
    [...groupIds(target), ...conflictingPresentations.flatMap(groupIds)],
    lock,
  );
  const presentationsById = new Map(
    allPresentations.map((presentation) => [presentation.id, presentation]),
  );
  const cancellationIds = new Set<number>();

  for (const signup of existingSignups) {
    if (!targetSlots.has(signup.slot_id)) continue;
    cancellationIds.add(signup.id);
    const presentation = presentationsById.get(signup.presentation_id);
    if (presentation?.linked_presentation_id === null) continue;
    for (const linkedSignup of existingSignups) {
      if (
        linkedSignup.presentation_id === presentation?.linked_presentation_id
      ) {
        cancellationIds.add(linkedSignup.id);
      }
    }
  }

  return {
    targetPresentations,
    allPresentations,
    existingSignups,
    cancellationSignups: existingSignups.filter((signup) =>
      cancellationIds.has(signup.id),
    ),
  };
}

export async function getSignupChangePreview(
  email: string | null | undefined,
  presentationId: number,
): Promise<SignupChangePreview> {
  if (!email) throw new Error("Email or OM ID required for signup");
  return withConnection(async (conn) => {
    const change = await calculateSignupChange(
      conn,
      email,
      presentationId,
      false,
    );
    const targetIds = new Set(
      change.targetPresentations.map((presentation) => presentation.id),
    );
    return {
      targetPresentations: change.targetPresentations.map(
        ({ id, title, slot_id }) => ({ id, title, slot_id }),
      ),
      cancelledPresentations: change.cancellationSignups
        .map((signup) =>
          change.allPresentations.find(
            (presentation) => presentation.id === signup.presentation_id,
          ),
        )
        .filter(
          (presentation): presentation is PresentationSignupRow =>
            presentation !== undefined && !targetIds.has(presentation.id),
        )
        .map(({ id, title, slot_id }) => ({ id, title, slot_id })),
    };
  });
}

async function restoreAndDeleteSignups(
  conn: mysql.PoolConnection,
  signups: ExistingSignupRow[],
): Promise<void> {
  if (signups.length === 0) return;
  await conn.execute(
    `DELETE FROM signups WHERE id IN (${signups.map(() => "?").join(",")})`,
    signups.map((signup) => signup.id),
  );
  for (const signup of signups) {
    await conn.execute(
      `UPDATE presentations
       SET remaining_capacity = remaining_capacity + ?
       WHERE id = ? AND remaining_capacity IS NOT NULL`,
      [signup.amount, signup.presentation_id],
    );
  }
}

async function validateAccess(
  presentation: PresentationSignupRow,
): Promise<void> {
  if (presentation.open_for === "nobody") {
    throw new Error("Erre a prezentációra nem lehet jelentkezni");
  }

  if (presentation.open_for === "only_priority") {
    // Elméletben hatékonyabb, ha nem kérjük le minden függvényhívásnál a felhasználót, viszont a valódi terhelésnél nem lesznek "only_priority" prezentációk, így a felhasználó lekérése egyáltalán nem fog történni.
    // (Az elsőbbségi jelentkezés kicsit lassabb lesz, viszont a normál jelentkezésnél nem lesz szükség a felhasználó lekérésére, így gyorsabb lesz.)
    const selfUser = await getAuth();
    if (!selfUser) throw new Error("Nem vagy bejelentkezve");
    if (!hasPermission(selfUser, "elsőbbségi_jelentkezés")) {
      throw new Error(
        "Erre a prezentációra csak elsőbbségi jelentkezéssel lehet jelentkezni",
      );
    }
  }
}
// TODO: /
function getCancelledAmountByPresentation(
  signups: ExistingSignupRow[],
): Map<number, number> {
  const amounts = new Map<number, number>();
  for (const signup of signups) {
    amounts.set(
      signup.presentation_id,
      (amounts.get(signup.presentation_id) ?? 0) + signup.amount,
    );
  }
  return amounts;
}

function validateCapacity(
  presentation: PresentationSignupRow,
  amount: number,
  cancelledAmount: number,
): void {
  if (presentation.remaining_capacity === null) {
    throw new Error("Jelentkezési időszak lezárva");
  }

  if (presentation.remaining_capacity + cancelledAmount < amount) {
    throw new Error("Nincs elegendő kapacitás");
  }
}
// TODO: /

async function removeSignupForSlot(
  email: string,
  slotId: number,
  retries: number,
): Promise<any> {
  try {
    return await multipledbreq(async (conn) => {
      const existingSignups = await getUserSignupRows(conn, email, true);
      const selectedSignup = existingSignups.find(
        (signup) => signup.slot_id === slotId,
      );
      if (!selectedSignup) {
        return { success: true, message: "Nincs törlendő jelentkezés" };
      }
      const presentation = (
        await getPresentationRows(conn, [selectedSignup.presentation_id], true)
      )[0];
      if (!presentation) throw new Error("A prezentáció nem található");
      const group = await getPresentationRows(
        conn,
        groupIds(presentation),
        true,
      );
      // TODO: case elsőbbségi_jelentkezés
      if (
        group.some(
          (candidate) =>
            candidate.remaining_capacity === null ||
            candidate.open_for === "nobody",
        )
      ) {
        return {
          success: false,
          message: "Lezárt előadás jelentkezése nem törölhető",
        };
      }
      const groupIdSet = new Set(group.map((candidate) => candidate.id));
      const signupsToDelete = existingSignups.filter((signup) =>
        groupIdSet.has(signup.presentation_id),
      );
      await restoreAndDeleteSignups(conn, signupsToDelete);
      return {
        success: true,
        message:
          group.length > 1
            ? "A duplaelőadás jelentkezése törölve"
            : "Jelentkezés törölve",
      };
    });
  } catch (error: any) {
    if (
      retries > 0 &&
      error instanceof Error &&
      error.message.includes("Deadlock")
    ) {
      return removeSignupForSlot(email, slotId, retries - 1);
    }
    console.error("Hiba a jelentkezés törlése során:", error);
    throw new Error("Hiba a jelentkezés törlése során");
  }
}

export async function signUpForPresentation(
  email: string | null | undefined,
  presentation_id: number | "NULL",
  slot_id: number,
  amount = 1,
  details: string | null = null,
  retries = 3,
): Promise<any> {
  if (!email) throw new Error("Email or OM ID required for signup");
  if (presentation_id === "NULL") {
    return removeSignupForSlot(email, slot_id, retries);
  }

  try {
    return await multipledbreq(async (conn) => {
      const change = await calculateSignupChange(
        conn,
        email,
        presentation_id,
        true,
      );
      if (
        process.env.EXTERNAL_SIGNUPS === "true" &&
        Number.isInteger(
          Number(process.env.EXTERNAL_SIGNUPS_PRESENTATION_LIMIT),
        )
      ) {
        const resultingSignupCount =
          change.existingSignups.length -
          change.cancellationSignups.length +
          change.targetPresentations.length;
        if (
          resultingSignupCount >
          Number(process.env.EXTERNAL_SIGNUPS_PRESENTATION_LIMIT)
        ) {
          return {
            success: false,
            message: `Legfeljebb ${process.env.EXTERNAL_SIGNUPS_PRESENTATION_LIMIT} prezentációra lehet jelentkezni`,
          };
        }
      }
      // TODO: /
      const cancelledAmounts = getCancelledAmountByPresentation(
        change.cancellationSignups,
      );
      try {
        for (const presentation of change.targetPresentations) {
          await validateAccess(presentation);
          validateCapacity(
            presentation,
            amount,
            cancelledAmounts.get(presentation.id) ?? 0,
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message };
        }
        throw error;
      }
      // TODO: /

      await restoreAndDeleteSignups(conn, change.cancellationSignups);
      for (const presentation of change.targetPresentations) {
        await conn.execute(
          `UPDATE presentations SET remaining_capacity = remaining_capacity - ?
           WHERE id = ?`,
          [amount, presentation.id],
        );
        await conn.execute(
          `INSERT INTO signups
             (email, presentation_id, slot_id, amount, details)
           VALUES (?, ?, ?, ?, ?)`,
          [email, presentation.id, presentation.slot_id, amount, details],
        );
      }
      return {
        success: true,
        message:
          change.targetPresentations.length > 1
            ? "Duplaelőadásra jelentkezés sikeres"
            : "Jelentkezés sikeres",
      };
    });
  } catch (error: any) {
    if (
      retries > 0 &&
      error instanceof Error &&
      error.message.includes("Deadlock")
    ) {
      return signUpForPresentation(
        email,
        presentation_id,
        slot_id,
        amount,
        details,
        retries - 1,
      );
    }
    console.error("Hiba a jelentkezés során:", error);
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

export async function closeAllSignupForAll() {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");
  return await dbreq("UPDATE presentations SET open_for = 'nobody'");
}

export async function openAllSignupOnlyForPriority() {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");
  return await dbreq("UPDATE presentations SET open_for = 'only_priority'");
}

export async function openAllSigupForEveryoune() {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  gate(selfUser, "admin");
  return await dbreq("UPDATE presentations SET open_for = 'everyone'");
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

export async function adminRemoveUserFromPresentation(
  email: string,
  presentation_id: number,
): Promise<void> {
  const selfUser = await getAuth();
  if (!selfUser) throw new Error("Nem vagy bejelentkezve");
  if (!gate(selfUser, "admin", "boolean"))
    throw new Error("Nincs jogosultságod ehhez");

  return await multipledbreq(async (conn) => {
    const signups = await getUserSignupRows(conn, email, true);
    const presentation = (
      await getPresentationRows(conn, [presentation_id], true)
    )[0];
    if (!presentation) throw new Error("A prezentáció nem található");

    const group = await getPresentationRows(conn, groupIds(presentation), true);
    const groupIdsSet = new Set(group.map((candidate) => candidate.id));
    const signupsToDelete = signups.filter((signup) =>
      groupIdsSet.has(signup.presentation_id),
    );
    if (signupsToDelete.length === 0)
      throw new Error("A felhasználó nincs jelentkezve erre a prezentációra");

    await restoreAndDeleteSignups(conn, signupsToDelete);
  });
}
