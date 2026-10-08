"use server";

import { dbreq } from "@/db/db";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";

interface Key {
  permission: string;
  table: string;
  logTable: string;
}

export async function borrowKey({ permission, table }: Key) {
  const selfUser = await getAuth();
  const hasAccess = hasPermission(selfUser, permission);
  const now = new Date();
  const key = await dbreq(`SELECT * FROM ${table}`);
  const keyStatus = key[0];

  if (hasAccess && keyStatus.borrowed === 0) {
    await dbreq(
      `UPDATE ${table} SET borrowed = 1, borrowed_by = ?, borrowed_at = ?`,
      [selfUser?.name, now],
    );
  } else {
    throw new Error(
      "A kulcs már ki van kölcsönözve, vagy nincs jogosultságod a kölcsönzéshez.",
    );
  }

  return true;
}

export async function returnKey({ permission, table, logTable }: Key) {
  const selfUser = await getAuth();
  const hasAccess = hasPermission(selfUser, permission);
  const radio = await dbreq(`SELECT * FROM ${table}`);
  const radioStatus = radio[0];

  if (
    hasAccess &&
    radioStatus.borrowed === 1 &&
    radioStatus.borrowed_by === selfUser?.name
  ) {
    await dbreq(
      `UPDATE ${table} SET borrowed = 0, borrowed_by = NULL, borrowed_at = NULL`
    );
    await dbreq(
      `INSERT INTO ${logTable} (name, email, borrowed_at, returned_at) VALUES (?, ?, ?, ?)`,
      [selfUser?.name, selfUser?.email, radioStatus.borrowed_at, new Date()],
    );
  } else {
    throw new Error(
      "A kulcs nem a te neveddel van kölcsönözve, vagy nincs jogosultságod a visszatételehez.",
    );
  }

  return true;
}

export async function getKeyStatus({ table }: Key) {
  const key = await dbreq(`SELECT * FROM ${table}`);
  console.log("Key status:", key[0]);
  return key[0];
}

export async function getKeyLogs({ permission, logTable }: Key) {
  const selfUser = await getAuth();
  if (!hasPermission(selfUser, permission)) {
    throw new Error("Permission denied");
  }

  const logs = await dbreq(
    `SELECT id, name, email, borrowed_at, returned_at FROM ${logTable} ORDER BY borrowed_at DESC, id DESC`
  );
  return logs;
}



