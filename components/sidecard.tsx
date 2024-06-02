import React from "react";
import Image from "next/image";
import "../styles/globals.css";
import { PopupButton } from "./popupbutton";

type SideCardProps = {
  title: string;
  image?: string;
  details?: string;
  description: string;
  popup: boolean;
  children?: React.ReactNode;
};

export const SideCard = ({
  title,
  image,
  details,
  description,
  popup,
  children,
}: SideCardProps) => {
  const OptionalButton = (popup: boolean) => {
    if (popup) {
      return (
        typeof details === "string" && (
          <PopupButton
            key={undefined}
            title={title}
            image={image}
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
          <h2 className="card-title text-foreground">{title}</h2>
          <p className="text-foreground">{description}</p>
          {children}
          <div className="card-actions justify-end">
            {OptionalButton(popup)}
          </div>
        </div>
      </div>
    </>
  );
};
