"use client";
import { Button } from "@heroui/react";
import React from "react";

export default function PresentationAPIButtons() {
  return (
    <div className="flex gap-2">
      <Button
        color="primary"
        onPress={() =>
          fetch("/api/presentations/startSignup").then((response) => {
            if (response.ok) alert("Jelentkezés elindítva!");
            else alert("Hiba történt a jelentkezés elindításakor!");
          })
        }
      >
        Jelentkezés elindítása
      </Button>

      <Button
        color="primary"
        onPress={() =>
          fetch("/api/presentations/pauseSignup").then((response) => {
            if (response.ok) alert("Jelentkezés szüneteltetve!");
            else alert("Hiba történt a jelentkezés szüneteltetésekor!");
          })
        }
      >
        Jelentkezés szüneteltetése
      </Button>
    </div>
  );
}
