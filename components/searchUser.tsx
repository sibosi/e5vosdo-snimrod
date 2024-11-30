"use client";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
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
    if (inputValue.length < 2) {
      return false;
    }

    // Normalize both strings so we can slice safely
    // take into account the ignorePunctuation option as well...
    textValue = textValue.normalize("NFC").toLocaleLowerCase();
    inputValue = inputValue.normalize("NFC").toLocaleLowerCase();

    return inputValue.split(" ").every((input) => textValue.includes(input));
  };

  return (
    <Autocomplete
      size={size ?? "md"}
      label={label ?? "Diák keresése"}
      placeholder={placeholder}
      className="max-w-xs"
      allowsEmptyCollection={false}
      defaultFilter={myFilter}
      defaultItems={Object.keys(usersNameByEmail).map((email) => ({
        name: usersNameByEmail[email],
        email: email,
      }))}
      value={searchValue}
      onChange={(event) => setSearchValue(event.target.value)}
      onSelectionChange={(name) => {
        if (name)
          onSelectEmail(
            Object.keys(usersNameByEmail).find(
              (email) => usersNameByEmail[email] === name,
            ) as string,
          );
      }}
    >
      {(user) => (
        <AutocompleteItem key={user.name} textValue={user.name}>
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-xs">{user.email}</p>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
