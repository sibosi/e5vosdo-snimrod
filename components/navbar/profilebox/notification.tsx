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
}: {
  notification: Notification;
  type: "new" | "read" | "sent";
}) => {
  const [showModal, setShowModal] = useState(-1);
  const [allUsersNameByEmail, setAllUsersNameByEmail] = useState<any>({});

  return (
    <div key={notification.id}>
      <div
        key={"Notification" + String(notification.id)}
        className="flex my-3 gap-2"
        onClick={() => setShowModal(notification.id)}
      >
        <div
          className={
            "block w-5 h-5 m-1 my-auto " +
            (type == "new" ? "text-danger-500" : "")
          }
        >
          {Bell}
        </div>
        <div className="text-left truncate">
          <h3 className="flex font-bold gap-1">
            <p className="truncate">{notification.title}</p>
            <p>&middot;</p>
            <p className="text-foreground-600 text-sm my-auto">
              {new Date(notification.time).toLocaleString("hu-HU", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </h3>
          <span className="text-sm break-words text-foreground-600">
            {notification.message}
          </span>
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
        className="overflow-auto mx-5"
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
