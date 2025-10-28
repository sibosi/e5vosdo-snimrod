"use client";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import React from "react";
import { Logo } from "../icons";
import ThemeSwitch from "../theme-switch";
import { PossibleUserType } from "@/db/dbreq";
import { LogoutIcon } from "../LogOut";
import { Avatar } from "@heroui/react";
import LoginButton from "../LoginButton";
import HelloMessage from "./helloMessage";

const DesktopMenu = ({ selfUser }: { selfUser: PossibleUserType }) => {
  const pathname = usePathname();

  return (
    <div className="hidden min-w-64 lg:block">
      <aside className="fixed flex h-full w-64 flex-col gap-1 transition-all duration-300 ease-in-out">
        <a
          href="/"
          className="mb-2 flex items-center gap-1 p-2 text-foreground"
        >
          <Logo />
          <h1 className="p-2 text-3xl font-bold">E5vös DÖ</h1>
        </a>
        {siteConfig.navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={
              "border-2 px-4 py-2 text-sm text-foreground-800 transition-all duration-300 ease-in-out hover:rounded-2xl hover:border-selfprimary-400 hover:bg-selfprimary-20" +
              (pathname === item.href
                ? " rounded-2xl border-selfprimary-600 bg-selfprimary-50"
                : " rounded-md border-transparent bg-transparent")
            }
          >
            {item.label}
          </a>
        ))}
        <div className="my-2 border-1 border-foreground-100" />
        {selfUser && (
          <div className="flex-cola m-2 flex items-center gap-3">
            <Avatar
              isBordered
              color="default"
              size="sm"
              src={selfUser?.image}
            />

            <HelloMessage
              selfUser={selfUser}
              textClass="text-2xl"
              padding={false}
            />
          </div>
        )}
        <a
          href="/me"
          className="flex w-full items-center gap-2 rounded-lg fill-foreground-500 p-2 transition-all duration-300 ease-in-out hover:bg-foreground-200 hover:fill-foreground-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            className="bi bi-person-fill"
            viewBox="0 0 16 16"
          >
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
          </svg>

          <span>Profilom</span>
        </a>
        <ThemeSwitch
          className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-foreground-200"
          text="Téma váltása"
        />
        {selfUser ? (
          <LogoutIcon
            text="Kijelentkezés"
            size={24}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-danger transition-all duration-300 ease-in-out hover:bg-danger-100"
          />
        ) : (
          <LoginButton />
        )}
      </aside>
    </div>
  );
};

export default DesktopMenu;
