"use client";
import React from "react";
import { useEffect, useState } from "react";

const isInPWA = () => {
  // For iOS devices
  if ((window.navigator as any).standalone) {
    return true;
  }

  // For other devices (using display-mode media feature)
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  return false;
};

const IfPWA = ({ children }: { children: React.ReactNode }) => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(isInPWA());
  }, []);

  return <>{isPWA ? children : <></>}</>;
};

export default IfPWA;
