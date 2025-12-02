"use client";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import { setCookie } from "@/lib/clientCookies";

export default function WelcomeHero() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid h-full lg:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-6 pb-6 pt-12 md:px-12">
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
              <h1 className="-mt-2 mb-4 flex flex-wrap gap-3 text-5xl font-bold md:text-7xl">
                <Logo className="mt-2 h-12 w-12 fill-selfprimary-800 md:h-16 md:w-16" />
                <span className="bg-gradient-to-r from-selfprimary-600 to-selfprimary-400 bg-clip-text pt-2 text-transparent">
                  Eötvös DÖ
                </span>
              </h1>
              <h2 className="text-2xl font-semibold text-selfprimary-700 md:text-3xl">
                2025/26-os diákönkormányzat
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
              <ul className="flex flex-col gap-3 text-selfprimary-700">
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
                <div className="mt-6 flex gap-4 max-md:flex-wrap">
                  <Button
                    size="lg"
                    color="secondary"
                    className="w-full min-w-48 font-semibold"
                    onPress={() => {
                      const element =
                        document.getElementById("welcome-features");
                      if (element)
                        element.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Lássuk a DÖ-t! &nbsp;➜
                  </Button>
                  <Button
                    size="lg"
                    color="secondary"
                    variant="bordered"
                    className="w-full min-w-48 font-semibold"
                    onPress={() => {
                      setCookie("skipWelcome", "true");
                      window.location.href = "/";
                    }}
                  >
                    ➜&nbsp;Bevezető kihagyása &nbsp;➜
                  </Button>
                </div>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ opacity: 0, scale: 0.8 }}
            initial={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-selfprimary-100 opacity-50 blur-3xl"
          ></motion.div>
          <motion.div
            animate={{ opacity: 0, scale: 0.8 }}
            initial={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-selfprimary-50 opacity-50 blur-3xl"
          ></motion.div>
        </div>

        <div className="relative min-h-64 [@media_(min-width:600px)]:min-h-96 [@media_(min-width:850px)]:min-h-[32rem]">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <Image
              src="/governments/2526/szombat-edited.jpeg"
              alt="Diákönkormányzat 2025/26"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent max-lg:hidden md:from-transparent"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
