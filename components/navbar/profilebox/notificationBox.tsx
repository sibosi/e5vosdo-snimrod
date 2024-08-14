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
    <div className={"px-1 rounded-2xl " + className + " " + colorStyle}>
      <div className="flex my-3 gap-2" onClick={onClick}>
        <div
          className={
            "block w-5 h-5 m-1 my-auto " + (className ?? "") + " " + colorStyle
          }
        >
          {icon}
        </div>
        <div className="text-left truncate w-full">
          <h3 className="flex font-bold gap-1">
            <p className="truncate">{title}</p>
          </h3>
          <span className="text-sm break-words text-foreground-600">
            {body}
          </span>
        </div>
        <div className="text-sm break-words text-foreground-600 text-end">
          <p>{sender}</p>
          <p>
            {time &&
              String(
                new Date(time)
                  .toLocaleString("hu-HU", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                  .substring(6)
              )}
          </p>
        </div>
      </div>
    </div>
  );
};
