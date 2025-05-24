"use client";
import { Input } from "@heroui/react";
import { useState, useRef, useEffect } from "react";

type SearchUserProps = {
  onSelectEmail: (email: string) => void;
} & React.ComponentProps<typeof Input>;

export default function SearchUser({
  onSelectEmail,
  ...props
}: Readonly<SearchUserProps>) {
  const [usersNameByEmail, setUsersNameByEmail] =
    useState<Record<string, string>>();
  const [searchValue, setSearchValue] = useState("");
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  const filter = (searchValue: string) => {
    if (!usersNameByEmail) return [];
    const elements = Object.keys(usersNameByEmail).filter((email) =>
      searchValue
        .toLocaleLowerCase()
        .split(" ")
        .every((input) =>
          usersNameByEmail[email].toLowerCase().includes(input),
        ),
    );

    return [...elements.slice(0, 6), searchValue];
  };

  useEffect(() => {
    fetch("/api/getAllUsersNameByEmail", {
      method: "GET",
    }).then((res) => {
      if (res.ok) {
        res.json().then((data: Record<string, string>) => {
          setUsersNameByEmail(data);
        });
      } else {
        alert("Hiba a felhasználók lekérdezése közben");
      }
    });
  }, []);

  useEffect(() => {
    if (usersNameByEmail === undefined) return;
    const results = filter(searchValue);
    setFilteredEmails(results);
  }, [searchValue]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (
    event: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
  ) => {
    if (filteredEmails.length === 0) return;

    const currentIndex = optionsRef.current.findIndex(
      (el) => el === document.activeElement,
    );

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        optionsRef.current[
          currentIndex === -1 ? 0 : (currentIndex + 1) % filteredEmails.length
        ]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        optionsRef.current[
          currentIndex === -1
            ? filteredEmails.length - 1
            : (currentIndex - 1 + filteredEmails.length) % filteredEmails.length
        ]?.focus();
        break;
      case "Enter":
        event.preventDefault();
        if (currentIndex === -1 && filteredEmails.length > 0) {
          onSelectEmail(filteredEmails[0]);
          setSearchValue("");
        }
    }
  };

  if (usersNameByEmail === undefined)
    return <Input {...props} placeholder="Betöltés..." disabled />;

  return (
    <div className="relative w-full">
      <Input
        {...props}
        name={props.name ?? "Diák keresése"}
        size={props.size}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchValue.length > 1 && (
        <div className="absolute z-50 rounded-md bg-surface-20 py-1 text-selfprimary-900 shadow-lg">
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
              className="block w-full rounded-md px-2 py-1 text-left hover:bg-selfprimary-100 focus:bg-selfprimary-100"
              onKeyDown={handleKeyDown}
            >
              <p className="font-semibold">
                {usersNameByEmail[email] ?? "Nem személy kiválasztása"}
              </p>
              <p className="text-xs font-extralight text-surface-700">
                {email}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
