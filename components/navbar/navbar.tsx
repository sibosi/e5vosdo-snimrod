import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { link as linkStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/icons";
import { ProfileIcon } from "@/components/navbar/profileicon";
import GetApp from "../PWA/getApp";
import { PossibleUserType } from "@/db/dbreq";
import LiveScore from "./headspace/livescore";
import HelloMessage from "../home/helloMessage";
import { Chip } from "@nextui-org/react";
import ChangingComponent from "./changingComponent";

export const Navbar = ({
  selfUser,
  isActiveHeadSpace,
  className,
}: {
  selfUser: PossibleUserType;
  isActiveHeadSpace: boolean;
  className?: string;
}) => {
  const phoneView = (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className={"top-0 md:hidden " + className}
    >
      <NavbarContent className="flex" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          <GetApp size={isActiveHeadSpace ? "small" : "small"} />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center" className="">
        <ChangingComponent
          startComponent={
            <HelloMessage selfUser={selfUser} size="sm" padding={false} />
          }
          endComponent={
            <NextLink
              className="flex items-center justify-start gap-1"
              href="/"
            >
              <Logo />
              <h1 className="p-2 text-3xl font-bold text-foreground">
                E5vös&nbsp;DÖ
              </h1>
            </NextLink>
          }
        />
        <LiveScore />
      </NavbarContent>

      <NavbarContent className="gap-2" justify="end">
        {selfUser?.permissions.includes("tester") && (
          <Chip variant="shadow" className="bg-selfsecondary-300 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0" />
            </svg>
          </Chip>
        )}
      </NavbarContent>
    </NextUINavbar>
  );

  const desktopView = (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className={"top-0 max-md:hidden " + className}
    >
      <NavbarContent className="fixed basis-full" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          {!selfUser?.permissions.includes("user") ? (
            <NextLink
              className="flex items-center justify-start gap-1"
              href="/"
            >
              <Logo />
              <p className="block- hidden p-2 font-bold text-foreground">E5</p>
            </NextLink>
          ) : (
            <>
              <HelloMessage selfUser={selfUser} size="sm" padding={false} />
              {selfUser?.permissions.includes("tester") && (
                <Chip variant="shadow" className="bg-selfsecondary-300 text-sm">
                  Tesztverzió
                </Chip>
              )}
            </>
          )}

          <GetApp size={isActiveHeadSpace ? "small" : "medium"} />
        </NavbarBrand>
        <ul className="ml-2 flex justify-start gap-4">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:font-medium data-[active=true]:text-selfprimary",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="fixed right-0 gap-2 pr-6" justify="end">
        <NavbarItem className="flex items-center">
          <ProfileIcon selfUser={selfUser} />
        </NavbarItem>
      </NavbarContent>
    </NextUINavbar>
  );

  return (
    <>
      {phoneView}
      {desktopView}
    </>
  );
};
