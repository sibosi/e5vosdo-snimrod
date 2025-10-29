"use client";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

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
        <p className="mx-auto mb-8 max-w-2xl text-lg text-selfprimary-700">
          Csatlakozz a közösséghez és ne maradj le semmiről! Minden fontos
          információ egy helyen vár rád.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="min-w-48 bg-selfprimary-500 font-semibold text-white hover:bg-selfprimary-600"
            onPress={handleSkipWelcome}
          >
            🚀 Kösz a bevezetőt! Kezdjük el! 🚀
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
