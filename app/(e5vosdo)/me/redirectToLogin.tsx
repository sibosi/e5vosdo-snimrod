"use client";

import Login from "@/components/LoginForm";
import React from "react";

const PleaseLogin = () => {
  return (
    <div className="fixed left-0 top-0 z-0 flex h-full w-full flex-col justify-center bg-background/90 px-5">
      <h1 className="mb-2 text-center text-3xl font-semibold text-foreground">
        A folytatáshoz jelentkezz be!
      </h1>
      <Login />
    </div>
  );
};

export default PleaseLogin;
