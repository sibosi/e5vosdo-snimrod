"use client";
import manifestFile from "@/apps/web/public/manifest.json";
import { reinstallServiceWorker } from "./managesw";

export interface CheckResult {
  updateRequired: boolean;
  currentVersion: string | null;
  latestVersion: string | null;

  error?: boolean;
  errorMessage?: string;
}

export const getManifest = async () => {
  return (await fetch("/api/manifest").then((res) =>
    res.json().then((data) => data),
  )) as typeof manifestFile;
};

export const chechForUpdate = async (): Promise<CheckResult> => {
  if (typeof window === "undefined")
    return {
      updateRequired: false,
      currentVersion: null,
      latestVersion: null,
      error: true,
      errorMessage: "Window is not defined",
    };

  // The app version is stored in local storage
  const currentVersion = localStorage.getItem("version");
  const latestVersion: string = (await getManifest()).version;

  if (!currentVersion)
    return {
      updateRequired: true,
      currentVersion: null,
      latestVersion: null,
      error: true,
      errorMessage: "No version found in local storage",
    };

  return {
    updateRequired: compareVersions(currentVersion, latestVersion) === -1,
    currentVersion: currentVersion,
    latestVersion: latestVersion,
  };
};

function compareVersions(version1: string, version2: string): number {
  /**
   * -1 = version1 < version2
   * 0 = version1 === version2
   * 1 = version1 > version2
   */

  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0; // Ha nincs több elem, feltételezzük, hogy 0
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) {
      return 1; // version1 nagyobb, mint version2
    }
    if (v1 < v2) {
      return -1; // version1 kisebb, mint version2
    }
  }

  return 0; // A verziók egyenlőek
}

export const checkSWupdate = async (): Promise<CheckResult> => {
  if (typeof window === "undefined")
    return {
      updateRequired: false,
      currentVersion: null,
      latestVersion: null,
      error: true,
      errorMessage: "Window is not defined",
    };

  const requiredSWversion: string = (await getManifest()).required_sw_version;
  const currentVersion = localStorage.getItem("version");

  if (!currentVersion)
    return {
      updateRequired: true,
      currentVersion: null,
      latestVersion: requiredSWversion,

      error: true,
      errorMessage: "No version found in local storage",
    };

  return {
    updateRequired: compareVersions(currentVersion, requiredSWversion) === -1,
    currentVersion: currentVersion,
    latestVersion: requiredSWversion,
  };
};

export const updateVersion = async () => {
  if (!navigator.serviceWorker.controller)
    return "Update failed: No service worker controller";

  if ((await checkSWupdate()).updateRequired) await reinstallServiceWorker();

  navigator.serviceWorker.controller.postMessage({ action: "reCache" });
  const latestVersion = (await getManifest()).version;

  localStorage.setItem("version", latestVersion);
  console.log("App updated to version", latestVersion);

  return latestVersion;
};
