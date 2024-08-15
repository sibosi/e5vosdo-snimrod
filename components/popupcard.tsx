import React from "react";
import Image from "next/image";
import "../styles/globals.css";
import { PopupButton } from "./popupbutton";

type CardProps = {
  title: string;
  image?: string;
  details?: string;
  description: string;
  popup: boolean;
  children?: React.ReactNode;
};

export const PopupCard = ({
  title,
  image,
  details,
  description,
  popup,
  children,
}: CardProps) => {
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
      <div className="myglass card mb-2 h-auto w-40 text-foreground sm:w-60">
        {typeof image === "string" && (
          <figure className="relative h-unit-40 w-40 sm:h-unit-60 sm:w-60">
            <Image
              fill={true}
              sizes="100vw"
              className="h-auto rounded-md object-contain"
              src={image} // Ensure image is always a string here
              alt="image"
              priority={true}
            />
          </figure>
        )}

        <div className="card-body flex p-6">
          <h2 className="card-title overflow-hidden text-clip">{title}</h2>
          <p>{description}</p>
          {children}
          <div className="card-actions justify-end">
            <div className="flex flex-wrap gap-3">{OptionalButton(popup)}</div>
          </div>
        </div>
      </div>
    </>
  );
};
