"use client";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function WelcomeHero() {
  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      <div className="grid h-full md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-6 py-12 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="mb-4 text-5xl font-bold md:text-7xl">
                <span className="bg-gradient-to-r from-selfprimary-600 to-selfprimary-400 bg-clip-text text-transparent">
                  Eötvös DÖ
                </span>
              </h1>
              <h2 className="text-2xl font-semibold text-selfprimary-700 md:text-3xl">
                2025/26-os Kormány
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <p className="mb-6 text-lg text-selfprimary-600 md:text-xl">
                Az Eötvös József Gimnázium diákönkormányzata a Te hangodat
                képviseli. Célunk egy olyan közösség építése, ahol minden diák
                megtalálja a helyét és lehetőségeit.
              </p>
              <ul className="space-y-3 text-selfprimary-700">
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center"
                >
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-selfprimary-500"></div>
                  Diákjogok képviselete
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center"
                >
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-selfprimary-500"></div>
                  Iskolai programok szervezése
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="flex items-center"
                >
                  <div className="mr-2 h-1.5 w-1.5 rounded-full bg-selfprimary-500"></div>
                  Közösségépítés
                </motion.li>
                <Button
                  size="lg"
                  className="min-w-48 bg-selfsecondary-500 font-semibold text-white hover:bg-selfsecondary-600"
                  onPress={() => {
                    localStorage.setItem("skipWelcome", "true");
                    window.location.href = "/";
                  }}
                >
                  ➜ Bevezető kihagyása ➜
                </Button>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-selfprimary-100 opacity-50 blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-selfprimary-50 opacity-50 blur-3xl"
          ></motion.div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src="/governments/2526/szombat.jpg"
              alt="Diákönkormányzat 2025/26"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent md:from-transparent"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
