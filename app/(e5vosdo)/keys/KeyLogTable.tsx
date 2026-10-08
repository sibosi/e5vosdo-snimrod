"use client";

import { Button } from "@heroui/react";
import { useState } from "react";
import { getKeyLogs } from "./keyActions";

interface KeyLog {
  id: number;
  name: string | null;
  email: string | null;
  borrowed_at: string | Date | null;
  returned_at: string | Date | null;
}

interface KeyLogTableProps {
  logTable: string;
  permission: string;
}

function formatDate(value: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function KeyLogTable({ logTable, permission }: KeyLogTableProps) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<KeyLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function showLogs() {
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      setLogs(await getKeyLogs({ logTable, permission, table: "" }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nem sikerült betölteni az előzményeket.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onPress={showLogs} className="m-4">
        Kölcsönzési előzmények
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="key-log-title"
        >
          <section className="flex max-h-[85vh] w-full max-w-6xl flex-col rounded-xl bg-white p-5 text-gray-900 shadow-xl dark:bg-gray-900 dark:text-white">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="key-log-title" className="text-xl font-semibold">
                Kulcs kölcsönzési előzményei
              </h2>
              <Button onPress={() => setOpen(false)}>Bezárás</Button>
            </div>
            {loading ? (
              <p>Betöltés…</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {[
                        "ID",
                        "Név",
                        "E-mail",
                        "Kölcsönözve",
                        "Visszahozva",
                      ].map((label) => (
                        <th key={label} className="px-4 py-3 font-semibold">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t border-gray-200 even:bg-gray-50 dark:border-gray-700 dark:even:bg-gray-800/60"
                      >
                        <td className="px-4 py-3">{log.id}</td>
                        <td className="px-4 py-3">{log.name || "—"}</td>
                        <td className="px-4 py-3">{log.email || "—"}</td>
                        <td className="px-4 py-3">
                          {formatDate(log.borrowed_at)}
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(log.returned_at)}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Még nincs kölcsönzési előzmény.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
