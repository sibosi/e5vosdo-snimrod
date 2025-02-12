import { UserType } from "@/db/dbreq";

export interface SettingsProps {
  selfUser: UserType;
  setSaveSettings: (save: () => void) => void;
}

export default async function saveSettings({
  settings,
  reload,
}: {
  settings: any;
  reload?: boolean;
}) {
  const response = await fetch("/api/editMySettings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  });
  if (response.status === 200) {
    if (reload) {
      alert("Sikeresen mentetted a beállításaidat!");
      location.reload();
    }
  } else {
    alert("Hiba történt a mentés során.");
  }
}
