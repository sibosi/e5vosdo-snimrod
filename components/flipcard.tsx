"use client";

import ReactCardFlip from "react-card-flip";
import React, { useState } from "react";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import Image from "next/image";
import image1 from "@/public/apa.jpg";

type CardProps = {
  text: string;
  children: React.ReactNode;
};

export const FlipCard = ({ text, children }: CardProps) => {
  const [flip, setFlip] = useState(false);
  return (
    <ReactCardFlip isFlipped={flip} flipDirection="horizontal">
      <div
        className="border border-transparent p-4 dark:text-white"
        onClick={() => setFlip(!flip)}
      >
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

      <div
        className="border border-transparent p-4 dark:text-white"
        onClick={() => setFlip(!flip)}
      >
        <div className="card lg:card-side glass shadow-xl">
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
    </ReactCardFlip>
  );
};
