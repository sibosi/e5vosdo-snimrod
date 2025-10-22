import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { MenuInSection } from "@/components/menza/menu";
import { getAuth, UserType } from "@/db/dbreq";
import Tray from "@/components/tray";
import LoginButton from "@/components/LoginButton";
import Carousel from "@/components/home/carousel";
import { Alert, Button } from "@heroui/react";
import { getCarouselEvents } from "@/db/event";
import tanarokJSON from "@/public/teachers.json";

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
      {tanarokJSON.includes(selfUser?.email || "") && (
        <a href="/tanari/jelenletek">
          <Alert className="my-4 text-left text-xl" color="success">
            Tanári státusz felismerve! A jelenléti ívek megtekintéséhez
            kattintson ide!
          </Alert>
        </a>
      )}



<div className="responsive-video">
  <iframe title="KMT" src="https://www.youtube.com/embed/BLGtv4RRVSY" frameborder="0" allowfullscreen></iframe>
</div>


      <a href="https://docs.google.com/spreadsheets/d/1wZtmbTTELxQK0nQJweKbURFqNOboOwyyR9WGdB9Fc6E/edit?usp=sharing">
        <Alert className="mt-4 text-left" color="secondary">
          Az sporteredmények vagy a programok megtekintéséhez kattints ide!
        </Alert>
      </a>

      <a href="/osztaly-programok" className="my-4">
        <div className="my-4 rounded-xl bg-selfsecondary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
          <h2 className="text-xl font-bold md:text-2xl">
            Szavazz a keddi programsáv termeire!
          </h2>
          <p className="mt-1 text-xs opacity-90 md:text-sm">
            Kattints ide, válaszd ki az 5 kedvenc programodat, és szavazz rájuk!
          </p>
          <div className="mt-3">
            <Button
              as="a"
              href="/osztaly-programok"
              size="sm"
              color="secondary"
              variant="solid"
            >
              Szavazz kedvenceidre! 🗳️
            </Button>
          </div>
        </div>
      </a>

      <a href="https://forms.gle/85zZFTTP1aqPaaJf6" className="my-4">
        <div className="my-4 rounded-xl bg-selfsecondary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
          <h2 className="text-xl font-bold md:text-2xl">
            Tetszettek a keddi előadások?
          </h2>
          <p className="mt-1 text-xs opacity-90 md:text-sm">
            A DÖ kiemelt figyelmet fordít a diákok visszajelzéseire. Kérjük,
            fejtsd ki a véleményedet a kedden látott előadásokról!
          </p>
          <div className="mt-3">
            <Button
              as="a"
              href="https://forms.gle/85zZFTTP1aqPaaJf6"
              size="sm"
              color="secondary"
              variant="solid"
            >
              Visszajelzést küldök! 🗳️
            </Button>
          </div>
        </div>
      </a>

      <div className="my-4 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Litkai Gergely előadása (9:00-10:30)
        </h2>
        <p className="mt-1 text-xs opacity-90 md:text-sm">
          Litkai Gergely előadására a tornateremben kerül sor. Mindenkit
          szeretettel várunk!
        </p>
      </div>

      <div className="my-4 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Belsős kihívások (11:00-12:30)
        </h2>
        <p className="mt-1 text-xs opacity-90 md:text-sm">
          Az osztályok kihívásokat teljesíthetnek az iskolán belül.
        </p>
      </div>

      {siteConfig.pageSections["menza"] != "hidden" && (
        <MenuInSection selfUser={selfUser} />
      )}

      <div className="my-4 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Külsős kihívások (13:30-17:30)
        </h2>
        <p className="mt-1 text-xs opacity-90 md:text-sm">
          Az osztályok iskolán belüli és iskolán kívüli kihívásokat
          teljesítenek, kisebb csapatokban.
        </p>
      </div>

      <div className="my-4 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Kihívások begyűjtése (16:00-17:30)
        </h2>
        <p className="mt-1 text-xs opacity-90 md:text-sm">
          Az osztályok iskolán belüli és iskolán kívüli kihívásokat
          teljesítenek, kisebb csapatokban.
        </p>
      </div>

      <div className="my-4 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-4 text-foreground shadow-lg md:p-6">
        <h2 className="text-xl font-bold md:text-2xl">
          Ki Mit Tud? (18:00-21:30)
        </h2>
        <p className="mt-1 text-xs opacity-90 md:text-sm">
          Iskolánk diákjai különféle produkciókkal lépnek fel a díszteremben.
        </p>
      </div>

      <p className="hidden text-center italic">„Bömbi a király”</p>
      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
