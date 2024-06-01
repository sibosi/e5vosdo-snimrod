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
      <div className="card image-full bg-base-100 max-w-sm shadow-2xl rounded-2xl overflow-hidden">
        {typeof image === "string" && (
          <figure>
            <Image
              fill
              className="object-filld"
              src={image}
              alt="Movie"
              priority={true}
            />
          </figure>
        )}
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
          {children}
          <div className="card-actions justify-end">
            {OptionalButton(popup)}
          </div>
        </div>
      </div>
    </>
  );
};
