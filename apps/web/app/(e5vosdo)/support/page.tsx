import { siteConfig } from "@/apps/web/config/site";

const SupportPage = async () => {
  return (
    <div className="font-semibold text-foreground">
      <div className="mb-8 text-center">
        <h1 className="pb-2 text-4xl lg:text-5xl">Szia!</h1>
        <h2 className="quote text-lg italic">„Az Eötvös többet ad”</h2>
      </div>

      <p>
        Az Eötvös DÖ hivatalos weboldalán jársz. Az oldal folyamatosan fejlődik,
        és új funkciókkal bővül. Ha bármilyen hibát találsz, vagy bármilyen
        ötlettel rendelkezel, kérlek{" "}
        <a
          href={siteConfig.links.feedback}
          className="text-selfprimary underline"
        >
          jelezd nekünk
        </a>
        {}!
      </p>
    </div>
  );
};

export default SupportPage;
