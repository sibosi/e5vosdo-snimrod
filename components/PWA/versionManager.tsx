"use client";
import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import {
  chechForUpdate,
  CheckResult,
  checkSWupdate,
  updateVersion,
} from "./version";
import { ReinstallServiceWorker } from "./managesw";

const VersionManager = () => {
  const [needUpdate, setNeedUpdate] = useState<CheckResult>();
  const [needSWUpdate, setNeedSWUpdate] = useState<CheckResult>();

  useEffect(() => {
    const interval = async () => {
      const newNeedUpdate = await chechForUpdate();
      setNeedUpdate(newNeedUpdate);
    };

    const intervalSW = async () => {
      const newNeedSWUpdate = await checkSWupdate();
      setNeedSWUpdate(newNeedSWUpdate);
    };

    interval();
    intervalSW();
  }, []);

  return (
    <div>
      <Button
        color={needUpdate?.updateRequired ? "danger" : "default"}
        onClick={async () => {
          if (needUpdate?.updateRequired) {
            await updateVersion();
            window.location.reload();
          }
        }}
      >
        App frissítés
      </Button>
      <ReinstallServiceWorker
        color={needSWUpdate?.updateRequired ? "danger" : "default"}
      >
        SW frissítés
      </ReinstallServiceWorker>
    </div>
  );
};

export default VersionManager;
