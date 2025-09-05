"use client";
import React from "react";
import { Button } from "@heroui/react";
import VersionTable from "../versionTable";
import VersionManager from "@/apps/web/components/PWA/versionManager";
import CacheManager from "@/apps/web/components/PWA/cacheManager";
import {
  ManageSW,
  ReinstallServiceWorker,
} from "@/apps/web/components/PWA/managesw";

const AdvancedSettings = () => {
  return (
    <div>
      <VersionTable />
      <div className="my-2 flex gap-2">
        <VersionManager />
        <Button
          color="warning"
          onPress={() => {
            caches.keys().then((keys) => {
              keys.forEach((key) => {
                caches.delete(key);
              });
              alert("A gyorsítótár kiürítve.");
            });
          }}
        >
          Gyorsítótár kiürítése
        </Button>

        <ManageSW />
      </div>
      <CacheManager />
    </div>
  );
};

export default AdvancedSettings;
