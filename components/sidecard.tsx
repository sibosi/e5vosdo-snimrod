import React from "react";
import Image from "next/image";
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
    <>
      <div className="card image-full max-w-sm overflow-hidden rounded-2xl">
        {typeof image === "string" && (
          <figure>
            <Image
              fill
              className="z-20 opacity-100 dark:opacity-50"
              src={image}
              alt="image"
              priority={true}
              unoptimized={image.startsWith("http")}
            />
          </figure>
        )}
        <div className="card-body -mx-2 bg-neutral-200 bg-opacity-15 dark:bg-opacity-0 dark:bg-none">
          <div className="flex justify-between">
            <h2 className="card-title rounded-md bg-selfprimary-20 px-2 text-foreground">
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
    </>
  );
};
