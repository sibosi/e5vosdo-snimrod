"use client";

import { useState, useEffect } from "react";
import { Avatar, Badge, Link, Navbar, NavbarContent } from "@nextui-org/react";
import Login from "@/components/LoginForm";
import { LogoutIcon } from "@/components/LogOut";
import { User } from "@/db/dbreq";
import { ThemeSwitch } from "@/components/theme-switch";
import { Notification } from "./profilebox/notification";

const Account = () => {
  return (
    <Link href="/me">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        className="bi bi-person-fill fill-foreground-500 hover:fill-foreground-600"
        viewBox="0 0 16 16"
      >
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
      </svg>
    </Link>
  );
};

async function fetchNotifications(
  notificationsIds: NotificationsIds,
  setNotificationsIds: (data: NotificationsIds) => void,
  setNotifications: (data: any) => void
) {
  const responseIds: NotificationsIds = await (
    await fetch("/api/getUserNotificationsIds")
  ).json();
  if (notificationsIds.new.toString() == responseIds.new.toString()) {
    return;
  }
  setNotificationsIds(responseIds);
  const response = await (await fetch("/api/getUserNotifications")).json();
  const data: any = response;
  (data as any).new.sort((a: any, b: any) => b.id - a.id);
  (data as any).read.sort((a: any, b: any) => b.id - a.id);
  (data as any).sent.sort((a: any, b: any) => b.id - a.id);
  // Add new and sent notifications list to one

  data.newAndSent = data.new.concat(data.sent);
  setNotifications(data);
}
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  sender_email: string;
  receiving_emails: string[];
}
interface Notifications {
  new: Notification[];
  read: Notification[];
  sent: Notification[];
  newAndSent: Notification[];
}
interface NotificationsIds {
  new: number[];
  read: number[];
  sent: number[];
}

export const ProfileIcon = ({ selfUser }: { selfUser: User | undefined }) => {
  const [showButtons, setShowButtons] = useState(false);

  const [notificationsIds, setNotificationsIds] = useState<NotificationsIds>({
    new: [-1],
    read: [-1],
    sent: [-1],
  });

  const [notifications, setNotifications] = useState<Notifications>({
    new: [],
    read: [],
    sent: [],
    newAndSent: [],
  });

  const [allUsersNameByEmail, setAllUsersNameByEmail] = useState<any>({});

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };

  useEffect(() => {
    if (!selfUser) return;
    fetchNotifications(notificationsIds, setNotificationsIds, setNotifications);
    fetch("/api/getAllUsersNameByEmail")
      .then((response) => response.json())
      .then((data) => setAllUsersNameByEmail(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selfUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(
        notificationsIds,
        setNotificationsIds,
        setNotifications
      );
    }, 8000); // in ms

    return () => clearInterval(interval);
  }, [notificationsIds]);

  return (
    <div>
      <div onClick={handleIconClick}>
        {selfUser?.image && selfUser?.name ? (
          <Badge
            content={String(
              notifications != undefined ? notifications.new.length : 0
            )}
            shape="circle"
            color="danger"
            isInvisible={
              notifications == undefined ? true : notifications.new.length == 0
            }
          >
            <Avatar isBordered color="default" src={selfUser.image} />
          </Badge>
        ) : (
          <Avatar isBordered color="default" src="apa-logo.jpg" />
        )}
      </div>
      {showButtons && (
        <div
          className="left-0 top-0 fixed w-full h-screen bg-transparent "
          onClick={handleIconClick}
        />
      )}

      <div
        className={`fixed right-4 top-14 w-11/12 sm:w-96 p-3 backdrop-blur-md bg-default-100/90 rounded-2xl transition-all duration-400 overflow-hidden text-center text-foreground ${
          !showButtons ? "h-0 py-0" : "h-auto"
        } `}
      >
        <Navbar
          className="flex bg-foreground-200 py-2 rounded-3xl gap-2"
          height={"auto"}
        >
          {selfUser ? (
            <>
              <NavbarContent justify="start">
                <ThemeSwitch />
                <Account />
              </NavbarContent>
              <NavbarContent justify="center">
                {String(selfUser?.nickname)}
              </NavbarContent>
              <NavbarContent justify="end">
                <LogoutIcon />
              </NavbarContent>
            </>
          ) : (
            <Login />
          )}
        </Navbar>
        <div className="max-h-72 overflow-auto scrollbar-default">
          {selfUser && notifications ? (
            notifications.newAndSent.map((item: any) => (
              <Notification
                key={item.id}
                notification={item}
                type={item.id in notifications.new ? "new" : "sent"}
                allUsersNameByEmail={allUsersNameByEmail}
              />
            ))
          ) : (
            <></>
          )}
          {selfUser && notifications ? (
            notifications.read.map((item) => (
              <Notification
                key={item.id}
                notification={item}
                type={"read"}
                allUsersNameByEmail={allUsersNameByEmail}
              />
            ))
          ) : (
            <></>
          )}
          {selfUser && !notifications ? (
            <div className="py-2">Értesítések betöltése...</div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
