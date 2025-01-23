"use client";
import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { chechForUpdate, CheckResult, updateVersion } from "./version";

const VersionManager = () => {
  const [needUpdate, setNeedUpdate] = useState<CheckResult>();

  useEffect(() => {
    const interval = async () => {
      const newNeedUpdate = await chechForUpdate();
      setNeedUpdate(newNeedUpdate);
    };

    interval();
  }, []);

  return (
    <div>
      <Button
        color={needUpdate?.updateRequired ? "danger" : "default"}
        onPress={async () => {
          if (needUpdate?.updateRequired) {
            await updateVersion();
            window.location.reload();
          }
        }}
      >
        App frissítés
      </Button>
    </div>
  );
};

export default VersionManager;
