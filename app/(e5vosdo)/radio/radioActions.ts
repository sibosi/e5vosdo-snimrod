"use server";

import { dbreq } from "@/db/db";
import { getAuth } from "@/db/dbreq";
import { hasPermission } from "@/db/permissions";

export async function borrowRadio() {
  const selfUser = await getAuth();
  const hasAccess = hasPermission(selfUser, "radio_access");
  const now = new Date();
  const radio = await dbreq("SELECT * FROM key_status");
  const radioStatus = radio[0];

  if (hasAccess && radioStatus.borrowed === 0) {
    await dbreq(
      "UPDATE key_status SET borrowed = 1, borrowed_by = ?, borrowed_at = ?",
      [selfUser?.name, now],
    );
  } else {
    throw new Error(
      "A rádiókulcs már ki van kölcsönözve, vagy nincs jogosultságod a kölcsönzéshez.",
    );
  }

  return true;
}

export async function returnRadio() {
  const selfUser = await getAuth();
  const hasAccess = hasPermission(selfUser, "radio_access");
  const radio = await dbreq("SELECT * FROM key_status");
  const radioStatus = radio[0];

  if (
    hasAccess &&
    radioStatus.borrowed === 1 &&
    radioStatus.borrowed_by === selfUser?.name
  ) {
    await dbreq(
      "UPDATE key_status SET borrowed = 0, borrowed_by = NULL, borrowed_at = NULL",
    );
    await dbreq(
      "INSERT INTO key_logs (name, email, borrowed_at, returned_at) VALUES (?, ?, ?, ?)",
      [selfUser?.name, selfUser?.email, radioStatus.borrowed_at, new Date()],
    );
  } else {
    throw new Error(
      "A rádiókulcs nem a te neveddel van kölcsönözve, vagy nincs jogosultságod a visszatételehez.",
    );
  }

  return true;
}

export async function getRadioStatus() {
  const radio = await dbreq("SELECT * FROM key_status");
  return radio[0];
}

export async function getRadioKeyLogs() {
  const selfUser = await getAuth();
  if (!hasPermission(selfUser, "radio_access")) {
    throw new Error("Permission denied");
  }

  return dbreq(
    "SELECT id, name, email, borrowed_at, returned_at FROM key_logs ORDER BY borrowed_at DESC, id DESC",
  );
}
