"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  Chip,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";
import { Logo } from "@/components/icons";
import { ProfileIcon } from "@/components/navbar/profileicon";
import GetApp from "../PWA/getApp";
import { PossibleUserType } from "@/db/dbreq";
import LiveScore from "./headspace/livescore";
import HelloMessage from "../home/helloMessage";
import ChangingComponent from "./changingComponent";
import { usePageSettings } from "@/hooks/usePageSettings";
import { useEffect, useState } from "react";

const NavbarForPhone = ({
  selfUser,
  className,
  isActiveHeadSpace,
}: {
  selfUser: PossibleUserType;
  className?: string;
  isActiveHeadSpace: boolean;
}) => {
  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className={"top-0 " + className}
    >
      <NavbarContent className="flex" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          <GetApp size="small" />
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center" className="">
        <ChangingComponent
          startComponent={
            <HelloMessage selfUser={selfUser} size="sm" padding={false} />
          }
          endComponent={
            isActiveHeadSpace ? (
              <LiveScore />
            ) : (
              <NextLink
                className="flex items-center justify-start gap-1"
                href="/"
              >
                <Logo />
                <h1 className="p-2 text-3xl font-bold text-foreground">
                  E5vös&nbsp;DÖ
                </h1>
              </NextLink>
            )
          }
        />
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
};

const NavbarForDesktop = ({
  selfUser,
  className,
  isActiveHeadSpace,
}: {
  selfUser: PossibleUserType;
  className?: string;
  isActiveHeadSpace: boolean;
}) => {
  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className={"top-0 " + className}
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
};

export const Navbar = ({
  selfUser,
  className,
}: {
  selfUser: PossibleUserType;
  className?: string;
}) => {
  const { pageSettings } = usePageSettings();
  const isActiveHeadSpace = pageSettings?.headspace === 1;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isMobile)
    return (
      <NavbarForPhone
        selfUser={selfUser}
        className={className}
        isActiveHeadSpace={isActiveHeadSpace}
      />
    );
  return (
    <NavbarForDesktop
      selfUser={selfUser}
      className={className}
      isActiveHeadSpace={isActiveHeadSpace}
    />
  );
};
