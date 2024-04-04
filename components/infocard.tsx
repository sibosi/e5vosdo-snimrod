"use client";
import Image from "next/image";
import { useState } from "react";
import ReactCardFlip from "react-card-flip";

type CardProps = {
  title: string;
  image: string;
  details: string;
  children?: React.ReactNode;
};

export const InfoCard = ({ title, image, details, children }: CardProps) => {
  const [flip, setFlip] = useState(false);
  return (
    <ReactCardFlip isFlipped={flip} flipDirection="horizontal">
      <div
        className="card glass w-40 sm:w-60 dark:text-white mb-2"
        onClick={() => setFlip(!flip)}
      >
        <figure className="relative w-40 sm:w-60 h-unit-40 sm:h-unit-60">
          <Image src={image} alt="image" fill={true} />
        </figure>
        <div className="card-body flex">
          <h2 className="card-title">{title}</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>

      <div
        className="card glass w-40 sm:w-60 dark:text-white mb-2 shadow-xl card-body"
        onClick={() => setFlip(!flip)}
      >
        <h2 className="card-title">{title}</h2>
        <p>{details}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </ReactCardFlip>
  );
};
