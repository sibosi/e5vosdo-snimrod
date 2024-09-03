import { siteConfig } from "@/config/site";
import { getAuth } from "@/db/dbreq";

const HelloPage = async () => {
  const selfUser = await getAuth();

  return (
    <div className="font-semibold text-foreground">
      <div className="mb-8 text-center">
        <h1 className="pb-2 text-4xl lg:text-5xl">
          Üdvözlünk&nbsp;
          <span className="bg-gradient-to-l from-selfprimary-300 to-selfprimary-700 bg-clip-text text-transparent">
            {selfUser?.nickname ?? "minálunk"}
          </span>
          !
        </h1>
        <h2 className="quote text-lg italic">„Az Eötvös többet ad”</h2>
      </div>

      <p>
        Az Eötvös DÖ hivatalos weboldalán jársz. Az oldal folyamatosan fejlődik,
        és új funkciókkal bővül. Ha bármilyen hibát találsz, vagy bármilyen
        ötlettel rendelkezel, kérlek&nbsp;
        <a
          href={siteConfig.links.feedback}
          className="text-selfprimary underline"
        >
          jelezd nekünk
        </a>
        !
      </p>
    </div>
  );
};

export default HelloPage;
