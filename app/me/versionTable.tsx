"use client";
import {
  chechForUpdate,
  CheckResult,
  checkSWupdate,
} from "@/components/PWA/version";
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
                <th className="font-semibold">Jelenlegi verzió</th>
                <th>
                  {needUpdate.currentVersion
                    ? needUpdate.currentVersion
                    : "Nincs elérhető verzió"}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">Legújabb verzió</th>
                <th>
                  {needUpdate.latestVersion
                    ? needUpdate.latestVersion
                    : "Nincs elérhető verzió"}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">SW verzió-követelmény</th>
                <th>
                  {needSWUpdate.latestVersion
                    ? needSWUpdate.latestVersion
                    : "Nincs elérhető verzió"}
                </th>
              </tr>
              <tr>
                <th className="font-semibold">Kell frissítés?</th>
                <th>{needUpdate.updateRequired ? "Igen" : "Nem"}</th>
              </tr>
              <tr>
                <th className="font-semibold">Kell SW frissítés</th>
                <th>{needSWUpdate.updateRequired ? "Igen" : "Nem"}</th>
              </tr>
            </tbody>
          </table>

          {JSON.stringify(needUpdate)}
        </div>
      ) : null}
    </>
  );
};

export default VersionTable;
