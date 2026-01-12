"use client";

import { AlertType } from "@/db/dbreq";
import {
  Button,
  Input,
  Textarea,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect, useState } from "react";

interface AlertFormData {
  id?: number;
  text: string;
  className: string;
  padding: boolean;
  icon: boolean;
}

const defaultFormData: AlertFormData = {
  text: "",
  className: "",
  padding: true,
  icon: false,
};

async function fetchAlerts(): Promise<AlertType[]> {
  const response = await fetch("/api/alerts/manage");
  if (!response.ok) throw new Error("Failed to fetch alerts");
  return response.json();
}

async function createAlert(data: AlertFormData) {
  const response = await fetch("/api/alerts/manage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.ok;
}

async function updateAlert(data: AlertFormData) {
  const response = await fetch("/api/alerts/manage", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.ok;
}

async function deleteAlertById(id: number) {
  const response = await fetch(`/api/alerts/manage?id=${id}`, {
    method: "DELETE",
  });
  return response.ok;
}

const AlertManager = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<AlertFormData>(defaultFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleSubmit = async () => {
    if (!formData.text.trim()) {
      alert("A szöveg megadása kötelező!");
      return;
    }

    let success: boolean;
    if (isEditing && formData.id) {
      success = await updateAlert(formData);
    } else {
      success = await createAlert(formData);
    }

    if (success) {
      alert(
        isEditing
          ? "Alert sikeresen frissítve!"
          : "Alert sikeresen létrehozva!",
      );
      setFormData(defaultFormData);
      setIsEditing(false);
      loadAlerts();
    } else {
      alert("Hiba történt a mentés során!");
    }
  };

  const handleEdit = (alert: AlertType) => {
    setFormData({
      id: alert.id,
      text: alert.text,
      className: alert.className || "",
      padding: alert.padding ?? true,
      icon: alert.icon ?? false,
    });
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    const success = await deleteAlertById(deleteId);
    if (success) {
      alert("Alert sikeresen törölve!");
      loadAlerts();
    } else {
      alert("Hiba történt a törlés során!");
    }
    onClose();
    setDeleteId(null);
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    onOpen();
  };

  const cancelEdit = () => {
    setFormData(defaultFormData);
    setIsEditing(false);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      alert("Add meg a link URL-jét!");
      return;
    }
    const displayText = linkText.trim() || linkUrl;
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="underline text-blue-400 hover:text-blue-300">${displayText}</a>`;
    setFormData({
      ...formData,
      text: formData.text + linkHtml,
    });
    setLinkUrl("");
    setLinkText("");
  };

  const isHidden = formData.className.includes("hidden");

  return (
    <div className="space-y-6">
      {/* Form for creating/editing alerts */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {isEditing ? "Alert szerkesztése" : "Új alert létrehozása"}
          </h3>
        </CardHeader>
        <Divider />
        <CardBody className="space-y-4">
          <Textarea
            label="Alert szövege (HTML támogatott)"
            placeholder="Írd be az alert szövegét..."
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            minRows={3}
          />

          {/* Link insertion helper */}
          <div className="rounded-lg border border-default-200 p-4">
            <p className="mb-2 text-sm font-medium">Link beszúrása</p>
            <div className="flex flex-wrap gap-2">
              <Input
                size="sm"
                label="Link URL"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="min-w-[200px] flex-1"
              />
              <Input
                size="sm"
                label="Link szövege (opcionális)"
                placeholder="Kattints ide"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="min-w-[200px] flex-1"
              />
              <Button
                size="lg"
                color="secondary"
                onPress={insertLink}
                className="self-end"
              >
                Link beszúrása
              </Button>
            </div>
          </div>

          <Input
            label="CSS osztály (className)"
            placeholder="pl.: hidden, text-red-500"
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
          />

          <div className="flex flex-wrap gap-6">
            <Switch
              isSelected={formData.padding}
              onValueChange={(value) =>
                setFormData({ ...formData, padding: value })
              }
            >
              Padding
            </Switch>
            <Switch
              isSelected={formData.icon}
              onValueChange={(value) =>
                setFormData({ ...formData, icon: value })
              }
            >
              Ikon megjelenítése
            </Switch>
            <Switch
              isSelected={isHidden}
              onValueChange={(value) => {
                let newClassName: string;
                if (value) {
                  newClassName = formData.className.includes("hidden")
                    ? formData.className
                    : (formData.className + " hidden").trim();
                } else {
                  newClassName = formData.className
                    .replaceAll(/\bhidden\b/g, "")
                    .trim();
                }
                setFormData({ ...formData, className: newClassName });
              }}
            >
              Rejtett (hidden)
            </Switch>
          </div>

          <div className="flex gap-2">
            <Button color="primary" onPress={handleSubmit} className="flex-1">
              {isEditing ? "Mentés" : "Létrehozás"}
            </Button>
            {isEditing && (
              <Button color="default" variant="flat" onPress={cancelEdit}>
                Mégse
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Preview */}
      {formData.text && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Előnézet</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div
              className={`bg-primary/20 rounded-lg p-4 ${formData.className}`}
              dangerouslySetInnerHTML={{ __html: formData.text }}
            />
          </CardBody>
        </Card>
      )}

      {/* List of existing alerts */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Meglévő alertek ({alerts.length})
          </h3>
        </CardHeader>
        <Divider />
        <CardBody>
          {loading && (
            <p className="text-center text-default-500">Betöltés...</p>
          )}
          {!loading && alerts.length === 0 && (
            <p className="text-center text-default-500">Nincsenek alertek</p>
          )}
          {!loading && alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="bg-default-100">
                  <CardBody>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-default-500">
                            ID: {alert.id}
                          </p>
                          <div
                            className="mt-1"
                            dangerouslySetInnerHTML={{ __html: alert.text }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleEdit(alert)}
                          >
                            Szerkesztés
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => confirmDelete(alert.id)}
                          >
                            Törlés
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-default-400">
                        <span>className: {alert.className || "(nincs)"}</span>
                        <span>|</span>
                        <span>padding: {alert.padding ? "igen" : "nem"}</span>
                        <span>|</span>
                        <span>icon: {alert.icon ? "igen" : "nem"}</span>
                        {alert.className?.includes("hidden") && (
                          <>
                            <span>|</span>
                            <span className="text-warning">REJTETT</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete confirmation modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Törlés megerősítése</ModalHeader>
          <ModalBody>
            <p>Biztosan törölni szeretnéd ezt az alertet?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={onClose}>
              Mégse
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Törlés
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AlertManager;
