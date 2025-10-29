"use client";
import React, { useEffect } from "react";

const RedirectToWelcome = ({ isActive = true }: { isActive: boolean }) => {
  useEffect(() => {
    if (!isActive) return;
    const skipWelcome = localStorage.getItem("skipWelcome");
    if (!skipWelcome) window.location.href = "/welcome";
  }, [isActive]);

  return <></>;
};

export default RedirectToWelcome;
