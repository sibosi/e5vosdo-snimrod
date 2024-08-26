"use client";
import React from "react";

export const NotificationBox = ({
  icon,
  title,
  body,
  sender,
  time,
  onClick,
  className,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  sender?: string;
  time?: string;
  onClick?: () => void;
  className?: string;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "foreground";
}) => {
  const colorStyle = color
    ? {
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-secondary-100 text-secondary-700",
        success: "bg-success-100 text-success-700",
        warning: "bg-warning-100 text-warning-700",
        danger: "bg-danger-100 text-danger-700",
        foreground: "bg-foreground-100 text-foreground-700",
      }[color]
    : "";

  return (
    <div className={"rounded-2xl px-1 " + className + " " + colorStyle}>
      <div className="my-3 flex gap-2" onClick={onClick}>
        <div
          className={
            "m-1 my-auto block h-5 w-5 " + (className ?? "") + " " + colorStyle
          }
        >
          {icon}
        </div>
        <div className="w-full truncate text-left">
          <h3 className="flex gap-1 font-bold">
            <p className="truncate">{title}</p>
          </h3>
          <span className="break-words text-sm text-foreground-600">
            {body}
          </span>
        </div>
        <div className="break-words text-end text-sm text-foreground-600">
          <p>{sender}</p>
          <p>
            {time &&
              String(
                new Date(time)
                  .toLocaleString("hu-HU", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                  .substring(6),
              )}
          </p>
        </div>
      </div>
    </div>
  );
};
