import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { MenuInSection } from "@/components/menza/menu";
import { getAuth, UserType } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import Carousel from "@/components/home/carousel";
import { Alert, Button } from "@heroui/react";
import { getCarouselEvents } from "@/db/event";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import MillioLepes from "@/components/home/milliolepes";
import Footer from "@/components/footer";

const PageHeadContent = async ({
  selfUser,
}: {
  selfUser: UserType | null | undefined;
}) => {
  if (selfUser?.permissions.includes("user"))
    return <Carousel data={await getCarouselEvents()} />;

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
      <div className="my-4 space-y-2 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-center text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Köszönjük, hogy velünk tartottatok az Eötvös Napokon! Mindenkinek
          kellemes őszi szünetet kívánunk!
        </h2>
        <Button
          as="a"
          href="https://forms.gle/vzJR12HQriv5B32r5"
          size="sm"
          color="secondary"
          variant="solid"
          className="w-full"
        >
          Kitöltöm az E5N visszajelzési űrlapot! 🗳️
        </Button>
      </div>

      <div className="responsive-video">
        <iframe
          title="KMT"
          src="https://www.youtube.com/embed/BLGtv4RRVSY"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>

      <div className="my-4 space-y-2 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Szavazz a keddi programsáv termeire!
        </h2>

        <Button
          as="a"
          href="/osztaly-programok"
          size="sm"
          color="secondary"
          variant="solid"
          className="w-full"
        >
          Szavazok a kedvenceimre! 🗳️
        </Button>
      </div>

      <div className="my-4 space-y-2 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Tetszettek a keddi előadások?
        </h2>
        <div className="mt-3">
          <Button
            as="a"
            href="https://forms.gle/85zZFTTP1aqPaaJf6"
            size="sm"
            color="secondary"
            variant="solid"
            className="w-full"
          >
            Visszajelzést küldök az előadásokról! 🗳️
          </Button>
        </div>
      </div>

      <Section title="Millió lépés" dropdownable={true}>
        <MillioLepes />
      </Section>

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

      <p className="hidden text-center italic">„Bömbi a király”</p>
      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
