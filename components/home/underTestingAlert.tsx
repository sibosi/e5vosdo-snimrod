import React from "react";
import { siteConfig } from "@/config/site";
import { Alert } from "./alert";

const UnderTestingAlert = () => {
  return (
    <Alert
      icon={false}
      className="border-selfsecondary-300 bg-selfsecondary-100"
    >
      Figyelem! Ez a funkció még fejlesztés alatt áll, és nem minden esetben
      működik megfelelően. Kérjük, hogy tapasztalataidat oszd meg velünk a{" "}
      <a
        href={siteConfig.links.feedback}
        target="_blank"
        rel="noopener noreferrer"
        className="text-selfprimary-700 underline"
      >
        visszajelzések
      </a>{" "}
      oldalon, hogy javíthassuk a felhasználói élményt.
    </Alert>
  );
};

export default UnderTestingAlert;
