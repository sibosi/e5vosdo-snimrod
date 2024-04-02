import { title } from "@/components/primitives";
import { Link } from "@nextui-org/link";
import WelcomeCard from "@/components/welcomecard";
import { siteConfig } from "@/config/site";
import { button as buttonStyles } from "@nextui-org/theme";
import { Test } from "@/components/test";

import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";

export default function WelcomePage() {
  return (
    <div>
      <h1
        className={clsx(
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        Welcome
      </h1>
      <br />
      <WelcomeCard text="Szia! ">
        <Link
          isExternal
          href={siteConfig.links.mypage}
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
        >
          MyPage
        </Link>
      </WelcomeCard>
    </div>
  );
}
