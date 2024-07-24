// components/navbar.tsx
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";
import { SearchIcon, InstagramIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { ProfileIcon } from "@/components/navbar/profileicon";
import GetApp from "../PWA/getApp";
import { User } from "@/db/dbreq";
import LiveScore from "./headspace/livescore";

export const Navbar = ({
  selfUser,
  isActiveHeadSpace,
}: {
  selfUser: User | undefined;
  isActiveHeadSpace: boolean;
}) => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-md",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="fixed basis-1/5 md:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-foreground block- p-2 hidden">E5</p>
          </NextLink>
          <GetApp size={isActiveHeadSpace ? "small" : "medium"} />
        </NavbarBrand>
        <ul className="hidden md:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
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

      <NavbarContent justify="start" />

      {isActiveHeadSpace ? (
        <NavbarContent justify="center" className="md:hidden">
          <LiveScore />
        </NavbarContent>
      ) : (
        <></>
      )}

      <NavbarContent justify="end" />

      <NavbarContent className="fixed right-0 gap-2 pr-6" justify="end">
        <NavbarItem>
          <Link
            isExternal
            href={siteConfig.links.instagram}
            aria-label="Instagram"
            className={"pr-2 " + isActiveHeadSpace ? "hidden" : ""}
          >
            <InstagramIcon className="text-default-500" />
          </Link>
        </NavbarItem>
        <NavbarItem className="flex items-center">
          <ProfileIcon selfUser={selfUser} />
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 1
                    ? "primary"
                    : index === siteConfig.navItems.length - 2 ||
                      index === siteConfig.navItems.length - 3
                    ? "danger"
                    : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
