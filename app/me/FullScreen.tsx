"use client";
import React, { useEffect } from "react";

const FullScreenBrightness = ({ children }: { children: React.ReactNode }) => {
  const handleFullScreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to enter fullscreen mode:", error);
    }
  };

  const handleExitFullScreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Failed to exit fullscreen mode:", error);
    }
  };

  useEffect(() => {
    handleFullScreen();

    return () => {
      handleExitFullScreen();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
      {children}
    </div>
  );
};

export default FullScreenBrightness;
