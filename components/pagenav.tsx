"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCookie } from "@/lib/clientCookies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const pages = {
  home: {
    route: "/",
    icon: <FontAwesomeIcon icon={["fas", "dog"]} />,
    label: "Home",
  },
  clubs: {
    route: "/clubs",
    icon: <FontAwesomeIcon icon={["fas", "people-roof"]} />,
    label: "Clubs",
  },
  events: {
    route: "/events",
    icon: <FontAwesomeIcon icon={["fas", "calendar-day"]} />,
    label: "Groups",
  },
  users: {
    route: "/admin/users",
    icon: <FontAwesomeIcon icon={["fas", "user-shield"]} />,
    label: "Users",
  },
  me: {
    route: "/me",
    icon: <FontAwesomeIcon icon={["fas", "user"]} />,
    label: "Me",
  },
  podcast: {
    route: "/est",
    icon: <FontAwesomeIcon icon={["fas", "microphone-lines"]} />,
    label: "Podcast",
  },
  feed: {
    route: "/elections",
    icon: <FontAwesomeIcon icon={["fas", "people-line"]} />,
    label: "Elections",
  },
};

const tabs = [pages.feed, pages.events, pages.home, pages.clubs, pages.me];

export const PageNav = () => {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);
  const [currentPage, setCurrentPage] = useState(() =>
    tabs.find((page) => page.route === pathname),
  );

  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [highlightStyle, setHighlightStyle] = useState<{
    left: number;
    width: number;
  }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const newPage = tabs.find((page) => page.route === pathname);
    setCurrentPage(newPage);
    if (pathname === "/welcome" && getCookie("skipWelcome") !== "true")
      setIsHidden(true);

    if (newPage) {
      const index = tabs.indexOf(newPage);
      const el = itemRefs.current[index];
      if (el) {
        const parentRect = el.parentElement?.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (parentRect) {
          const left = elRect.left - parentRect.left;
          const width = elRect.width;
          setHighlightStyle({ left, width });
        } else {
          setHighlightStyle({ left: el.offsetLeft, width: el.offsetWidth });
        }
      }
    }
  }, [pathname]);

  if (isHidden) return null;

  return (
    <div className="myglass fixed bottom-6 z-50 w-auto items-center rounded-full p-2 shadow-xl lg:hidden">
      <div className="relative mx-auto flex h-full max-w-lg items-center justify-around gap-3.5 font-medium">
        <motion.div
          className="absolute bottom-0 top-0 rounded-full bg-selfprimary-100"
          animate={{ left: highlightStyle.left, width: highlightStyle.width }}
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ position: "absolute" }}
        />
        {tabs.map((page, index) => {
          const isActive = currentPage === page;
          return (
            <Link
              key={index}
              href={page.route}
              aria-current={isActive ? "page" : undefined}
              className="relative inline-flex flex-col items-center justify-center p-3.5"
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
            >
              <div
                className={`text-xl ${
                  isActive
                    ? "text-selfprimary-700"
                    : "text-foreground hover:text-selfprimary-700"
                }`}
              >
                {page.icon}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
