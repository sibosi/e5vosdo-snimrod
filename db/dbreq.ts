import { auth } from "@/auth";
import { dbreq, multipledbreq } from "./db";
import webPush from "web-push";
import { badge, image } from "@nextui-org/theme";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string; // Replace with your public VAPID key
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string; // Replace with your private VAPID key

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com", // Replace with your email
  publicVapidKey,
  privateVapidKey
);

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

export async function getUsersName() {
  const response = await dbreq(`SELECT name FROM users;`);
  let names: string[] = [];
  (response as unknown as []).map((user: { name: string }) =>
    names.push(user.name)
  );
  return names;
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

  const REQ2 = `INSERT INTO \`users\` (\`username\`, \`email\`, \`image\`, \`name\`, \`permissions\`, \`notifications\`, \`service_workers\`) SELECT '${user.name}', '${user.email}', '${user.image}', '${user.name}', '[]', '[]', '[]'  WHERE NOT EXISTS (SELECT *FROM \`users\`WHERE \`email\` = '${user.email}');`;

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

export async function getUsersEmailByPermission(permission: string) {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"${permission}"', '$')`
  )) as any;
  let emails: string[] = [];
  response.map((user: { email: string }) => emails.push(user.email));
  return emails;
}

export async function getNotificationById(id: number) {
  const response = (await dbreq(
    `SELECT * FROM notifications WHERE id = ${Number(id)}`
  )) as any[];
  return response[0];
}

export async function getUserNotificationsIds() {
  const email = (await getAuth())?.email;
  const response = (
    (await dbreq(
      `SELECT notifications FROM users WHERE email = '${email}'`
    )) as any
  )[0].notifications as number[];
  return response;
}

export async function getUserNotifications() {
  const email = (await getAuth())?.email;
  const response = (
    (await dbreq(
      `SELECT notifications FROM users WHERE email = '${email}'`
    )) as any
  )[0].notifications as number[];

  let notifications: any[] = [];
  for (let i = 0; i < response.length; i++) {
    notifications.push(await getNotificationById(response[i]));
  }
  return notifications;
}

export async function addServiceWorker(serviceWorker: any) {
  const email = (await getAuth())?.email;
  const REQ1 = `UPDATE users SET service_workers = JSON_ARRAY_APPEND(service_workers, '$', JSON_OBJECT('endpoint', '${serviceWorker.endpoint}', 'expirationTime', '${serviceWorker.expirationTime}', 'keys', JSON_OBJECT('p256dh', '${serviceWorker.keys.p256dh}', 'auth', '${serviceWorker.keys.auth}'))) WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function removeServiceWorker(serviceWorker: any, email: string) {
  let users_service_workers = (
    (await dbreq(
      `SELECT service_workers FROM users WHERE email = '${email}'`
    )) as any
  )[0].service_workers;

  users_service_workers = users_service_workers.filter(
    (sw: any) => sw.endpoint !== serviceWorker.endpoint
  );

  const REQ1 = `UPDATE users SET service_workers = '${JSON.stringify(
    users_service_workers
  )}' WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function getServiceWorkersByPermission(permission: string) {
  const users_service_workers: { service_workers: [] }[] = (await dbreq(
    `SELECT service_workers FROM users WHERE JSON_CONTAINS(permissions, '"${permission}"', '$')`
  )) as any;
  let service_workers: any[] = [];
  users_service_workers.map((user: { service_workers: [] }) =>
    user.service_workers.map((sw: any) => service_workers.push(sw))
  );

  return service_workers;
}

export async function getServiceWorkersByEmail(email: string) {
  const response = (await dbreq(
    `SELECT service_workers FROM users WHERE email = '${email}'`
  )) as any;
  return response[0].service_workers;
}

export async function checkPushAuth(auth: string) {
  const response: any = await dbreq(`SELECT * FROM push_auths;`);

  const auths: string[] = response.map((auth: any) => auth.auth);
  return auths.includes(auth);
}
export async function addPushAuth(auth: string) {
  return await dbreq(`INSERT INTO push_auths (auth) VALUES ('${auth}');`);
}

export async function newPush(email: string, payload: any) {
  const service_workers = await getServiceWorkersByEmail(email);
  service_workers.map(async (sw: any) => {
    try {
      console.log("Sending notification to:", sw);
      await webPush.sendNotification(sw, payload);
    } catch (error) {
      console.error("Error sending notification:", error);
      if ((error as any).statusCode === 410) {
        console.log(await removeServiceWorker(sw, email));
      }
    }
  });
}

export async function newNotificationByEmails(
  title: string,
  message: string,
  receiving_emails: string[]
) {
  const sender_email = (await getAuth())?.email;

  let valid_receiving_emails: string[] = [];

  if (!receiving_emails[0].includes("@")) {
    valid_receiving_emails = await getUsersEmailByPermission(
      receiving_emails[0]
    );
  } else {
    valid_receiving_emails = receiving_emails;
  }

  const REQ1 = `INSERT INTO notifications (title, message, sender_email, receiving_emails) VALUES ('${title}', '${message}', '${sender_email}', '${
    '["' + valid_receiving_emails.join('", "') + '"]'
  }');`;
  const REQ2 = `SET @notification_id = LAST_INSERT_ID();`;
  const REQ3 = `UPDATE users JOIN (SELECT receiving_emails FROM notifications WHERE id = @notification_id) AS n ON JSON_CONTAINS(n.receiving_emails, JSON_QUOTE(users.email), '$') SET users.notifications = JSON_ARRAY_APPEND(users.notifications, '$', CAST(@notification_id AS JSON));`;
  const REQ4 = `SELECT * FROM notifications WHERE id = @notification_id;`;

  const MAINRRQ = [REQ1, REQ2, REQ3, REQ4];

  const response = await multipledbreq(MAINRRQ);

  valid_receiving_emails.map(async (email) => {
    await newPush(
      email,
      JSON.stringify({
        title: sender_email + " üzenetet küldött",
        message: title,
        body: title,
        icon: "favicon.ico",
        badge: "favicon-16x16.ico",
      })
    );
  });

  return { data: "success" };
}

export async function newNotificationByNames(
  title: string,
  message: string,
  receiving_names: string[]
) {
  const sender_email = (await getAuth())?.email;
  let receiving_emails: string[] = [];
  let valid_receiving_emails: string[] = [];

  const usersNameAndEmail: Array<{ name: string; email: string }> =
    (await dbreq(`SELECT name, email FROM users`)) as any;

  const usersNameAndEmailDict: { [key: string]: string } = {};
  usersNameAndEmail.map((user: { name: string; email: string }) => {
    usersNameAndEmailDict[user.name] = user.email;
  });

  receiving_names.map((name) => {
    receiving_emails.push(usersNameAndEmailDict[name] ?? name);
  });

  await receiving_emails.map(async (email) => {
    if (email.includes("@")) {
      valid_receiving_emails.push(email);
    } else {
      valid_receiving_emails = [
        ...valid_receiving_emails,
        ...(await getUsersEmailByPermission(email)),
      ];
    }
  });

  return await newNotificationByEmails(title, message, valid_receiving_emails);
}

export interface apireqType {
  gate:
    | "getUsers"
    | "getUsersName"
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
    | "removeUserPermissions"
    | "getNotificationById"
    | "getUserNotificationsIds"
    | "getUserNotifications"
    | "newNotificationByEmails"
    | "newNotificationByNames"
    | "checkPushAuth";
}
export const apioptions = [
  "getUsers",
  "getUsersName",
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
  "getNotificationById",
  "getUserNotificationsIds",
  "getUserNotifications",
  "newNotificationByEmails",
  "newNotificationByNames",
  "checkPushAuth",
];

export const apireq = {
  getUsers: { req: getUsers, perm: ["admin", "tester"] },
  getUsersName: { req: getUsersName, perm: ["student"] },
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
  getNotificationById: { req: getNotificationById, perm: ["student"] },
  getUserNotificationsIds: { req: getUserNotificationsIds, perm: ["student"] },
  getUserNotifications: { req: getUserNotifications, perm: ["student"] },
  newNotificationByEmails: { req: newNotificationByEmails, perm: ["admin"] },
  newNotificationByNames: { req: newNotificationByNames, perm: ["admin"] },
  checkPushAuth: { req: checkPushAuth, perm: ["student"] },
};

export const defaultApiReq = async (req: string, body: any) => {
  if (req === "getUsers") return await getUsers();
  else if (req === "getUsersName") return await getUsersName();
  else if (req === "getEvents") return await getEvents();
  else if (req === "getStudentUsers") return await getStudentUsers();
  else if (req === "getAdminUsers") return await getAdminUsers();
  else if (req === "getUsersEmail") return await getUsersEmail();
  else if (req === "getAdminUsersEmail") return await getAdminUsersEmail();
  else if (req === "addUserPermission") {
    const { email, permission } = body;
    const response = await addUserPermission(email, permission);
    return "MyResponse: " + String(response);
  } else if (req === "removeUserPermissions") {
    const { email, permission } = body;
    return await removeUserPermissions(email, permission);
  } else if (req === "getNotificationById")
    return await getNotificationById(body);
  else if (req === "getUserNotificationsIds")
    return await getUserNotificationsIds();
  else if (req === "getUserNotifications") return await getUserNotifications();
  else if (req === "newNotificationByEmails") {
    const { title, message, receiving_emails } = body;
    return await newNotificationByEmails(title, message, receiving_emails);
  } else if (req === "newNotificationByNames") {
    const { title, message, receiving_names } = body;
    return await newNotificationByNames(title, message, receiving_names);
  } else if (req === "checkPushAuth") {
    const { auth } = body;
    return await checkPushAuth(auth);
  } else return "No such request";
};
