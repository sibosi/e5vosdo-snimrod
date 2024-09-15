"use client";
import React, { useState, useEffect } from "react";
import { ThemeOptions } from "../themePicker";
import { Button, Link } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { reinstallServiceWorker } from "../PWA/managesw";

const Welcome = () => {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    const getWelcome = () => {
      return localStorage.getItem("welcome") === "false" ? false : true;
    };

    setShowWelcome(getWelcome());
  }, []);

  return (
    showWelcome && (
      <div className="rounded-2xl border-1 p-4 text-lg text-foreground shadow-lg">
        <h1 className="text-4xl font-bold">Üdv a DÖ alkalmazásban! 🎉</h1>
        <p className="mt-2">
          Az alkalmazásban a következő modulok érhetőek el:
        </p>
        <ul className="mt-2 list-inside list-disc">
          <li>Órarend</li>
          <li>Szabad teremkereső</li>
          <li>Teremcserék</li>
          <li>Helyettesítések</li>
          <li>Menza</li>
          <li>Események</li>
          <li>Klubok és szakkörök</li>
          <li>Visszajelzés a DÖ-nek</li>
        </ul>

        <p className="my-2">
          A &quot;profil&quot; oldalon tudod adataidat, beállításaidat
          módosítani.
        </p>
        <p className="my-2">Válassz témát az alábbiak közül:</p>

        <ThemeOptions />

        <p className="my-2">
          Ha bármilyen hibát tapasztalsz, vagy ötleted lenne az alkalmazással
          kapcsolatban, kérjük jelezd a{" "}
          <span>
            <Link
              className="text-lg font-bold text-selfprimary"
              href={siteConfig.links.feedback}
            >
              visszajelzési űrlapon
            </Link>
          </span>{" "}
          keresztül!
        </p>
        <Button
          className="mt-4 bg-selfprimary-100"
          onClick={() => {
            localStorage.setItem("welcome", "false");
            reinstallServiceWorker();
            window.location.reload();
          }}
        >
          Jó szórakozást!
        </Button>
      </div>
    )
  );
};

export default Welcome;
