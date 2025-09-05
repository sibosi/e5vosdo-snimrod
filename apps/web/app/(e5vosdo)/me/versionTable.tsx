"use client";
import {
  chechForUpdate,
  CheckResult,
  checkSWupdate,
} from "@/apps/web/components/PWA/version";
import React, { useEffect, useState } from "react";

const VersionTable = () => {
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
    <>
      {needUpdate && needSWUpdate ? (
        <div>
          <table>
            <tbody>
              <tr>
                <th className="font-semibold">App verzió</th>
                <th>
                  <span
                    className={
                      needUpdate.updateRequired ? "text-danger" : "text-success"
                    }
                  >
                    {needUpdate.currentVersion
                      ? needUpdate.currentVersion
                      : "Nincs elérhető verzió"}
                  </span>
                  {needUpdate.updateRequired
                    ? "→ " + needUpdate.latestVersion
                    : ""}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">Szinkronizációs követelmény</th>
                <th>
                  <span
                    className={needSWUpdate.updateRequired ? "text-danger" : ""}
                  >
                    {needSWUpdate.latestVersion
                      ? needSWUpdate.latestVersion
                      : "Nincs elérhető verzió"}
                  </span>

                  <span className="text-danger">
                    {"serviceWorker" in navigator
                      ? ""
                      : "Szinkronizálatlan app"}
                  </span>
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
};

export default VersionTable;
