"use client";
import React from "react";

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  color?: "selfprimary" | "selfsecondary";
  className?: string;
  type?:
    | "text"
    | "password"
    | "email"
    | "date"
    | "time"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "color"
    | "file"
    | "range"
    | "hidden"
    | "checkbox"
    | "radio"
    | "datetime-local";
};

const Input = ({
  label,
  value,
  onChange,
  placeholder,
  color = "selfprimary",
  className,
  type,
}: InputProps) => {
  className += " " + "rounded-md p-2";

  if (color === "selfprimary")
    className += " bg-selfprimary-50 text-selfprimary-900";
  else if (color === "selfsecondary")
    className += " bg-selfsecondary-50 text-selfsecondary-900";

  return (
    <input
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
};

export default Input;
