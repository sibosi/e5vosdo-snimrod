import React from "react";

type Alert = {
  children: React.ReactNode;
  className?: string;
};

export const Alert = ({ children, className }: Alert) => {
  return (
    <div
      className={
        "mb-3 w-fit rounded-lg border-3 px-3 py-2 text-sm text-foreground shadow-md " +
        className
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="inline h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        <path d="M12 17V11" strokeWidth="1.5" strokeLinecap="round" />
        <circle
          cx="1"
          cy="1"
          r="1"
          transform="matrix(1 0 0 -1 11 9)"
          fill="currentColor"
        />
      </svg>
      <div className="inline p-2">{children}</div>
    </div>
  );
};
