import React from "react";
import "../styles/globals.css";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export const Section = ({ title, children }: SectionProps) => {
  return (
    <div className="py-3 text-foreground">
      <h1 className="text-2xl font-medium py-1">{title}</h1>
      <div>{children}</div>
    </div>
  );
};
