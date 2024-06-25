import { dbreq } from "./db";

export interface User {
  name: string;
  email: string;
  image: string;
}

export function getUsers() {
  return dbreq(`SELECT * FROM \`users\``);
}

export async function updateUser(user: User | undefined) {
  if (!user) return;

  const REQ1 = `UPDATE \`users\` SET \`username\` = '${user.name}', \`email\` = '${user.email}', \`image\` = '${user.image}', \`last_login\` = NOW() WHERE \`email\` = '${user.email}';`;

  const REQ2 = `INSERT INTO \`users\` (\`username\`, \`email\`, \`image\`) SELECT '${user.name}', '${user.email}', '${user.image}' WHERE NOT EXISTS (SELECT *FROM \`users\`WHERE \`email\` = '${user.email}');`;

  return dbreq(REQ1), dbreq(REQ2);
}

export function getEvents() {
  return dbreq(`SELECT * FROM \`events\``);
}
