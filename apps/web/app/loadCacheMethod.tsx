"use client";
import React, { useEffect } from "react";

function updateCacheMethod(cacheMethod: "always" | "offline" | "never") {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: "updateCacheMethod",
      cacheMethod: cacheMethod,
    });
  }
}

const LoadCacheMethod = () => {
  useEffect(() => {
    updateCacheMethod(
      (localStorage.getItem("cacheMethod") as "always" | "offline" | "never") ||
        "always",
    );
  });
  return <></>;
};

export default LoadCacheMethod;
