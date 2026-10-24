import React from "react";
import { Alert as HeroUiAlert } from "@heroui/react";

type Alert = {
  children: React.ReactNode;
  className?: string;
  hideIcon?: boolean;
  color?: "primary" | "default" | "success" | "warning" | "danger";
};

export const Alert = ({
  children,
  className,
  hideIcon = false,
  color = "primary",
}: Alert) => {
  if (className?.includes("hidden")) return <></>;

  return (
    <div className="w-full max-w-full p-2">
      <HeroUiAlert hideIcon={hideIcon} color={color}>
        {children}
      </HeroUiAlert>
    </div>
  );
};
