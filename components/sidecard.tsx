import React, { useState } from "react";
import "../styles/globals.css";
import { PopupButton } from "./popupbutton";

type SideCardProps = {
  title: string;
  image?: string;
  details?: React.ReactNode;
  description: string;
  popup: boolean;
  children?: React.ReactNode;
  makeStringToHTML?: boolean;
};

export const SideCard = ({
  title,
  image,
  details,
  description,
  popup,
  children,
  makeStringToHTML,
}: SideCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const OptionalButton = (popup: boolean) => {
    if (!popup || details == undefined || details == "") return;
    return (
      <PopupButton
        key={undefined}
        title={title}
        image={image}
        details={details}
        makeStringToHTML={makeStringToHTML}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    );
  };

  return (
    <>
      <button
        className="w-full max-w-md rounded-2xl bg-selfprimary-100 text-left"
        onClick={() => setIsModalOpen(true)}
      >
        <div
          className="overflow-hidden rounded-t-2xl"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {image !== undefined && (
            <div className="h-28 bg-foreground-100/10 p-4 dark:bg-foreground-100/30">
              <div className="flex justify-end">{children}</div>
              <p className="w-fit rounded-md bg-selfprimary-20 px-2 text-foreground">
                {description}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 py-1">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
      </button>
      {OptionalButton(popup)}
    </>
  );
};
