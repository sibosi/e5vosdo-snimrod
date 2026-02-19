import React from "react";
import { Alert as HeroUiAlert } from "@heroui/react";

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
  if (className?.includes("hidden")) return <></>;

  return (
    <div className="w-full max-w-full p-2">
      <HeroUiAlert color="primary">{children}</HeroUiAlert>
    </div>
  );
};
