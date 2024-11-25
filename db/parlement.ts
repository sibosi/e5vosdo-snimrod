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
  parlament_id: number;
}

export async function createParlament(
  selfUser: UserType,
  date: string,
  title?: string,
) {
  gate(selfUser, "head_of_parlament");
  console.log("createParlament", date, title);
  return dbreq(
    `INSERT INTO parlaments (date, title) VALUES ("${date}", "${title}");`,
  );
}

export async function getParlaments(selfUser: UserType) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  return dbreq(`SELECT * FROM parlaments;`);
}

export async function registerToParlament(
  selfUser: UserType,
  email: string,
  parlamentId: number,
) {
  gate(selfUser, "delegate_counter");
  return dbreq(
    `INSERT INTO parlament_participants (email, parlament_id) VALUES ("${email}", ${parlamentId});`,
  );
}
