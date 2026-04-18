"use client";

import { useState } from "react";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function VideoUploader() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/media/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ismeretlen hiba történt.");
      }

      setSuccess(`Videó sikeresen hozzáadva! ID: ${data.id}`);
      setUrl("");
      setTitle("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">YouTube Videó Hozzáadása</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="YouTube Videó URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <Input
            label="Videó Címe"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="A videó címe..."
          />
          <Button type="submit" color="primary" isLoading={loading}>
            Videó Hozzáadása
          </Button>
        </form>
        {error && <p className="mt-4 text-danger">{error}</p>}
        {success && <p className="mt-4 text-success">{success}</p>}
      </CardBody>
    </Card>
  );
}
