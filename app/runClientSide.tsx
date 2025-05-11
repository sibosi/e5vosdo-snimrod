"use client";
import { loadPalette } from "@/components/themePicker";
import React from "react";

const loadPalettes = () => {
  ["primary", "secondary"].forEach((selfColor) => {
    loadPalette(selfColor);
  });
};

const RunClientSide = () => {
  React.useEffect(() => {
    loadPalettes();
  }, []);

  return <></>;
};

export default RunClientSide;
