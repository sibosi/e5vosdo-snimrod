import { auth } from "@/auth";
import { dbreq, multipledbreq } from "./db";
import webPush from "web-push";
import { backup } from "./autobackup";
import { OAuth2Client } from "google-auth-library";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string;

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com",
  publicVapidKey,
  privateVapidKey,
);

export interface User {
  name: string;
  username: string;
  nickname: string;
  email: string;
  image: string;
  last_login: string;
  permissions: string[];
  EJG_code: string | null;
  OM5: string | null;
  food_menu: string;
  coming_year: number;
  class_character: string;
  order_number: number;
  tickets: string[];
  push_permission: boolean;
  push_about_games: boolean;
  push_about_timetable: boolean;
}

export type UserType = User;
export type PossibleUserType = User | undefined | null;

export interface Log {
  id?: number;
  time: string;
  user: string;
  action: string;
  message: string;
}

export interface AlertType {
  id: number;
  text: string;
  className?: string;
  padding?: boolean;
  icon?: boolean;
}

export async function addLog(action: string, message?: string) {
  const email = await getEmail();
  return await dbreq(
    `INSERT INTO logs (time, user, action, message) VALUES (?, ?, ?, ?);`,
    [new Date().toJSON(), email ?? "undefined", action, message ?? ""],
  );
}

export async function getLogs(max: number = 10) {
  addLog("getLogs");
  if (!(await getAuth())?.permissions.includes("admin")) return;
  return (await dbreq(`SELECT * FROM logs ORDER BY id DESC LIMIT ?;`, [
    max,
  ])) as Log[];
}

export async function getUserLogs(email: string) {
  addLog("getUserLogs", email);
  return (await dbreq(`SELECT * FROM logs WHERE user = ? ORDER BY id DESC;`, [
    email,
  ])) as Log[];
}

export async function getUsers() {
  return await dbreq(`SELECT * FROM \`users\``);
}

export async function getUsersName() {
  const response = await dbreq(`SELECT name FROM users;`);
  return (response as { name: string }[]).map((user) => user.name);
}

export async function getUser(email: string | undefined) {
  if (!email) return;
  return (
    (await dbreq(`SELECT * FROM \`users\` WHERE email = ?`, [email])) as User[]
  )[0];
}

export async function getAllUsersNameByEmail() {
  const response = await dbreq(`SELECT name, email FROM users;`);
  let users: { [key: string]: string } = {};
  (response as []).map((user: User) => {
    users[user.email] = user.name;
  });
  return users;
}

export async function getEmail() {
  const session = await auth();
  const authEmail = session?.user?.email;
  return authEmail;
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function getAuth(): Promise<User | null | undefined> {
  const session = await auth();
  if (!session?.user?.email) return;

  const verifiedEmail = session.user.email;
  const verifiedName = session.user.name || undefined;
  const verifiedImage = session.user.image || undefined;

  try {
    console.log("getAuth by email:", verifiedEmail);

    const rows = (await dbreq(`SELECT * FROM users WHERE email = ?`, [
      verifiedEmail,
    ])) as User[];

    if (rows.length === 0) {
      console.log("No user");
      // use updateUser (or your own upsert) to write name/email/image
      await updateUser({
        email: verifiedEmail,
        name: verifiedName!,
        image: verifiedImage!,
      } as User);
      // re‑query to get the full row (including any defaults, id, etc.)
      const inserted = (await dbreq(`SELECT * FROM users WHERE email = ?`, [
        verifiedEmail,
      ])) as User[];
      return inserted[0] || null;
    }

    return rows[0];
  } catch (e) {
    console.error("Error in getAuth:", e);
    return null;
  }
}
export async function hasPermission(
  email: string | undefined,
  functionname: string,
) {
  if (!email) return false;
  const user = (await getUser(email)) as User;
  const userPermissionsSet = new Set(user.permissions);
  const functionPermissions = new Set(apireq[functionname as apireqType]?.perm);

  const response = Array.from(functionPermissions).some((item) =>
    userPermissionsSet.has(item),
  );
  return response;
}

export async function getUsersEmail() {
  const response = await dbreq(`SELECT email FROM users;`);
  let emails: string[] = [];
  (response as []).map((user: { email: string }) => emails.push(user.email));
  return emails;
}

export async function getStudentUsers() {
  return await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`,
  );
}

export async function getStudentUsersEmail() {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`,
  )) as { email: string }[];
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email),
  );
  return emails;
}

export async function getAdminUsers() {
  return await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`,
  );
}

export async function getAdminUsersEmail() {
  const response = await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`,
  );
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email),
  );
  return emails;
}

export async function updateUser(user: User | undefined, isLogin = false) {
  if (!user) return;

  if (!isLogin) addLog("updateUser", user.email);
  const date = new Date().toJSON();

  const query = `
    INSERT INTO \`users\` (
      \`username\`, \`nickname\`, \`email\`, \`image\`, \`name\`, \`last_login\`,
      \`permissions\`, \`notifications\`, \`tickets\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      \`username\` = VALUES(\`username\`),
      \`name\` = VALUES(\`name\`),
      \`image\` = VALUES(\`image\`),
      \`last_login\` = VALUES(\`last_login\`);
  `;

  await dbreq(query, [
    user.name,
    user.name.split(" ")[0],
    user.email,
    user.image,
    user.name,
    date,
    JSON.stringify(["user"]),
    JSON.stringify({ new: [1], read: [], sent: [] }),
    JSON.stringify(["EJG_code_edit"]),
  ]);
  return null;
}

export async function addUserPermission(
  email: string | undefined,
  permission: string,
) {
  if (!email) return "no email";

  addLog("addUserPermission", email + " " + permission);

  if (((await getUser(email)) as any).permissions.includes(permission))
    return "The user already has this permission";

  return await dbreq(
    `UPDATE users SET permissions = JSON_ARRAY_APPEND(permissions, '$', ?) WHERE \`email\` = ?;`,
    [permission, email],
  );
}

export async function removeUserPermissions(
  email: string | undefined,
  permission: string,
) {
  if (!email) return;

  addLog("removeUserPermissions", email + " " + permission);

  return await dbreq(
    `UPDATE users SET permissions = JSON_REMOVE(permissions, JSON_UNQUOTE(JSON_SEARCH(permissions, 'one', ?))) WHERE email = ?;`,
    [permission, email],
  );
}

export async function getUsersEmailByPermission(permission: string) {
  const response = await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, JSON_QUOTE(?), '$')`,
    [permission],
  );
  let emails: string[] = [];
  response.map((user: { email: string }) => emails.push(user.email));
  return emails;
}

export async function getUsersEmailWherePushAboutGames() {
  const response = await dbreq(
    `SELECT email FROM users WHERE push_about_games = 1`,
  );
  let emails: string[] = [];
  response.map((user: { email: string }) => emails.push(user.email));
  return emails;
}

export async function getNotificationById(id: number) {
  const response = (await dbreq(`SELECT * FROM notifications WHERE id = ?`, [
    id,
  ])) as any[];
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
    await dbreq(`SELECT notifications FROM users WHERE email = ?`, [email])
  )[0].notifications as number[];
  return response;
}

export async function getUserNotifications() {
  const email = (await getAuth())?.email;
  if (!email) return;

  const notifications: any = await dbreq(
    `SELECT notifications FROM users WHERE email = ?`,
    [email],
  );

  const {
    new: newNotifs,
    read: readNotifs,
    sent: sentNotifs,
  } = notifications[0].notifications;

  const getNotifications = async (ids: number[]) => {
    if (!ids.length) return [];
    return await dbreq(`SELECT * FROM notifications WHERE id IN (?);`, [ids]);
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
  if (!email) return;

  // Ensure idempotency per (owner_email, endpoint)
  await dbreq(
    `DELETE FROM service_workers WHERE owner_email = ? AND endpoint = ?;`,
    [email, serviceWorker.endpoint],
  );

  return await dbreq(
    `INSERT INTO service_workers (owner_email, auth, p256dh, endpoint, expiration_time) VALUES (?, ?, ?, ?, ?);`,
    [
      email,
      serviceWorker.keys?.auth ?? null,
      serviceWorker.keys?.p256dh ?? null,
      serviceWorker.endpoint,
      serviceWorker.expirationTime ?? null,
    ],
  );
}

export async function removeServiceWorker(serviceWorker: any, email: string) {
  return await dbreq(
    `DELETE FROM service_workers WHERE owner_email = ? AND endpoint = ?;`,
    [email, serviceWorker.endpoint],
  );
}

export async function getServiceWorkersByPermission(permission: string) {
  const rows: any[] = await dbreq(
    `SELECT sw.endpoint, sw.expiration_time, sw.p256dh, sw.auth
     FROM service_workers sw
     JOIN users u ON u.email = sw.owner_email
     WHERE JSON_CONTAINS(u.permissions, JSON_QUOTE(?), '$');`,
    [permission],
  );

  return rows.map((row) => ({
    endpoint: row.endpoint,
    expirationTime: row.expiration_time,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }));
}

export async function getServiceWorkersByEmail(email: string) {
  const rows: any[] = await dbreq(
    `SELECT endpoint, expiration_time, p256dh, auth FROM service_workers WHERE owner_email = ?;`,
    [email],
  );
  return rows.map((row) => ({
    endpoint: row.endpoint,
    expirationTime: row.expiration_time,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }));
}

export async function checkPushAuth(auth: string) {
  const response: any = await dbreq(`SELECT * FROM push_auths;`);

  const auths: string[] = response.map((auth: any) => auth.auth);
  return auths.includes(auth);
}
export async function addPushAuth(auth: string) {
  const isExist =
    ((await dbreq(`SELECT * FROM push_auths WHERE auth = ?;`, [auth])) as any[])
      .length > 0;
  if (isExist) return true;
  return await dbreq(`INSERT INTO push_auths (auth) VALUES (?);`, [auth]);
}

export async function newPush(email: string, payload: any) {
  addLog("newPush", email + " " + JSON.stringify(payload));
  const service_workers = await getServiceWorkersByEmail(email);
  service_workers.forEach(async (sw: any) => {
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
    await dbreq(`SELECT notifications FROM users WHERE email = ?`, [email])
  )[0].notifications.new;

  const filtered_new_notifications = new_notifications.filter(
    (nid: number) => nid !== id,
  );

  const placeholders = filtered_new_notifications.map(() => "?").join(", ");
  const req1 = `UPDATE users SET notifications = JSON_SET(notifications, '$.new', JSON_ARRAY(${placeholders})) WHERE email = ?;`;
  const req2 = `UPDATE users SET notifications = JSON_SET(notifications, '$.read', JSON_ARRAY_APPEND(JSON_EXTRACT(notifications, '$.read'), '$', ?)) WHERE email = ?;`;
  await dbreq(req1, [...filtered_new_notifications, email]);
  return [await dbreq(req2, [id, email])];
}

export async function newNotificationByEmails(
  title: string,
  message: string,
  receiving_emails: string[],
  payload: string = "",
) {
  const sender_email = (await getAuth())?.email;

  let valid_receiving_emails: string[] = [];

  console.log("#5 receiving_emails", receiving_emails);

  if (!receiving_emails[0].includes("@")) {
    valid_receiving_emails = await getUsersEmailByPermission(
      receiving_emails[0],
    );
  } else {
    valid_receiving_emails = receiving_emails;
  }

  await multipledbreq(async (conn) => {
    // Insert notification
    const [ins]: any = await conn.execute(
      `INSERT INTO notifications (title, message, sender_email, receiving_emails, time) VALUES (?, ?, ?, CAST(? AS JSON), ?);`,
      [
        title,
        message,
        sender_email,
        JSON.stringify(valid_receiving_emails),
        new Date().toJSON(),
      ],
    );
    const notification_id = ins.insertId;

    // Update recipients' new notifications using a join on the inserted row
    await conn.execute(
      `UPDATE users JOIN (SELECT receiving_emails FROM notifications WHERE id = ?) AS n ON JSON_CONTAINS(n.receiving_emails, JSON_QUOTE(users.email), '$')
       SET users.notifications = JSON_SET(users.notifications, '$.new', JSON_ARRAY_APPEND(JSON_EXTRACT(users.notifications, '$.new'), '$', CAST(? AS JSON)));`,
      [notification_id, notification_id],
    );

    // Add to sender's sent
    await conn.execute(
      `UPDATE users SET notifications = JSON_SET(notifications, '$.sent', JSON_ARRAY_APPEND(JSON_EXTRACT(notifications, '$.sent'), '$', CAST(? AS JSON))) WHERE email = ?;`,
      [notification_id, sender_email],
    );

    // Return inserted notification
    const [row]: any = await conn.execute(
      `SELECT * FROM notifications WHERE id = ?;`,
      [notification_id],
    );
    return row[0];
  });

  valid_receiving_emails.forEach(async (email) => {
    if (payload !== "") {
      await newPush(email, payload);
    } else {
      await newPush(
        email,
        JSON.stringify({
          title: sender_email + " üzenetet küldött",
          body: title,
        }),
      );
    }
  });

  return { data: "success" };
}

export async function newNotificationByNames(
  title: string,
  message: string,
  receiving_names: string[],
) {
  const sender_email = (await getAuth())?.email;
  addLog("newNotificationByNames", sender_email + " " + title + " " + message);
  let receiving_emails: string[] = [];
  let valid_receiving_emails: string[] = [];

  const usersNameAndEmail: Array<{ name: string; email: string }> = await dbreq(
    `SELECT name, email FROM users`,
  );

  const usersNameAndEmailDict: { [key: string]: string } = {};
  usersNameAndEmail.forEach((user: { name: string; email: string }) => {
    usersNameAndEmailDict[user.name] = user.email;
  });

  receiving_names.forEach((name) => {
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
    }),
  );

  return await newNotificationByEmails(title, message, valid_receiving_emails);
}

export async function addTicket(email: string, ticket: string) {
  addLog("addTicket", email + " " + ticket);
  return await dbreq(
    `UPDATE users SET tickets = JSON_ARRAY_APPEND(tickets, '$', ?) WHERE email = ?;`,
    [ticket, email],
  );
}

export async function removeTicket(ticket: string) {
  addLog("removeTicket", ticket);
  const email = (await getAuth())?.email;
  return await dbreq(
    `UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', ?))) WHERE email = ?;`,
    [ticket, email],
  );
}

export async function deleteTicket(email: string, ticket: string) {
  addLog("deleteTicket", email + " " + ticket);
  return await dbreq(
    `UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', ?))) WHERE email = ?;`,
    [ticket, email],
  );
}

export async function editMySettings({
  settings,
}: {
  settings: {
    nickname?: string;
    EJG_code?: string;
    OM5?: string;
    food_menu?: string;
    push_permission?: boolean;
    push_about_games?: boolean;
    push_about_timetable?: boolean;
  };
}) {
  const selfUser = await getAuth();
  if (!selfUser) return "No user";
  const email = selfUser?.email;

  addLog("editMySettings");

  const setClauses: string[] = [];
  const params: any[] = [];
  const isValidEJGCode = (code: string): boolean => /^[A-Z0-9]{13}$/.test(code);

  if (
    selfUser.tickets.includes("EJG_code_edit") &&
    selfUser.EJG_code != settings.EJG_code &&
    isValidEJGCode(settings.EJG_code ?? "")
  ) {
    await removeTicket("EJG_code_edit");
    setClauses.push("EJG_code = ?");
    params.push(settings.EJG_code);
  }

  console.log(JSON.stringify(settings));

  if (settings.push_permission !== undefined) {
    setClauses.push("push_permission = ?");
    params.push(settings.push_permission ? 1 : 0);
  }

  if (settings.push_about_games !== undefined) {
    setClauses.push("push_about_games = ?");
    params.push(settings.push_about_games ? 1 : 0);
  }
  if (settings.push_about_timetable !== undefined) {
    setClauses.push("push_about_timetable = ?");
    params.push(settings.push_about_timetable ? 1 : 0);
  }

  if (settings.nickname) {
    setClauses.push("nickname = ?");
    params.push(settings.nickname);
  }
  if (settings.food_menu !== undefined) {
    setClauses.push("food_menu = ?");
    params.push(
      ["A", "B"].includes(settings.food_menu) ? settings.food_menu : null,
    );
  }

  if (settings.OM5) {
    setClauses.push("OM5 = ?");
    params.push(settings.OM5);
  }

  if (setClauses.length === 0) return "No changes";
  const request = `UPDATE users SET ${setClauses.join(", ")} WHERE email = ?;`;
  params.push(email);

  console.log(request);
  console.log(await dbreq(request, params));

  return null;
}

export async function getMyClassTimetable(EJG_class: string) {
  interface Lesson {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    room: string;
    EJG_classes: string[];
    group_name: number | null;
    teacher: string;
    subject: string;
  }

  const response = (await dbreq(
    `SELECT * FROM timetable WHERE JSON_CONTAINS(JSON_EXTRACT(EJG_classes, '$[1]'), JSON_QUOTE(?), '$')`,
    [EJG_class],
  )) as Lesson[];

  response.forEach((lesson) => {
    lesson.teacher = lesson.teacher.replace(/\n/g, " ");
  });

  return response;
}

export async function getFreeRooms(
  day: "H" | "K" | "SZ" | "CS" | "P",
  time: string,
) {
  const rooms = (
    (await dbreq(`SELECT DISTINCT room FROM timetable;`)) as { room: string }[]
  ).map((room) => room.room);

  const occupiedRooms = (
    (await dbreq(
      `SELECT DISTINCT room FROM timetable WHERE day = ? AND start_time = ?;`,
      [day, time],
    )) as { room: string }[]
  ).map((room) => room.room);

  return rooms.filter((room) => !occupiedRooms.includes(room));
}

export async function getAlerts() {
  return (await dbreq(`SELECT * FROM alerts;`)) as AlertType[];
}

export const apireq = {
  getUsers: { req: getUsers, perm: ["admin"] },
  getUsersName: { req: getUsersName, perm: ["student"] },
  getUser: { req: getUser, perm: [] },
  getAllUsersNameByEmail: { req: getAllUsersNameByEmail, perm: ["user"] },
  getAuth: { req: getAuth, perm: ["user"] },
  hasPermission: { req: hasPermission, perm: [] },
  getUsersEmail: { req: getUsersEmail, perm: ["admin", "tester"] },
  getStudentUsers: { req: getStudentUsers, perm: ["admin", "tester"] },
  getStudentUsersEmail: { req: getStudentUsersEmail, perm: [] },
  getAdminUsers: { req: getAdminUsers, perm: ["admin", "tester"] },
  getAdminUsersEmail: { req: getAdminUsersEmail, perm: ["admin", "tester"] },
  updateUser: { req: updateUser, perm: ["admin"] },
  addUserPermission: { req: addUserPermission, perm: ["admin"] },
  removeUserPermissions: { req: removeUserPermissions, perm: ["admin"] },
  getNotificationById: { req: getNotificationById, perm: ["user"] },
  getUserNotificationsIds: { req: getUserNotificationsIds, perm: ["user"] },
  getUserNotifications: { req: getUserNotifications, perm: ["user"] },
  markAsRead: { req: markAsRead, perm: ["user"] },
  newNotificationByEmails: { req: newNotificationByEmails, perm: ["admin"] },
  newNotificationByNames: { req: newNotificationByNames, perm: ["admin"] },
  checkPushAuth: { req: checkPushAuth, perm: ["user"] },
  editMySettings: { req: editMySettings, perm: ["user"] },
  getMyClassTimetable: { req: getMyClassTimetable, perm: ["user"] },
  addTicket: { req: addTicket, perm: ["admin"] },
  deleteTicket: { req: deleteTicket, perm: ["admin"] },
  getFreeRooms: { req: getFreeRooms, perm: ["user"] },
  getUserLogs: { req: getUserLogs, perm: ["admin"] },
  backup: { req: backup, perm: ["admin", "backup"] },
} as const;

export const apioptions = Object.keys(apireq) as (keyof typeof apireq)[];

export type apireqType = (typeof apioptions)[number];

export const defaultApiReq = async (req: string, body: any) => {
  if (req === "getUsers") return await getUsers();
  if (req === "getAuth") return await getAuth();
  if (req === "getAllUsersNameByEmail") return await getAllUsersNameByEmail();
  if (req === "getUsersName") return await getUsersName();
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
  if (req === "getNotificationById") return await getNotificationById(body);
  if (req === "getUserNotificationsIds") return await getUserNotificationsIds();
  if (req === "getUserNotifications") return await getUserNotifications();
  if (req === "markAsRead") {
    const { id } = body;
    return await markAsRead(id);
  }
  if (req === "newNotificationByEmails") {
    const { title, message, receiving_emails } = body;
    return await newNotificationByEmails(title, message, receiving_emails);
  }
  if (req === "newNotificationByNames") {
    const { title, message, receiving_names } = body;
    return await newNotificationByNames(title, message, receiving_names);
  }
  if (req === "checkPushAuth") {
    const { auth } = body;
    return await checkPushAuth(auth);
  }
  if (req === "editMySettings") {
    const { settings } = body;
    return await editMySettings({ settings });
  }
  if (req === "getMyClassTimetable") {
    const { EJG_class } = body;
    return await getMyClassTimetable(EJG_class);
  }
  if (req === "addTicket") {
    const { email, ticket } = body;
    return await addTicket(email, ticket);
  }
  if (req === "deleteTicket") {
    const { email, ticket } = body;
    return await deleteTicket(email, ticket);
  }
  if (req === "getFreeRooms") {
    const { day, time } = body;
    return await getFreeRooms(day, time);
  }
  if (req === "getUserLogs") {
    const { email } = body;
    return await getUserLogs(email);
  } else if (req === "backup") {
    return await backup();
  } else return "No such request";
};
