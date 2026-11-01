"use client";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  Chip,
} from "@heroui/react";
import NextLink from "next/link";
import { Logo } from "@/components/icons";
import { ProfileIcon } from "@/components/navbar/profileicon";
import GetApp from "../PWA/getApp";
import { PossibleUserType } from "@/db/dbreq";
import LiveScore from "./headspace/livescore";
import HelloMessage from "../home/helloMessage";
import ChangingComponent from "./changingComponent";
import { usePageSettings } from "@/hooks/usePageSettings";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const NavbarForPhone = ({
  selfUser,
  className,
  isActiveHeadSpace,
}: {
  selfUser: PossibleUserType;
  className?: string;
  isActiveHeadSpace: boolean;
}) => {
  const PageTitles: Record<string, string> = {
    "/": "E5vös DÖ",
    "/events": "Események",
    "/clubs": "Szakkörök",
    "/me": "Profilom",
    "/est": "E5 Podcast",
    "/admin/page": "Admin",
    "/e5media": "Média",
    "/dev": "Admin",
    "/fal": "Fal",
  };

  const pathname = usePathname();
  const [currentTitle, setCurrentTitle] = useState("E5vös DÖ");

  useEffect(() => {
    setCurrentTitle(PageTitles[pathname] ?? "E5vös DÖ");
  }, [pathname]);

  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className={"top-0 lg:hidden " + className}
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
                  {currentTitle}
                </h1>
              </NextLink>
            )
          }
        />
      </NavbarContent>

      <NavbarContent className="gap-2" justify="end">
        {selfUser?.permissions.includes("tester") &&
          !selfUser?.permissions.includes("tsz_member") && (
            <Chip className="bg-selfsecondary-300 text-sm">
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
        {selfUser?.permissions.includes("tsz_member") && (
          <Chip className="border border-white bg-black text-sm">
            <svg
              width="40"
              height="40"
              viewBox="0 0 380 374"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="p-1"
            >
              <path
                d="M166.123 81H118.369V106H166.123V81ZM214.893 125.5L227.086 106H214.893V81H262.139V104L214.893 179V125.5ZM167.139 201L118.369 278.5V304H167.139V278.5H152.406L167.139 255V201ZM214.893 278.5V304H262.139V278.5H214.893Z"
                fill-rule="evenodd"
                clip-rule="evenodd"
                fill="white"
              />
              <g filter="url(#filter0_d_7_47)">
                <path
                  d="M96.524 107V69H283.984V107H212.861V304H168.663V107H96.524Z"
                  fill="white"
                />
              </g>
              <path
                d="M167.139 303V277C154.212 269.24 149.689 260.581 145.802 243.5H114.534C113.289 268 134.626 297 167.139 303Z"
                fill-rule="evenodd"
                clip-rule="evenodd"
                fill="white"
              />
              <path
                d="M214.893 107V79.5C245.882 88.5 261.123 104 266.203 134.5H233.69C231.15 122.5 226.89 114.978 214.893 107Z"
                fill="white"
              />
              <path
                d="M166.123 196.5V167.5C140.722 158.5 137.674 118.5 166.123 107V79.5C103.128 91 95 182.15 166.123 196.5Z"
                fill="white"
              />
              <path
                d="M214.893 183V211C246.898 222.5 246.39 265 214.893 277V303C291.096 283 282.968 196.5 214.893 183Z"
                fill="white"
              />
              <defs>
                <filter
                  id="filter0_d_7_47"
                  x="46.924"
                  y="19.4"
                  width="286.66"
                  height="334.2"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="24.8" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_7_47"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_7_47"
                    result="shape"
                  />
                </filter>
              </defs>
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
      maxWidth="full"
      position="sticky"
      className={"top-0 " + className}
    >
      <NavbarContent className="fixed basis-full max-md:hidden" justify="start">
        <NavbarBrand as="li" className="max-w-fit gap-3">
          <NextLink className="flex items-center justify-start gap-1" href="/">
            <Logo />
            <p className="block- hidden p-2 font-bold text-foreground">E5</p>
          </NextLink>
          {selfUser?.permissions.includes("user") && (
            <>
              <HelloMessage selfUser={selfUser} size="sm" padding={false} />
              {selfUser?.permissions.includes("tester") && (
                <Chip className="bg-selfsecondary-300 text-sm">
                  Tesztverzió
                </Chip>
              )}
            </>
          )}

          <GetApp size={isActiveHeadSpace ? "small" : "medium"} />
        </NavbarBrand>
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

  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);

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
  return <></>;
};
