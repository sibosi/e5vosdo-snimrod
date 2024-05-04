"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";
import "../styles/globals.css";
import { Button } from "@nextui-org/button";

type CardProps = {
  title: string;
  image: string;
  details: string;
  children?: React.ReactNode;
};

export const PopupCard = ({ title, image, details, children }: CardProps) => {
  const [showWindow, setShowWindow] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null); // Use ref for the popup element

  const handleButtonClick = () => {
    setShowPopup(true);
    setShowWindow(true);
  };

  const handleCloseWindow = () => {
    setShowWindow(false); // Update state variable to hide window
  };

  useEffect(() => {
    if (showWindow) {
      document.body.classList.add("no-scroll");

      // Add event listener for clicks outside the popup
      const handleClickOutside = (event: MouseEvent) => {
        // Check if the clicked element is outside the popup element
        if (
          popupRef.current &&
          !popupRef.current.contains(event.target as Node)
        ) {
          handleCloseWindow();
        }
      };

      document.addEventListener("click", handleClickOutside);

      // Cleanup effect by removing the event listener
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [showWindow]);

  return (
    <>
      {showWindow && (
        <div className="fixed top-0 left-0 right-0 h-[100%] z-50 pt-[10%] pb-[20%] px-4 text-black">
          <div
            ref={popupRef} // Assign ref to the popup element
            className="light:bg-primary-content myglass md:h-[100%] h-full bg-opacity-60 p-4 rounded-xl flex flex-col justify-normal items-start text-center"
          >
            <Button
              className="absolute top-0 right-0 p-3"
              onClick={handleCloseWindow}
            >
              <FaTimes className="text-2xl" />
            </Button>
            <div className="overflow-auto md:flex h-auto pt-7">
              <div className="relative w-32 h-auto p-14 md:w-56 md:p-28">
                <Image
                  fill={true}
                  className="object-contain h-auto"
                  src={image}
                  alt="image"
                  priority={true}
                />
              </div>
              <div className="overflow-auto fill-overlay h-auto md:max-h-[100%] text-left text-foreground">
                <p className="text-lg">
                  {title}
                  <br />
                </p>
                <p className="text-md whitespace-pre-line pb-4">{details}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card myglass w-40 sm:w-60 mb-2 text-foreground">
        <figure className="relative w-40 sm:w-60 h-unit-40 sm:h-unit-60">
          <Image
            fill={true}
            className="w-full h-auto"
            src={image}
            alt="image"
            priority={true}
          />
        </figure>
        <div className="card-body flex">
          <h2 className="card-title text-clip overflow-hidden">{title}</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={handleButtonClick}>
              Részletek
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
