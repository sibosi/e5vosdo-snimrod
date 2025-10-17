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
    <HeroUiAlert color="primary" className="m-2">
      {children}
    </HeroUiAlert>
  );
};
