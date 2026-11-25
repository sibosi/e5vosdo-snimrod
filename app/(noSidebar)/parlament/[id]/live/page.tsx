import { redirect } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { getAuth, getAllUsersNameByEmail } from "@/db/dbreq";
import {
  getParlament,
  getParlamentApplicants,
  getParlamentParticipants,
} from "@/db/parlament";
import { EJG_CLASSES } from "@/public/getUserClass";
import { siteConfig } from "@/config/site";
import Countdown from "./countdown";
import SnowfallOverlay from "@/components/SnowfallOverlay";

type Props = {
  params: Promise<{ id: string }>;
};

const getDisplayName = (
  email: string,
  usersNameByEmail: Record<string, string | { name: string; class: string }>,
) => {
  const user = usersNameByEmail[email];
  return typeof user === "string" ? user : (user?.name ?? email);
};

export default async function LiveParlamentPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const parlamentId = Number(id);
  if (!Number.isInteger(parlamentId)) redirect("/parlament");

  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  try {
    const [parlament, participants, applicants, usersNameByEmail] =
      await Promise.all([
        getParlament(selfUser, parlamentId),
        getParlamentParticipants(selfUser, parlamentId),
        getParlamentApplicants(selfUser, parlamentId),
        getAllUsersNameByEmail(),
      ]);

    if (!parlament) {
      return <p className="p-6">A parlament nem található.</p>;
    }

    const startTime = new Date(parlament.date).getTime();
    if (!Number.isFinite(startTime)) {
      throw new Error(`Invalid start date for parlament ${parlamentId}`);
    }

    const appUrl = process.env.NEXTAUTH_URL || siteConfig.links.home;
    const registrationUrl = new URL(
      `/parlament/${parlamentId}`,
      appUrl,
    ).toString();
    const additionalClasses = [
      ...new Set([...Object.keys(participants), ...Object.keys(applicants)]),
    ].filter((group) => !EJG_CLASSES.includes(group));
    const allClasses = [...EJG_CLASSES, ...additionalClasses];

    return (
      <>
        <SnowfallOverlay />
        <main className="mx-auto grid w-full max-w-7xl gap-6 p-4 lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.5fr)]">
          <section className="flex flex-col items-center gap-5 rounded-2xl bg-foreground/5 p-6 text-center">
            <div>
              <h1 className="text-3xl font-bold">{parlament.title}</h1>
              <p className="mt-2 text-lg">
                Kezdés:{" "}
                {new Date(startTime).toLocaleString("hu-HU", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <QRCodeSVG
                value={registrationUrl}
                size={360}
                className="max-w-90 h-auto w-full"
                title="Parlamenti jelentkezés QR-kódja"
              />
            </div>
            <p className="text-lg font-semibold">Olvasd be a jelentkezéshez!</p>

            <Countdown startTime={startTime} />
          </section>

          <section className="grid min-w-0 divide-x divide-y divide-black border border-black sm:grid-cols-2">
            {allClasses.map((group) => {
              const presentEmails = participants[group] ?? [];
              const applicantEmails = (applicants[group] ?? []).filter(
                (email) => !presentEmails.includes(email),
              );
              const colorClass = presentEmails.length
                ? "bg-success-400"
                : applicantEmails.length
                  ? "bg-warning-400"
                  : "bg-default-100";

              return (
                <article
                  key={group}
                  className={`flex items-center gap-2 px-4 py-2 ${colorClass}`}
                >
                  <h3 className="text-xl font-bold">{group}</h3>
                  <div>
                    {presentEmails.length > 0 && (
                      <ul className="">
                        {presentEmails.map((email) => (
                          <li key={email}>
                            {getDisplayName(email, usersNameByEmail)} (jelen)
                          </li>
                        ))}
                      </ul>
                    )}
                    {applicantEmails.length > 0 && (
                      <ul className="">
                        {applicantEmails.map((email) => (
                          <li key={email}>
                            {getDisplayName(email, usersNameByEmail)}{" "}
                            (kérvényezte)
                          </li>
                        ))}
                      </ul>
                    )}
                    {!presentEmails.length && !applicantEmails.length && (
                      <p>Még nincs jelentkező</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </main>
      </>
    );
  } catch (error) {
    console.error("Error loading live parlament:", error);
    return (
      <p className="p-6 font-semibold text-danger">
        Hiba történt a parlament élő nézetének betöltése közben.
      </p>
    );
  }
}
