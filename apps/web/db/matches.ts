import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface Team {
  id: number;
  name: string;
  image_url: string;
  team_leader: string;
  group_letter: string;
}

export interface Match {
  id: number;
  group_letter: string;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  datetime: string;
  start_time: string;
  end_time: string;
  status: "pending" | "live" | "finished";
}

export const getTeams = async () => {
  const query = "SELECT * FROM teams";
  const result = await dbreq(query);
  return result;
};

export const getTeam = async (selfUser: UserType, id: number) => {
  const query = `SELECT * FROM teams WHERE id = ${id}`;
  const result = await dbreq(query);
  return result[0];
};

export const createTeam = async (selfUser: UserType, team: Team) => {
  gate(selfUser, "admin");
  const query = `INSERT INTO teams (name, image_url) VALUES ('${team.name}', '${team.image_url}')`;
  return await dbreq(query);
};

export const editTeam = async (selfUser: UserType, team: Team) => {
  gate(selfUser, "admin");
  const query = `UPDATE teams SET name = '${team.name}', image_url = '${team.image_url}' WHERE id = ${team.id}`;
  return await dbreq(query);
};

export const deleteTeam = async (selfUser: UserType, id: number) => {
  gate(selfUser, "admin");
  const query = `DELETE FROM teams WHERE id = ${id}`;
  return await dbreq(query);
};

export const pinMatch = async (selfUser: UserType, id: number) => {
  gate(selfUser, "admin");
  const query = `UPDATE settings SET headspace = ${1}, livescore = ${id} WHERE name = 'now';`;
  return await dbreq(query);
};

export const getMatches = async () => {
  const query = "SELECT * FROM matches";
  const result = await dbreq(query);
  return result;
};

export const getMatch = async (id: number) => {
  const query = `SELECT * FROM matches WHERE id = ${id}`;
  const result = await dbreq(query);
  return result[0];
};

export const getNextMatch = async () => {
  const query =
    "SELECT * FROM matches WHERE status IN ('pending', 'live') ORDER BY datetime LIMIT 1";
  const result = await dbreq(query);
  return result[0];
};

export const createMatch = async (selfUser: UserType, match: Match) => {
  gate(selfUser, "matchOrganiser");
  const query = `INSERT INTO matches (group_letter, team1_id, team2_id, team1_score, team2_score, datetime, start_time, end_time, status) VALUES ('${match.group_letter}', ${match.team1_id}, ${match.team2_id}, ${match.team1_score}, ${match.team2_score}, '${match.datetime}', '${match.start_time}', '${match.end_time}', '${match.status}')`;
  return await dbreq(query);
};

export const editMatch = async (selfUser: UserType, match: Match) => {
  gate(selfUser, "matchOrganiser");
  const query = `UPDATE matches SET group_letter = '${match.group_letter}', team1_id = ${match.team1_id}, team2_id = ${match.team2_id}, team1_score = ${match.team1_score}, team2_score = ${match.team2_score}, datetime = '${match.datetime}', start_time = '${match.start_time}', end_time = '${match.end_time}', status = '${match.status}' WHERE id = ${match.id}`;
  return await dbreq(query);
};

export const deleteMatch = async (selfUser: UserType, id: number) => {
  gate(selfUser, "matchOrganiser");
  const query = `DELETE FROM matches WHERE id = ${id}`;
  return await dbreq(query);
};

/** From the old codebase
 *
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
 */
