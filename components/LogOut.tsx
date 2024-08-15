import { doLogout } from "@/actions/route";
import { Button } from "@nextui-org/react";
import React from "react";

interface LogoutProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LogoutButton = ({ className, size }: LogoutProps) => {
  return (
    <form action={doLogout} className="max-w-min">
      <Button
        type="submit"
        name="action"
        value="google"
        color="primary"
        size={size ? size : "sm"}
        className={"rounded-badge " + className}
      >
        Kijelentkezés
      </Button>
    </form>
  );
};

export const LogoutIcon = () => {
  return (
    <form action={doLogout} className="h-5 max-w-min">
      <button
        title="Kijelentkezés"
        type="submit"
        className="max-h-min max-w-min border-none bg-transparent p-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-door-open-fill fill-foreground-500 hover:fill-foreground-600"
          viewBox="0 0 16 16"
        >
          <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1" />
        </svg>
      </button>
    </form>
  );
};
