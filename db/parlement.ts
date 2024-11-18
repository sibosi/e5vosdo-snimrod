import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface Parlement {
  id: number;
  date: string;
  title: string;
}

export interface ParlementParticipant {
  id: number;
  email: string;
  parlement_id: number;
}

export async function createParlement(
  selfUser: UserType,
  date: string,
  title?: string,
) {
  gate(selfUser, "head_of_parlament");
  return dbreq(
    `INSERT INTO parlements (date, title) VALUES ("${date}", "${title}");`,
  );
}

export async function getParlements(selfUser: UserType) {
  gate(selfUser, ["head_of_parlament", "delegate", "delegate_counter"]);
  return dbreq(`SELECT * FROM parlements;`);
}

export async function registerToParlament(
  selfUser: UserType,
  email: string,
  parlementId: number,
) {
  gate(selfUser, "delegate_counter");
  return dbreq(
    `INSERT INTO parlement_participants (email, parlement_id) VALUES ("${email}", ${parlementId});`,
  );
}
