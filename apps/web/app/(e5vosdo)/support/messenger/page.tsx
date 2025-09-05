import { CopyUrlButton } from "@/apps/web/app/skipMessenger";
import { siteConfig } from "@/apps/web/config/site";

const SupportMessengerPage = async () => {
  return (
    <div className="font-semibold text-foreground">
      <div className="mb-8 text-center">
        <h1 className="pb-2 text-4xl lg:text-5xl">Messenger</h1>
      </div>

      <p>
        A Messenger nem támogatja a Google bejeletkezést. Kérjük, használj egy
        másik böngészőt. (pl. Google Chrome, Safari)
      </p>

      <div className="mx-auto my-2 max-w-fit text-center">
        <p className="mb-1 text-xl font-bold text-selfprimary">
          {siteConfig.links.home}
        </p>
        <CopyUrlButton props={{ className: "bg-selfprimary-200" }} />
      </div>
    </div>
  );
};

export default SupportMessengerPage;
