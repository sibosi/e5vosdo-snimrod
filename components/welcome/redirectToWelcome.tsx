"use client";
import React, { useEffect } from "react";
import { getCookie } from "@/lib/clientCookies";

const RedirectToWelcome = ({ isActive = true }: { isActive: boolean }) => {
  useEffect(() => {
    if (!isActive) return;
    const skipWelcome = getCookie("skipWelcome");
    const isBot =
      navigator.userAgent.toLowerCase().includes("google.com/bot.html") ||
      /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|semrush|ahrefs|mj12bot|seznambot|facebookexternalhit|twitterbot|linkedinbot|embedly|crawler|spider|\bbot\b/i.test(
        navigator.userAgent.toLowerCase(),
      );

    if (!skipWelcome && !isBot) globalThis.location.href = "/welcome";
  }, [isActive]);

  return <></>;
};

export default RedirectToWelcome;
