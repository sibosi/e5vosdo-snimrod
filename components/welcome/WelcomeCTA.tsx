"use client";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { ThemeOptions } from "../themePicker";

export default function WelcomeCTA() {
  const handleSkipWelcome = () => {
    localStorage.setItem("skipWelcome", "true");
    window.location.href = "/";
  };

  return (
    <div className="px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <h3 className="mb-6 text-3xl font-bold text-selfprimary-900 md:text-4xl">
          Készen állsz a kezdésre?
        </h3>
        <p className="mx-auto mb-4 max-w-2xl text-lg text-selfprimary-700">
          Válassz egy menő palettát és vágjunk bele!
        </p>

        <ThemeOptions className="grid grid-cols-3 justify-items-center gap-4 md:grid-cols-5 lg:grid-cols-9" />

        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            color="secondary"
            className="min-w-48 font-semibold"
            onPress={handleSkipWelcome}
          >
            🚀 Kösz a bevezetőt! Kezdjük el! 🚀
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
