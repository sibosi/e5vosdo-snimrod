"use client";
import { doLogout } from "@/actions/route";
import { Button, Chip } from "@nextui-org/react";
import React from "react";
import resetCache from "./PWA/resetCache";

interface LogoutProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const DoorIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="currentColor"
      className="fill-foreground-500"
      viewBox="0 0 16 16"
    >
      <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1" />
    </svg>
  );
};

export const LogoutButton = ({ className, size }: LogoutProps) => {
  return (
    <form action={doLogout} className="max-w-min">
      <Button
        type="submit"
        name="action"
        value="google"
        size={size ?? "sm"}
        onPress={resetCache}
        className={"rounded-badge fill-selfprimary " + className}
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
        <DoorIcon />
      </button>
    </form>
  );
};

export const LogoutBadge = () => {
  return (
    <form action={doLogout}>
      <button title="Kijelentkezés" type="submit">
        <Chip
          className="bg-selfprimary-100 pl-2 text-foreground-800"
          startContent={<DoorIcon />}
          size="sm"
        >
          <span>Kijelentkezés</span>
        </Chip>
      </button>
    </form>
  );
};
