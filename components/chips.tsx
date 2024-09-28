import { Chip } from "@nextui-org/react";
import React from "react";

// New
export const ChipNew = ({ text }: { text: string }) => {
  return (
    <Chip color="primary" size="sm">
      {text}
    </Chip>
  );
};

// Under development (hungarian)
export const ChipUC = () => {
  return (
    <Chip color="warning" size="sm">
      Fejlesztés alatt
    </Chip>
  );
};

// Beta (hungarian)
export const ChipBeta = () => {
  return (
    <Chip color="primary" size="sm" variant="shadow">
      Béta
    </Chip>
  );
};
