import { auth } from "@/auth";
import { dbreq, multipledbreq } from "./db";
import webPush from "web-push";
import { CarouselItemProps } from "@/components/home/carousel";

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

export interface PresentationType {
  id: number;
  name: string;
  description: string;
  slot_id: number;
  location_id: number;
  signup_type: string;
  is_competition: boolean;
  organiser: string;
  capacity: number;
  starts_at: string;
  ends_at: string;
  signup_deadline: string;
  min_team_size: number;
  max_team_size: number;
  root_parent: number;
  direct_child: number;
  remaining_capacity: number;
  room?: string;
}

export interface SignUpType {
  email: string;
  slot_id: number;
  presentation_id: number;
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
  return (response as { name: string }[]).map((user) => user.name);
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
  (response as []).map((user: User) => {
    users[user.email] = user.name;
  });
  return users;
}

export async function getAuth(email?: string | undefined) {
  try {
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
  } catch (e) {
    console.log(e);
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

  await dbreq(REQ1);
  await dbreq(REQ2);

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

export async function getUsersEmailWherePushAboutGames() {
  const response = (await dbreq(
    `SELECT email FROM users WHERE push_about_games = 1`,
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
  users_service_workers.forEach((user: { service_workers: [] }) =>
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
  const isExist =
    ((await dbreq(`SELECT * FROM push_auths WHERE auth = '${auth}';`)) as any[])
      .length > 0;
  if (isExist) return true;
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

  return [await dbreq(REQ1), await dbreq(REQ2)];
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

  await multipledbreq(MAINRRQ);

  valid_receiving_emails.forEach(async (email) => {
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
  addLog("newNotificationByNames", sender_email + " " + title + " " + message);
  let receiving_emails: string[] = [];
  let valid_receiving_emails: string[] = [];

  const usersNameAndEmail: Array<{ name: string; email: string }> =
    (await dbreq(`SELECT name, email FROM users`)) as any;

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
    push_permission?: boolean;
    push_about_games?: boolean;
    push_about_timetable?: boolean;
  };
}) {
  const selfUser = await getAuth();
  if (!selfUser) return "No user";
  const email = selfUser?.email;

  addLog("editMySettings");

  let request = "UPDATE users SET ";

  const valid_EJG_code = selfUser.tickets.includes("EJG_code_edit")
    ? settings.EJG_code
    : selfUser.EJG_code;

  if (
    selfUser.tickets.includes("EJG_code_edit") &&
    selfUser.EJG_code != settings.EJG_code
  ) {
    await removeTicket("EJG_code_edit");
    request += `EJG_code = '${valid_EJG_code}', `;
  }

  console.log(JSON.stringify(settings));

  if (settings.push_permission !== undefined)
    request += `push_permission = ${settings.push_permission ? 1 : 0}, `;

  if (settings.push_about_games !== undefined)
    request += `push_about_games = ${settings.push_about_games ? 1 : 0}, `;
  if (settings.push_about_timetable !== undefined)
    request += `push_about_timetable = ${settings.push_about_timetable ? 1 : 0}, `;

  if (settings.nickname) request += `nickname = '${settings.nickname}', `;
  if (settings.food_menu !== undefined)
    request += `food_menu = ${
      ["A", "B"].includes(settings.food_menu)
        ? "'" + settings.food_menu + "'"
        : "NULL"
    }, `;

  if (request === "UPDATE users SET ") return "No changes";
  request = request.slice(0, -2);
  request += ` WHERE email = '${email}';`;

  console.log(request);
  console.log(await dbreq(request));

  return null;
}

export async function getPageSettings() {
  try {
    return (
      (await dbreq(`SELECT * FROM settings WHERE name = "now";`)) as any
    )[0] as PageSettingsType;
  } catch (e) {
    console.log(e);
    return {
      id: 0,
      name: "now",
      headspace: 0,
      livescore: 0,
    };
  }
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
    const VERB = "kosarat dobott"; // gólt lőtt
    const TITLE = "KOSÁR!"; // GÓL!
    // const notificationPermission = "tester";
    const receiving_emails = await getUsersEmailWherePushAboutGames();
    // await getUsersEmailByPermission(notificationPermission);

    if (match.id !== oldMatch.id || match.status === "Upcoming")
      return await dbreq(REQ1);
    if (match.status === "Finished" && oldMatch.status !== "Finished") {
      console.log("Sending notification - Game finished");
      const title = `${match.team_short1} - ${match.team_short2}`;
      const message = `A meccsnek vége. Az eredmény: ${match.team_short1} ${match.score1} - ${match.score2} ${match.team_short2}`;

      receiving_emails.forEach(async (email) => {
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

      receiving_emails.forEach(async (email) => {
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
      const title = `${TITLE}! | ${match.team_short1} - ${match.team_short2}`;
      const message = `${match.team1} ${VERB}! Az aktuális állás: ${match.team_short1} ${match.score1} - ${match.score2} ${match.team_short2}`;

      receiving_emails.forEach(async (email) => {
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
      const title = `${TITLE}! | ${match.team_short1} - ${match.team_short2}`;
      const message = `${match.team2} ${VERB}! Az aktuális állás: ${match.team_short1} ${match.score1} - ${match.score2} ${match.team_short2}`;

      receiving_emails.forEach(async (email) => {
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

export async function getCarousel() {
  return (await dbreq(`SELECT * FROM carousel;`)) as CarouselItemProps[];
}

export async function getAlerts() {
  return (await dbreq(`SELECT * FROM alerts;`)) as AlertType[];
}

export async function getPresentations() {
  return (await dbreq(`SELECT * FROM presentations;`)) as PresentationType[];
}

export async function signUpForPresentation(
  slot_id: number,
  presentation_id: number | "NULL",
) {
  const email = (await getAuth())?.email;

  async function checkHasCapacity(presentation_id: number) {
    const result = (await dbreq(
      `SELECT remaining_capacity FROM presentations WHERE id = ${presentation_id};`,
    )) as { remaining_capacity: number }[];

    return result.length > 0 && result[0].remaining_capacity > 0;
  }

  try {
    // Ellenőrizzük, hogy a felhasználó már jelentkezett-e
    const check = (await dbreq(
      `SELECT * FROM signups_new WHERE email = '${email}' AND slot_id = ${slot_id};`,
    )) as SignUpType[];

    if (presentation_id === "NULL") {
      // Jelentkezés törlése
      const REQ1 = `UPDATE presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = (SELECT presentation_id FROM signups_new WHERE email = '${email}' AND slot_id = ${slot_id}) AND remaining_capacity < capacity;`;
      const REQ2 = `DELETE FROM signups_new WHERE email = '${email}' AND slot_id = ${slot_id};`;

      const response = await multipledbreq([REQ1, REQ2]);
      console.log(response);
      return response;
    }

    if (check.length > 0) {
      // Ha már van jelentkezés erre a slotra, előbb növeljük a korábbi előadás kapacitását, majd csökkentjük az új előadásét
      if (!(await checkHasCapacity(presentation_id))) {
        return { success: false, message: "Nincs elég kapacitás" };
      }

      const REQ1 = `UPDATE presentations SET remaining_capacity = remaining_capacity + 1 WHERE id = (SELECT presentation_id FROM signups_new WHERE email = '${email}' AND slot_id = ${slot_id}) AND remaining_capacity < capacity;`;
      const REQ2 = `UPDATE signups_new SET presentation_id = ${presentation_id} WHERE email = '${email}' AND slot_id = ${slot_id};`;
      const REQ3 = `UPDATE presentations SET remaining_capacity = remaining_capacity - 1 WHERE id = ${presentation_id} AND remaining_capacity > 0;`;

      const response = await multipledbreq([REQ1, REQ2, REQ3]);
      console.log(response);
      return response;
    } else {
      // Új jelentkezés esetén előbb ellenőrizzük a kapacitást
      if (!(await checkHasCapacity(presentation_id))) {
        return { success: false, message: "Nincs elég kapacitás" };
      }

      const REQ1 = `INSERT INTO signups_new (email, slot_id, presentation_id) VALUES ('${email}', ${slot_id}, ${presentation_id});`;
      const REQ2 = `UPDATE presentations SET remaining_capacity = remaining_capacity - 1 WHERE id = ${presentation_id} AND remaining_capacity > 0;`;

      const response = await multipledbreq([REQ1, REQ2]);
      console.log(response);
      return response;
    }
  } catch (error) {
    console.error("SQL hiba történt:", error);
    return { success: false, message: "SQL hiba történt", error };
  }
}

export async function getMyPresentetions() {
  const email = (await getAuth())?.email;
  const response = await dbreq(
    `SELECT * FROM signups_new WHERE email = '${email}';`,
  );
  return response;
}

export async function getMembersAtPresentation(presentation_id: number) {
  const response = (await dbreq(
    `SELECT email FROM signups_new WHERE presentation_id = ${presentation_id};`,
  )) as { email: string }[];
  // Format it
  const emails = response.map((item: { email: string }) => item.email);

  const uniqueEmails = Array.from(new Set(emails));

  return uniqueEmails;
}

export async function getPresentationsByIds(ids: number[]) {
  const response = await dbreq(
    `SELECT * FROM presentations WHERE id IN (${ids.join(", ")});`,
  );
  return response;
}

export async function getMyPre() {
  const email = (await getAuth())?.email;
  const response = (await dbreq(
    `SELECT * FROM signups_new WHERE email = '${email}';`,
  )) as SignUpType[];

  /**
   * goal type: {
   *  [key: slot_id]: presentation_id[]
   * }
   */
  console.log(JSON.stringify(response));
  const goal: { [key: number]: number[] } = {};
  response.forEach((item: { slot_id: number; presentation_id: number }) => {
    if (goal[item.slot_id]) goal[item.slot_id].push(item.presentation_id);
    else goal[item.slot_id] = [item.presentation_id];
  });

  return goal;
}

export const apireq = {
  getPageSettings: { req: getPageSettings, perm: [] },
  editPageSettings: { req: editPageSettings, perm: ["admin"] },
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
  getCarousel: { req: getCarousel, perm: ["user"] },
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
  else if (req === "getStudentUsers") return await getStudentUsers();
  else if (req === "getAdminUsers") return await getAdminUsers();
  else if (req === "getUsersEmail") return await getUsersEmail();
  else if (req === "getAdminUsersEmail") return await getAdminUsersEmail();
  else if (req === "getCarousel") return await getCarousel();
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
