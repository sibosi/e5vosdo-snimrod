"use client";

import GoogleAnalytics from "@bradgarropy/next-google-analytics";
import { useEffect } from "react";

const MEASUREMENT_ID = "G-P74RJ9THHS";

export default function Analytics({
  analyticsId,
}: Readonly<{ analyticsId?: string }>) {
  useEffect(() => {
    if (!analyticsId || !globalThis.gtag) return;
    globalThis.gtag("config", MEASUREMENT_ID, {
      user_id: analyticsId,
    });
  }, [analyticsId]);

  return <GoogleAnalytics measurementId={MEASUREMENT_ID} />;
}
