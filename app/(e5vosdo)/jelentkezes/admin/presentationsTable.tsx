"use client";

import {
  PresentationType,
  PresentationSlotType,
} from "@/db/presentationSignup";
import { Button } from "@heroui/react";
import React, { useEffect, useState } from "react";
import SearchUser from "@/components/searchUser";

interface EditingPresentation extends Partial<PresentationType> {
  isNew?: boolean;
}

const AdminPresentationsPage = () => {
  const [presentations, setPresentations] = useState<PresentationType[]>([]);
  const [signups, setSignups] = useState<{ [key: number]: string[] }>({});
  const [signupsWithAmounts, setSignupsWithAmounts] = useState<{
    [key: number]: Array<{ email: string; amount: number }>;
  }>({});
  const [namesByEmail, setNamesByEmail] = useState<{
    [key: string]: { name: string; class: string };
  }>({});
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
  const [existingSlots, setExistingSlots] = useState<PresentationSlotType[]>(
    [],
  );
  const [addingUserToPresentationId, setAddingUserToPresentationId] = useState<
    number | null
  >(null);
  const [isManagingSlots, setIsManagingSlots] = useState(false);
  const [newSlotTitle, setNewSlotTitle] = useState("");
  const [newSlotDetails, setNewSlotDetails] = useState("");
  const [removingUser, setRemovingUser] = useState<{
    email: string;
    presentationId: number;
  } | null>(null);

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

    // Also fetch signups with amounts for correct calculations
    try {
      const response = await fetch("/api/admin/signupsWithAmounts");
      if (response.ok) {
        const data = await response.json();
        setSignupsWithAmounts(data);
      } else {
        console.error("Error fetching signups with amounts");
      }
    } catch (error) {
      console.error("Error fetching signups with amounts:", error);
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
      const response = await fetch("/api/presentations/getPresentationSlots");
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

  const handleCreateSlot = async () => {
    if (!newSlotTitle.trim()) {
      alert("A slot neve kötelező!");
      return;
    }

    try {
      const response = await fetch("/api/admin/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSlotTitle,
          details: newSlotDetails || null,
        }),
      });

      if (response.ok) {
        await fetchSlots();
        setNewSlotTitle("");
        setNewSlotDetails("");
        alert("Slot sikeresen létrehozva");
      } else {
        const error = await response.json();
        alert(`Hiba: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating slot:", error);
      alert("Hiba a slot létrehozása során");
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a slotot?")) return;

    try {
      const response = await fetch(`/api/admin/slots?id=${slotId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSlots();
        await fetchPresentations(); // Frissítjük a prezentációkat is
        alert("Slot sikeresen törölve");
      } else {
        const error = await response.json();
        alert(`Hiba: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting slot:", error);
      alert("Hiba a slot törlése során");
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
      const filtered = presentations.filter((p) => {
        const slotTitle =
          existingSlots.find((s) => s.id === p.slot_id)?.title || "";
        const search = searchTerm.toLowerCase();
        const title = (p.title || "").toLowerCase();
        const description = (p.description || "").toLowerCase();
        const address = (p.address || "").toLowerCase();
        const requirements = (p.requirements || "").toLowerCase();
        return (
          slotTitle.toLowerCase().includes(search) ||
          title.includes(search) ||
          description.includes(search) ||
          address.includes(search) ||
          requirements.includes(search)
        );
      });
      setFilteredPresentations(filtered);
    }
  }, [presentations, searchTerm, existingSlots]);

  const validateSlotId = (slot_id: number | undefined): boolean => {
    if (!slot_id) return false;

    const slotExists = existingSlots.some((s) => s.id === slot_id);
    if (slotExists) return true;

    alert("A megadott slot ID nem létezik. Kérlek válassz egy létező slotot.");
    return false;
  };

  const handleSave = async () => {
    if (!editingPresentation) return;

    // Slot ID validáció - mind új, mind szerkesztett prezentációnál
    if (editingPresentation.slot_id) {
      if (!validateSlotId(editingPresentation.slot_id)) {
        return;
      }
    } else {
      alert("A slot kiválasztása kötelező!");
      return;
    }

    try {
      const method = editingPresentation.isNew ? "POST" : "PUT";
      const response = await fetch("/api/admin/presentations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPresentation),
      });

      if (response.ok) {
        const element = document.getElementById(
          "presentation-card-" + (editingPresentation.id ?? ""),
        );
        setEditingPresentation(null);
        setIsCreating(false);
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        await fetchSlots(); // Frissítjük a slotokat is

        if (element) element.scrollIntoView({ behavior: "smooth" });

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
      slot_id: existingSlots.length > 0 ? existingSlots[0].id : undefined,
      title: "",
      description: "",
      address: "",
      requirements: "",
      capacity: 20,
      remaining_capacity: 20,
      performer: null,
    });
    setIsCreating(true);
  };

  const cancelEditing = () => {
    setEditingPresentation(null);
    setIsCreating(false);
  };

  const handleAddUserToPresentation = async (
    email: string,
    presentationId: number,
  ) => {
    if (!email || !presentationId) return;

    let finalEmail = email;

    // Ha nem regisztrált felhasználóról van szó, egyedi email címet generálunk
    if (email.includes("(Nem regisztrált)")) {
      throw new Error("Nem regisztrált felhasználó");
    }

    try {
      const presentation = presentations.find((p) => p.id === presentationId);
      if (!presentation) {
        alert("Prezentáció nem található");
        return;
      }

      // Figyelmeztetés betelt prezentáció esetén
      if (
        presentation.remaining_capacity !== null &&
        presentation.remaining_capacity <= 0
      ) {
        if (
          !confirm(
            "Ez a prezentáció már betelt. Biztos, hogy hozzá szeretnéd adni a felhasználót? Ez túllépi a kapacitást.",
          )
        ) {
          return;
        }
      }

      const response = await fetch(`/api/admin/addUserToPresentation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: finalEmail,
          presentation_id: presentationId,
          slot_id: presentation.slot_id,
        }),
      });

      if (response.ok) {
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        setAddingUserToPresentationId(null);

        const wasFull =
          presentation.remaining_capacity !== null &&
          presentation.remaining_capacity <= 0;
        const message = wasFull
          ? "Felhasználó sikeresen hozzáadva a prezentációhoz (kapacitás túllépve)"
          : "Felhasználó sikeresen hozzáadva a prezentációhoz";
        alert(message);
      } else {
        const error = await response.json();
        alert(
          `Hiba: ${error.error?.message || error.error || "Ismeretlen hiba történt"}`,
        );
      }
    } catch (error) {
      console.error("Error adding user to presentation:", error);
      alert("Hiba a felhasználó hozzáadása során");
    }
  };

  const startAddingUser = (presentationId: number) => {
    setAddingUserToPresentationId(presentationId);
  };

  const cancelAddingUser = () => {
    setAddingUserToPresentationId(null);
  };

  const handleRemoveUserFromPresentation = async () => {
    if (!removingUser) return;

    try {
      const response = await fetch(`/api/admin/removeUserFromPresentation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: removingUser.email,
          presentation_id: removingUser.presentationId,
        }),
      });

      if (response.ok) {
        await fetchPresentations();
        await fetchSignups();
        await fetchNamesByEmail();
        setRemovingUser(null);
        alert("Felhasználó sikeresen eltávolítva a prezentációról");
      } else {
        const error = await response.json();
        alert(`Hiba: ${error.error || "Ismeretlen hiba történt"}`);
      }
    } catch (error) {
      console.error("Error removing user from presentation:", error);
      alert("Hiba a felhasználó eltávolítása során");
    }
  };

  const startRemovingUser = (email: string, presentationId: number) => {
    setRemovingUser({ email, presentationId });
  };

  const cancelRemovingUser = () => {
    setRemovingUser(null);
  };

  if (loading) {
    return <div className="p-4 text-center">Betöltés...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Prezentációk Adminisztrációja</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-selfprimary-100 p-4 text-center">
          <div className="text-2xl font-bold text-selfprimary-600">
            {presentations.length}
          </div>
          <div className="text-sm text-selfprimary-800">Összes prezentáció</div>
        </div>
        <div className="rounded-lg bg-success-100 p-4 text-center">
          <div className="text-2xl font-bold text-success-600">
            {presentations.reduce((sum, p) => {
              const signupsForPresentation = signupsWithAmounts[p.id] || [];
              const totalAmount = signupsForPresentation.reduce(
                (acc, signup) => acc + signup.amount,
                0,
              );
              return sum + totalAmount;
            }, 0)}
          </div>
          <div className="text-sm text-success-800">Összes jelentkező (fő)</div>
        </div>
        <div className="rounded-lg bg-selfsecondary-100 p-4 text-center">
          <div className="text-2xl font-bold text-selfsecondary-600">
            {presentations.reduce((sum, p) => sum + p.capacity, 0)}
          </div>
          <div className="text-sm text-selfsecondary-800">Összes kapacitás</div>
        </div>
        <div className="rounded-lg bg-secondary-100 p-4 text-center">
          <div className="text-2xl font-bold text-secondary-600">
            {presentations.reduce(
              (sum, p) => sum + (p.remaining_capacity || 0),
              0,
            )}
          </div>
          <div className="text-sm text-secondary-800">Szabad helyek</div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="min-w-64 flex-1">
          <input
            type="text"
            placeholder="Keresés prezentációk között (név, slot, helyszín, követelmények)..."
            className="w-full rounded-md border border-foreground-300 bg-selfprimary-bg p-3 text-foreground-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button
          color="primary"
          onPress={startCreating}
          isDisabled={
            isCreating || editingPresentation !== null || isManagingSlots
          }
        >
          Új Prezentáció Hozzáadása
        </Button>

        <Button
          color="secondary"
          onPress={() => setIsManagingSlots(!isManagingSlots)}
          isDisabled={editingPresentation !== null}
        >
          {isManagingSlots ? "Slot kezelés bezárása" : "Slotok kezelése"}
        </Button>

        <Button
          color="success"
          onPress={startSignupProcess}
          isDisabled={editingPresentation !== null || isManagingSlots}
        >
          Jelentkezés Indítása
        </Button>

        <Button
          color="warning"
          onPress={pauseSignup}
          isDisabled={editingPresentation !== null || isManagingSlots}
        >
          Jelentkezés Szüneteltetése
        </Button>

        <Button
          color="secondary"
          onPress={() => {
            window.open("/api/presentations/getPDF", "_blank");
          }}
        >
          PDF létrehozása
        </Button>
      </div>

      {isManagingSlots && (
        <div className="mb-8 rounded-lg bg-selfprimary-100 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Slotok Kezelése</h2>

          {/* Create new slot form */}
          <div className="mb-6 rounded-lg bg-selfprimary-bg p-4">
            <h3 className="mb-3 text-lg font-semibold">Új Slot Létrehozása</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="new-slot-title"
                  className="mb-2 block font-medium"
                >
                  Slot neve (kötelező)
                </label>
                <input
                  id="new-slot-title"
                  className="w-full rounded-md border border-foreground-300 p-2"
                  value={newSlotTitle}
                  onChange={(e) => setNewSlotTitle(e.target.value)}
                  placeholder="Pl.: 1. sáv, 2. sáv, Délelőtt"
                />
              </div>
              <div>
                <label
                  htmlFor="new-slot-details"
                  className="mb-2 block font-medium"
                >
                  Részletek (opcionális)
                </label>
                <input
                  id="new-slot-details"
                  className="w-full rounded-md border border-foreground-300 p-2"
                  value={newSlotDetails}
                  onChange={(e) => setNewSlotDetails(e.target.value)}
                  placeholder="Pl.: 8:00-9:00, A épület"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button color="primary" onPress={handleCreateSlot}>
                Slot Létrehozása
              </Button>
            </div>
          </div>

          {/* Existing slots list */}
          <div className="rounded-lg bg-selfprimary-bg p-4">
            <h3 className="mb-3 text-lg font-semibold">
              Meglévő Slotok ({existingSlots.length})
            </h3>
            {existingSlots.length === 0 ? (
              <p className="text-foreground-500">Még nincsenek slotok</p>
            ) : (
              <div className="space-y-2">
                {existingSlots.map((slot) => {
                  const presentationCount = presentations.filter(
                    (p) => p.slot_id === slot.id,
                  ).length;
                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg border border-foreground-200 p-3"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">
                          {slot.title}
                          {slot.details && (
                            <span className="ml-2 text-sm font-normal text-foreground-600">
                              ({slot.details})
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-foreground-500">
                          ID: {slot.id} | {presentationCount} prezentáció
                          használja
                        </div>
                      </div>
                      <Button
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleDeleteSlot(slot.id)}
                        isDisabled={presentationCount > 0}
                      >
                        Törlés
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
              <select
                id="slot-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.slot_id || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    slot_id: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                disabled={!editingPresentation.isNew}
              >
                <option value="">Válassz slotot...</option>
                {existingSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.title} {slot.details ? `(${slot.details})` : ""}
                  </option>
                ))}
              </select>
              {existingSlots.length > 0 && (
                <div className="mt-1 text-xs text-foreground-600">
                  Meglévő slotok: {existingSlots.map((s) => s.title).join(", ")}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="title-input" className="mb-2 block font-medium">
                Cím
              </label>
              <input
                id="title-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.title || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    title: e.target.value,
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
                value={editingPresentation.address || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    address: e.target.value,
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

            <div>
              <label
                htmlFor="performer-input"
                className="mb-2 block font-medium"
              >
                Előadó
              </label>
              <input
                id="performer-input"
                className="w-full rounded-md bg-selfprimary-50 p-2 text-selfprimary-900"
                value={editingPresentation.performer || ""}
                onChange={(e) =>
                  setEditingPresentation({
                    ...editingPresentation,
                    performer: e.target.value,
                  })
                }
                placeholder="Az előadó neve"
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
                    capacity: Number.parseInt(e.target.value) || 0,
                    remaining_capacity: editingPresentation.isNew
                      ? Number.parseInt(e.target.value) || 0
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
          <div className="text-center text-foreground-500">
            {searchTerm
              ? "Nincs találat a keresési feltételekre"
              : "Nincsenek prezentációk"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPresentations.map((presentation) => (
              <div
                id={"presentation-card-" + presentation.id}
                key={presentation.id}
                className="rounded-lg border-2 border-selfprimary-400 bg-selfprimary-100 p-4"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold">
                      {existingSlots.find((s) => s.id === presentation.slot_id)
                        ?.title || `Slot #${presentation.slot_id}`}{" "}
                      | {presentation.id}. {presentation.title}
                    </h3>
                    {presentation.performer && (
                      <p className="mt-1 text-sm font-semibold text-foreground-700">
                        Előadó: {presentation.performer}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-foreground-600">
                      {presentation.address}
                    </p>
                    <p className="text-sm text-foreground-600">
                      {presentation.requirements}
                    </p>
                    <p className="mt-2">{presentation.description}</p>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {presentation.remaining_capacity == null &&
                        "(Szüneteltetve) "}{" "}
                      {(() => {
                        const signupsForPresentation =
                          signupsWithAmounts[presentation.id] || [];
                        const totalAmount = signupsForPresentation.reduce(
                          (acc, signup) => acc + signup.amount,
                          0,
                        );
                        return presentation.capacity - totalAmount;
                      })()}
                      / {presentation.capacity}
                    </div>
                    <div className="text-sm text-foreground-600">
                      Szabad / Összes hely
                    </div>
                    <div className="mt-1 text-xs text-foreground-500">
                      ({signups[presentation.id]?.length || 0} jelentkezés)
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
                      color="success"
                      size="sm"
                      onPress={() => startAddingUser(presentation.id)}
                      isDisabled={
                        editingPresentation !== null ||
                        addingUserToPresentationId !== null
                      }
                    >
                      Felhasználó hozzáadása
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
                      <div className="grid gap-2 md:grid-cols-2">
                        {signups[presentation.id].map((email, index) => {
                          const userInfo = namesByEmail[email] || {
                            name: "Ismeretlen név",
                            class: "",
                          };
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded border border-foreground-200 bg-selfprimary-20 p-2 text-sm"
                            >
                              <span>
                                {index + 1}.{" "}
                                {typeof userInfo === "string"
                                  ? userInfo
                                  : userInfo.name}{" "}
                                {typeof userInfo === "object" &&
                                  userInfo.class && (
                                    <span className="text-foreground-600">
                                      ({userInfo.class})
                                    </span>
                                  )}
                                <br />
                                <span className="text-xs text-foreground-500">
                                  {email}
                                </span>
                              </span>
                              <button
                                onClick={() =>
                                  startRemovingUser(email, presentation.id)
                                }
                                className="ml-2 flex h-6 w-6 items-center justify-center rounded-full text-danger hover:bg-danger-50"
                                title="Felhasználó eltávolítása"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-foreground-500">
                        Nincsenek jelentkezők
                      </div>
                    )}
                  </div>
                )}

                {addingUserToPresentationId === presentation.id && (
                  <div className="mt-4 rounded-lg bg-selfprimary-50 p-4">
                    <h4 className="mb-3 font-semibold">
                      Felhasználó hozzáadása: {presentation.title}
                    </h4>
                    <div className="relative">
                      <SearchUser
                        usersNameByEmail={namesByEmail}
                        onSelectEmail={(email) =>
                          handleAddUserToPresentation(email, presentation.id)
                        }
                        label="Válassz felhasználót"
                        placeholder="Keresés név szerint..."
                        size="md"
                        addCustomParticipant={true}
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={cancelAddingUser}
                      >
                        Mégse
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Removing User */}
      {removingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Biztos vagy benne?
            </h3>
            <p className="mb-6 text-gray-700">
              Biztosan el szeretnéd távolítani{" "}
              <strong>
                {(() => {
                  const userInfo = namesByEmail[removingUser.email];
                  return typeof userInfo === "string"
                    ? userInfo
                    : userInfo?.name || removingUser.email;
                })()}
              </strong>{" "}
              felhasználót erről a prezentációról?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                color="primary"
                variant="bordered"
                onPress={cancelRemovingUser}
              >
                Mégse
              </Button>
              <Button color="danger" onPress={handleRemoveUserFromPresentation}>
                Eltávolítás
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPresentationsPage;
