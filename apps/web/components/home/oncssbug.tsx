import { siteConfig } from "@/apps/web/config/site";
import React from "react";

const OnCSSBug = () => {
  return (
    <div className="m-2 hidden rounded-lg bg-selfsecondary-100 p-2 text-foreground">
      Ha ezt a szöveget látod, valószínűleg furcsán jelenik meg az oldal. Ha
      tévedünk, kérlek jelezd a fejlesztőnek.
      <br />
      Hiba esetén menj a következő oldalra:
      <br />
      <a href="/clearCache" className="underline">
        {siteConfig.links.home}/clearCache
      </a>
    </div>
  );
};

export default OnCSSBug;
