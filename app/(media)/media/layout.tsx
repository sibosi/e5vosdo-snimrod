import MainLayout, {
  dynamic,
  metadata,
  viewport,
} from "@/app/mainLayoutWithLogLoginProp";
import { addLog } from "@/db/dbreq";
import { headers } from "next/headers";

export { dynamic, metadata, viewport };
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MainLayout logLogin={logLogin}>{children}</MainLayout>;
}

async function logLogin(email: string | undefined | null) {
  if (email) addLog("login media-gallery", email);
  else
    addLog(
      "login media-gallery",
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? // proxy mögül
        (await headers()).get("x-real-ip") ??
        "unknown ip",
    );
}
