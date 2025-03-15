import React from "react";
import "../styles/globals.css";
import { PopupButton } from "./popupbutton";

type SideCardProps = {
  title: string;
  image?: string;
  details?: React.ReactNode;
  description: string;
  popup: boolean;
  button_size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  makeStringToHTML?: boolean;
};

export const SideCard = ({
  title,
  image,
  details,
  description,
  button_size,
  popup,
  children,
  makeStringToHTML,
}: SideCardProps) => {
  const OptionalButton = (popup: boolean) => {
    if (popup) {
      return (
        details != undefined &&
        details != "" && (
          <PopupButton
            key={undefined}
            title={title}
            image={image}
            button_size={button_size}
            details={details}
            makeStringToHTML={makeStringToHTML}
            className="text-sm"
          />
        )
      );
    }
  };

  return (
    <div
      className="max-w-md overflow-hidden rounded-2xl"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="space-y-12 bg-foreground-100 bg-opacity-10 p-4 dark:bg-opacity-30"
        style={{
          background: "",
        }}
      >
        <div className="flex justify-between">
          <h2 className="flex items-center rounded-md bg-selfprimary-20 px-2 text-xl font-semibold text-foreground">
            {title}
          </h2>

          <div>{OptionalButton(popup)}</div>
        </div>
        <p className="w-fit rounded-md bg-selfprimary-20 px-2 text-foreground">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
};
