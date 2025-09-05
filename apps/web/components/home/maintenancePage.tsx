"use client";
import { PossibleUserType } from "@/apps/web/db/dbreq";
import React from "react";
import Login from "../LoginForm";
import { gate } from "@/apps/web/db/permissions";
import { LogoutButton } from "../LogOut";

const MaintenancePage = ({ selfUser }: { selfUser: PossibleUserType }) => {
  if (!selfUser) {
    return (
      <div className="fixed left-0 top-0 z-0 flex h-full w-full flex-col justify-center bg-background bg-opacity-90 px-5">
        <h1 className="mb-2 text-center text-3xl font-semibold text-foreground">
          Az oldal karbantartás alatt van. Kérjük nézz vissza később!
        </h1>
        <Login />
      </div>
    );
  }

  if (!gate(selfUser, "tester", "boolean")) {
    return (
      <div className="fixed left-0 top-0 z-0 flex h-full w-full flex-col justify-center bg-background bg-opacity-90 px-5">
        <h1 className="mb-2 text-center text-3xl font-semibold text-foreground">
          Szia {selfUser.name}! Az oldal karbantartás alatt van. Kérjük nézz
          vissza később!
        </h1>
        <LogoutButton />
      </div>
    );
  }

  return <></>;
};

export default MaintenancePage;
