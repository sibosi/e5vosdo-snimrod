// components/navbar.tsx
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
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
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, InstagramIcon } from "@/components/icons";
import { Logo } from "@/components/icons";
import { Chip } from "@nextui-org/react";
import { ProfileIcon } from "@/components/profileicon"; // Ensure the path is correct
import { Session } from "next-auth";

export const Navbar = ({ session }: { session: Session | null }) => {
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
      <NavbarContent className="basis-1/5 md:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p
              className={clsx(
                "font-bold dark:text-white",
                linkStyles({ color: "foreground", isBlock: true })
              )}
            >
              E5
            </p>
            <Chip
              size="sm"
              color="warning"
              className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
            >
              PREVIEW
            </Chip>
          </NextLink>
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
      <NavbarContent
        className="hidden md:flex basis-1/5 md:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex gap-2">
          <Link
            isExternal
            href={siteConfig.links.instagram}
            aria-label="Instagram"
          >
            <InstagramIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="flex">
          <div className="flex gap-4 items-center">
            <ProfileIcon session={session} />
          </div>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent className="md:hidden basis-1 pl-4" justify="end">
        <Link
          isExternal
          href={siteConfig.links.instagram}
          aria-label="Instagram"
        >
          <InstagramIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle className="text-foreground hidden" />
        <NavbarItem className="flex">
          <div className="flex gap-4 items-center">
            <ProfileIcon session={session} />
          </div>
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
