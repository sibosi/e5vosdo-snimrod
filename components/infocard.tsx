"use client";
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
    <ReactCardFlip isFlipped={flip} flipDirection="horizontal" cardStyles={{}}>
      <div
        className="card w-96 bg-base-100 flex"
        onClick={() => setFlip(!flip)}
      >
        <figure>
          <img src={image} alt="image" />
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
        className="card w-96 bg-base-100 shadow-xl card-body"
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
