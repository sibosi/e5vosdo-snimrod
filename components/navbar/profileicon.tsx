"use client";

import { useState, useEffect } from "react";
import { Avatar, Badge, Link, Navbar, NavbarContent } from "@nextui-org/react";
import Login from "@/components/LoginForm";
import { LogoutIcon } from "@/components/LogOut";
import { User } from "@/db/dbreq";
import { ThemeSwitch } from "@/components/theme-switch";
import { Notification } from "./profilebox/notification";
import InstallAppNotif from "./profilebox/installAppNotif";
import UpdateSWNotif from "./profilebox/updateSWNotif";
import EnablePushNotif from "./profilebox/enablePushNotif";

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

async function fetchNotifications(
  notificationsIds: NotificationsIds,
  setNotificationsIds: (data: NotificationsIds) => void,
  setNotifications: (data: any) => void,
) {
  const resp = await fetch("/api/getUserNotificationsIds");

  if (resp.status != 200) return;

  const responseIds: NotificationsIds = await resp.json();
  responseIds.newAndSent = responseIds.new.concat(responseIds.sent);
  responseIds.newAndSent.sort((a: any, b: any) => b - a);
  if (notificationsIds.new.toString() == responseIds.new.toString()) {
    return;
  }
  setNotificationsIds(responseIds);
  const response = await (await fetch("/api/getUserNotifications")).json();
  const data: any = response;
  data.new.sort((a: any, b: any) => b.id - a.id);
  data.read.sort((a: any, b: any) => b.id - a.id);
  data.sent.sort((a: any, b: any) => b.id - a.id);

  data.newAndSent = data.new.concat(data.sent);
  data.newAndSent.sort((a: any, b: any) => b.id - a.id);
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
  newAndSent: number[];
}

export const ProfileIcon = ({ selfUser }: { selfUser: User | undefined }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [hideSentAndRead, setHideSentAndRead] = useState(false);

  const [notificationsIds, setNotificationsIds] = useState<NotificationsIds>({
    new: [-1],
    read: [-1],
    sent: [-1],
    newAndSent: [-1, -1],
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
        setNotifications,
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
              notifications != undefined ? notifications.new.length : 0,
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
          className="fixed left-0 top-0 h-screen w-full bg-transparent"
          onClick={handleIconClick}
        />
      )}

      <div
        className={`fixed right-4 top-14 w-11/12 overflow-hidden rounded-2xl bg-default-100/90 p-3 text-center text-foreground backdrop-blur-md transition-all duration-400 sm:w-96 ${
          !showButtons ? "h-0 py-0" : "h-auto"
        } `}
      >
        <Navbar
          className="flex gap-2 rounded-3xl bg-foreground-200 py-2"
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
                <div onClick={() => setHideSentAndRead(!hideSentAndRead)}>
                  {hideSentAndRead ? hideIcon : showIcon}
                </div>
                <LogoutIcon />
              </NavbarContent>
            </>
          ) : (
            <Login />
          )}
        </Navbar>
        <div className="max-h-72 overflow-auto scrollbar-default">
          <UpdateSWNotif />
          <InstallAppNotif />
          <EnablePushNotif />
          {selfUser && notifications ? (
            notifications.newAndSent.map((item: Notification, index) =>
              notificationsIds.sent.includes(item.id) &&
              notificationsIds.newAndSent.indexOf(item.id) == index &&
              hideSentAndRead ? (
                <></>
              ) : (
                <Notification
                  key={"NewOrSentNot" + String(index)}
                  notification={item}
                  type={
                    notificationsIds.sent.includes(item.id)
                      ? notificationsIds.newAndSent.indexOf(item.id) == index
                        ? "sent"
                        : "new"
                      : "new"
                  }
                  allUsersNameByEmail={allUsersNameByEmail}
                />
              ),
            )
          ) : (
            <></>
          )}
          {selfUser && notifications && !hideSentAndRead ? (
            notifications.read.map((item, index) => (
              <Notification
                key={"ReadNot" + String(index)}
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
          {selfUser && notifications && hideSentAndRead ? (
            <div className="py-2">Csak az új értesítések jelennek meg</div>
          ) : (
            <></>
          )}
          {!selfUser ? (
            <div className="py-2">
              Bejelentkezés szükséges az értesítésekhez
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
