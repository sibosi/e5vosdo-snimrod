"use client";

import type { ReactNode } from "react";
import { Tab, Tabs } from "@heroui/react";

type ServerSideTabItem = {
  key: string;
  label: string;
  content: ReactNode;
};

type ServerSideTabProps = Readonly<{
  tabs: ServerSideTabItem[];
  isSecret?: boolean;
}>;

export default function ServerSideTab({ tabs, isSecret }: ServerSideTabProps) {
  return (
    <Tabs
      fullWidth={true}
      color="primary"
      variant="light"
      aria-label="Options"
      hidden={isSecret}
      className="pb-2"
    >
      {tabs.map((tab) => (
        <Tab key={tab.key} title={tab.label} className="p-0">
          {tab.content}
        </Tab>
      ))}
    </Tabs>
  );
}
