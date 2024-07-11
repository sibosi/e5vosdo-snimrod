import { auth } from "@/auth";
import { dbreq, multipledbreq } from "./db";
import webPush from "web-push";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string;

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com", // Replace with your email
  publicVapidKey,
  privateVapidKey
);

export interface User {
  name: string;
  username: string;
  nickname: string;
  email: string;
  image: string;
  last_login: string;
  permissions: string[];
  EJG_code: string;
  food_menu: string;
  tickets: string[];
}

export async function getUsers() {
  return await dbreq(`SELECT * FROM \`users\``);
}

export async function getUsersName() {
  const response = await dbreq(`SELECT name FROM users;`);
  return (response as unknown as { name: string }[]).map((user) => user.name);
}

export async function getUser(email: string | undefined) {
  if (!email) return;
  return (
    (await dbreq(`SELECT * FROM \`users\` WHERE email = '${email}'`)) as User[]
  )[0];
}

export async function getAllUsersNameByEmail() {
  const response = await dbreq(`SELECT name, email FROM users;`);
  let users: { [key: string]: string } = {};
  (response as unknown as []).map((user: User) => {
    users[user.email] = user.name;
  });
  return users;
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

  const REQ2 = `INSERT INTO \`users\` (\`username\`, \`nickname\`, \`email\`, \`image\`, \`name\`, \`permissions\`, \`notifications\`, \`service_workers\`, \`tickets\`) SELECT '${
    user.name
  }', '${user.name.split(" ")[0]}', '${user.email}', '${user.image}', '${
    user.name
  }', '["user"]', '{ "new": [], "read": [], "sent": []  }', '[]', '["EJG_code_edit"]'  WHERE NOT EXISTS (SELECT *FROM \`users\`WHERE \`email\` = '${
    user.email
  }');`;

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
    `SELECT * FROM notifications WHERE id = ${id}`
  )) as any[];
  const notification: {
    id: number;
    title: string;
    message: string;
    time: string;
    sender_email: string;
    receiving_emails: string[];
  } = response[0];
  return notification;
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
  if (!email) return;

  const notifications: any = await dbreq(
    `SELECT notifications FROM users WHERE email = '${email}'`
  );

  const {
    new: newNotifs,
    read: readNotifs,
    sent: sentNotifs,
  } = notifications[0].notifications;

  const getNotifications = async (ids: number[]) => {
    if (!ids.length) return [];
    return await dbreq(
      `SELECT * FROM notifications WHERE id IN (${ids.join(",")})`
    );
  };

  const [newNotifications, readNotifications, sentNotifications] =
    await Promise.all([
      getNotifications(newNotifs),
      getNotifications(readNotifs),
      getNotifications(sentNotifs),
    ]);

  return {
    new: newNotifications,
    read: readNotifications,
    sent: sentNotifications,
  };
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
      await webPush.sendNotification(sw, payload);
    } catch (error) {
      console.error("Error sending notification:", error);
      if ((error as any).statusCode === 410) {
        await removeServiceWorker(sw, email);
      }
    }
  });
}

export async function markAsRead(id: number) {
  const email = (await getAuth())?.email;

  const new_notifications = (
    (await dbreq(
      `SELECT notifications FROM users WHERE email = '${email}'`
    )) as any
  )[0].notifications.new;

  const filtered_new_notifications = new_notifications.filter(
    (nid: number) => nid !== id
  );

  const REQ1 = `UPDATE users SET notifications = JSON_SET(notifications, '$.new', JSON_ARRAY(${filtered_new_notifications.join(
    ", "
  )})) WHERE email = '${email}';`;

  const REQ2 = `UPDATE users SET notifications = JSON_SET(notifications, '$.read', JSON_ARRAY_APPEND(JSON_EXTRACT(notifications, '$.read'), '$', ${id})) WHERE email = '${email}';`;

  return await dbreq(REQ1), await dbreq(REQ2);
}

export async function newNotificationByEmails(
  title: string,
  message: string,
  receiving_emails: string[]
) {
  const sender_email = (await getAuth())?.email;

  let valid_receiving_emails: string[] = [];

  console.log("#5 receiving_emails", receiving_emails);

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
  const REQ3 = `UPDATE users JOIN (SELECT receiving_emails FROM notifications WHERE id = @notification_id) AS n ON JSON_CONTAINS(n.receiving_emails, JSON_QUOTE(users.email), '$') SET users.notifications = JSON_SET(users.notifications, '$.new', JSON_ARRAY_APPEND(JSON_EXTRACT(users.notifications, '$.new'), '$', CAST(@notification_id AS JSON)));`;
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

  await Promise.all(
    receiving_emails.map(async (email) => {
      if (email.includes("@")) {
        valid_receiving_emails.push(email);
      } else {
        valid_receiving_emails = [
          ...valid_receiving_emails,
          ...(await getUsersEmailByPermission(email)),
        ];
        console.log("#4 valid_receiving_emails", valid_receiving_emails);
      }
    })
  );

  return await newNotificationByEmails(title, message, valid_receiving_emails);
}

export async function addTicket(email: string, ticket: string) {
  const REQ1 = `UPDATE users SET tickets = JSON_ARRAY_APPEND(tickets, '$', '${ticket}') WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function removeTicket(ticket: string) {
  const email = (await getAuth())?.email;
  const REQ1 = `UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', '${ticket}'))) WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function editMySettings({
  settings,
}: {
  settings: { nickname: string; EJG_code: string; food_menu: string };
}) {
  const user = await getAuth();
  if (!user) return "No user";
  const email = user?.email;

  const valid_EJG_code = user.tickets.includes("EJG_code_edit")
    ? settings.EJG_code
    : user.EJG_code;

  if (
    user.tickets.includes("EJG_code_edit") &&
    user.EJG_code != settings.EJG_code
  ) {
    await removeTicket("EJG_code_edit");
  }

  const REQ1 = `UPDATE users SET nickname = '${
    settings.nickname
  }', EJG_code = '${valid_EJG_code}', food_menu = ${
    settings.food_menu == null ? null : "'" + settings.food_menu + "'"
  } WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export interface apireqType {
  gate:
    | "getUsers"
    | "getUsersName"
    | "getUser"
    | "getAllUsersNameByEmail"
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
    | "markAsRead"
    | "newNotificationByEmails"
    | "newNotificationByNames"
    | "checkPushAuth"
    | "editMySettings";
}
export const apioptions = [
  "getUsers",
  "getUsersName",
  "getUser",
  "getAllUsersNameByEmail",
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
  "markAsRead",
  "newNotificationByEmails",
  "newNotificationByNames",
  "checkPushAuth",
  "editMySettings",
];

export const apireq = {
  getUsers: { req: getUsers, perm: ["admin", "tester"] },
  getUsersName: { req: getUsersName, perm: ["student"] },
  getUser: { req: getUser, perm: [] },
  getAllUsersNameByEmail: { req: getAllUsersNameByEmail, perm: ["user"] },
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
  getUserNotificationsIds: { req: getUserNotificationsIds, perm: ["user"] },
  getUserNotifications: { req: getUserNotifications, perm: ["user"] },
  markAsRead: { req: markAsRead, perm: ["user"] },
  newNotificationByEmails: { req: newNotificationByEmails, perm: ["admin"] },
  newNotificationByNames: { req: newNotificationByNames, perm: ["admin"] },
  checkPushAuth: { req: checkPushAuth, perm: ["student"] },
  editMySettings: { req: editMySettings, perm: ["student"] },
};

export const defaultApiReq = async (req: string, body: any) => {
  if (req === "getUsers") return await getUsers();
  else if (req === "getAllUsersNameByEmail")
    return await getAllUsersNameByEmail();
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
  else if (req === "markAsRead") {
    const { id } = body;
    return await markAsRead(id);
  } else if (req === "newNotificationByEmails") {
    const { title, message, receiving_emails } = body;
    return await newNotificationByEmails(title, message, receiving_emails);
  } else if (req === "newNotificationByNames") {
    const { title, message, receiving_names } = body;
    return await newNotificationByNames(title, message, receiving_names);
  } else if (req === "checkPushAuth") {
    const { auth } = body;
    return await checkPushAuth(auth);
  } else if (req === "editMySettings") {
    const { settings } = body;
    return await editMySettings({ settings });
  } else return "No such request";
};
