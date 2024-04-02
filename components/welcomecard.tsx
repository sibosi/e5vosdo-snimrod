"use client";

import clsx from "clsx";
import React from "react";

import { link as linkStyles } from "@nextui-org/theme";

type CardProps = {
  text: string;
  children: React.ReactNode;
};

export const WelcomeCard = ({ text, children }: CardProps) => {
  return (
    <div className="border border-transparent p-4 dark:text-white">
      <div className="card lg:card-side glass shadow-xl">
        <figure>
          <img
            src="https://scontent-dfw5-1.cdninstagram.com/v/t51.29350-15/426628793_718104097150387_1631207887608414653_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=18de74&_nc_ohc=8o_2M5TZD5QAX8JZO5U&_nc_ht=scontent-dfw5-1.cdninstagram.com&edm=AL-3X8kEAAAA&oh=00_AfAD77OBN5GxddLNO7HsTEiBlg3h3ctKWxW5iud_jQSh7A&oe=660A4090"
            alt="Album"
            className="object-fit h-72 w-auto"
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
