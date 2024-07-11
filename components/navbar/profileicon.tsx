"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Badge,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Navbar,
  NavbarContent,
} from "@nextui-org/react";
import Login from "@/components/LoginForm";
import { LogoutIcon } from "@/components/LogOut";
import { User } from "@/db/dbreq";
import { ThemeSwitch } from "@/components/theme-switch";
import { Notification } from "./profilebox/notification";

const Bell = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-bell-fill"
    viewBox="0 0 16 16"
  >
    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
  </svg>
);

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
  console.log(
    notificationsIds.new.toString() == responseIds.new.toString(),
    notificationsIds.new.toString(),
    responseIds.new.toString()
  );
  if (notificationsIds.new.toString() == responseIds.new.toString()) {
    return;
  }
  setNotificationsIds(responseIds);
  const response = await (await fetch("/api/getUserNotifications")).json();
  const data: JSON = response;
  (data as any).new.sort((a: any, b: any) => b.id - a.id);
  (data as any).read.sort((a: any, b: any) => b.id - a.id);
  (data as any).sent.sort((a: any, b: any) => b.id - a.id);
  setNotifications(data);
}

async function markAsRead(id: number) {
  const response = await fetch("/api/markAsRead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  });
  if (response.status == 200) {
    return;
  }
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
}

interface NotificationsIds {
  new: number[];
  read: number[];
  sent: number[];
}

export const ProfileIcon = ({ selfUser }: { selfUser: User | undefined }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [showModal, setShowModal] = useState(-1);

  const [notificationsIds, setNotificationsIds] = useState<NotificationsIds>({
    new: [-1],
    read: [-1],
    sent: [-1],
  });
  // {new: [id, id], read: [id, id], sent: [id, id]}
  const [notifications, setNotifications] = useState<Notifications>();
  // {new: [{id, title, message, time}, {id, title, message, time}], read: [{id, title, message, time}]}

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
            notifications.new.map((item: any) => (
              <Notification key={item.id} notification={item} type={"new"} />
            ))
          ) : (
            <></>
          )}
          {selfUser && notifications ? (
            notifications.read.map((item) => (
              <Notification key={item.id} notification={item} type={"read"} />
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
