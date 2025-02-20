"use client";
import React, { useEffect, useState } from "react";
import { EventType } from "@/db/event";
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@heroui/react";
import Image from "next/image";

interface UserType {
  permissions: string[];
}

export function ManagePreviewEvents({
  selfUser,
}: Readonly<{ selfUser: UserType }>) {
  const [previewEvents, setPreviewEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const fetchPreviewEvents = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/getPreviewEvents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          module: "event",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch preview events");
      const data = (await res.json()) as EventType[];
      setPreviewEvents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load preview events.");
    } finally {
      setIsLoading(false);
    }
  };

  const approvePreviewEvent = async (id: number) => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/approveEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          module: "event",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to approve event");

      await fetchPreviewEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to approve event.");
    } finally {
      setIsLoading(false);
    }
  };

  const rejectPreviewEvent = async (id: number) => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/rejectEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          module: "event",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to reject event");

      await fetchPreviewEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to reject event.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selfUser.permissions.includes("admin")) {
      fetchPreviewEvents();
    }
  }, [selfUser]);

  if (!selfUser.permissions.includes("admin")) {
    return (
      <div style={{ padding: "1rem", color: "red" }}>Admin Access Required</div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Preview Events (Admin)</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {previewEvents.length === 0 && !isLoading && !error && (
        <p>No preview events available.</p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {previewEvents.map((event) => (
          <div
            key={event.id}
            className="space-y-2 rounded-xl bg-selfprimary-100 p-4"
          >
            {event.image && (
              <div className="relative h-56">
                <Image
                  src={event.image}
                  alt={
                    typeof event.title === "string"
                      ? event.title
                      : event.title.join(" ")
                  }
                  fill={true}
                  className="mb-0.5 rounded-md object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold">
              {Array.isArray(event.title)
                ? event.title.join(" / ")
                : event.title}
            </h3>

            <div className="flex flex-wrap gap-4">
              <Button
                onPress={() => openModal(event)}
                disabled={isLoading}
                className="bg-selfprimary-300"
              >
                Részletek
              </Button>
              <Link
                href={`/creator/${event.id}`}
                className="rounded-xl bg-selfprimary-300 px-4 py-2.5 text-sm text-foreground"
              >
                Szerkesztés
              </Link>
              <Button
                onPress={() => approvePreviewEvent(event.id)}
                disabled={isLoading}
                color="success"
                variant="flat"
              >
                Jóváhagyás
              </Button>
              <Button
                onPress={() => rejectPreviewEvent(event.id)}
                disabled={isLoading}
                color="danger"
                variant="flat"
              >
                Elutasítás
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="5xl">
        <ModalContent>
          <ModalHeader>
            {selectedEvent
              ? Array.isArray(selectedEvent.title)
                ? selectedEvent.title.join(" / ")
                : selectedEvent.title
              : "Event Details"}
          </ModalHeader>
          <ModalBody>
            {selectedEvent && (
              <>
                <p>Description: {selectedEvent.description || "N/A"}</p>
                <p>Time: {new Date(selectedEvent.time).toLocaleString()}</p>
                {selectedEvent.show_time && (
                  <p>
                    Show Time:{" "}
                    {new Date(selectedEvent.show_time).toLocaleString()}
                  </p>
                )}
                <p>
                  Hide Time:{" "}
                  {new Date(selectedEvent.hide_time).toLocaleString()}
                </p>
                <p>Tags: {selectedEvent.tags.join(", ")}</p>
                <p>Author: {selectedEvent.author ?? "N/A"}</p>
                <p>Show Author: {selectedEvent.show_author ? "Yes" : "No"}</p>
                <p>
                  Show at Carousel:{" "}
                  {selectedEvent.show_at_carousel ? "Yes" : "No"}
                </p>
                <p>
                  Show at Events: {selectedEvent.show_at_events ? "Yes" : "No"}
                </p>
                <p>ID: {selectedEvent.id}</p>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export function ManageActiveEvents({
  selfUser,
}: Readonly<{ selfUser: UserType }>) {
  const [activeEvents, setActiveEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  const fetchActiveEvents = async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/getEvents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          module: "event",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = (await res.json()) as EventType[];
      setActiveEvents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load events.");
    } finally {
      setIsLoading(false);
    }
  };

  const rollbackEvent = async (id: number) => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/rollbackEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          module: "event",
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to rollback event");

      await fetchActiveEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to rollback event.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selfUser.permissions.includes("admin")) {
      fetchActiveEvents();
    }
  }, [selfUser]);

  if (!selfUser.permissions.includes("admin")) {
    return (
      <div style={{ padding: "1rem", color: "red" }}>Admin Access Required</div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Active Events (Admin)</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {activeEvents.length === 0 && !isLoading && !error && (
        <p>No active events available.</p>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {activeEvents.map((event) => (
          <div
            key={event.id}
            className="space-y-2 rounded-xl bg-selfprimary-100 p-4"
          >
            {event.image && (
              <div className="relative h-56">
                <Image
                  src={event.image}
                  alt={
                    typeof event.title === "string"
                      ? event.title
                      : event.title.join(" ")
                  }
                  fill={true}
                  className="mb-0.5 rounded-md object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold">
              {Array.isArray(event.title)
                ? event.title.join(" / ")
                : event.title}
            </h3>

            <div className="flex flex-wrap gap-4">
              <Button
                onPress={() => openModal(event)}
                disabled={isLoading}
                className="bg-selfprimary-300"
              >
                Részletek
              </Button>
              <Button
                onPress={() => rollbackEvent(event.id)}
                disabled={isLoading}
                className="bg-selfsecondary-300"
              >
                Rollback
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="5xl">
        <ModalContent>
          <ModalHeader>
            {selectedEvent
              ? Array.isArray(selectedEvent.title)
                ? selectedEvent.title.join(" / ")
                : selectedEvent.title
              : "Event Details"}
          </ModalHeader>
          <ModalBody>
            {selectedEvent && (
              <>
                <p>Description: {selectedEvent.description || "N/A"}</p>
                <p>Time: {new Date(selectedEvent.time).toLocaleString()}</p>
                {selectedEvent.show_time && (
                  <p>
                    Show Time:{" "}
                    {new Date(selectedEvent.show_time).toLocaleString()}
                  </p>
                )}
                <p>
                  Hide Time:{" "}
                  {new Date(selectedEvent.hide_time).toLocaleString()}
                </p>
                <p>Tags: {selectedEvent.tags.join(", ")}</p>
                <p>Author: {selectedEvent.author ?? "N/A"}</p>
                <p>Show Author: {selectedEvent.show_author ? "Yes" : "No"}</p>
                <p>
                  Show at Carousel:{" "}
                  {selectedEvent.show_at_carousel ? "Yes" : "No"}
                </p>
                <p>
                  Show at Events: {selectedEvent.show_at_events ? "Yes" : "No"}
                </p>
                <p>ID: {selectedEvent.id}</p>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
