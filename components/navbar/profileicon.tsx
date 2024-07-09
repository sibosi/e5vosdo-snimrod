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
import Login from "../LoginForm";
import { LogoutIcon } from "../LogOut";
import { User } from "@/db/dbreq";
import { ThemeSwitch } from "../theme-switch";

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
  notificationsIds: number[],
  setNotificationsIds: (data: number[]) => void,
  setNotifications: (data: any) => void
) {
  if (
    notificationsIds == ((await fetch("/api/getUserNotificationsIds")) as any)
  ) {
    return;
  }
  setNotificationsIds(notificationsIds);
  const response = await fetch("/api/getUserNotifications");
  const data: JSON = await response.json();
  console.log(data);
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

interface Notifications {
  new: {
    id: number;
    title: string;
    message: string;
    time: string;
    sender_email: string;
    receiving_emails: string[];
  }[];
  read: {
    id: number;
    title: string;
    message: string;
    time: string;
    sender_email: string;
    receiving_emails: string[];
  }[];
  sent: {
    id: number;
    title: string;
    message: string;
    time: string;
    sender_email: string;
    receiving_emails: string[];
  }[];
}

export const ProfileIcon = ({ selfUser }: { selfUser: User | undefined }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [showModal, setShowModal] = useState(-1);

  const [notificationsIds, setNotificationsIds] = useState<number[]>([]);
  // {new: [id, id], read: [id, id], sent: [id, id]}
  const [notifications, setNotifications] = useState<Notifications>();
  // {new: [{id, title, message, time}, {id, title, message, time}], read: [{id, title, message, time}]}

  useEffect(() => {
    if (!selfUser) return;
    fetchNotifications(notificationsIds, setNotificationsIds, setNotifications);
  }, [notificationsIds, selfUser]);

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };

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
              <div key={item.id}>
                <div
                  key={"Notification" + String(item.id)}
                  className="flex my-3 gap-2"
                  onClick={() => {
                    setShowModal(item.id);
                    markAsRead(item.id);
                  }}
                >
                  <div className="block w-5 h-5 m-1 my-auto text-danger-500">
                    {Bell}
                  </div>
                  <div className="text-left truncate">
                    <h3 className="flex font-bold gap-1">
                      <p className="truncate">{item.title}</p>
                      <p>&middot;</p>
                      <p className="text-foreground-600 text-sm my-auto">
                        {new Date(item.time).toLocaleString("hu-HU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </h3>
                    <span className="text-sm break-words text-foreground-600">
                      {item.message}
                    </span>
                  </div>
                </div>
                <Modal
                  size="md"
                  key={"NotModal" + String(item.id)}
                  isOpen={showModal === item.id}
                  onClose={() => setShowModal(-1)}
                  className="overflow-auto"
                >
                  <ModalHeader>
                    Szia
                    {item.sender_email + " üzenetet küldött"}
                  </ModalHeader>
                  <ModalContent className="max-h-[95vh] overflow-auto p-10">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-foreground-600">{item.message}</p>
                    </div>
                  </ModalContent>
                </Modal>
              </div>
            ))
          ) : (
            <></>
          )}
          {selfUser && notifications ? (
            notifications.read.map((item) => (
              <div key={item.id}>
                <div
                  key={"Notification" + String(item.id)}
                  className="flex my-3 gap-2"
                  onClick={() => setShowModal(item.id)}
                >
                  <div className="block w-5 h-5 m-1 my-auto">{Bell}</div>
                  <div className="text-left truncate">
                    <h3 className="flex font-bold gap-1">
                      <p className="truncate">{item.title}</p>
                      <p>&middot;</p>
                      <p className="text-foreground-600 text-sm my-auto">
                        {new Date(item.time).toLocaleString("hu-HU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </h3>
                    <span className="text-sm break-words text-foreground-600">
                      {item.message}
                    </span>
                  </div>
                </div>
                <Modal
                  size="md"
                  key={"NotModal" + String(item.id)}
                  isOpen={showModal === item.id}
                  onClose={() => setShowModal(-1)}
                  className="overflow-auto mx-5"
                  placement="center"
                >
                  <ModalContent className="text-foreground">
                    <ModalHeader>
                      {item.sender_email.split("@")[0].split(".").join(" ") +
                        " üzenetet küldött"}
                    </ModalHeader>
                    <ModalBody className="max-h-[95vh] overflow-auto pb-5">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-bold text-foreground">
                          {item.title}
                        </h3>
                        <p className="text-foreground-600">{item.message}</p>
                      </div>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};
