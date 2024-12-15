"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OGURL() {
  const router = useRouter();

  useEffect(() => {
    const allowedDomains = ["info.e5vosdo.hu", "localhost"];
    const currentDomain = window.location.hostname;

    if (!allowedDomains.includes(currentDomain)) {
      // router.push("https://info.e5vosdo.hu" + window.location.pathname);
    }
  }, [router]);

  return null;
}
