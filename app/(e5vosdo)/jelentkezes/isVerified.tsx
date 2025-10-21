"use client";
import Login from "@/components/LoginForm";
import { siteConfig } from "@/config/site";
import { PossibleUserType } from "@/db/dbreq";
import { Alert } from "@heroui/react";
import React from "react";

const textByTopic = {
  signup: {
    notLoggedIn:
      "Az E5N előadások jelentkezéséhez be kell jelentkezned az eötvösös google fiókoddal!",
    notVerified:
      "Csak igazolt diákok jelentkezhetnek előadásra. Probléma esetén értesítendő: ",
    verified: "Diákstátusz igazolva! Az előadásokra jelentkezhetsz.",
  },
  vote: {
    notLoggedIn:
      "Az osztályprogramok szavazásához be kell jelentkezned az eötvösös google fiókoddal!",
    notVerified:
      "Csak igazolt diákok szavazhatnak. Probléma esetén értesítendő: ",
    verified: "Diákstátusz igazolva! Szavazhatsz.",
  },
};

const IsVerified = ({
  selfUser,
  topic = "signup",
}: {
  selfUser: PossibleUserType;
  topic?: "signup" | "vote";
}) => {
  if (!selfUser)
    return (
      <Alert color="warning" className="my-2" endContent={<Login />}>
        {textByTopic[topic].notLoggedIn}
      </Alert>
    );

  if (!selfUser.is_verified)
    return (
      <Alert color="danger" className="my-2">
        {textByTopic[topic].notVerified} {siteConfig.developer} (
        {siteConfig.developerEmail})
      </Alert>
    );

  return (
    <Alert color="success" className="my-2">
      {textByTopic[topic].verified}
    </Alert>
  );
};

export default IsVerified;
