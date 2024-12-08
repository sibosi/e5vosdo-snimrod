"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OGURL() {
  const router = useRouter();
  const isFakeAuth = process.env.FAKE_AUTH === "true";

  useEffect(() => {
    const allowedDomains = ["info.e5vosdo.hu", "localhost", "192."];
    const currentDomain = window.location.hostname;

    if (!allowedDomains.includes(currentDomain) && !isFakeAuth) {
      router.push("https://info.e5vosdo.hu" + window.location.pathname);
    }
  }, [isFakeAuth, router]);

  return null;
}
