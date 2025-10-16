"use client";
import Login from "@/components/LoginForm";
import { siteConfig } from "@/config/site";
import { PossibleUserType } from "@/db/dbreq";
import { Alert } from "@heroui/react";
import React from "react";

const IsVerified = ({ selfUser }: { selfUser: PossibleUserType }) => {
  if (!selfUser)
    return (
      <Alert color="warning" className="my-2" endContent={<Login />}>
        Az E5N előadások jelentkezéséhez be kell jelentkezned!
      </Alert>
    );

  if (!selfUser.is_verified)
    return (
      <Alert color="danger" className="my-2">
        Csak igazolt diákok jelentkezhetnek előadásra. Probléma esetén
        értesítendő: {siteConfig.developer} ({siteConfig.developerEmail})
      </Alert>
    );

  return (
    <Alert color="success" className="my-2">
      Diákstátusz igazolva! Az előadásjelentkezési felület szombat délután fog
      megnyílni.
    </Alert>
  );
};

export default IsVerified;
