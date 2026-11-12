import MainLayout from "@/app/mainLayoutWithLogLoginProp";
import { addLog, addUserPermission, getAuth } from "@/db/dbreq";
import { headers } from "next/headers";

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

export default async function ThankYouForSubmitting() {
  const selfUser = await getAuth();

  const email = selfUser?.email ?? "unknown email";
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? // proxy mögül
    (await headers()).get("x-real-ip") ??
    "unknown ip";

  void addLog("merch_form_submitted", `email: ${email}, ip: ${ip}`);
  if (selfUser) void addUserPermission(selfUser.email, "merch_voted");

  return (
    <MainLayout logLogin={logLogin}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">Köszönjük a szavazatod!</h1>
        <p className="text-lg">
          A nyertes design-csomagról a DÖ e-mailben fogja a diákságot
          értesíteni.
        </p>
      </div>
    </MainLayout>
  );
}
