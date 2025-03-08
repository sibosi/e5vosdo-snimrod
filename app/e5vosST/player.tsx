"use client";
import React, { useEffect, useRef, useState } from "react";
import { SecureAudioStream } from "@/lib/audioDecoder";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [token, setToken] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [audioFileId, setAudioFileId] = useState<string>("1");

  useEffect(() => {
    async function initializeSession() {
      try {
        const res = await fetch("/api/audio/authToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: "demo-user" }),
        });

        if (!res.ok) {
          throw new Error("Failed to get authentication token");
        }

        const data = await res.json();
        setToken(data.token);
        setSessionId(data.sessionId);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    }

    initializeSession();
  }, []);

  useEffect(() => {
    if (token && sessionId && audioRef.current && audioFileId) {
      new SecureAudioStream(audioRef.current, token, sessionId, audioFileId);
    }
  }, [token, sessionId, audioFileId]);

  const selectAudioFile = (fileId: string) => {
    setAudioFileId(fileId);
    if (token && sessionId && audioRef.current) {
      new SecureAudioStream(audioRef.current, token, sessionId, fileId);
    }
  };

  if (isLoading) {
    return <div className="container">Loading secure audio player...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Secure Audio Player</h1>
      <div className="player-wrapper">
        <audio ref={audioRef} controls />
      </div>

      <div className="audio-selection">
        <h3>Select Audio File</h3>
        <button
          className={audioFileId === "1" ? "selected" : ""}
          onClick={() => selectAudioFile("1")}
        >
          Audio File 1
        </button>
        <button
          className={audioFileId === "2" ? "selected" : ""}
          onClick={() => selectAudioFile("2")}
        >
          Audio File 2
        </button>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: Arial, sans-serif;
        }
        .player-wrapper {
          margin: 2rem 0;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 8px;
        }
        audio {
          width: 100%;
        }
        .audio-selection {
          margin-top: 2rem;
        }
        button {
          margin-right: 1rem;
          padding: 0.5rem 1rem;
          background: #e0e0e0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button.selected {
          background: #0070f3;
          color: white;
        }
      `}</style>
    </div>
  );
}
