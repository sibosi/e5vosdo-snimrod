"use client";
import { Input } from "@heroui/react";
import { useState, useRef, useEffect } from "react";

export default function SearchUser({
  usersNameByEmail,
  onSelectEmail,
  label,
  placeholder,
  size,
  addCustomParticipant = false,
}: Readonly<{
  usersNameByEmail: Record<string, string | { name: string; class: string }>;
  onSelectEmail: (email: string) => void;
  label?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  addCustomParticipant?: boolean;
}>) {
  const [searchValue, setSearchValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  const getUserName = (email: string) => {
    const userInfo = usersNameByEmail[email];
    return typeof userInfo === "string" ? userInfo : (userInfo?.name ?? email);
  };

  const filter = (searchValue: string) => {
    const elements = Object.keys(usersNameByEmail).filter((email) =>
      searchValue
        .toLocaleLowerCase()
        .split(" ")
        .every((input) => getUserName(email).toLowerCase().includes(input)),
    );

    return elements.slice(0, 6);
  };

  useEffect(() => {
    const results = filter(searchValue);
    if (addCustomParticipant && results.length < 2)
      results.push(`${searchValue} (Nem regisztrált)`);
    setFilteredEmails(results);
    setHighlightedIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredEmails.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        setHighlightedIndex((prevIndex) =>
          prevIndex === null || prevIndex === filteredEmails.length - 1
            ? 0
            : prevIndex + 1,
        );
        break;
      case "ArrowUp":
        setHighlightedIndex((prevIndex) =>
          prevIndex === null || prevIndex === 0
            ? filteredEmails.length - 1
            : prevIndex - 1,
        );
        break;
      case "Enter":
        if (highlightedIndex !== null) {
          onSelectEmail(filteredEmails[highlightedIndex]);
          setSearchValue("");
        }
        break;
      case "Escape":
        setHighlightedIndex(null);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Input
        name={label ?? "Diák keresése"}
        placeholder={placeholder ?? "Diák neve"}
        size={size}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchValue.length > 1 && (
        <div className="w-unit-80 absolute z-50 mt-8 rounded-md border border-selfprimary-200 bg-selfprimary-bg p-1 text-selfprimary-900 shadow-md">
          {filteredEmails.map((email, index) => (
            <button
              type="button"
              key={email}
              onClick={() => {
                onSelectEmail(email);
                setSearchValue("");
              }}
              ref={(el) => {
                optionsRef.current[index] = el!;
              }}
              className={`block w-full rounded-md px-1 py-0.5 text-left hover:bg-selfprimary-200 ${
                highlightedIndex === index ? "bg-selfprimary-200" : ""
              }`}
            >
              <p className="font-bold">{getUserName(email)}</p>
              <p className="text-xs font-thin">{email}</p>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
