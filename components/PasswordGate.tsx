"use client";

import { useState, useEffect } from "react";

interface PasswordGateProps {
  authEndpoint: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PasswordGate: React.FC<PasswordGateProps> = ({
  authEndpoint,
  children,
  title = "Jelszó szükséges",
  description = "Kérjük, add meg a jelszót a hozzáféréshez.",
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated via API (cookie check)
    fetch(authEndpoint, { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [authEndpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(authEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: inputPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setError(false);
      } else {
        setError(true);
        setInputPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-selfprimary-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-selfprimary-bg p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-selfprimary-100">
            <svg
              className="h-8 w-8 text-selfprimary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-foreground-500">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                setError(false);
              }}
              placeholder="Jelszó"
              className={`w-full rounded-lg border-2 bg-foreground-50 px-4 py-3 text-center text-lg transition focus:outline-none focus:ring-2 ${
                error
                  ? "border-danger-500 focus:ring-danger-200"
                  : "border-foreground-200 focus:border-selfprimary-500 focus:ring-selfprimary-200"
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-center text-sm text-danger-600">
                Hibás jelszó. Próbáld újra!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-selfprimary-600 py-3 font-semibold text-white transition hover:bg-selfprimary-700 focus:outline-none focus:ring-2 focus:ring-selfprimary-500 focus:ring-offset-2"
          >
            Belépés
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
