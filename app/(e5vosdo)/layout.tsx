import MainLayout, {
  dynamic,
  metadata,
  viewport,
} from "@/app/mainLayoutWithLogLoginProp";
import { addLog } from "@/db/dbreq";
import SnowfallOverlay from "@/components/SnowfallOverlay";
import { headers } from "next/headers";

export { dynamic, metadata, viewport };
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainLayout logLogin={logLogin}>
      <SnowfallOverlay />
      {children}
    </MainLayout>
  );
}
async function logLogin(email: string | undefined | null) {
  if (email) addLog("login", email);
  else
    addLog(
      "login",
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? // proxy mögül
        (await headers()).get("x-real-ip") ??
        "unknown ip",
    );
}
