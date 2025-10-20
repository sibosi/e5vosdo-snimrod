"use client";
import { Match, Team, TeamCategory } from "@/db/matches";
import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";

interface CreateEditMatchProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (match: Match) => void;
  matchToEdit?: Match;
  teams?: Team[];
  categories?: TeamCategory[];
}

const CreateEditMatch = ({
  isOpen,
  onClose,
  onSave,
  matchToEdit,
  teams,
  categories,
}: CreateEditMatchProps) => {
  const isEditing = !!matchToEdit;

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Match>>({
    team1_id: 0,
    team2_id: 0,
    team1_score: 0,
    team2_score: 0,
    datetime: new Date().toISOString().slice(0, 16),
    status: "pending",
    category_id: undefined,
    start_time: "",
    end_time: "",
  });

  // Filter teams by selected category
  const filteredTeams =
    teams?.filter(
      (team) =>
        selectedCategory === null || team.category_id === selectedCategory,
    ) || [];

  useEffect(() => {
    if (matchToEdit) {
      // Format datetime for input field (yyyy-MM-ddThh:mm)
      const formattedDatetime = matchToEdit.datetime.slice(0, 16);

      setFormData({
        ...matchToEdit,
        datetime: formattedDatetime,
      });

      // Set category based on match's category or team's category
      if (matchToEdit.category_id) {
        setSelectedCategory(matchToEdit.category_id);
      } else if (teams) {
        const team1 = teams.find((t) => t.id === matchToEdit.team1_id);
        if (team1) {
          setSelectedCategory(team1.category_id);
        }
      }
    } else {
      // Reset form for new match
      setFormData({
        team1_id: 0,
        team2_id: 0,
        team1_score: 0,
        team2_score: 0,
        datetime: new Date().toISOString().slice(0, 16),
        status: "pending",
        category_id: undefined,
        start_time: "",
        end_time: "",
      });
      setSelectedCategory(null);
    }
  }, [matchToEdit, teams, isOpen]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = Number.parseInt(e.target.value, 10);
    setSelectedCategory(categoryId);
    setFormData({
      ...formData,
      category_id: categoryId,
      team1_id: 0,
      team2_id: 0,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Handle number inputs
    if (
      name === "team1_id" ||
      name === "team2_id" ||
      name === "team1_score" ||
      name === "team2_score"
    ) {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value, 10),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!selectedCategory && !isEditing) {
      alert("Kérlek válassz egy kategóriát!");
      return;
    }

    if (!formData.team1_id || formData.team1_id === 0) {
      alert("Kérlek válaszd ki az első csapatot!");
      return;
    }

    if (!formData.team2_id || formData.team2_id === 0) {
      alert("Kérlek válaszd ki a második csapatot!");
      return;
    }

    if (formData.team1_id === formData.team2_id) {
      alert("Két különböző csapatot kell választani!");
      return;
    }

    if (!formData.datetime) {
      alert("Dátum és idő megadása kötelező!");
      return;
    }

    // Create a complete match object
    const matchData: Match = {
      id: matchToEdit?.id || 0,
      category_id: formData.category_id || selectedCategory || undefined,
      team1_id: formData.team1_id || 0,
      team2_id: formData.team2_id || 0,
      team1_score: formData.team1_score || 0,
      team2_score: formData.team2_score || 0,
      datetime: formData.datetime || new Date().toISOString(),
      start_time: formData.start_time || "",
      end_time: formData.end_time || "",
      status: (formData.status as "pending" | "live" | "finished") || "pending",
    };

    onSave(matchData);
  };

  if (!teams) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Csapatok betöltése...</ModalHeader>
          <ModalBody>Csapatok betöltése...</ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Mégse
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {isEditing ? "Meccs szerkesztése" : "Új meccs létrehozása"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Category Selection - First Step */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Kategória *
              </label>
              <Select
                name="category_id"
                selectedKeys={
                  selectedCategory ? [selectedCategory.toString()] : []
                }
                onChange={handleCategoryChange}
                placeholder="Válassz kategóriát"
                isDisabled={isEditing}
                classNames={{
                  trigger: selectedCategory
                    ? "border-2 border-green-500"
                    : "border-2 border-orange-500",
                }}
              >
                {(categories || []).map((category) => (
                  <SelectItem key={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
              {!selectedCategory && !isEditing && (
                <p className="mt-1 text-xs text-orange-600">
                  Először válaszd ki a kategóriát
                </p>
              )}
            </div>

            {/* Team Selection - Second Step */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  1. Csapat *
                </label>
                <Select
                  name="team1_id"
                  selectedKeys={
                    formData.team1_id ? [formData.team1_id.toString()] : []
                  }
                  onChange={handleChange}
                  placeholder="Válassz csapatot"
                  isDisabled={!selectedCategory && !isEditing}
                >
                  {filteredTeams
                    .filter((team) => team.id !== formData.team2_id)
                    .map((team) => (
                      <SelectItem key={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  2. Csapat *
                </label>
                <Select
                  name="team2_id"
                  selectedKeys={
                    formData.team2_id ? [formData.team2_id.toString()] : []
                  }
                  onChange={handleChange}
                  placeholder="Válassz csapatot"
                  isDisabled={!selectedCategory && !isEditing}
                >
                  {filteredTeams
                    .filter((team) => team.id !== formData.team1_id)
                    .map((team) => (
                      <SelectItem key={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                </Select>
              </div>
            </div>

            {/* Match Details */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Dátum és idő *
              </label>
              <Input
                type="datetime-local"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
              />
            </div>

            {/* Scores - Only for editing or advanced users */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  1. Csapat pontszáma
                </label>
                <Input
                  type="number"
                  name="team1_score"
                  value={String(formData.team1_score)}
                  onChange={handleChange}
                  min={0}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  2. Csapat pontszáma
                </label>
                <Input
                  type="number"
                  name="team2_score"
                  value={String(formData.team2_score)}
                  onChange={handleChange}
                  min={0}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium">Állapot</label>
              <Select
                name="status"
                selectedKeys={formData.status ? [formData.status] : []}
                onChange={handleChange}
              >
                <SelectItem key="pending">Várakozó</SelectItem>
                <SelectItem key="live">Élő</SelectItem>
                <SelectItem key="finished">Befejezett</SelectItem>
              </Select>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Mégse
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            {isEditing ? "Mentés" : "Létrehozás"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateEditMatch;
