"use client";
import { Button } from "@heroui/react";
import React from "react";

export default function PresentationAPIButtons() {
  const callSignupAction: (
    endpoint: string,
    confirmation: string,
    successMessage: string,
    errorMessage: string,
  ) => Promise<void> = async (
    endpoint: string,
    confirmation: string,
    successMessage: string,
    errorMessage: string,
  ) => {
    if (!confirm(confirmation)) return;

    try {
      const response = await fetch(`/api/presentations/${endpoint}`);
      alert(response.ok ? successMessage : errorMessage);
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
      alert(errorMessage);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        color="primary"
        onPress={() =>
          callSignupAction(
            "openAllSigupForEveryoune",
            "Biztosan mindenki számára megnyitod minden prezentáció jelentkezését?",
            "Minden prezentáció megnyitva mindenki számára!",
            "Hiba történt a jelentkezés megnyitásakor!",
          )
        }
      >
        Jelentkezés megnyitása mindenkinek
      </Button>

      <Button
        color="primary"
        onPress={() =>
          callSignupAction(
            "openAllSignupOnlyForPriority",
            "Biztosan csak az elsőbbségi jelentkezéssel rendelkezők számára nyitod meg minden prezentáció jelentkezését?",
            "Minden prezentáció megnyitva elsőbbségi jelentkezésre!",
            "Hiba történt a prioritásos jelentkezés megnyitásakor!",
          )
        }
      >
        Megnyitás csak elsőbbségieknek
      </Button>

      <Button
        color="danger"
        onPress={() =>
          callSignupAction(
            "closeAllSignupForAll",
            "Biztosan le szeretnéd zárni minden prezentációnál a jelentkezést?",
            "Minden prezentációnál lezárva a jelentkezés!",
            "Hiba történt a jelentkezés lezárásakor!",
          )
        }
      >
        Minden jelentkezés lezárása
      </Button>
    </div>
  );
}
