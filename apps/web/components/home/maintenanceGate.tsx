import { PossibleUserType } from "@/apps/web/db/dbreq";
import React from "react";
import { gate } from "@/apps/web/db/permissions";
import MaintenancePage from "./maintenancePage";

const MaintenanceGate = ({
  selfUser,
  isActive,
  children,
}: {
  selfUser: PossibleUserType;
  isActive: boolean;
  children: React.ReactNode;
}) => {
  if (!isActive) return children;

  if (!selfUser || !gate(selfUser, "tester", "boolean"))
    return <MaintenancePage selfUser={selfUser} />;

  return children;
};

export default MaintenanceGate;
