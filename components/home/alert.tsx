import React from "react";

type Alert = {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  icon?: boolean;
};

export const Alert = ({
  children,
  className,
  padding = true,
  icon = true,
}: Alert) => {
  return (
    <div
      className={
        "w-fit rounded-lg border-3 text-sm text-foreground shadow-md " +
        (padding && "mb-3 px-3 py-2") +
        " " +
        className
      }
    >
      {icon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
          <path d="M12 17V11" strokeWidth="1.5" strokeLinecap="round" />
          <circle
            cx="1"
            cy="1"
            r="0.75"
            transform="matrix(1 0 0 -1 11 9)"
            fill="currentColor"
          />
        </svg>
      )}
      <div className="inline">{children}</div>
    </div>
  );
};
