"use client";
import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";
import {
  CalendarIcon,
  MicrophoneIcon,
  UsersIcon,
  NewspaperIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import PodcastPlayer from "./PodcastPlayer";
import { useEvents } from "@/hooks/useEvents";

export default function WelcomeFeatures() {
  const { events, futureEvents, isLoading } = useEvents(false);

  const nextEventWithImage = (() => {
    if (isLoading) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasImage = (event: any) =>
      event && typeof event === "object" && "image" in event && event.image;

    const getEventDate = (dateStr: string) =>
      new Date(dateStr.replaceAll("-", "/"));

    const allEvents = { ...events, ...futureEvents };

    if (!allEvents || typeof allEvents !== "object") {
      console.log("No events available:", { events, futureEvents });
      return null;
    }

    const validDates = Object.keys(allEvents)
      .filter((date) => getEventDate(date) >= today)
      .sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());

    for (const date of validDates) {
      const eventsForDate = allEvents[date];
      if (!Array.isArray(eventsForDate) || eventsForDate.length === 0) continue;

      const eventWithImage = eventsForDate.find(hasImage);
      if (eventWithImage) {
        console.log("Found event with image:", { date, eventWithImage });
        return {
          date,
          ...eventWithImage,
        };
      }
    }

    if (validDates.length > 0) {
      console.log(
        "Events found but none with images. Valid dates:",
        validDates,
      );
      console.log("Sample event structure:", allEvents[validDates[0]]);
    } else {
      console.log("No valid dates found. All dates:", Object.keys(allEvents));
    }
    return null;
  })();

  return (
    <div className="px-6 py-12" id="welcome-features">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12 text-center text-3xl font-bold text-selfprimary-900 md:text-4xl"
      >
        Ismerj meg minket közelebbről!
      </motion.h3>

      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-xl bg-selfprimary-bg shadow-lg"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image
                src={
                  nextEventWithImage?.image || "/governments/2526/szombat.jpg"
                }
                alt={
                  typeof nextEventWithImage?.title === "object"
                    ? nextEventWithImage.title.join(" ")
                    : nextEventWithImage?.title || "Diákönkormányzat 2025/26"
                }
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-3 text-white">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <h4 className="text-2xl font-bold text-selfprimary-900">
                  Események
                </h4>
              </div>
              <p className="mb-4 text-selfprimary-600">
                Kövesd nyomon az iskola legfontosabb eseményeit, programjait és
                rendezvényeit.
              </p>
              {(() => {
                if (isLoading) {
                  return (
                    <div className="mb-6 rounded-lg bg-selfprimary-50 p-4">
                      <p className="text-sm text-selfprimary-700">
                        Betöltés...
                      </p>
                    </div>
                  );
                }

                if (!nextEventWithImage) {
                  return (
                    <div className="mb-6 rounded-lg bg-selfprimary-50 p-4">
                      <p className="text-sm text-selfprimary-700">
                        Jelenleg nincs közelgő esemény
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="mb-6 rounded-lg bg-selfprimary-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-selfprimary-600" />
                      <span className="font-medium">Következő esemény</span>
                    </div>
                    <p className="text-sm text-selfprimary-700">
                      {typeof nextEventWithImage.title === "object"
                        ? nextEventWithImage.title.join(" ")
                        : nextEventWithImage.title}
                    </p>
                    <p className="mt-1 text-xs text-selfprimary-500">
                      {new Date(
                        nextEventWithImage.date.replaceAll("-", "/"),
                      ).toLocaleDateString("hu-HU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {nextEventWithImage.show_time
                        ? " • " + nextEventWithImage.time
                        : " • Egész nap"}
                    </p>
                  </div>
                );
              })()}
              <Link href="/events">
                <Chip
                  color="primary"
                  variant="flat"
                  className="cursor-pointer bg-selfprimary-100 text-selfprimary-800"
                >
                  Események megtekintése →
                </Chip>
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="overflow-hidden rounded-xl bg-selfprimary-bg shadow-lg"
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-600 p-3 text-white">
                  <NewspaperIcon className="h-6 w-6" />
                </div>
                <h4 className="text-2xl font-bold text-selfprimary-900">
                  Hírek
                </h4>
              </div>
              <p className="mb-4 text-selfprimary-600">
                Friss információk, bejelentések és fontos közlemények egy
                helyen.
              </p>
              <div className="mb-6 rounded-lg bg-selfprimary-50 p-4">
                <p className="font-medium text-selfprimary-900">
                  Köszönjük, hogy velünk tartottatok az Eötvös Napokon!
                </p>
                <p className="mt-2 text-sm text-selfprimary-600">
                  Mindenkinek kellemes őszi szünetet kívánunk! 🍁
                  <br />A KiMitTud? videó már elérhető a főoldalon!
                </p>
                <p className="mt-2 text-xs text-selfprimary-500">
                  - Diákönkormányzat
                </p>
              </div>
              <Link href="/">
                <Chip
                  color="primary"
                  variant="flat"
                  className="cursor-pointer bg-selfprimary-100 text-selfprimary-800"
                >
                  További hírek →
                </Chip>
              </Link>
            </div>
            <div className="relative h-64 md:h-auto">
              <VideoPlayer
                videoId="BLGtv4RRVSY"
                title="Eötvös Napok Összefoglaló"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg"
        >
          <div className="grid md:grid-cols-2">
            <div className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-selfprimary-bg/20 rounded-full p-3 text-white">
                  <MicrophoneIcon className="h-6 w-6" />
                </div>
                <h4 className="text-2xl font-bold text-white">E5T Podcast</h4>
              </div>
              <p className="mb-6 text-white/90">
                Hallgasd meg az iskola saját podcastját érdekes témákkal és
                beszélgetésekkel.
              </p>
              <div className="mb-6">
                <PodcastPlayer
                  title="Tippjeink a szezonra"
                  episode="SE:1 EP:2"
                  audioUrl="https://anchor.fm/s/10134ec00/podcast/play/109998896/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2025-9-21%2F409687339-44100-2-487d0d2c3c047.m4a"
                  coverImage="https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_episode/43052128/43052128-1761054507160-4acbbb2fe2103.jpg"
                />
              </div>
              <Link href="/est">
                <Chip
                  color="primary"
                  variant="flat"
                  className="cursor-pointer bg-selfprimary-bg text-rose-600"
                >
                  Összes epizód →
                </Chip>
              </Link>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-sm"></div>
              <Image
                src="https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/43052128/43052128-1740524882766-2bb20f727e8ea.jpg"
                alt="E5T Podcast"
                fill
                unoptimized
                className="object-contain p-12"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="overflow-hidden rounded-xl bg-selfprimary-bg shadow-lg"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-auto">
              <Image
                src="/welcome/Klubexpo0065.jpg"
                alt="Klubok"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-600 p-3 text-white">
                  <UsersIcon className="h-6 w-6" />
                </div>
                <h4 className="text-2xl font-bold text-selfprimary-900">
                  Klubok & Szakkörök
                </h4>
              </div>
              <p className="mb-4 text-selfprimary-600">
                Fedezd fel a különböző klubokat és csatlakozz a közösségekhez.
              </p>
              <div className="mb-6 space-y-3 rounded-lg bg-selfprimary-50 p-4">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-selfprimary-600" />
                  <span className="font-medium text-selfprimary-900">
                    Aktív klubok
                  </span>
                </div>
                <ul className="ml-6 list-disc space-y-1 text-sm text-selfprimary-700">
                  <li>🎭 Színjátszó kör</li>
                  <li>🎵 Podcast</li>
                  <li>🏐 Röplabda</li>
                  <li>💻 Technikusi Szervezet</li>
                  <li>⭐ és még sok más!</li>
                </ul>
              </div>
              <Link href="/clubs">
                <Chip
                  color="primary"
                  variant="flat"
                  className="cursor-pointer bg-selfprimary-100 text-selfprimary-800"
                >
                  Klubok felfedezése →
                </Chip>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
