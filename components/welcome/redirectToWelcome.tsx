"use client";
import React, { useEffect } from "react";

const RedirectToWelcome = () => {
  useEffect(() => {
    const skipWelcome = localStorage.getItem("skipWelcome");
    if (!skipWelcome) window.location.href = "/welcome";
  }, []);

  return <></>;
};

export default RedirectToWelcome;
