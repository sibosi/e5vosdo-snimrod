import React from "react";

type Alert = {
  children: React.ReactNode;
  className?: string;
};

export const Alert = ({ children, className }: Alert) => {
  return (
    <div
      className={
        "text-sm bg-amber-300 rounded-lg py-2 px-3 border-3 border-amber-400 mb-3 text-black w-fit " +
        className
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 inline"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="#1C274C" strokeWidth="1.5" />
        <path
          d="M12 17V11"
          stroke="#1C274C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="1"
          cy="1"
          r="1"
          transform="matrix(1 0 0 -1 11 9)"
          fill="#1C274C"
        />
      </svg>
      <div className="inline p-2">{children}</div>
    </div>
  );
};
