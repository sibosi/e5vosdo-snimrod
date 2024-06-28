import { auth } from "@/auth";
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
  return (
    (await dbreq(`SELECT * FROM \`users\` WHERE email = '${email}'`)) as User[]
  )[0];
}

export async function getAuth(email?: string | undefined) {
  if (!email) {
    const session = await auth();
    if (!session?.user) return;
    const authEmail = session.user.email;

    const response = (await dbreq(
      `SELECT * FROM \`users\` WHERE email = '${authEmail}'`
    )) as User[];

    return response[0];
  } else {
    const response = (await dbreq(
      `SELECT * FROM \`users\` WHERE email = '${email}'`
    )) as User[];

    return response[0];
  }
}

export async function hasPermission(
  email: string | undefined,
  functionname: string
) {
  if (!email) return false;
  const user = (await getUser(email)) as User;
  const userPermissionsSet = new Set(user.permissions);
  const functionPermissions = new Set(
    apireq[functionname as apireqType["gate"]].perm
  );

  const response = Array.from(functionPermissions).some((item) =>
    userPermissionsSet.has(item)
  );
  return response;
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

  const REQ1 = `UPDATE \`users\` SET \`username\` = '${user.name}', \`name\` = '${user.name}', \`email\` = '${user.email}', \`image\` = '${user.image}', \`last_login\` = NOW() WHERE \`email\` = '${user.email}';`;

  const REQ2 = `INSERT INTO \`users\` (\`username\`, \`email\`, \`image\`, \`name\`, \`permissions\`) SELECT '${user.name}', '${user.email}', '${user.image}', '${user.name}', '[]'  WHERE NOT EXISTS (SELECT *FROM \`users\`WHERE \`email\` = '${user.email}');`;

  return await dbreq(REQ1), await dbreq(REQ2);
}

export async function addUserPermission(
  email: string | undefined,
  permission: string
) {
  if (!email) return "no email";

  if (((await getUser(email)) as any).permissions.includes(permission))
    return "The user already has this permission";

  const REQ1 = `UPDATE users SET permissions = JSON_ARRAY_APPEND(permissions, '$', '${permission}') WHERE \`email\` = '${email}';`;

  return await dbreq(REQ1);
}

export async function removeUserPermissions(
  email: string | undefined,
  permission: string
) {
  if (!email) return;

  const REQ2 = `UPDATE users SET permissions = JSON_REMOVE(permissions, JSON_UNQUOTE(JSON_SEARCH(permissions, 'one', '${permission}'))) WHERE email = '${email}';`;

  return await dbreq(REQ2);
}

export interface apireqType {
  gate:
    | "getUsers"
    | "getUser"
    | "getAuth"
    | "hasPermission"
    | "getUsersEmail"
    | "getEvents"
    | "getStudentUsers"
    | "getStudentUsersEmail"
    | "getAdminUsers"
    | "getAdminUsersEmail"
    | "updateUser"
    | "addUserPermission"
    | "removeUserPermissions";
}
export const apioptions = [
  "getUsers",
  "getUser",
  "getAuth",
  "hasPermission",
  "getUsersEmail",
  "getEvents",
  "getStudentUsers",
  "getStudentUsersEmail",
  "getAdminUsers",
  "getAdminUsersEmail",
  "updateUser",
  "addUserPermission",
  "removeUserPermissions",
];

export const apireq = {
  getUsers: { req: getUsers, perm: ["admin", "tester"] },
  getUser: { req: getUser, perm: [] },
  getAuth: { req: getAuth, perm: [] },
  hasPermission: { req: hasPermission, perm: [] },
  getUsersEmail: { req: getUsersEmail, perm: ["admin", "tester"] },
  getEvents: { req: getEvents, perm: ["student"] },
  getStudentUsers: { req: getStudentUsers, perm: ["admin", "tester"] },
  getStudentUsersEmail: { req: getStudentUsersEmail, perm: [] },
  getAdminUsers: { req: getAdminUsers, perm: ["admin", "tester"] },
  getAdminUsersEmail: { req: getAdminUsersEmail, perm: ["admin", "tester"] },
  updateUser: { req: updateUser, perm: ["admin"] },
  addUserPermission: { req: addUserPermission, perm: ["admin"] },
  removeUserPermissions: { req: removeUserPermissions, perm: ["admin"] },
};

export const defaultApiReq = async (req: string, body: any) => {
  if (req === "getUsers") return await getUsers();
  if (req === "getEvents") return await getEvents();
  if (req === "getStudentUsers") return await getStudentUsers();
  if (req === "getAdminUsers") return await getAdminUsers();
  if (req === "getUsersEmail") return await getUsersEmail();
  if (req === "getAdminUsersEmail") return await getAdminUsersEmail();
  if (req === "addUserPermission") {
    const { email, permission } = body;
    const response = await addUserPermission(email, permission);
    return "MyResponse: " + String(response);
  }
  if (req === "removeUserPermissions") {
    const { email, permission } = body;
    return await removeUserPermissions(email, permission);
  }
};
