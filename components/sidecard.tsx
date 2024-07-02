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
};

export const SideCard = ({
  title,
  image,
  details,
  description,
  button_size,
  popup,
  children,
}: SideCardProps) => {
  const OptionalButton = (popup: boolean) => {
    if (popup) {
      return (
        details != undefined && (
          <PopupButton
            key={undefined}
            title={title}
            image={image}
            button_size={button_size}
            details={details}
          />
        )
      );
    }
  };

  return (
    <>
      <div className="card image-full max-w-sm rounded-2xl overflow-hidden">
        {typeof image === "string" && (
          <figure>
            <Image
              fill
              className="z-20 dark:opacity-50 opacity-100"
              src={image}
              alt="image"
              priority={true}
            />
          </figure>
        )}
        <div className="card-body bg-neutral-200 bg-opacity-50 dark:bg-none dark:bg-opacity-0">
          <div className="flex">
            <h2 className="card-title w-full text-foreground">{title}</h2>
            <div>{OptionalButton(popup)}</div>
          </div>
          <p className="text-foreground">{description}</p>
          {children}
        </div>
      </div>
    </>
  );
};
