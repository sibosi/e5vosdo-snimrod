"use client";
import Tray from "@/components/tray";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import AppearanceSettings from "./settings/AppearanceSettings";
import NotificationSettings from "./settings/NotificationSettings";
import PersonalDataSettings from "./settings/PersonalDataSettings";
import { UserType } from "@/db/dbreq";
import { doLogout } from "@/actions/route";
import AdvancedSettings from "./settings/AdvancedSettings";

const Settings = ({ selfUser }: { selfUser: UserType }) => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [saveSettingsCallback, setSaveSettingsCallback] =
    useState<() => void>();
  const [reloadNeeded, setReloadNeeded] = useState(false);
  const [isSaveNeeded, setIsSaveNeeded] = useState(false);

  const sections: {
    title: string;
    saveAble: boolean;
    content: React.ReactNode;
  }[] = [
    {
      title: "Személyes adatok",
      saveAble: true,
      content: (
        <PersonalDataSettings
          selfUser={selfUser}
          setIsSaveNeeded={setIsSaveNeeded}
          setSaveSettings={setSaveSettingsCallback}
        />
      ),
    },
    {
      title: "Értesítések",
      saveAble: false,
      content: (
        <NotificationSettings
          selfUser={selfUser}
          setReloadNeeded={setReloadNeeded}
        />
      ),
    },
    {
      title: "Megjelenés",
      saveAble: false,
      content: <AppearanceSettings />,
    },

    /*{
      title: "Fejlesztői beállítások",
      saveAble: false,
      content: <AdvancedSettings />,
  }*/
  ];

  useEffect(() => {
    if (reloadNeeded) window.location.reload();
  }, [activeSection]);

  return (
    <>
      <Tray
        padding={false}
        className="flex flex-col divide-y divide-selfprimary-500 p-1 text-sm font-bold text-selfprimary-900"
      >
        {sections.map((section, index) => (
          <button
            key={section.title}
            className="flex items-center justify-between p-3"
            onClick={
              activeSection === index
                ? () => setActiveSection(null)
                : () => setActiveSection(index)
            }
          >
            <p>{section.title}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                strokeWidth="2"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
              />
            </svg>
          </button>
        ))}
      </Tray>

      <Tray
        padding={false}
        className="flex flex-col divide-y divide-selfprimary-500 p-1 text-sm font-bold text-selfprimary-900"
      >
        <button
          className="flex items-center justify-between p-3"
          onClick={doLogout}
        >
          <p>Kijelentkezés</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              strokeWidth="2"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
            />
          </svg>
        </button>
      </Tray>

      <Drawer
        isOpen={activeSection !== null}
        onOpenChange={(open) => !open && setActiveSection(null)}
        size={
          typeof window !== "undefined" && window.innerWidth >= 1024
            ? "md"
            : "full"
        }
        backdrop="transparent"
        onClose={() => {
          setActiveSection(null);
          setSaveSettingsCallback(undefined);
        }}
      >
        {activeSection === null ? null : (
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className="flex flex-col gap-1">
                  <h2>{sections[activeSection].title}</h2>
                </DrawerHeader>
                <DrawerBody>{sections[activeSection].content}</DrawerBody>
                {sections[activeSection].saveAble && (
                  <DrawerFooter>
                    <Button
                      color={saveSettingsCallback ? "primary" : "default"}
                      isDisabled={!isSaveNeeded}
                      onPress={() => {
                        if (saveSettingsCallback !== undefined) {
                          saveSettingsCallback();
                        }
                        onClose();
                      }}
                    >
                      Mentés
                    </Button>
                  </DrawerFooter>
                )}
              </>
            )}
          </DrawerContent>
        )}
      </Drawer>
    </>
  );
};

export default Settings;
