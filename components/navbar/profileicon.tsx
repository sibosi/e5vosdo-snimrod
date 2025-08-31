"use client";

import { useState } from "react";
import { Avatar, Badge, Link, Navbar, NavbarContent } from "@heroui/react";
import Login from "@/components/LoginForm";
import { LogoutButton, LogoutIcon } from "@/components/LogOut";
import { PossibleUserType } from "@/db/dbreq";
import dynamic from "next/dynamic";
import { Notification } from "./profilebox/notification";

const ThemeSwitch = dynamic(() => import("@/components/theme-switch"), {
  ssr: false,
});

const Account = ({ size }: { size?: number | string }) => {
  return (
    <Link href="/me">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size ?? 20}
        height={size ?? 20}
        className="bi bi-person-fill fill-foreground-500 hover:fill-foreground-600"
        viewBox="0 0 16 16"
      >
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
      </svg>
    </Link>
  );
};

const hideIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-envelope-dash-fill fill-foreground-500 hover:fill-foreground-600"
    viewBox="0 0 16 16"
  >
    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z" />
    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-5.5 0a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5" />
  </svg>
);

const showIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-envelope-open-fill fill-foreground-500 hover:fill-foreground-600"
    viewBox="0 0 16 16"
  >
    <path d="M8.941.435a2 2 0 0 0-1.882 0l-6 3.2A2 2 0 0 0 0 5.4v.314l6.709 3.932L8 8.928l1.291.718L16 5.714V5.4a2 2 0 0 0-1.059-1.765zM16 6.873l-5.693 3.337L16 13.372v-6.5Zm-.059 7.611L8 10.072.059 14.484A2 2 0 0 0 2 16h12a2 2 0 0 0 1.941-1.516M0 13.373l5.693-3.163L0 6.873z" />
  </svg>
);

export const ProfileIcon = ({ selfUser }: { selfUser: PossibleUserType }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [hideSentAndRead, setHideSentAndRead] = useState(false);

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };

  return (
    <div>
      <button onClick={handleIconClick}>
        {selfUser?.image && selfUser?.name ? (
          <Avatar isBordered color="default" src={selfUser.image} />
        ) : (
          <Avatar
            isBordered
            color="default"
            src="governments/2526/szombat-logo.jpeg"
          />
        )}
      </button>

      {showButtons && (
        <div
          className="fixed left-0 top-0 h-screen w-full bg-transparent"
          onClick={handleIconClick}
        />
      )}

      <div
        className={`fixed right-4 top-14 w-52 overflow-hidden rounded-2xl bg-default-100/90 p-3 text-center text-foreground backdrop-blur-md transition-all duration-400 ${
          !showButtons ? "h-0 py-0" : "h-auto"
        } `}
      >
        <p className="text-lg font-bold text-selfprimary-800">
          {String(selfUser?.nickname)}
        </p>

        <div className="text-foreground-500">
          <ThemeSwitch
            className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-foreground-200"
            text="Téma váltása"
          />
          <a
            href="/me"
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-foreground-200"
          >
            <Account size={24} />
            <span>Profilom</span>
          </a>
          <LogoutIcon
            text="Kijelentkezés"
            size={24}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-danger hover:bg-danger-100"
          />
        </div>
      </div>
    </div>
  );
};
