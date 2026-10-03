import getUserClass from "@/public/getUserClass";
import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";
import type { Parlament, ParlamentParticipant } from "@/types/parliaments";

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
  isApplicant: boolean = false,
) {
  if (!isApplicant) {
    gate(selfUser, ["delegate_counter", "head_of_parlament"]);
  }

  return await dbreq(
    `INSERT INTO parlament_participants (email, class, parlament_id, is_applicant) VALUES (?, ?, ?, ?);`,
    [email, group, parlamentId, isApplicant],
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
    `SELECT * FROM parlament_participants WHERE parlament_id = ? AND is_applicant = 0;`,
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

export async function getParlamentApplicants(
  selfUser: UserType,
  parlamentId: number,
) {
  const data: ParlamentParticipant[] = (await dbreq(
    `SELECT * FROM parlament_participants WHERE parlament_id = ? AND is_applicant = 1;`,
    [parlamentId],
  )) as any;

  const applicantsByClass: Record<string, string[]> = {};
  data.forEach((participant) => {
    if (!applicantsByClass[participant.class])
      applicantsByClass[participant.class] = [];
    applicantsByClass[participant.class].push(participant.email);
  });

  return applicantsByClass;
}

export async function applyToParlamentFromOwnClass(
  selfUser: UserType,
  parlamentId: number,
) {
  const parlament = await getParlament(selfUser, parlamentId);
  const startTime = new Date(parlament.date).getTime();
  const elapsedTime = Date.now() - startTime;

  if (
    !Number.isFinite(startTime) ||
    elapsedTime < 0 ||
    elapsedTime >= 60 * 60 * 1000
  ) {
    throw new Error(
      "A parlamenti jelentkezés csak a kezdés előtt, illetve azután egy óráig lehetséges",
    );
  }

  const userClass = getUserClass(selfUser);
  if (!userClass) throw new Error("User class could not be determined");

  return await registerToParlament(
    selfUser,
    selfUser.email,
    userClass,
    parlamentId,
    true,
  );
}
