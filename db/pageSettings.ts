import { dbreq } from "./db";
import { UserType } from "./dbreq";
import { gate } from "./permissions";

export interface PageSettingsType {
  id: number;
  name: string;
  headspace: 0 | 1;
  livescore: number;
}

export async function getPageSettings(): Promise<PageSettingsType> {
  try {
    return (await dbreq(`SELECT * FROM settings WHERE name = "now";`))[0];
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

export async function editPageSettings(
  selfUser: UserType,
  settings: PageSettingsType,
) {
  gate(selfUser, "matchOrganiser");
  const query = `UPDATE settings SET headspace = ${settings.headspace}, livescore = ${settings.livescore} WHERE name = 'now';`;
  return await dbreq(query);
}
