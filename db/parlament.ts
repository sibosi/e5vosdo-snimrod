import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface Parlament {
  id: number;
  date: string;
  title: string;
}

export interface ParlamentParticipant {
  id: number;
  email: string;
  class: string;
  parlament_id: number;
}

export async function createParlament(
  selfUser: UserType,
  date: string,
  title?: string,
) {
  gate(selfUser, "head_of_parlament");
  console.log("createParlament", date, title);
  return await dbreq(
    `INSERT INTO parlaments (date, title) VALUES ("${date}", "${title}");`,
  );
}

export async function deleteParlament(selfUser: UserType, parlamentId: number) {
  gate(selfUser, "admin");
  return await dbreq(`DELETE FROM parlaments WHERE id = ${parlamentId};`);
}

export async function getParlaments(selfUser: UserType) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  return await dbreq(`SELECT * FROM parlaments;`);
}

export async function getParlament(selfUser: UserType, parlamentId: number) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  return await dbreq(`SELECT * FROM parlaments WHERE id = ${parlamentId};`);
}

export async function registerToParlament(
  selfUser: UserType,
  email: string,
  group: string,
  parlamentId: number,
) {
  gate(selfUser, "delegate_counter");
  return await dbreq(
    `INSERT INTO parlament_participants (email, class, parlament_id) VALUES ("${email}", "${group}", ${parlamentId});`,
  );
}

export async function unregisterFromParlament(
  selfUser: UserType,
  email: string,
  group: string,
  parlamentId: number,
) {
  gate(selfUser, "delegate_counter");
  return await dbreq(
    `DELETE FROM parlament_participants WHERE email = "${email}" AND class = "${group}" AND parlament_id = ${parlamentId};`,
  );
}

export async function getParlamentParticipants(
  selfUser: UserType,
  parlamentId: number,
) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  const data: ParlamentParticipant[] = (await dbreq(
    `SELECT * FROM parlament_participants WHERE parlament_id = ${parlamentId};`,
  )) as any;

  const response: Record<string, string[]> = {};
  data.forEach((participant) => {
    if (!response[participant.class]) response[participant.class] = [];
    response[participant.class].push(participant.email);
  });

  return response;
}
