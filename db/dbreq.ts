import { dbreq } from "./db";

export interface User {
  name: string;
  email: string;
  image: string;
  last_login: string;
  permissions: string[];
}

export async function getUsers() {
  return await dbreq(`SELECT * FROM \`users\``);
}

export async function getUser(email: string | undefined) {
  if (!email) return;
  return (await dbreq(
    `SELECT * FROM \`users\` WHERE email = '${email}'`
  )) as User;
}

export async function getUsersEmail() {
  const response = await dbreq(`SELECT email FROM users;`);
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email)
  );
  return emails;
}

export async function getEvents() {
  return await dbreq(`SELECT * FROM \`events\``);
}

export async function getStudentUsers() {
  return await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`
  );
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

export async function getAdminUsers() {
  return (await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`
  )) as Promise<Array<string>>;
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

export async function addUserPermissions(
  user: User | undefined,
  permissions: string
) {
  if (!user) return;

  const REQ1 = `UPDATE \`users\` SET \`permissions\` = JSON_ARRAY_APPEND(permissions, '$', '${permissions}') WHERE \`email\` = '${user.email}';`;

  await dbreq(REQ1);
  return await getUser(user.email);
}

export async function removeUserPermissions(
  user: User | undefined,
  permissions: string
) {
  if (!user) return;

  const REQ1 = `UPDATE \`users\` SET \`permissions\` = JSON_REMOVE(permissions, '$[${permissions}]') WHERE \`email\` = '${user.email}';`;

  return await dbreq(REQ1);
}

export interface apireqType {
  gate:
    | "getUsers"
    | "getEvents"
    | "getStudentUsers"
    | "getAdminUsers"
    | "getUsersEmail"
    | "getAdminUsersEmail"
    | "addUserPermissions"
    | "removeUserPermissions";
}
export const apioptions = [
  "getUsers",
  "getEvents",
  "getStudentUsers",
  "getAdminUsers",
  "getUsersEmail",
  "getAdminUsersEmail",
  "addUserPermissions",
  "removeUserPermissions",
];

export const apireq = {
  getUsers: { req: getUsers, perm: "admin" },
  updateUser: { req: updateUser, perm: "admin" },
  getEvents: { req: getEvents, perm: null },
  getStudentUsers: { req: getStudentUsers, perm: "admin" },
  getAdminUsers: { req: getAdminUsers, perm: "admin" },
  getUsersEmail: { req: getUsersEmail, perm: "admin" },
  getAdminUsersEmail: { req: getAdminUsersEmail, perm: "admin" },
  addUserPermissions: { req: addUserPermissions, perm: "admin" },
  removeUserPermissions: { req: removeUserPermissions, perm: "admin" },
};

export const defaultApiReq = async (req: string, body: any) => {
  if (req === "getUsers") return await getUsers();
  if (req === "getEvents") return await getEvents();
  if (req === "getStudentUsers") return await getStudentUsers();
  if (req === "getAdminUsers") return await getAdminUsers();
  if (req === "getUsersEmail") return await getUsersEmail();
  if (req === "getAdminUsersEmail") return await getAdminUsersEmail();
  if (req === "addUserPermissions") {
    const { user, permissions } = body;
    console.log(body);
    console.log(user, permissions);
    return await addUserPermissions(user, permissions);
  }
};
