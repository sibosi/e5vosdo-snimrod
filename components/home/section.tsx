"use client";
import React, { useEffect, useState } from "react";
import "@/styles/globals.css";
import { Button, ButtonGroup, Link } from "@heroui/react";

type SectionProps = {
  title: string;
  defaultStatus?: "opened" | "closed";
  dropdownable?: boolean;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  savable?: boolean;
  chip?: React.ReactNode;
  newVersion?: React.ReactNode;
  oldVersionName?: string;
  newVersionName?: string;
  isCard?: boolean;
};

const loadSectionStatus = (name: string) => {
  if (typeof window !== "undefined") {
    const status = localStorage.getItem("section_" + name);
    if (status === "false") return false;
    if (status === "true") return true;
  }
  return null;
};

const setSectionStatus = (name: string, status: boolean) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("section_" + name, status.toString());
  }
};

export const Section = ({
  title,
  defaultStatus,
  dropdownable,
  children,
  className,
  titleClassName,
  savable = true,
  chip,
  newVersion,
  oldVersionName = "Régi nézet",
  newVersionName = "Új nézet",
  isCard = false,
}: SectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultStatus != "closed");
  const [isNewVersion, setIsNewVersion] = useState(false);

  const updateVersion = (isNewVersion: boolean) => {
    setIsNewVersion(isNewVersion);
    if (newVersion !== undefined)
      localStorage.setItem(
        "section_" + title + "_new_version",
        isNewVersion.toString(),
      );
  };

  useEffect(() => {
    setIsOpen(
      (savable ? loadSectionStatus(title) : undefined) ??
        defaultStatus != "closed",
    );
    if (newVersion !== undefined)
      setIsNewVersion(loadSectionStatus(title + "_new_version") ?? false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDropdown = () => {
    if (!dropdownable) return;
    setIsOpen(!isOpen);
    if (savable) setSectionStatus(title, !isOpen);
  };

  if (isCard) className += " rounded-3xl bg-selfprimary-50 p-6";

  return (
    <div
      className={
        `transition-all duration-300 ${
          isOpen ? `py-3 text-foreground` : `py-0 text-gray-500`
        } ` + className
      }
    >
      <div className="flex">
        <button
          className="flex max-w-fit py-1 text-2xl font-medium"
          onClick={toggleDropdown}
        >
          {dropdownable && (
            <Link
              onPress={toggleDropdown}
              className="my-auto max-w-fit text-selfprimary"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`inline h-6 w-6 shrink-0 ${
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
          <h2 className={titleClassName}>{title}</h2>
          <span className="my-auto ml-2 flex max-h-min justify-center pt-1 align-middle">
            {chip}
          </span>
        </button>
        {newVersion !== undefined && isOpen && (
          <span className="ml-auto pl-2 text-xs text-red-500">
            <ButtonGroup>
              <Button
                onPress={() => updateVersion(false)}
                size="sm"
                className={
                  "border-selfprimary-100 " +
                  (!isNewVersion
                    ? "bg-selfprimary-100 text-selfprimary-900"
                    : "border-1 bg-transparent text-selfprimary-500")
                }
              >
                {oldVersionName}
              </Button>
              <Button
                onPress={() => updateVersion(true)}
                size="sm"
                className={
                  "border-selfprimary-100 " +
                  (isNewVersion
                    ? "bg-selfprimary-100 text-selfprimary-900"
                    : "border-1 bg-transparent text-selfprimary-500")
                }
              >
                {newVersionName}
              </Button>
            </ButtonGroup>
          </span>
        )}
      </div>
      <div
        className={`transition-all duration-1000 ${
          !isOpen ? "max-h-0 overflow-hidden" : "h-auto"
        }`}
      >
        <div className="transition-none">
          {isNewVersion ? newVersion : children}
        </div>
      </div>
    </div>
  );
};
