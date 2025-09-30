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
import PleaseLogin from "../../me/redirectToLogin";
import { PossibleUserType } from "@/db/dbreq";

export default function ManageEvents({
  selfUser,
}: Readonly<{ selfUser: PossibleUserType }>) {
  const [previewEvents, setPreviewEvents] = useState<EventType[]>([]);
  const [activeEvents, setActiveEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<
    "preview" | "active"
  >("preview");

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
      setPreviewEvents(data.toSorted((a, b) => b.id - a.id));
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
      setActiveEvents(data.toSorted((a, b) => b.id - a.id));
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

  const showedEvents =
    selectedEventType === "preview" ? previewEvents : activeEvents;

  useEffect(() => {
    if (selfUser?.permissions.includes("admin")) {
      fetchPreviewEvents();
      fetchActiveEvents();
    }
  }, [selfUser]);

  if (!selfUser) return <PleaseLogin />;

  if (!selfUser.permissions.includes("admin"))
    return <p>Admin Access Required</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["preview", "active"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedEventType(type)}
            className={`rounded-xl border-2 px-3 py-1 ${
              selectedEventType === type
                ? "border-selfprimary-200 bg-selfprimary-200 font-semibold"
                : "border-selfprimary-200 hover:bg-selfprimary-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {showedEvents.length === 0 && !isLoading && !error ? (
          <p className="pt-4">Nincsenek megjeleníthető események.</p>
        ) : (
          showedEvents.map((event) => (
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

              <div className="grid grid-cols-2 gap-2">
                <Button
                  aria-label="Részletek"
                  isIconOnly
                  onPress={() => setSelectedEvent(event)}
                  disabled={isLoading}
                  className="w-full bg-selfprimary-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.933.87a2.89 2.89 0 0 1 4.134 0l.622.638.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01zM7.002 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0m1.602-2.027c.04-.534.198-.815.846-1.26.674-.475 1.05-1.09 1.05-1.986 0-1.325-.92-2.227-2.262-2.227-1.02 0-1.792.492-2.1 1.29A1.7 1.7 0 0 0 6 5.48c0 .393.203.64.545.64.272 0 .455-.147.564-.51.158-.592.525-.915 1.074-.915.61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325-.619.433-.926.914-.926 1.64v.111c0 .428.208.745.585.745.336 0 .504-.24.554-.627" />
                  </svg>
                </Button>

                {selectedEventType === "active" && (
                  <Button
                    onPress={() => rollbackEvent(event.id)}
                    disabled={isLoading}
                    className="w-full bg-selfsecondary-300"
                  >
                    Rollback
                  </Button>
                )}

                {selectedEventType === "preview" && (
                  <>
                    <Button
                      aria-label="Szerkesztés"
                      isIconOnly
                      as={Link}
                      href={`/creator/${event.id}`}
                      className="w-full bg-selfprimary-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                      </svg>
                    </Button>
                    <Button
                      aria-label="Jóváhagyás"
                      isIconOnly
                      onPress={() => approvePreviewEvent(event.id)}
                      isDisabled={isLoading}
                      className="w-full"
                      color="success"
                      variant="flat"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708" />
                      </svg>
                    </Button>
                    <Button
                      aria-label="Elutasítás"
                      isIconOnly
                      onPress={() => rejectPreviewEvent(event.id)}
                      isDisabled={isLoading}
                      color="danger"
                      className="w-full"
                      variant="flat"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zM6 7.5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1 0-1" />
                      </svg>
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        size="5xl"
      >
        {selectedEvent && (
          <ModalContent>
            <ModalHeader>
              {Array.isArray(selectedEvent.title)
                ? selectedEvent.title.join(" / ")
                : selectedEvent.title}
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
                    Show at Events:{" "}
                    {selectedEvent.show_at_events ? "Yes" : "No"}
                  </p>
                  <p>ID: {selectedEvent.id}</p>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setSelectedEvent(null)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
}
