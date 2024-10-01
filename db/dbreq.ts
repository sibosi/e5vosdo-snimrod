import { auth } from "@/auth";
import { dbreq, multipledbreq } from "./db";
import webPush from "web-push";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY as string;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY as string;

webPush.setVapidDetails(
  "mailto:spam.sibosi@gmail.com",
  publicVapidKey,
  privateVapidKey,
);

export interface PageSettingsType {
  id: number;
  name: string;
  headspace: 0 | 1;
  livescore: number;
}

export interface Match {
  id: number;
  url: string;
  team1: string;
  team2: string;
  team_short1: string;
  team_short2: string;
  score1: number;
  score2: number;
  image1: string;
  image2: string;
  status: string;
  time: string;
  start_time: string;
  end_time: string;
}

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
  coming_year: number;
  class_character: string;
  order_number: number;
  tickets: string[];
  hidden_lessons: number[];
  default_group: number | null;
  service_workers: any[];
  push_perission: boolean;
  push_about_games: boolean;
  push_about_timetable: boolean;
}

export type UserType = User;

export interface Log {
  id?: number;
  time: string;
  user: string;
  action: string;
  message: string;
}

export async function addLog(action: string, message?: string) {
  const email = (await getAuth())?.email;
  return await dbreq(
    `INSERT INTO logs (time, user, action, message) VALUES ('${new Date().toJSON()}', '${email}', '${action}', '${
      message ?? ""
    }');`,
  );
}

export async function getLogs(max: number = 10) {
  addLog("getLogs");
  if (!(await getAuth())?.permissions.includes("admin")) return;
  return (await dbreq(
    `SELECT * FROM logs ORDER BY id DESC LIMIT ${max};`,
  )) as Log[];
}

export async function getUserLogs(email: string) {
  addLog("getUserLogs", email);
  return (await dbreq(
    `SELECT * FROM logs WHERE user = '${email}' ORDER BY id DESC;`,
  )) as Log[];
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
  // addLog("getUser", email);
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
      `SELECT * FROM \`users\` WHERE email = '${authEmail}'`,
    )) as User[];

    return response[0];
  } else {
    const response = (await dbreq(
      `SELECT * FROM \`users\` WHERE email = '${email}'`,
    )) as User[];

    return response[0];
  }
}

export async function hasPermission(
  email: string | undefined,
  functionname: string,
) {
  if (!email) return false;
  const user = (await getUser(email)) as User;
  const userPermissionsSet = new Set(user.permissions);
  const functionPermissions = new Set(apireq[functionname as apireqType].perm);

  const response = Array.from(functionPermissions).some((item) =>
    userPermissionsSet.has(item),
  );
  return response;
}

export async function getUsersEmail() {
  const response = await dbreq(`SELECT email FROM users;`);
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email),
  );
  return emails;
}

export async function getEvents() {
  return (await dbreq(`SELECT * FROM \`events\``)) as any[];
}

export async function getStudentUsers() {
  return await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`,
  );
}

export async function getStudentUsersEmail() {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"student"', '$')`,
  )) as Promise<Array<string>>;
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email),
  );
  return emails;
}

export async function getAdminUsers() {
  return (await dbreq(
    `SELECT * FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`,
  )) as Promise<Array<string>>;
}

export async function getAdminUsersEmail() {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"admin"', '$')`,
  )) as Promise<Array<string>>;
  let emails: string[] = [];
  (response as unknown as []).map((user: { email: string }) =>
    emails.push(user.email),
  );
  return emails;
}

export async function updateUser(user: User | undefined) {
  if (!user) return;

  addLog("updateUser", user.email);

  const REQ1 = `UPDATE \`users\` SET \`username\` = '${
    user.name
  }', \`name\` = '${user.name}', \`email\` = '${user.email}', \`image\` = '${
    user.image
  }', \`last_login\` = '${new Date().toJSON()}' WHERE \`email\` = '${
    user.email
  }';`;

  const REQ2 = `INSERT INTO \`users\` (\`username\`, \`nickname\`, \`email\`, \`image\`, \`name\`, \`last_login\`, \`permissions\`, \`notifications\`, \`service_workers\`, \`tickets\`, \`hidden_lessons\`) SELECT '${
    user.name
  }', '${user.name.split(" ")[0]}', '${user.email}', '${user.image}', '${
    user.name
  }', '${new Date().toJSON()}', '["user"]', '{ "new": [1], "read": [], "sent": []  }', '[]', '["EJG_code_edit"]', '[]'  WHERE NOT EXISTS (SELECT *FROM \`users\`WHERE \`email\` = '${
    user.email
  }');`;

  return await dbreq(REQ1), await dbreq(REQ2);
}

export async function addUserPermission(
  email: string | undefined,
  permission: string,
) {
  if (!email) return "no email";

  addLog("addUserPermission", email + " " + permission);

  if (((await getUser(email)) as any).permissions.includes(permission))
    return "The user already has this permission";

  const REQ1 = `UPDATE users SET permissions = JSON_ARRAY_APPEND(permissions, '$', '${permission}') WHERE \`email\` = '${email}';`;

  return await dbreq(REQ1);
}

export async function removeUserPermissions(
  email: string | undefined,
  permission: string,
) {
  if (!email) return;

  addLog("removeUserPermissions", email + " " + permission);

  const REQ2 = `UPDATE users SET permissions = JSON_REMOVE(permissions, JSON_UNQUOTE(JSON_SEARCH(permissions, 'one', '${permission}'))) WHERE email = '${email}';`;

  return await dbreq(REQ2);
}

export async function getUsersEmailByPermission(permission: string) {
  const response = (await dbreq(
    `SELECT email FROM users WHERE JSON_CONTAINS(permissions, '"${permission}"', '$')`,
  )) as any;
  let emails: string[] = [];
  response.map((user: { email: string }) => emails.push(user.email));
  return emails;
}

export async function getNotificationById(id: number) {
  const response = (await dbreq(
    `SELECT * FROM notifications WHERE id = ${id}`,
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
      `SELECT notifications FROM users WHERE email = '${email}'`,
    )) as any
  )[0].notifications as number[];
  return response;
}

export async function getUserNotifications() {
  const email = (await getAuth())?.email;
  if (!email) return;

  const notifications: any = await dbreq(
    `SELECT notifications FROM users WHERE email = '${email}'`,
  );

  const {
    new: newNotifs,
    read: readNotifs,
    sent: sentNotifs,
  } = notifications[0].notifications;

  const getNotifications = async (ids: number[]) => {
    if (!ids.length) return [];
    return await dbreq(
      `SELECT * FROM notifications WHERE id IN (${ids.join(",")})`,
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
      `SELECT service_workers FROM users WHERE email = '${email}'`,
    )) as any
  )[0].service_workers;

  users_service_workers = users_service_workers.filter(
    (sw: any) => sw.endpoint !== serviceWorker.endpoint,
  );

  const REQ1 = `UPDATE users SET service_workers = '${JSON.stringify(
    users_service_workers,
  )}' WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function getServiceWorkersByPermission(permission: string) {
  const users_service_workers: { service_workers: [] }[] = (await dbreq(
    `SELECT service_workers FROM users WHERE JSON_CONTAINS(permissions, '"${permission}"', '$')`,
  )) as any;
  let service_workers: any[] = [];
  users_service_workers.map((user: { service_workers: [] }) =>
    user.service_workers.map((sw: any) => service_workers.push(sw)),
  );

  return service_workers;
}

export async function getServiceWorkersByEmail(email: string) {
  const response = (await dbreq(
    `SELECT service_workers FROM users WHERE email = '${email}'`,
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
  addLog("newPush", email + " " + JSON.stringify(payload));
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
      `SELECT notifications FROM users WHERE email = '${email}'`,
    )) as any
  )[0].notifications.new;

  const filtered_new_notifications = new_notifications.filter(
    (nid: number) => nid !== id,
  );

  const REQ1 = `UPDATE users SET notifications = JSON_SET(notifications, '$.new', JSON_ARRAY(${filtered_new_notifications.join(
    ", ",
  )})) WHERE email = '${email}';`;

  const REQ2 = `UPDATE users SET notifications = JSON_SET(notifications, '$.read', JSON_ARRAY_APPEND(JSON_EXTRACT(notifications, '$.read'), '$', ${id})) WHERE email = '${email}';`;

  return await dbreq(REQ1), await dbreq(REQ2);
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

  const REQ1 = `INSERT INTO notifications (title, message, sender_email, receiving_emails, time) VALUES ('${title}', '${message}', '${sender_email}', '${
    '["' + valid_receiving_emails.join('", "') + '"]'
  }', '${new Date().toJSON()}');`;
  const REQ2 = `SET @notification_id = LAST_INSERT_ID();`;
  const REQ3 = `UPDATE users JOIN (SELECT receiving_emails FROM notifications WHERE id = @notification_id) AS n ON JSON_CONTAINS(n.receiving_emails, JSON_QUOTE(users.email), '$') SET users.notifications = JSON_SET(users.notifications, '$.new', JSON_ARRAY_APPEND(JSON_EXTRACT(users.notifications, '$.new'), '$', CAST(@notification_id AS JSON)));`;
  const REQ4 = `SELECT * FROM notifications WHERE id = @notification_id;`;
  // Add the notification to the sender's sent notifications
  const REQ5 = `UPDATE users SET notifications = JSON_SET(notifications, '$.sent', JSON_ARRAY_APPEND(JSON_EXTRACT(notifications, '$.sent'), '$', CAST(@notification_id AS JSON))) WHERE email = '${sender_email}';`;

  const MAINRRQ = [REQ1, REQ2, REQ3, REQ4, REQ5];

  const response = await multipledbreq(MAINRRQ);

  valid_receiving_emails.map(async (email) => {
    if (payload !== "") {
      await newPush(email, payload);
    } else {
      await newPush(
        email,
        JSON.stringify({
          title: sender_email + " üzenetet küldött",
          message: title,
          body: title,
          icon: "favicon.ico",
          badge: "favicon-16x16.ico",
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
    }),
  );

  return await newNotificationByEmails(title, message, valid_receiving_emails);
}

export async function addTicket(email: string, ticket: string) {
  addLog("addTicket", email + " " + ticket);
  const REQ1 = `UPDATE users SET tickets = JSON_ARRAY_APPEND(tickets, '$', '${ticket}') WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function removeTicket(ticket: string) {
  addLog("removeTicket", ticket);
  const email = (await getAuth())?.email;
  const REQ1 = `UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', '${ticket}'))) WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function deleteTicket(email: string, ticket: string) {
  addLog("deleteTicket", email + " " + ticket);
  const REQ1 = `UPDATE users SET tickets = JSON_REMOVE(tickets, JSON_UNQUOTE(JSON_SEARCH(tickets, 'one', '${ticket}'))) WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function editMySettings({
  settings,
}: {
  settings: {
    nickname?: string;
    EJG_code?: string;
    food_menu?: string;
    push_perission?: boolean;
    push_about_games?: boolean;
  };
}) {
  const user = await getAuth();
  if (!user) return "No user";
  const email = user?.email;

  addLog("editMySettings");

  let requests: string[] = [];

  const valid_EJG_code = user.tickets.includes("EJG_code_edit")
    ? settings.EJG_code
    : user.EJG_code;

  if (
    user.tickets.includes("EJG_code_edit") &&
    user.EJG_code != settings.EJG_code
  ) {
    await removeTicket("EJG_code_edit");
  }

  console.log(JSON.stringify(settings));

  if (settings.push_perission !== undefined)
    requests.push(
      `UPDATE users SET push_perission = ${
        settings.push_perission ? 1 : 0
      } WHERE email = '${email}';`,
    );

  if (settings.push_about_games !== undefined)
    requests.push(
      `UPDATE users SET push_about_games = ${
        settings.push_about_games ? 1 : 0
      } WHERE email = '${email}';`,
    );

  const newNickname = settings.nickname ?? user.nickname;
  const newFoodMenu = settings.food_menu ?? user.food_menu;

  const REQ1 = `UPDATE users SET nickname = '${
    newNickname
  }', EJG_code = '${valid_EJG_code}', food_menu = ${
    newFoodMenu == null ? null : "'" + newFoodMenu + "'"
  } WHERE email = '${email}';`;

  requests.push(REQ1);
  console.log(requests);
  console.log(await multipledbreq(requests));

  return null;
}

export async function getPageSettings() {
  return (
    (await dbreq(`SELECT * FROM settings WHERE name = "now";`)) as any
  )[0] as PageSettingsType;
}

export async function editPageSettings(settings: PageSettingsType) {
  const REQ1 = `UPDATE settings SET headspace = ${settings.headspace}, livescore = ${settings.livescore} WHERE name = 'now';`;

  return await dbreq(REQ1);
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
    `SELECT * FROM timetable WHERE JSON_CONTAINS(JSON_EXTRACT(EJG_classes, '$[1]'), '"${EJG_class}"', '$')`,
  )) as Lesson[];

  response.forEach((lesson) => {
    lesson.teacher = lesson.teacher.replace(/\n/g, " ");
  });

  return response;
}

export async function setHiddenLessons(lessonsId: number[]) {
  const email = (await getAuth())?.email;
  const REQ1 = `UPDATE users SET hidden_lessons = '${JSON.stringify(
    lessonsId,
  )}' WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function getDefaultGroup() {
  const email = (await getAuth())?.email;
  const REQ1 = `SELECT default_group FROM users WHERE email = '${email}';`;

  return ((await dbreq(REQ1)) as any)[0].default_group;
}

export async function editDefaultGroup(group: number | null) {
  const email = (await getAuth())?.email;
  const REQ1 = `UPDATE users SET default_group = ${group} WHERE email = '${email}';`;

  return await dbreq(REQ1);
}

export async function getMatch(id: number) {
  return (
    (await dbreq(`SELECT * FROM matches WHERE id = ${id};`)) as any
  )[0] as Match;
}

export async function getMatches() {
  return (await dbreq(`SELECT * FROM matches;`)) as Match[];
}

export async function getComingMatch() {
  const matchId = (await getPageSettings()).livescore;
  return await getMatch(matchId);
}

export async function updateMatch(id: number, match: Match) {
  // If there is no match with the given id, make a new one
  if (!(await getMatch(id))) {
    const REQ1 = `INSERT INTO matches (id, url, team1, team2, team_short1, team_short2, score1, score2, status, time, start_time, end_time) VALUES (${id}, '${match.url}', '${match.team1}', '${match.team2}', '${match.team_short1}', '${match.team_short2}', ${match.score1}, ${match.score2}, '${match.status}', '${match.time}', '${match.start_time}', '${match.end_time}');`;
    return await dbreq(REQ1);
  }
  const sendNotification = true;
  const REQ1 = `UPDATE matches SET team1 = '${match.team1}', team2 = '${
    match.team2
  }', team_short1 = '${match.team_short1}', team_short2 = '${
    match.team_short2
  }', score1 = ${match.score1}, score2 = ${match.score2}, status = '${
    match.status
  }', time = "${match.time}", start_time = '${match.start_time}', end_time = '${
    match.end_time || match.start_time
  }' WHERE id = ${id};`;

  if (sendNotification) {
    console.log("Sending notification");
    const oldMatch = await getMatch(id);
    const notificationPermission = "tester";
    if (match.status === "Finished" && oldMatch.status !== "Finished") {
      console.log("Sending notification - Game finished");
      const title = `${match.team_short1} - ${match.team_short2}`;
      const message = `A meccsnek vége. Az eredmény: ${match.team_short1} ${match.score1} - ${match.score2} ${match.team_short2}`;
      const receiving_emails = await getUsersEmailByPermission(
        notificationPermission,
      );
      receiving_emails.map(async (email) => {
        await newPush(
          email,
          JSON.stringify({
            title: title,
            body: message,
            icon: "soccer-ball.png",
            badge: "soccer-ball.png",
          }),
        );
      });
      console.log("Notification sent - Game finished");
    } else if (match.status === "Live" && oldMatch.status !== "Live") {
      console.log("Sending notification - Game started");
      const title = `${match.team_short1} - ${match.team_short2}`;
      const message = `A meccs elkezdődött! ${match.team1} vs ${match.team2}`;
      const receiving_emails = await getUsersEmailByPermission(
        notificationPermission,
      );
      receiving_emails.map(async (email) => {
        await newPush(
          email,
          JSON.stringify({
            title: title,
            body: message,
            icon: "soccer-ball.png",
            badge: "soccer-ball.png",
          }),
        );
      });
      console.log("Notification sent - Game started");
    } else if (match.score1 !== oldMatch.score1) {
      console.log("Sending notification - Goal");
      const title = `Gól! | ${match.team_short1} - ${match.team_short2}`;
      const message = `${match.team1} gólt lőtt! Az aktuális állás: ${match.team_short1} ${match.score1} - ${match.score2} ${match.team_short2}`;
      const receiving_emails = await getUsersEmailByPermission(
        notificationPermission,
      );
      receiving_emails.map(async (email) => {
        await newPush(
          email,
          JSON.stringify({
            title: title,
            body: message,
            icon: match.image1,
            badge: "soccer-ball.png",
          }),
        );
      });
      console.log("Notification sent - Goal");
    } else if (match.score2 !== oldMatch.score2) {
      console.log("Sending notification - Goal");
      const title = `Gól! | ${match.team_short1} - ${match.team_short2}`;
      const message = `${match.team2} gólt lőtt! Az aktuális állás: ${match.team_short1} ${match.score1} - ${match.score2} ${match.team_short2}`;
      const receiving_emails = await getUsersEmailByPermission(
        notificationPermission,
      );

      receiving_emails.map(async (email) => {
        await newPush(
          email,
          JSON.stringify({
            title: title,
            body: message,
            icon: match.image2,
            badge: "soccer-ball.png",
          }),
        );
      });
      console.log("Notification sent - Goal");
    }
  }

  return await dbreq(REQ1);
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
      `SELECT DISTINCT room FROM timetable WHERE day = '${day}' AND start_time = '${time}';`,
    )) as { room: string }[]
  ).map((room) => room.room);

  return rooms.filter((room) => !occupiedRooms.includes(room));
}

export const apireq = {
  getPageSettings: { req: getPageSettings, perm: [] },
  editPageSettings: { req: editPageSettings, perm: ["admin"] },
  getUsers: { req: getUsers, perm: ["admin", "tester"] },
  getUsersName: { req: getUsersName, perm: ["student"] },
  getUser: { req: getUser, perm: [] },
  getAllUsersNameByEmail: { req: getAllUsersNameByEmail, perm: ["user"] },
  getAuth: { req: getAuth, perm: ["user"] },
  hasPermission: { req: hasPermission, perm: [] },
  getUsersEmail: { req: getUsersEmail, perm: ["admin", "tester"] },
  getEvents: { req: getEvents, perm: [] },
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
  setHiddenLessons: { req: setHiddenLessons, perm: ["user"] },
  getDefaultGroup: { req: getDefaultGroup, perm: ["user"] },
  editDefaultGroup: { req: editDefaultGroup, perm: ["user"] },
  addTicket: { req: addTicket, perm: ["admin"] },
  deleteTicket: { req: deleteTicket, perm: ["admin"] },
  getFreeRooms: { req: getFreeRooms, perm: ["user"] },
  getMatch: { req: getMatch, perm: ["user"] },
  getMatches: { req: getMatches, perm: ["user"] },
  updateMatch: { req: updateMatch, perm: ["admin"] },
  getComingMatch: { req: getComingMatch, perm: ["user"] },
  getUserLogs: { req: getUserLogs, perm: ["admin"] },
} as const;

export const apioptions = Object.keys(apireq) as (keyof typeof apireq)[];

export type apireqType = (typeof apioptions)[number];

export const defaultApiReq = async (req: string, body: any) => {
  if (req === "getUsers") return await getUsers();
  else if (req === "getAuth") return await getAuth();
  else if (req === "getPageSettings") return await getPageSettings();
  else if (req === "editPageSettings")
    return await editPageSettings(body.settings);
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
  } else if (req === "getMyClassTimetable") {
    const { EJG_class } = body;
    return await getMyClassTimetable(EJG_class);
  } else if (req === "setHiddenLessons") {
    const { lessonsId } = body;
    return await setHiddenLessons(lessonsId);
  } else if (req === "getDefaultGroup") {
    return await getDefaultGroup();
  } else if (req === "editDefaultGroup") {
    const { group } = body;
    return await editDefaultGroup(group);
  } else if (req === "addTicket") {
    const { email, ticket } = body;
    return await addTicket(email, ticket);
  } else if (req === "deleteTicket") {
    const { email, ticket } = body;
    return await deleteTicket(email, ticket);
  } else if (req === "getFreeRooms") {
    const { day, time } = body;
    return await getFreeRooms(day, time);
  } else if (req === "getMatch") {
    const { id } = body;
    return await getMatch(id);
  } else if (req === "getMatches") {
    return await getMatches();
  } else if (req === "updateMatch") {
    const { id, match } = body;
    return await updateMatch(id, match);
  } else if (req === "getComingMatch") {
    return await getComingMatch();
  } else if (req === "getUserLogs") {
    const { email } = body;
    return await getUserLogs(email);
  } else return "No such request";
};
