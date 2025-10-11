"use client";

import { PresentationType } from "@/db/presentationSignup";
import { Button } from "@heroui/react";
import React, { useEffect, useState } from "react";

interface EditingPresentation extends Partial<PresentationType> {
  isNew?: boolean;
}

const AdminPresentationsPage = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>([]);
  const [signups, setSignups] = useState<{ [key: number]: string[] }>({});
  const [namesByEmail, setNamesByEmail] = useState<{ [key: string]: string }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [editingPresentation, setEditingPresentation] =
    useState<EditingPresentation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSignups, setShowSignups] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPresentations, setFilteredPresentations] = useState<
    PresentationType[]
  >([]);
  const [existingSlots, setExistingSlots] = useState<string[]>([]);

  useEffect(() => {
    if (editingPresentation !== null) {
      const element = document.getElementById("editing-presentation-title");
      if (element) {
        const yOffset = -100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + yOffset;

        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    }
  }, [editingPresentation]);

  const fetchPresentations = async () => {
    try {
      const response = await fetch("/api/admin/presentations");
      if (response.ok) {
        const data = await response.json();
        setPresentations(data);
      } else {
        alert("Hiba a prezentációk betöltésekor");
      }
    } catch (error) {
      console.error("Error fetching presentations:", error);
      alert("Hiba a prezentációk betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const fetchSignups = async () => {
    try {
      const response = await fetch("/api/admin/signups");
      if (response.ok) {
        const data = await response.json();
        setSignups(data);
      } else {
        console.error("Error fetching signups");
      }
    } catch (error) {
      console.error("Error fetching signups:", error);
    }
  };

  const fetchNamesByEmail = async () => {
    try {
      const response = await fetch("/api/getAllUsersNameByEmail");
      if (response.ok) {
        const data = await response.json();
        setNamesByEmail(data);
      } else {
        console.error("Error fetching names by email");
      }
    } catch (error) {
      console.error("Error fetching names by email:", error);
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/presentations/getSlots");
      if (response.ok) {
        const data = await response.json();
        setExistingSlots(data);
      } else {
        console.error("Error fetching slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const toggleSignupsView = (presentationId: number) => {
    setShowSignups((prev) => ({
      ...prev,
      [presentationId]: !prev[presentationId],
    }));
  };

  const pauseSignup = async () => {
    if (!confirm("Biztosan szüneteltetni szeretnéd a jelentkezést?")) return;

    try {
      const response = await fetch("/api/presentations/pauseSignup");

      if (response.ok) {
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        alert("Jelentkezés szüneteltetve");
      } else {
        alert("Hiba történt");
      }
    } catch (error) {
      console.error("Error pausing signup:", error);
      alert("Hiba történt");
    }
  };

  const startSignupProcess = async () => {
    if (!confirm("Biztosan indítani szeretnéd a jelentkezést?")) return;

    try {
      const response = await fetch("/api/presentations/startSignup");

      if (response.ok) {
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        alert("Jelentkezés elindítva");
      } else {
        alert("Hiba történt");
      }
    } catch (error) {
      console.error("Error starting signup:", error);
      alert("Hiba történt");
    }
  };

  useEffect(() => {
    fetchPresentations();
    fetchSignups();
    fetchNamesByEmail();
    fetchSlots();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPresentations(presentations);
    } else {
      const filtered = presentations.filter(
        (p) =>
          p.slot.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.adress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.requirements.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredPresentations(filtered);
    }
  }, [presentations, searchTerm]);

  const validateSlot = (slot: string): boolean => {
    if (!slot || slot.trim() === "") return true;

    const slotExists = existingSlots.includes(slot);
    if (slotExists) return true;

    const confirmMessage =
      existingSlots.length > 0
        ? `A megadott slot (${slot}) még nem létezik.\n\nMeglévő slotok:\n${existingSlots.join(", ")}\n\nBiztosan létre szeretnéd hozni ezt az új slotot?`
        : `A megadott slot (${slot}) még nem létezik.\n\nJelenleg nincsenek meglévő slotok.\n\nBiztosan létre szeretnéd hozni ezt az új slotot?`;

    return confirm(confirmMessage);
  };

  const handleSave = async () => {
    if (!editingPresentation) return;

    // Slot validáció - mind új, mind szerkesztett prezentációnál
    if (editingPresentation.slot) {
      if (!validateSlot(editingPresentation.slot)) {
        return;
      }
    }

    try {
      const method = editingPresentation.isNew ? "POST" : "PUT";
      const response = await fetch("/api/admin/presentations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPresentation),
      });

      if (response.ok) {
        setEditingPresentation(null);
        setIsCreating(false);
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        await fetchSlots(); // Frissítjük a slotokat is
        alert(
          editingPresentation.isNew
            ? "Prezentáció sikeresen létrehozva"
            : "Prezentáció sikeresen frissítve",
        );
      } else {
        const error = await response.json();
        alert(`Hiba: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving presentation:", error);
      alert("Hiba a mentés során");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a prezentációt?")) return;

    try {
      const response = await fetch(`/api/admin/presentations?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        alert("Prezentáció sikeresen törölve");
      } else {
        const error = await response.json();
        alert(`Hiba a törléskor: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting presentation:", error);
      alert("Hiba a törlés során");
    }
  };

  const startEditing = (presentation: PresentationType) => {
    setEditingPresentation({ ...presentation });
    setIsCreating(false);
  };

  const startCreating = () => {
    setEditingPresentation({
      isNew: true,
      slot: "",
      name: "",
      description: "",
      adress: "",
      requirements: "",
      capacity: 20,
      remaining_capacity: 20,
    });
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setEditingPresentation(null);
    setIsCreating(false);
  };

  if (loading) {
    return <div className="p-4 text-center">Betöltés...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Prezentációk Adminisztrációja</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-100 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {presentations.length}
          </div>
          <div className="text-sm text-blue-800">Összes prezentáció</div>
        </div>
        <div className="rounded-lg bg-green-100 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {presentations.reduce(
              (sum, p) => sum + (signups[p.id]?.length || 0),
              0,
            )}
          </div>
          <div className="text-sm text-green-800">Összes jelentkező</div>
        </div>
        <div className="rounded-lg bg-orange-100 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {presentations.reduce((sum, p) => sum + p.capacity, 0)}
          </div>
          <div className="text-sm text-orange-800">Összes kapacitás</div>
        </div>
        <div className="rounded-lg bg-purple-100 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {presentations.reduce(
              (sum, p) => sum + (p.remaining_capacity || 0),
              0,
            )}
          </div>
          <div className="text-sm text-purple-800">Szabad helyek</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="min-w-64 flex-1">
          <input
            type="text"
            placeholder="Keresés prezentációk között (név, slot, helyszín, követelmények)..."
            className="w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          color="primary"
          onPress={startCreating}
          isDisabled={isCreating || editingPresentation !== null}
        >
          Új Prezentáció Hozzáadása
        </Button>

        <Button
          color="success"
          onPress={startSignupProcess}
          isDisabled={editingPresentation !== null}
        >
          Jelentkezés Indítása
        </Button>

        <Button
          color="warning"
          onPress={pauseSignup}
          isDisabled={editingPresentation !== null}
        >
          Jelentkezés Szüneteltetése
        </Button>

        <Button
          color="secondary"
          onPress={() => {
            window.open("/api/admin/export", "_blank");
          }}
        >
          CSV Export
        </Button>
      </div>

      {editingPresentation && (
        <div className="mb-8 rounded-lg bg-selfprimary-100 p-6">
          <h2
            id="editing-presentation-title"
            className="mb-4 text-2xl font-semibold"
          >
            {editingPresentation.isNew
              ? "Új Prezentáció"
              : "Prezentáció Szerkesztése"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="slot-input" className="mb-2 block font-medium">
                Időpont/Slot
              </label>
              {editingPresentation.isNew ? (
                <input
                  id="slot-input"
                  className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                  value={editingPresentation.slot || ""}
                  onChange={(e) =>
                    setEditingPresentation({
                      ...editingPresentation,
                      slot: e.target.value,
                    })
                  }
                  placeholder="Pl.: H1, K2, P3"
                />
              ) : (
                <p>{editingPresentation.slot}</p>
              )}
              {existingSlots.length > 0 && (
                <div className="mt-1 text-xs text-gray-600">
                  Meglévő slotok: {existingSlots.join(", ")}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="name-input" className="mb-2 block font-medium">
                Név
              </label>
              <input
                id="name-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.name || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    name: e.target.value,
                  })
                }
                placeholder="Prezentáció neve"
              />
            </div>

            <div>
              <label htmlFor="address-input" className="mb-2 block font-medium">
                Helyszín
              </label>
              <input
                id="address-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.adress || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    adress: e.target.value,
                  })
                }
                placeholder="Pl.: online, Reáltanoda utca, 200. terem"
              />
            </div>

            <div>
              <label
                htmlFor="requirements-input"
                className="mb-2 block font-medium"
              >
                Követelmények
              </label>
              <input
                id="requirements-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.requirements || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    requirements: e.target.value,
                  })
                }
                placeholder="Pl.: Csak 12.-eseknek / Hozzanak személyit"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description-input"
                className="mb-2 block font-medium"
              >
                Leírás
              </label>
              <textarea
                id="description-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                rows={4}
                value={editingPresentation.description || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    description: e.target.value,
                  })
                }
                placeholder="Részletes leírás"
              />
            </div>

            <div>
              <label
                htmlFor="capacity-input"
                className="mb-2 block font-medium"
              >
                Kapacitás
              </label>
              <input
                id="capacity-input"
                type="number"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.capacity?.toString() || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    capacity: parseInt(e.target.value) || 0,
                    remaining_capacity: editingPresentation.isNew
                      ? parseInt(e.target.value) || 0
                      : editingPresentation.remaining_capacity,
                  })
                }
                placeholder="Maximális létszám"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button color="success" onPress={handleSave}>
              {editingPresentation.isNew ? "Létrehozás" : "Mentés"}
            </Button>
            <Button color="danger" variant="light" onPress={cancelEditing}>
              Mégse
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Meglévő Prezentációk</h2>

        {filteredPresentations.length === 0 ? (
          <div className="text-center text-gray-500">
            {searchTerm
              ? "Nincs találat a keresési feltételekre"
              : "Nincsenek prezentációk"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPresentations.map((presentation) => (
              <div
                key={presentation.id}
                className="rounded-lg border-2 border-selfprimary-400 bg-selfprimary-100 p-4"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold">
                      {presentation.slot} | {presentation.id}.{" "}
                      {presentation.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {presentation.adress}
                    </p>
                    <p className="text-sm text-gray-600">
                      {presentation.requirements}
                    </p>
                    <p className="mt-2">{presentation.description}</p>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {presentation.remaining_capacity ?? "-"} /{" "}
                      {presentation.capacity}
                    </div>
                    <div className="text-sm text-gray-600">
                      Szabad / Összes hely
                    </div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => toggleSignupsView(presentation.id)}
                      >
                        {showSignups[presentation.id]
                          ? "Jelentkezők elrejtése"
                          : "Jelentkezők megtekintése"}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      color="primary"
                      size="sm"
                      onPress={() => startEditing(presentation)}
                      isDisabled={editingPresentation !== null}
                    >
                      Szerkesztés
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete(presentation.id)}
                      isDisabled={editingPresentation !== null}
                    >
                      Törlés
                    </Button>
                  </div>
                </div>

                {showSignups[presentation.id] && (
                  <div className="mt-4 rounded-lg bg-selfprimary-50 p-4">
                    <h4 className="mb-2 font-semibold">
                      Jelentkezők ({signups[presentation.id]?.length || 0}):
                    </h4>
                    {signups[presentation.id]?.length > 0 ? (
                      <div className="grid gap-1 md:grid-cols-2">
                        {signups[presentation.id].map((email, index) => (
                          <div key={index} className="text-sm">
                            {index + 1}.{" "}
                            {namesByEmail[email] || "Ismeretlen név"} ({email})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Nincsenek jelentkezők
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPresentationsPage;
