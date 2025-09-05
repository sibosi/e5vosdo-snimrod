"use client";
import { Match, Team } from "@/apps/web/db/matches";
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
}

const CreateEditMatch = ({
  isOpen,
  onClose,
  onSave,
  matchToEdit,
  teams,
}: CreateEditMatchProps) => {
  const isEditing = !!matchToEdit;

  const [formData, setFormData] = useState<Partial<Match>>({
    team1_id: 0,
    team2_id: 0,
    team1_score: 0,
    team2_score: 0,
    datetime: new Date().toISOString().slice(0, 16),
    status: "pending",
    group_letter: "A",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    if (matchToEdit) {
      // Format datetime for input field (yyyy-MM-ddThh:mm)
      const formattedDatetime = matchToEdit.datetime.slice(0, 16);

      setFormData({
        ...matchToEdit,
        datetime: formattedDatetime,
      });
    } else {
      // Reset form for new match
      setFormData({
        team1_id: teams?.[0]?.id || 0,
        team2_id: teams?.[1]?.id || 0,
        team1_score: 0,
        team2_score: 0,
        datetime: new Date().toISOString().slice(0, 16),
        status: "pending",
        group_letter: "A",
        start_time: "",
        end_time: "",
      });
    }
  }, [matchToEdit, teams, isOpen]);

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
        [name]: parseInt(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = () => {
    // Basic validation
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
      team1_id: formData.team1_id || 0,
      team2_id: formData.team2_id || 0,
      team1_score: formData.team1_score || 0,
      team2_score: formData.team2_score || 0,
      datetime: formData.datetime || new Date().toISOString(),
      start_time: formData.start_time || "",
      end_time: formData.end_time || "",
      status: (formData.status as "pending" | "live" | "finished") || "pending",
      group_letter: formData.group_letter || "A",
    };

    onSave(matchData);
  };

  const availableGroups = ["A", "B", "C", "D", "X", "Q", "T", "H", "W"];

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  1. Csapat
                </label>
                <Select
                  name="team1_id"
                  value={formData.team1_id?.toString()}
                  onChange={handleChange}
                  className="w-full"
                >
                  {teams?.map((team) => (
                    <SelectItem key={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  2. Csapat
                </label>
                <Select
                  name="team2_id"
                  value={formData.team2_id?.toString()}
                  onChange={handleChange}
                  className="w-full"
                >
                  {teams?.map((team) => (
                    <SelectItem key={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Csoport
              </label>
              <Select
                name="group_letter"
                value={formData.group_letter}
                onChange={handleChange}
                className="w-full"
              >
                {availableGroups.map((group) => (
                  <SelectItem key={group}>{group}</SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dátum és idő
              </label>
              <Input
                type="datetime-local"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  1. Csapat pontszáma
                </label>
                <Input
                  type="number"
                  name="team1_score"
                  value={String(formData.team1_score)}
                  onChange={handleChange}
                  min={0}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  2. Csapat pontszáma
                </label>
                <Input
                  type="number"
                  name="team2_score"
                  value={String(formData.team2_score)}
                  onChange={handleChange}
                  min={0}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Állapot
              </label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full"
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
