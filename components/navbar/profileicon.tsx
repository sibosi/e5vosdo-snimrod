"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Modal,
  ModalContent,
  Navbar,
  NavbarContent,
} from "@nextui-org/react";
import Login from "../LoginForm";
import LogOut from "../LogOut";
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
  const response = await fetch("/api/getUserNotifications"); // Adjust the endpoint as necessary
  const data = await response.json();
  setNotifications(data);
}

export const ProfileIcon = ({ selfUser }: { selfUser: User | undefined }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [showModal, setShowModal] = useState(-1);

  const [notificationsIds, setNotificationsIds] = useState<number[]>([]); // [id, id, id]
  const [notifications, setNotifications] = useState<any>([]); // [title, message, addressee]

  useEffect(() => {
    if (!selfUser) return;
    fetchNotifications(notificationsIds, setNotificationsIds, setNotifications);
  }, [notificationsIds, selfUser]);

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };

  return (
    <div>
      <div onClick={handleIconClick}>
        {selfUser?.image && selfUser?.name ? (
          <Avatar isBordered color="default" src={selfUser.image} />
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
              </NavbarContent>
              <NavbarContent justify="center">
                {String(selfUser?.name)}
              </NavbarContent>
              <NavbarContent justify="end">
                <LogOut />
              </NavbarContent>
            </>
          ) : (
            <Login />
          )}
        </Navbar>
        {selfUser ? (
          notifications.map((item: any, index: number) => (
            <div key={index}>
              <div
                key={"Notification" + String(index)}
                className="flex my-3 gap-2"
                onClick={() => setShowModal(index)}
              >
                <div className="block w-5 h-5 m-1 my-auto">{Bell}</div>
                <div className="text-left truncate">
                  <h3 className="flex font-bold gap-1">
                    <p className="truncate">{item.title}</p>
                    <p>&middot;</p>
                    <p className="text-foreground-600 text-sm my-auto">
                      ma 18:00
                    </p>
                  </h3>
                  <span className="text-sm break-words text-foreground-600">
                    {item.message}
                  </span>
                </div>
              </div>
              <Modal
                size="md"
                key={"NotModal" + String(index)}
                isOpen={showModal === index}
                onClose={() => setShowModal(-1)}
                className="overflow-auto"
              >
                <ModalContent className="max-h-[95vh] overflow-auto p-10">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="text-foreground-600">{item.message}</p>
                  </div>
                </ModalContent>
              </Modal>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
