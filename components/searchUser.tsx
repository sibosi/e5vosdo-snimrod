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
  excludeEmails = [],
  showInput = true,
  inputValue,
  onInputChange,
}: Readonly<{
  usersNameByEmail: Record<
    string,
    string | { name: string; class: string; image?: string }
  >;
  onSelectEmail: (email: string) => void;
  label?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  addCustomParticipant?: boolean;
  excludeEmails?: string[];
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}>) {
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const searchValue = inputValue ?? internalSearchValue;
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  const getUserName = (email: string) => {
    const userInfo = usersNameByEmail[email];
    return typeof userInfo === "string" ? userInfo : (userInfo?.name ?? email);
  };

  const getUserInfo = (email: string) => {
    const userInfo = usersNameByEmail[email];
    return typeof userInfo === "string" ? undefined : userInfo;
  };

  const setSearchValue = (value: string) => {
    setInternalSearchValue(value);
    onInputChange?.(value);
  };

  const filter = (searchValue: string) => {
    const elements = Object.keys(usersNameByEmail).filter(
      (email) =>
        !excludeEmails.includes(email) &&
        searchValue
          .toLocaleLowerCase()
          .split(" ")
          .every((input) =>
            `${getUserName(email)} ${email} ${getUserInfo(email)?.class ?? ""}`
              .toLowerCase()
              .includes(input),
          ),
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
  }, [searchValue, excludeEmails, addCustomParticipant]);

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
      {showInput && (
        <Input
          name={label ?? "Diák keresése"}
          placeholder={placeholder ?? "Diák neve"}
          size={size}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      )}
      {searchValue.length > (showInput ? 1 : 0) && (
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
              <div className="flex items-center gap-2">
                {getUserInfo(email)?.image ? (
                  <img
                    src={getUserInfo(email)?.image}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold">
                    {getUserName(email).slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold">{getUserName(email)}</p>
                  <p className="text-xs font-thin">
                    {getUserInfo(email)?.class
                      ? `${getUserInfo(email)?.class} · `
                      : ""}
                    {email}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
