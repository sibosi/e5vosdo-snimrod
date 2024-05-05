"use client";

import clsx from "clsx";
import React from "react";
import Image from "next/image";
import image1 from "@/public/apa.jpg";

import { link as linkStyles } from "@nextui-org/theme";

type CardProps = {
  text: string;
  children: React.ReactNode;
};

export const WelcomeCard = ({ text, children }: CardProps) => {
  return (
    <div className="border border-transparent p-4 dark:text-white">
      <div className="card sm:card-side glass shadow-xl">
        <figure>
          <Image
            sizes="100vw"
            src={image1}
            alt="Album"
            className="object-fit sm:h-72 sm:w-auto"
          />
        </figure>
        <div className="card-body">
          <h2
            className={clsx(
              "card-title",
              linkStyles({ color: "foreground", isBlock: true })
            )}
          >
            New album is released!
          </h2>
          <p>{text}</p>
          {children}
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Listen</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
