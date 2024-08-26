"use client";
import { Button } from "@nextui-org/react";
import React from "react";

const ToManageButton = ({ className }: { className?: string }) => {
  return (
    <Button
      className={"fill-selfprimary " + className}
      onClick={() => {
        window.location.href = "/about";
      }}
    >
      Az oldal kezelése
    </Button>
  );
};

export default ToManageButton;
