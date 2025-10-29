"use client";

import { useEffect, useState } from "react";

// Theme detection utilities
function getThemePreference(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function intToHex(argbInt: number) {
  const r = (argbInt >> 16) & 0xff;
  const g = (argbInt >> 8) & 0xff;
  const b = argbInt & 0xff;
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function convertColorToHctTone(
  mainColor: string,
  tone: number,
): Promise<string> {
  try {
    const mc = await import("@material/material-color-utilities");
    const { Hct, argbFromRgb, hexFromArgb } = mc;

    const rgb = hexToRgb(mainColor);
    const argb = argbFromRgb(rgb.r, rgb.g, rgb.b);
    const current = Hct.fromInt(argb);
    const newHct = Hct.from(current.hue, current.chroma, tone);
    const outInt = newHct.toInt();

    return typeof hexFromArgb === "function"
      ? hexFromArgb(outInt)
      : intToHex(outInt);
  } catch (e) {
    console.warn(
      "Material color utilities not available, using original color",
    );
    return mainColor;
  }
}

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function useDominantColors(
  imageSrc: string | null | undefined,
  tone = 56,
) {
  const [colorHex, setColorHex] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">(
    getThemePreference(),
  );

  // Watch for theme changes
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentTheme(getThemePreference());
    };

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setCurrentTheme(e.matches ? "dark" : "light");
      }
    };

    // Listen for localStorage changes
    globalThis.window?.addEventListener("storage", handleStorageChange);

    // Listen for system theme changes
    const mediaQuery = globalThis.window?.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    mediaQuery?.addEventListener("change", handleSystemThemeChange);

    return () => {
      globalThis.window?.removeEventListener("storage", handleStorageChange);
      mediaQuery?.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!imageSrc) {
      setColorHex(null);
      return;
    }

    let mounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";

    // For external URLs, use our proxy
    const finalSrc = isExternalUrl(imageSrc)
      ? `/api/image-proxy?url=${encodeURIComponent(imageSrc)}`
      : imageSrc;

    img.onerror = () => {
      if (!mounted) return;
      console.error("Image loading failed");
      setColorHex(null);
    };

    img.onload = async () => {
      if (!mounted) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 32, 32);
        const imageData = ctx.getImageData(0, 0, 32, 32).data;

        // Get most frequent color
        const colorCounts = new Map<string, number>();
        for (let i = 0; i < imageData.length; i += 4) {
          if (imageData[i + 3] < 128) continue; // Skip transparent pixels
          const color = `${imageData[i]},${imageData[i + 1]},${imageData[i + 2]}`;
          colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
        }

        const dominantColor = Array.from(colorCounts.entries()).sort(
          (a, b) => b[1] - a[1],
        )[0];

        if (!dominantColor) return;

        const [r, g, b] = dominantColor[0].split(",").map(Number);
        const mainHex =
          "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

        // Adjust tone based on theme
        const adjustedTone = currentTheme === "light" ? 100 - tone : tone;

        // Convert to HCT with adjusted tone
        const finalHex = await convertColorToHctTone(mainHex, adjustedTone);

        if (mounted) setColorHex(finalHex);
      } catch (err) {
        console.error("Color extraction failed:", err);
      }
    };

    // Start the loading process
    img.src = finalSrc;

    return () => {
      mounted = false;
    };
  }, [imageSrc, tone, currentTheme]);

  return { colorHex };
}
