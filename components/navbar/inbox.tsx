"use client";
import { Modal, ModalContent } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

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

const Inbox = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [showModal, setShowModal] = useState(-1);

  const [notificationsIds, setNotificationsIds] = useState<number[]>([]); // [id, id, id]
  const [notifications, setNotifications] = useState<any>([]); // [title, message, addressee]

  useEffect(() => {
    fetchNotifications(notificationsIds, setNotificationsIds, setNotifications);
  }, [notificationsIds]);

  const handleIconClick = () => {
    setShowButtons(!showButtons);
  };
  return (
    <div>
      <div onClick={handleIconClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          className="bi bi-inbox-fill fill-default-500 block"
          viewBox="0 0 16 16"
        >
          <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z" />
        </svg>
      </div>
      {showButtons && (
        <div
          className="left-0 top-0 fixed w-full h-screen bg-transparent "
          onClick={handleIconClick}
        />
      )}

      <div
        className={`fixed right-4 top-14 w-11/12 sm:w-80 p-3 backdrop-blur-md bg-default-100/80 rounded-2xl transition-all duration-400 overflow-hidden text-center text-foreground ${
          !showButtons ? "h-0 py-0" : "h-auto"
        } `}
      >
        {notifications.map((item: any, index: number) => (
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
        ))}
      </div>
    </div>
  );
};

export default Inbox;
