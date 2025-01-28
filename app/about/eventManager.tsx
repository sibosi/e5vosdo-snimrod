"use client";
import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

interface PreviewEvent {
  id: number;
  title: string | string[];
  image: string | null;
  description: string | null;
  time: string;
  show_time: string | null;
  hide_time: string;
  tags: string[];
}

interface UserType {
  permissions: string[];
}

export default function AdminEventsPanel({
  selfUser,
}: Readonly<{ selfUser: UserType }>) {
  const [previewEvents, setPreviewEvents] = useState<PreviewEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch preview events from the server
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
      const data = (await res.json()) as PreviewEvent[];
      setPreviewEvents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load preview events.");
    } finally {
      setIsLoading(false);
    }
  };

  // Approve an event
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

      // Refresh the preview list after approving
      await fetchPreviewEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to approve event.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reject an event
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

      // Refresh the preview list after rejecting
      await fetchPreviewEvents();
    } catch (err) {
      console.error(err);
      setError("Failed to reject event.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load events if the user is admin
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

      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "1fr 1fr 1fr",
        }}
      >
        {previewEvents.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border border-selfprimary-300 bg-selfprimary-100 p-4"
          >
            {event.image && (
              <img
                src={event.image}
                alt={
                  typeof event.title === "string"
                    ? event.title
                    : event.title.join(" ")
                }
                style={{
                  width: "100%",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              />
            )}
            <h3>
              {Array.isArray(event.title)
                ? event.title.join(" / ")
                : event.title}
            </h3>
            <p>Description: {event.description || "N/A"}</p>
            <p>Time: {new Date(event.time).toLocaleString()}</p>
            {event.show_time && (
              <p>Show Time: {new Date(event.show_time).toLocaleString()}</p>
            )}
            <p>Hide Time: {new Date(event.hide_time).toLocaleString()}</p>
            <p>Tags: {event.tags.join(", ")}</p>

            <div
              style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}
            >
              <Button
                onPress={() => approvePreviewEvent(event.id)}
                disabled={isLoading}
              >
                Approve
              </Button>
              <Button
                onPress={() => rejectPreviewEvent(event.id)}
                disabled={isLoading}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
