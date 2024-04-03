import { title } from "@/components/primitives";
import { Link } from "@nextui-org/link";
import WelcomeCard from "@/components/welcomecard";
import { siteConfig } from "@/config/site";
import { button as buttonStyles } from "@nextui-org/theme";
import { Test } from "@/components/test";

import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { FlipCard } from "@/components/flipcard";

export default function AboutPage() {
  return (
    <div>
      <h1
        className={clsx(
          title(),
          linkStyles({ color: "foreground", isBlock: true })
        )}
      >
        About
      </h1>
      <br />
      <FlipCard text="">Hi</FlipCard>
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
