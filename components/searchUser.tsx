"use client";
import { Input } from "@nextui-org/react";
import { useState } from "react";

export default function SearchUser({
  usersNameByEmail,
  onSelectEmail,
  label,
  placeholder,
  size,
}: Readonly<{
  usersNameByEmail: Record<string, string>;
  onSelectEmail: (email: string) => void;
  label?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}>) {
  const [searchValue, setSearchValue] = useState("");
  const myFilter = (textValue: string, inputValue: string) => {
    if (inputValue.length < 2) return false;

    textValue = textValue.toLocaleLowerCase();
    inputValue = inputValue.toLocaleLowerCase();

    return inputValue.split(" ").every((input) => textValue.includes(input));
  };

  const filter = (searchValue: string) => {
    const elements = Object.keys(usersNameByEmail).filter((email) =>
      usersNameByEmail[email].toLowerCase().includes(searchValue.toLowerCase()),
    );

    return elements.slice(0, 6);
  };

  return (
    <>
      <Input
        name={label ?? "Diák keresése"}
        placeholder={placeholder ?? "Diák neve"}
        size={size}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      ></Input>
      {searchValue.length > 1 && (
        <div className="absolute z-50 mt-8 w-unit-80 rounded-md border border-selfprimary-200 bg-selfprimary-bg p-1 text-selfprimary-900 shadow-md">
          {filter(searchValue).map((email) => {
            return (
              <button
                type="button"
                key={email}
                onClick={() => {
                  onSelectEmail(email);
                  setSearchValue("");
                }}
                className="block w-full rounded-md px-1 py-0.5 text-left hover:bg-selfprimary-200"
              >
                <p className="font-bold">{usersNameByEmail[email]}</p>
                <p className="text-xs font-thin">{email}</p>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
