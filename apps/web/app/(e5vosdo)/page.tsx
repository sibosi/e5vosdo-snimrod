import "@/styles/bgimage.css";
import { siteConfig } from "@/apps/web/config/site";
import {
  QuickTeachers,
  QuickTeachersDev,
} from "@/apps/web/components/helyettesites/quickteacher";
import { MenuInSection } from "@/apps/web/components/menza/menu";
import { Section } from "@/apps/web/components/home/section";
import { Events } from "@/apps/web/components/events";
import { getAuth, UserType } from "@/apps/web/db/dbreq";
import Tray from "@/apps/web/components/tray";
import LoginButton from "@/apps/web/components/LoginButton";
import Footer from "@/apps/web/components/footer";
import Carousel from "@/apps/web/components/home/carousel";
import { gate } from "@/apps/web/db/permissions";
import HeadTimetable from "@/apps/web/components/home/smartHead/headTimetable";
import { Alert } from "@/apps/web/components/home/alert";

const PageHeadContent = ({
  selfUser,
}: {
  selfUser: UserType | null | undefined;
}) => {
  if (selfUser?.permissions.includes("user"))
    return <Carousel data={[]} selfUser={selfUser} />;

  if (selfUser === null)
    return (
      <Tray>
        <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
          Sajnáljuk, valamilyen hiba történt. Kérjük, próbáld újra később!
        </h1>
      </Tray>
    );

  return (
    <Tray>
      <h1 className="text-3xl font-bold text-selfprimary-900 md:text-4xl">
        Hiányolsz valamit? <br />
        Netán a híreket? <br />
        <span className="bg-gradient-to-r from-selfprimary-900 to-selfsecondary-300 bg-clip-text text-transparent">
          Vagy az órarendedet?
        </span>
        <LoginButton />
      </h1>
    </Tray>
  );
};

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      <PageHeadContent selfUser={selfUser} />

      {gate(selfUser, "user", "boolean") && (
        <Section
          title="Órarend"
          dropdownable={true}
          defaultStatus="closed"
          savable={true}
        >
          <div className="max-w-md">
            <Alert
              icon={false}
              className="border-selfsecondary-300 bg-selfsecondary-100"
            >
              Az alább látható órarend nem hivatalos és nem feltétlenül
              aktuális. A hivatalos ideiglenes órarend később, PDF-ben kerül
              kiküldésre.
            </Alert>
            {selfUser?.permissions.includes("user") && (
              <HeadTimetable selfUser={selfUser} />
            )}
          </div>
        </Section>
      )}

      {siteConfig.pageSections["helyettesitesek"] != "hidden" && (
        <Section
          title={"Helyettesítések"}
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["helyettesitesek"]}
          newVersion={<QuickTeachersDev />}
          oldVersionName="Lista"
          newVersionName="Rács"
        >
          <QuickTeachers />
        </Section>
      )}

      {siteConfig.pageSections["menza"] != "hidden" && (
        <MenuInSection selfUser={selfUser} />
      )}

      {siteConfig.pageSections["esemenyek"] != "hidden" && (
        <Section
          title="Események"
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["esemenyek"]}
        >
          <Events />
        </Section>
      )}

      <Section title="Keresel valamit?" dropdownable={false}>
        <Footer />
      </Section>

      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
