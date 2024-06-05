"use client";
import React, { useState } from "react";
import "../styles/globals.css";
import { Link } from "@nextui-org/react";

type SectionProps = {
  title: string;
  dropdownable?: boolean;
  children: React.ReactNode;
  className?: string;
};

export const Section = ({
  title,
  dropdownable,
  children,
  className,
}: SectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleDropdown = () => {
    if (dropdownable) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={
        `transition-all duration-300 ${
          isOpen ? `py-3 text-foreground` : `py-0 text-gray-500`
        } ` + className
      }
    >
      <h1 className="text-2xl font-medium py-1" onClick={toggleDropdown}>
        {dropdownable && (
          <Link onClick={toggleDropdown}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 20 20"
              aria-hidden="true"
              className={`h-6 w-6 shrink-0 inline ${
                isOpen ? `rotate-0` : `rotate-180 fill-gray-400`
              }`}
              data-testid="flowbite-accordion-arrow"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
        )}

        {title}
      </h1>
      <div
        className={`transition-all duration-1000 ${
          !isOpen ? "max-h-0 overflow-hidden" : "h-auto"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
