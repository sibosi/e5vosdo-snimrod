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
  await dbreq(query);
};

export const editTeam = async (selfUser: UserType, team: Team) => {
  gate(selfUser, "admin");
  const query = `UPDATE teams SET name = '${team.name}', image_url = '${team.image_url}' WHERE id = ${team.id}`;
  await dbreq(query);
};

export const deleteTeam = async (selfUser: UserType, id: number) => {
  gate(selfUser, "admin");
  const query = `DELETE FROM teams WHERE id = ${id}`;
  await dbreq(query);
};

export const pinMatch = async (selfUser: UserType, id: number) => {
  gate(selfUser, "admin");
  const query = `UPDATE settings SET headspace = ${1}, livescore = ${id} WHERE name = 'now';`;
  await dbreq(query);
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
  const query = `INSERT INTO matches (team1_id, team2_id, team1_score, team2_score, datetime) VALUES (${match.team1_id}, ${match.team2_id}, ${match.team1_score}, ${match.team2_score}, '${match.datetime}')`;
  await dbreq(query);
};

export const editMatch = async (selfUser: UserType, match: Match) => {
  gate(selfUser, "matchOrganiser");
  const query = `UPDATE matches SET team1_score = ${match.team1_score}, team2_score = ${match.team2_score}, status = '${match.status}', datetime = '${match.datetime}', start_time = '${match.start_time}', end_time = '${match.end_time}' WHERE id = ${match.id}`;
  return await dbreq(query);
};

export const deleteMatch = async (selfUser: UserType, id: number) => {
  gate(selfUser, "matchOrganiser");
  const query = `DELETE FROM matches WHERE id = ${id}`;
  await dbreq(query);
};
