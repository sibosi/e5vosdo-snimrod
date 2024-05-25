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
  //description = "If a dog chews shoes whose shoes does he choose?";
  //popup = false;

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
      <div className="card myglass w-40 sm:w-60 mb-2 h-auto text-foreground">
        {typeof image === "string" && (
          <figure className="relative w-40 sm:w-60 h-unit-40 sm:h-unit-60">
            <Image
              fill={true}
              sizes="100vw"
              className="object-contain h-auto rounded-md"
              src={image} // Ensure image is always a string here
              alt="image"
              priority={false}
            />
          </figure>
        )}

        <div className="card-body flex p-6">
          <h2 className="card-title text-clip overflow-hidden">{title}</h2>
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
