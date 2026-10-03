import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";
import type { Parlament, ParlamentParticipant } from "@/types/parliaments";

export type { Parlament, ParlamentParticipant };

export async function createParlament(
  selfUser: UserType,
  date: string,
  title?: string,
) {
  gate(selfUser, "head_of_parlament");
  console.log("createParlament", date, title);
  return await dbreq(`INSERT INTO parlaments (date, title) VALUES (?, ?);`, [
    date,
    title,
  ]);
}

export async function deleteParlament(selfUser: UserType, parlamentId: number) {
  gate(selfUser, "head_of_parlament");
  return await dbreq(`DELETE FROM parlaments WHERE id = ?;`, [parlamentId]);
}

export async function getParlaments(selfUser: UserType) {
  return await dbreq(`SELECT * FROM parlaments;`);
}

export async function getParlament(selfUser: UserType, parlamentId: number) {
  return (
    await dbreq(`SELECT * FROM parlaments WHERE id = ?;`, [parlamentId])
  )[0] as Parlament;
}

export async function registerToParlament(
  selfUser: UserType,
  email: string,
  group: string,
  parlamentId: number,
) {
  gate(selfUser, ["delegate_counter", "head_of_parlament"]);
  return await dbreq(
    `INSERT INTO parlament_participants (email, class, parlament_id) VALUES (?, ?, ?);`,
    [email, group, parlamentId],
  );
}

export async function unregisterFromParlament(
  selfUser: UserType,
  email: string,
  group: string,
  parlamentId: number,
) {
  gate(selfUser, ["delegate_counter", "head_of_parlament"]);
  return await dbreq(
    `DELETE FROM parlament_participants WHERE email = ? AND class = ? AND parlament_id = ?;`,
    [email, group, parlamentId],
  );
}

export async function getParlamentParticipants(
  selfUser: UserType,
  parlamentId: number,
) {
  const data: ParlamentParticipant[] = (await dbreq(
    `SELECT * FROM parlament_participants WHERE parlament_id = ?;`,
    [parlamentId],
  )) as any;

  const participantsByClass: Record<string, string[]> = {};
  data.forEach((participant) => {
    if (!participantsByClass[participant.class])
      participantsByClass[participant.class] = [];
    participantsByClass[participant.class].push(participant.email);
  });

  return participantsByClass;
}
