import React from "react";
import { Alert as HeroUiAlert } from "@heroui/react";

type Alert = {
  children: React.ReactNode;
  className?: string;
  hideIcon?: boolean;
};

export const Alert = ({ children, className, hideIcon = false }: Alert) => {
  if (className?.includes("hidden")) return <></>;

  return (
    <div className="w-full max-w-full p-2">
      <HeroUiAlert hideIcon={hideIcon} color="primary">
        {children}
      </HeroUiAlert>
    </div>
  );
};
