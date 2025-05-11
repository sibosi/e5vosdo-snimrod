import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import {
  QuickTeachers,
  QuickTeachersDev,
} from "@/components/helyettesites/quickteacher";
import { MenuInSection } from "@/components/menza/menu";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import { getAuth, UserType } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import Footer from "@/components/footer";
import Carousel from "@/components/home/carousel";
import { gate } from "@/db/permissions";
import HeadTimetable from "@/components/home/smartHead/headTimetable";
import { Chip } from "@heroui/react";

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
        Hiányolsz valamit? Netán a híreket?
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

      {gate(selfUser, "tester", "boolean") && (
        <Section
          title="Órarend"
          dropdownable={true}
          defaultStatus="closed"
          savable={true}
          chip={
            <Chip color="secondary" size="sm">
              Előnézet
            </Chip>
          }
        >
          <HeadTimetable selfUser={selfUser} />
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
