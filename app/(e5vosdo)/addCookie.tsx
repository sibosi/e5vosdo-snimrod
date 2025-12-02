"use client";
import { setCookie } from "@/lib/clientCookies";
import { useEffect } from "react";

const AddCookie = () => {
  useEffect(() => {
    const now = Date.now();
    const targetDate = new Date("2025-12-05T00:00:00Z").getTime();
    if (now < targetDate) setCookie("skipWelcome", "true");
  }, []);

  return null;
};

export default AddCookie;
