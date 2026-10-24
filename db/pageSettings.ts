import { dbreq } from "./db";
import { addLog, UserType } from "./dbreq";
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
  void addLog("editPageSettings", selfUser.email);

  return await dbreq(
    `UPDATE settings SET headspace = ?, livescore = ? WHERE name = 'now';`,
    [settings.headspace, settings.livescore],
  );
}
