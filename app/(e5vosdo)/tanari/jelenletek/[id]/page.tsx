"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { PresentationType, SignupType } from "@/db/presentationSignup";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import SearchUser from "@/components/searchUser";

interface SignupWithUser extends SignupType {
  userName?: string;
  userClass?: string;
}

interface StudentPresentations {
  email: string;
  name: string;
  presentations: Array<{
    id: number;
    title: string;
    slot: string;
    participated: boolean;
  }>;
}

export default function PresentationAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const presentationId = Number(params.id);

  const [presentation, setPresentation] = useState<PresentationType | null>(
    null,
  );
  const [signups, setSignups] = useState<SignupWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterParticipated, setFilterParticipated] = useState<
    "all" | "yes" | "no"
  >("all");
  const [usersNameByEmail, setUsersNameByEmail] = useState<
    Record<string, string>
  >({});
  const [studentSearch, setStudentSearch] =
    useState<StudentPresentations | null>(null);
  const [searchingStudent, setSearchingStudent] = useState(false);

  useEffect(() => {
    if (presentationId) {
      fetchPresentation();
      fetchSignups();
      fetchAllUsers();
    }
  }, [presentationId]);

  const fetchAllUsers = async () => {
    try {
      const response = await fetch("/api/auth/getAllUsersNameByEmail");
      if (response.ok) {
        const data = await response.json();
        setUsersNameByEmail(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPresentation = async () => {
    try {
      const response = await fetch("/api/presentations/getPresentations");
      if (response.ok) {
        const data: PresentationType[] = await response.json();
        const found = data.find((p) => p.id === presentationId);
        if (found) {
          setPresentation(found);
        } else {
          alert("Prezentáció nem található");
          router.push("/tanari/jelenletek");
        }
      }
    } catch (error) {
      console.error("Error fetching presentation:", error);
      alert("Hiba történt");
    }
  };

  const fetchSignups = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/presentations/getSignupsWithParticipation?presentation_id=${presentationId}`,
      );
      if (response.ok) {
        const data: SignupWithUser[] = await response.json();
        // Ensure participated is boolean
        const normalizedData = data.map((signup) => ({
          ...signup,
          participated: Boolean(signup.participated),
        }));
        setSignups(normalizedData);
      } else {
        alert("Hiba a jelentkezések betöltésekor");
      }
    } catch (error) {
      console.error("Error fetching signups:", error);
      alert("Hiba történt");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleParticipation = async (
    signup_id: number,
    currentState: boolean,
  ) => {
    try {
      const response = await fetch("/api/presentations/markParticipation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signup_id,
          participated: !currentState,
        }),
      });

      if (response.ok) {
        // Update local state
        setSignups((prev) =>
          prev.map((s) =>
            s.id === signup_id ? { ...s, participated: !currentState } : s,
          ),
        );
      } else {
        alert("Hiba történt a jelölés során");
      }
    } catch (error) {
      console.error("Error marking participation:", error);
      alert("Hiba történt");
    }
  };

  const filteredSignups = signups.filter((signup) => {
    const matchesSearch =
      signup.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.userClass?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterParticipated === "all" ||
      (filterParticipated === "yes" && signup.participated) ||
      (filterParticipated === "no" && !signup.participated);

    return matchesSearch && matchesFilter;
  });

  const participatedCount = signups.filter((s) => s.participated).length;
  const totalCount = signups.length;

  const handleStudentSearch = async (email: string) => {
    setSearchingStudent(true);
    setStudentSearch(null);

    try {
      // Fetch all presentations for this student
      const response = await fetch("/api/presentations/getPresentations");
      if (!response.ok) {
        alert("Hiba a prezentációk betöltésekor");
        return;
      }

      const allPresentations: PresentationType[] = await response.json();

      // Fetch signups for each presentation and find this student
      const studentPresentations: Array<{
        id: number;
        title: string;
        slot: string;
        participated: boolean;
      }> = [];

      for (const pres of allPresentations) {
        const signupsResponse = await fetch(
          `/api/presentations/getSignupsWithParticipation?presentation_id=${pres.id}`,
        );
        if (signupsResponse.ok) {
          const presSignups: SignupWithUser[] = await signupsResponse.json();
          const studentSignup = presSignups.find((s) => s.email === email);
          if (studentSignup) {
            studentPresentations.push({
              id: pres.id,
              title: pres.title,
              slot: pres.slot,
              participated: Boolean(studentSignup.participated),
            });
          }
        }
      }

      setStudentSearch({
        email,
        name: usersNameByEmail[email] || email,
        presentations: studentPresentations,
      });
    } catch (error) {
      console.error("Error searching student:", error);
      alert("Hiba történt a keresés során");
    } finally {
      setSearchingStudent(false);
    }
  };

  if (!presentation && !loading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <Card>
          <CardBody>
            <p className="text-center">Prezentáció nem található</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <div className="mb-4">
        <Link href="/tanari/jelenletek">
          <Button variant="light" startContent={<span>←</span>}>
            Vissza a prezentációkhoz
          </Button>
        </Link>
      </div>

      <h1 className="mb-6 text-3xl font-bold">Részvétel Nyilvántartása</h1>

      {presentation && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Prezentáció részletei</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {presentation.id}
              </p>
              <p>
                <strong>Cím:</strong> {presentation.title}
              </p>
              {presentation.performer && (
                <p>
                  <strong>Előadó:</strong> {presentation.performer}
                </p>
              )}
              <p>
                <strong>Helyszín:</strong> {presentation.address}
              </p>
              <p>
                <strong>Időpont:</strong> {presentation.slot}
              </p>
              <p>
                <strong>Kapacitás:</strong> {presentation.capacity} fő
              </p>
              {presentation.requirements && (
                <p>
                  <strong>Követelmények:</strong> {presentation.requirements}
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <Input
              label="Keresés"
              placeholder="Név, email vagy osztály..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />

            <Select
              label="Szűrés"
              placeholder="Válassz szűrőt"
              selectedKeys={[filterParticipated]}
              onChange={(e) =>
                setFilterParticipated(e.target.value as "all" | "yes" | "no")
              }
              className="max-w-xs"
            >
              <SelectItem key="all">Minden</SelectItem>
              <SelectItem key="yes">Csak résztvevők</SelectItem>
              <SelectItem key="no">Nem résztvevők</SelectItem>
            </Select>

            <Chip color="primary" variant="flat">
              Részt vett: {participatedCount} / {totalCount}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              Jelentkezettek ({filteredSignups.length})
            </h2>
          </CardHeader>
          <p className="px-3">
            Kattintson a diák nevére a részvétel jelöléséhez vagy
            eltávolításához.
          </p>
          <CardBody>
            <div className="space-y-2">
              {filteredSignups.length === 0 ? (
                <p className="text-center text-foreground-500">
                  Nincsenek jelentkezők
                </p>
              ) : (
                filteredSignups.map((signup, index) => (
                  <button
                    key={signup.id}
                    onClick={() =>
                      handleToggleParticipation(signup.id, signup.participated)
                    }
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                      signup.participated
                        ? "border-success-300 bg-success-50 hover:bg-success-100"
                        : "border-foreground-300 bg-foreground-50 hover:bg-foreground-100"
                    }`}
                  >
                    <Checkbox
                      size="lg"
                      isSelected={signup.participated}
                      color="success"
                      isReadOnly
                    />

                    <div className="flex-1">
                      <p className="font-semibold">
                        <span className="text-foreground-500">
                          {index + 1}.
                        </span>{" "}
                        {signup.userName}
                      </p>
                      <p className="text-sm text-foreground-600">
                        {signup.userClass}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Student Search Section */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">
            Diák jelentkezéseinek keresése
          </h2>
        </CardHeader>
        <CardBody>
          <div className="min-h-96 space-y-4">
            <div className="">
              <SearchUser
                usersNameByEmail={usersNameByEmail}
                onSelectEmail={handleStudentSearch}
                label="Diák keresése"
                placeholder="Kezdd el írni a diák nevét..."
                size="lg"
              />
            </div>

            {searchingStudent && (
              <div className="flex justify-center p-4">
                <Spinner size="md" />
              </div>
            )}

            {studentSearch && !searchingStudent && (
              <div className="space-y-3">
                <div className="rounded-lg bg-primary-50 p-3">
                  <p className="font-semibold">{studentSearch.name}</p>
                  <p className="text-sm text-foreground-600">
                    {studentSearch.email}
                  </p>
                </div>

                {studentSearch.presentations.length === 0 ? (
                  <p className="text-center text-foreground-500">
                    Ez a diák nem jelentkezett és nem lett beosztva egy
                    prezentációra sem. (Szervező / médiás / érettségiző diák)
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold">
                      Jelentkezések ({studentSearch.presentations.length}):
                    </p>
                    {studentSearch.presentations.map((pres) => (
                      <div
                        key={pres.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          pres.id === presentationId
                            ? "border-primary-500 bg-primary-50"
                            : "border-foreground-200 bg-foreground-50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {pres.id}. {pres.title}
                            </p>
                            {pres.id === presentationId && (
                              <Chip size="sm" color="primary" variant="flat">
                                Aktuális prezentáció
                              </Chip>
                            )}
                          </div>
                          <p className="text-sm text-foreground-600">
                            Időpont: {pres.slot}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={pres.participated ? "success" : "default"}
                          variant={pres.participated ? "solid" : "flat"}
                        >
                          {pres.participated ? "Résztvett ✓" : "Nem vett részt"}
                        </Chip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
