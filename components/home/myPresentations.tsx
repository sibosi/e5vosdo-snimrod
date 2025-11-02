"use client";

import React, { useEffect, useState } from "react";
import {
  PresentationType,
  PresentationSlotType,
} from "@/db/presentationSignup";
import { Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";

const MyPresentations = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>([]);
  const [slots, setSlots] = useState<PresentationSlotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
    fetchMyPresentations();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/presentations/getPresentationSlots");
      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  };

  const fetchMyPresentations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/presentations/getMyPresentations");
      if (response.ok) {
        const data: PresentationType[] = await response.json();
        setPresentations(data);
      } else {
        setError("Hiba történt a prezentációk betöltése közben");
      }
    } catch (err) {
      console.error("Error fetching presentations:", err);
      setError("Hiba történt a prezentációk betöltése közben");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="rounded-lg bg-selfprimary-50 p-6 text-center text-foreground-600">
        <p>Nem jelentkeztél előadásra.</p>
        <a
          href="/jelentkezes"
          className="mt-2 inline-block text-selfprimary-700 underline hover:text-selfprimary-900"
        >
          Jelentkezz most →
        </a>
      </div>
    );
  }

  // Group presentations by slot_id
  const groupedBySlot = presentations.reduce(
    (acc, pres) => {
      if (!acc[pres.slot_id]) {
        acc[pres.slot_id] = [];
      }
      acc[pres.slot_id].push(pres);
      return acc;
    },
    {} as { [slotId: number]: PresentationType[] },
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedBySlot)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([slotIdStr, preses]) => {
          const slotId = Number(slotIdStr);
          const slot = slots.find((s) => s.id === slotId);
          const slotTitle = slot?.title || `Slot #${slotId}`;

          return (
            <div key={slotId}>
              <h3 className="mb-2 font-semibold text-selfprimary-900">
                {slotTitle}
                {slot?.details && (
                  <span className="ml-2 text-sm font-normal text-foreground-600">
                    ({slot.details})
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {preses.map((pres) => (
                  <Card key={pres.id} className="shadow-sm">
                    <CardHeader className="flex-col items-start gap-1 pb-2">
                      <div className="flex w-full items-start justify-between">
                        <h4 className="text-lg font-semibold">{pres.title}</h4>
                        <Chip size="sm" color="primary" variant="flat">
                          ID: {pres.id}
                        </Chip>
                      </div>
                      {pres.performer && (
                        <p className="text-sm text-foreground-600">
                          Előadó: {pres.performer}
                        </p>
                      )}
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-1 text-sm">
                        <p className="text-foreground-700">
                          <span className="font-medium">Helyszín:</span>{" "}
                          {pres.address}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default MyPresentations;
