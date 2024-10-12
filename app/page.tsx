import "@/styles/bgimage.css";
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";

import clsx from "clsx";
import { QuickTeachers } from "@/components/helyettesites/quickteacher";
import { Menu } from "@/components/menza/menu";
import { Section } from "@/components/home/section";
import { Events } from "@/components/events";
import { RoomChanges } from "@/components/roomchanges/roomchanges";
import { getAuth } from "@/db/dbreq";
import TimetableDay from "@/components/timetable/timetableday";
import FreeRooms from "@/components/freeRooms";
import Welcome from "@/components/home/welcome";
import { Alert } from "@/components/home/alert";
import { ChipBeta } from "@/components/chips";
import SecialDay from "@/components/events/specialDay";
import HelloMessage from "@/components/home/helloMessage";
import MillioLepes from "@/components/home/milliolepes";
import Carousel from "@/components/home/carousel";

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      {!selfUser?.permissions.includes("tester") && (
        <HelloMessage selfUser={selfUser} />
      )}

      <Welcome />

      {selfUser?.permissions.includes("tester") && (
        <Carousel
          data={[
            {
              uri: "/events/KMT.jpg",
              title: ["KMT -", "Jelentkezz!"],
              description:
                "Kedves Diákok!\n\nIdén is elérkezett az idő, hogy megmutassátok, milyen rejtett tehetségekkel rendelkeztek! Az Eötvös Napok keretein belül megrendezésre kerül a már jól ismert KiMitTud? verseny, amelynek időpontja: október 24.\n\nEz egy fantasztikus lehetőség arra, hogy színpadra lépj, megcsillogtasd képességeidet, és egyúttal szórakoztasd is diáktársaidat! Akár énekelsz, táncolsz, zenélsz, előadói készségeid vannak, vagy valami igazán különlegeset tudsz – itt a helyed! Bármilyen műfajban indulhatsz, a lényeg, hogy merd megmutatni, mire vagy képes.\n\nNe hagyd ki ezt az izgalmas lehetőséget! Jelentkezni október 10-ig tudtok az alábbi linken keresztül, egyéni vagy csoportos produkció előadására:\n\n\nhttps://docs.google.com/forms/d/1fQQXcE0NwIF0PPrHfKoHW9bsAumsDOJU8cN4eCC1I6s/edit\n\n\nTedd emlékezetessé az idei Eötvös Napokat – légy te az, akire mindenki emlékezni fog!\n\nVárjuk a jelentkezéseiteket!\n\nÜdvözlettel,\nEötvös DÖ és TechTeam",
            },
            {
              uri: "/events/e5n_eloadas.jpg",
              title: ["E5N - Gyere", "előadónak!"],
              description:
                "Kedves Diákság!\n\nÖrömmel értesítünk benneteket, hogy az előadók jelentkezési határidejét október 17-ig meghosszabbítottuk. Szeretnénk mindenkinek további lehetőséget biztosítani, hogy csatlakozzon az Eötvös Napok előadásaihoz előadóként.\n\nAz előadássávok a következőek:\n\n\nCsütörtök (10.24.)\n\n9:00-9:45 - első előadássáv\n\n10:00-10:45 - második előadássáv\n\n\nPéntek(10.25.):\n\n10:15-11:00 - első előadássáv\n\n11:15-12:00 - második előadássáv\n\n\nA további részletek a forms leírásában találhatók, ha bármi egyéb kérdés, bizonytalanság vagy probléma merül fel az előadásokkal kapcsolatban, nyugodtan keressetek minket! \n\nhttps://forms.gle/uBgrZ4GVznmLaDfs5 \n\n\nÜdvözlettel,\n\nEötvös DÖ Kormány",
            },

            {
              title: ["Turi - Hozd el", "használt ruháid!"],
              uri: "/events/turi2.jpg",
              description:
                "Kedves Diákok!\n\nIdén is megrendezésre kerül az E5vösTuri az E5N idején. Kérünk mindenkit, hogy addig is gyűjtögesse, válogassa azokat ruháit, könyveit, társasait esetleg plüsseit, ékszereit, amiket úgy érzi behozna, hogy új gazdára találjanak!\n\nMi már nagyon várjuk, hogy sok lelkes arcot lássunk ismét a turiban!\n\nKövessetek be minket az e5vosturi instagram oldalon, további információkért!\n\nÜdv,\nE5vösTuri csapata",
            },
            {
              uri: "/events/mome.jpg",
              title: ["MOME", "workshop"],
              description:
                'Kedves Diákok!\n\nEgy momés tanárszakos halgató levelét továbbítom nektek:\n\n"Fogok tartani a MOME-n egy 4 alkalmas formatervező kurzus, ahol egy-egy egyedi kisállatház elkészítésén keresztül megtanítom a résztvevőknek hogy hogyan kell egy ötletet a tervezéstől a kivitelezésig végig vinni, és hogy az elkészítéshez szükséges eszközöket és szerszámokat hogyan kell szakszerűen használni. A tanfolyam végére mindenki hazaviheti a saját, 4 nap alatt elkészített kisállatházát, és a szakmai tudást, amit saját projekteknél alkalmazhat.\n\nAjánlom azoknak, akiket érdekel a formatervezés, barkácsolás, a MOME-ra készülnek, vagy csak szívesen kedveskednének háziállatuknak egy új házikóval.\nElső alkalom: november 9.\nHelyszín: MOME\n\nÉs itt van hozzá egy link a részletekről és a jelentkezési felületről.\nhttps://craft.mome.hu/pet-house/index.html\n\nÜdvözlettel,\n\nKormos Panni"\n\nÜdv.:\nBG',
            },
            {
              uri: "/groups/podcast.png",
              title: "E5 Podcast",
            },
          ]}
        />
      )}

      {siteConfig.pageSections["teremcserek"] != "hidden" && (
        <Section
          title={"Teremcserék"}
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["teremcserek"]}
        >
          <RoomChanges />
        </Section>
      )}

      {siteConfig.pageSections["helyettesitesek"] != "hidden" && (
        <Section
          title={"Helyettesítések"}
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["helyettesitesek"]}
        >
          <QuickTeachers />
        </Section>
      )}

      <Section title="Millió Lépés" dropdownable={true} defaultStatus="closed">
        <MillioLepes />
      </Section>

      {siteConfig.pageSections["menza"] != "hidden" && (
        <Section
          title="Mi a mai menü?"
          dropdownable={true}
          defaultStatus={siteConfig.pageSections["menza"]}
        >
          <Menu
            menu={
              selfUser?.food_menu == "A" || selfUser?.food_menu == "B"
                ? selfUser?.food_menu
                : undefined
            }
          />
        </Section>
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

      <Section title="Keresel valamit?" className="max-w-xs">
        <Link href={"/clubs"} className="block max-w-fit text-selfprimary">
          Klubok és szakkörök ➜
        </Link>
        <Link href={"/events"} className="block max-w-fit text-selfprimary">
          Összes esemény ➜
        </Link>
        <Link href={"/me"} className="block max-w-fit text-selfprimary">
          Saját beállítások ➜
        </Link>
        <Link
          href={"/clearCacke"}
          className="hidden max-w-fit text-selfprimary"
        >
          Gyorsítótár törlése ➜
        </Link>
      </Section>

      <Section
        title="Hamarosan"
        dropdownable={true}
        defaultStatus="closed"
        className="rounded-2xl bg-gradient-to-r from-selfprimary-50 to-selfprimary-bg"
      >
        <Section
          title="Órarend"
          dropdownable={false}
          defaultStatus="closed"
          className="mx-3 rounded-xl pl-3"
        >
          {0 ? (
            selfUser ? (
              <TimetableDay selfUser={selfUser} />
            ) : (
              <p>Bejelentkezés után láthatod az órarended!</p>
            )
          ) : (
            <p>
              Jelenleg nem elérhető az órarended. Kérjük, nézz vissza később!
            </p>
          )}
        </Section>

        <Section
          title="Szabad teremkereső"
          dropdownable={true}
          defaultStatus="closed"
          chip={<ChipBeta />}
        >
          {0 ? (
            <FreeRooms />
          ) : (
            <p>
              Jelenleg nem elérhető a teremkereső. Kérjük, nézz vissza később!
            </p>
          )}
        </Section>
      </Section>

      <div className="hero bg-[url('/opinion.png')]">
        <div className="bgcolor hero-overlay"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md rounded-lg bg-danger-foreground bg-opacity-70 p-4 text-black backdrop-blur-sm">
            <h1 className={clsx("mb-5 text-4xl font-bold")}>
              Helló Eötvös népe!
              <br />
            </h1>
            <p className={clsx("mb-5 w-auto text-lg lg:text-lg")}>
              A DÖ kötelessége a diákok érdekeinek eleget tenni. Az űrlapon
              megoszthatjátok észrevételeiteket, javaslataitokat és esetleges
              problémáitokat.
              <br />
            </p>
            <Link
              href={siteConfig.links.feedback}
              className={clsx(
                buttonStyles({
                  radius: "full",
                  variant: "solid",
                }),
                "bg-selfsecondary-200",
              )}
            >
              Irány az űrlap!
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
