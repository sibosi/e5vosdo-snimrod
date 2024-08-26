"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { useState } from "react";

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

const Sent = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    className="bi bi-send-fill"
    viewBox="0 0 16 16"
  >
    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
  </svg>
);

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

export const Notification = ({
  notification,
  type,
  allUsersNameByEmail,
}: {
  notification: Notification;
  type: "new" | "read" | "sent";
  allUsersNameByEmail: { [key: string]: string };
}) => {
  const [showModal, setShowModal] = useState(-1);

  return (
    <div key={notification.id}>
      <div
        key={"Notification" + String(notification.id)}
        className="my-3 flex gap-2"
        onClick={() => setShowModal(notification.id)}
      >
        <div
          className={
            "m-1 my-auto block h-5 w-5 " +
            (type == "new"
              ? "text-danger-500"
              : type == "sent"
                ? "text-primary-500"
                : "")
          }
        >
          {type == "sent" ? Sent : Bell}
        </div>
        <div className="w-full truncate text-left">
          <h3 className="flex gap-1 font-bold">
            <p className="truncate">{notification.title}</p>
          </h3>
          <span className="break-words text-sm text-foreground-600">
            {notification.message}
          </span>
        </div>
        <div className="break-words text-end text-sm text-foreground-600">
          <p>
            {allUsersNameByEmail[notification.sender_email]
              ? allUsersNameByEmail[notification.sender_email]
                  .split(" ")
                  .reverse()[0] +
                " " +
                allUsersNameByEmail[notification.sender_email].split(" ")[0]
              : // First name and last name only
                notification.sender_email}
          </p>
          <p>
            {String(
              new Date(notification.time)
                .toLocaleString("hu-HU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
                .substring(6),
            )}
          </p>
        </div>
      </div>
      <Modal
        size="md"
        key={"NotModal" + String(notification.id)}
        isOpen={showModal === notification.id}
        onClose={() => {
          setShowModal(-1);
          if (type == "new") {
            markAsRead(notification.id);
          }
        }}
        className="mx-5 overflow-auto"
        placement="center"
      >
        <ModalContent className="text-foreground">
          <ModalHeader>
            {(allUsersNameByEmail[notification.sender_email] ??
              notification.sender_email) + " üzenetet küldött"}
          </ModalHeader>
          <ModalBody className="max-h-[95vh] overflow-auto pb-5">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-foreground">
                {notification.title}
              </h3>
              <p className="text-foreground-600">{notification.message}</p>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
