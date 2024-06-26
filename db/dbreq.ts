import { dbreq } from "./db";

export interface User {
  name: string;
  email: string;
  image: string;
}

export async function getUsers() {
  return await dbreq(`SELECT * FROM \`users\``);
}

export async function getUsersEmail() {
  const response = await dbreq(`SELECT email FROM users;`);
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email)
  );
  return emails;
}

export async function getStudentUsersEmail() {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`
  )) as Promise<Array<string>>;
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email)
  );
  return emails;
}

export async function getAdminUsersEmail() {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`
  )) as Promise<Array<string>>;
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email)
  );
  return emails;
}

export async function updateUser(user: User | undefined) {
  if (!user) return;

  const REQ1 = `UPDATE \`users\` SET \`username\` = '${user.name}', \`email\` = '${user.email}', \`image\` = '${user.image}', \`last_login\` = NOW() WHERE \`email\` = '${user.email}';`;

  const REQ2 = `INSERT INTO \`users\` (\`username\`, \`email\`, \`image\`) SELECT '${user.name}', '${user.email}', '${user.image}' WHERE NOT EXISTS (SELECT *FROM \`users\`WHERE \`email\` = '${user.email}');`;

  return await dbreq(REQ1), await dbreq(REQ2);
}

export async function getEvents() {
  return await dbreq(`SELECT * FROM \`events\``);
}

export async function getStudentUsers() {
  return await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`
  );
}

export async function getAdminUsers() {
  return (await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`
  )) as Promise<Array<string>>;
}

export interface apireqType {
  gate:
    | "getUsers"
    | "getEvents"
    | "getStudentUsers"
    | "getAdminUsers"
    | "getUsersEmail"
    | "getAdminUsersEmail";
}
export const apioptions = [
  "getUsers",
  "getEvents",
  "getStudentUsers",
  "getAdminUsers",
  "getUsersEmail",
  "getAdminUsersEmail",
];

export const apireq = {
  getUsers: getUsers,
  updateUser: updateUser,
  getEvents: getEvents,
  getStudentUsers: getStudentUsers,
  getAdminUsers: getAdminUsers,
  getUsersEmail: getUsersEmail,
  getAdminUsersEmail: getAdminUsersEmail,
};
