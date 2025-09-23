"use client";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import React from "react";

const DesktopMenu = () => {
  const pathname = usePathname();

  return (
    <div className="hidden min-w-64 lg:block">
      <aside className="fixed flex h-full w-64 flex-col gap-1 transition-all duration-300 ease-in-out">
        {siteConfig.navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={
              "border-2 px-4 py-2 text-sm text-foreground-800 transition-all duration-300 ease-in-out hover:rounded-2xl hover:border-selfprimary-400 hover:bg-selfprimary-20" +
              (pathname !== item.href
                ? " rounded-md border-transparent bg-transparent"
                : " rounded-2xl border-selfprimary-600 bg-selfprimary-50")
            }
          >
            {item.label}
          </a>
        ))}
      </aside>
    </div>
  );
};

export default DesktopMenu;
