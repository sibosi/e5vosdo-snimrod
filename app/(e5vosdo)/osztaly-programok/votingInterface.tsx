"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { ClassProgram } from "@/db/classPrograms";

interface UserVote {
  program_id: number;
  vote_order: number;
}

const VotingInterface = () => {
  const [programs, setPrograms] = useState<ClassProgram[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [userClass, setUserClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [programsRes, votesRes, userClassRes] = await Promise.all([
        fetch("/api/classPrograms/getPrograms"),
        fetch("/api/classPrograms/getUserVotes"),
        fetch("/api/classPrograms/getUserClass"),
      ]);

      if (programsRes.ok) {
        const programsData = await programsRes.json();
        setPrograms(programsData);
      }

      if (votesRes.ok) {
        const votesData: UserVote[] = await votesRes.json();
        const sortedVotes = [...votesData].sort(
          (a, b) => a.vote_order - b.vote_order,
        );
        const votes: (number | null)[] = [null, null, null, null, null];
        sortedVotes.forEach((vote, index) => {
          if (index < 5) {
            votes[index] = vote.program_id;
          }
        });
        setSelectedPrograms(votes);
      }

      if (userClassRes.ok) {
        const userClassData = await userClassRes.json();
        setUserClass(userClassData.userClass);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showMessage("error", "Hiba történt az adatok betöltése közben");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSelectChange = (position: number, value: string) => {
    const programId = value ? parseInt(value) : null;
    setSelectedPrograms((prev) => {
      const newSelection = [...prev];
      newSelection[position] = programId;
      return newSelection;
    });
  };

  const saveVotes = async () => {
    const validVotes = selectedPrograms.filter(
      (id): id is number => id !== null,
    );

    if (validVotes.length === 0) {
      showMessage("error", "Válassz legalább egy programot!");
      return;
    }

    // Check for duplicates
    const uniqueVotes = new Set(validVotes);
    if (uniqueVotes.size !== validVotes.length) {
      showMessage("error", "Nem választhatod ugyanazt a programot többször!");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/classPrograms/saveVotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programIds: validVotes }),
      });

      if (response.ok) {
        showMessage("success", "Szavazatok sikeresen mentve!");
      } else {
        const error = await response.json();
        showMessage("error", error.error || "Hiba történt a mentés során");
      }
    } catch (error) {
      console.error("Error saving votes:", error);
      showMessage("error", "Hiba történt a mentés során");
    } finally {
      setSaving(false);
    }
  };

  const getAvailablePrograms = (currentPosition: number) => {
    const selectedIds = selectedPrograms
      .map((id, idx) => (idx !== currentPosition ? id : null))
      .filter((id): id is number => id !== null);

    return programs.filter((p) => {
      // Filter out already selected programs
      if (selectedIds.includes(p.id)) return false;

      // Filter out programs from user's own class
      if (userClass && p.class === userClass) return false;

      return true;
    });
  };

  const getSelectedProgram = (programId: number | null) => {
    if (!programId) return null;
    return programs.find((p) => p.id === programId);
  };

  const clearSelection = (position: number) => {
    setSelectedPrograms((prev) => {
      const newSelection = [...prev];
      newSelection[position] = null;
      return newSelection;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const validVotesCount = selectedPrograms.filter((id) => id !== null).length;

  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* Header */}
      <div className="mb-6 rounded-xl bg-selfprimary-100 bg-gradient-to-r p-6 text-foreground shadow-lg">
        <h1 className="text-2xl font-bold md:text-3xl">
          Szavazz kedvenc programjaidra!
        </h1>
        <p className="mt-2 text-sm opacity-90 md:text-base">
          Válaszd ki az 5 kedvenc programodat sorrendben (1. = legkedveltebb).
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Voting Section */}
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-semibold">
              Válassz 5 programot sorrendben
            </h2>
            <Chip size="lg" color="primary" variant="flat">
              {validVotesCount} / 5
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((position) => {
              const selectedProgram = getSelectedProgram(
                selectedPrograms[position],
              );
              const availablePrograms = getAvailablePrograms(position);

              return (
                <div key={position} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-selfprimary-500 text-xl font-bold text-foreground">
                      {position + 1}
                    </div>
                    <Select
                      label={`${position + 1}. választásod`}
                      placeholder="Válassz egy programot..."
                      selectedKeys={
                        selectedPrograms[position]
                          ? [String(selectedPrograms[position])]
                          : []
                      }
                      onChange={(e) =>
                        handleSelectChange(position, e.target.value)
                      }
                      className="flex-1"
                      size="lg"
                      classNames={{
                        trigger: selectedProgram
                          ? "bg-selfprimary-50 border-selfprimary-300"
                          : "",
                      }}
                    >
                      {availablePrograms.map((program) => (
                        <SelectItem key={String(program.id)}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {program.name}
                            </span>
                            <Chip size="sm" color="secondary" variant="flat">
                              {program.room}
                            </Chip>
                            <Chip size="sm" color="primary" variant="flat">
                              {program.class}
                            </Chip>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                    {selectedProgram && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => clearSelection(position)}
                        isIconOnly
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  {selectedProgram && (
                    <div className="ml-16 rounded-lg bg-selfprimary-50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {selectedProgram.name}
                        </span>
                        <Chip size="sm" color="secondary" variant="flat">
                          Terem: {selectedProgram.room}
                        </Chip>
                        <Chip size="sm" color="primary" variant="flat">
                          Osztály: {selectedProgram.class}
                        </Chip>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              color="primary"
              size="lg"
              onPress={saveVotes}
              isLoading={saving}
              isDisabled={validVotesCount === 0}
              className="px-8"
            >
              Mentés
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 bg-selfsecondary-50">
        <CardBody>
          <div className="space-y-2 text-sm text-selfsecondary-900">
            <p className="font-semibold">ℹ️ Hasznos információk:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Az 1. választásod a legkedveltebb programod</li>
              <li>Minimum 1, maximum 5 programot választhatsz</li>
              <li>Ugyanazt a programot nem választhatod többször</li>
              {userClass && (
                <li className="font-semibold text-selfprimary-700">
                  A saját osztályodra ({userClass}) nem szavazhatsz
                </li>
              )}
              <li>A szavazatodat bármikor módosíthatod</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default VotingInterface;
