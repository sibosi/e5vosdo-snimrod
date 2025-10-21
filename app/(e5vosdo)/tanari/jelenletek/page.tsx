"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { PresentationType } from "@/db/presentationSignup";
import Link from "next/link";

export default function PresentationSelectionPage() {
  const [presentations, setPresentations] = useState<PresentationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedPresentations, setGroupedPresentations] = useState<{
    [slot: string]: PresentationType[];
  }>({});

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/presentations/getPresentations");
      if (response.ok) {
        const data = await response.json();
        setPresentations(data);

        // Group presentations by slot
        const grouped = data.reduce(
          (
            acc: { [slot: string]: PresentationType[] },
            presentation: PresentationType,
          ) => {
            if (!acc[presentation.slot]) {
              acc[presentation.slot] = [];
            }
            acc[presentation.slot].push(presentation);
            return acc;
          },
          {},
        );
        setGroupedPresentations(grouped);
      } else {
        alert("Hiba a prezentációk betöltésekor");
      }
    } catch (error) {
      console.error("Error fetching presentations:", error);
      alert("Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex max-w-6xl justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-1">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Prezentációk - Jelenléti ív</h1>
        <p className="mt-2 text-foreground-600">
          Válassza ki az egyik előadást a jelenléti ív megtekintéséhez.
        </p>
      </div>

      {presentations.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-center text-foreground-500">
              Nincsenek prezentációk
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPresentations)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([slot, slotPresentations]) => (
              <Card key={slot}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{slot}. sáv</h2>
                    <Chip size="sm" variant="flat">
                      {slotPresentations.length} előadás
                    </Chip>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {slotPresentations.map((presentation) => (
                      <Link
                        key={presentation.id}
                        href={`/tanari/jelenletek/${presentation.id}`}
                        className="w-full"
                      >
                        <Card
                          isPressable
                          isHoverable
                          className="h-full w-full transition-all hover:scale-105"
                        >
                          <CardBody>
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold">
                                  {presentation.id}. {presentation.title}
                                </h3>
                              </div>

                              {presentation.performer && (
                                <p className="text-sm text-foreground-600">
                                  <strong>Előadó:</strong>{" "}
                                  {presentation.performer}
                                </p>
                              )}

                              <p className="text-sm text-foreground-600">
                                <strong>Helyszín:</strong>{" "}
                                {presentation.address}
                              </p>

                              <div className="flex items-center gap-2 pt-2">
                                <Chip size="sm" color="primary" variant="flat">
                                  Kapacitás: {presentation.capacity}
                                </Chip>
                                {presentation.remaining_capacity !== null && (
                                  <Chip
                                    size="sm"
                                    color={
                                      presentation.remaining_capacity > 0
                                        ? "success"
                                        : "danger"
                                    }
                                    variant="flat"
                                  >
                                    Szabad: {presentation.remaining_capacity}
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
