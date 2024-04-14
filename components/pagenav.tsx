import "../styles/globals.css";
import "bootstrap-icons/font/bootstrap-icons.json";
import clsx from "clsx";
import Link from "next/link";

const pages = {
  home: {
    route: "/",
    icon: "bi bi-house-door-fill",
    label: "Home",
  },
  clubs: {
    route: "/clubs",
    icon: "bi bi-people-fill",
    label: "Clubs",
  },
  groups: {
    route: "/groups",
    icon: "bi bi-journal-bookmark-fill",
    label: "Groups",
  },
  about: {
    route: "/about",
    icon: "bi bi-person-bounding-box",
    label: "About",
  },
};

const tabs = [pages.groups, pages.clubs, pages.home, pages.about];

export const PageNav = () => {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 backdrop-blur-lg md:hidden">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css"
      ></link>
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {tabs.map((page, index) => (
          <Link
            href={page.route}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <i
              className={clsx(
                page.icon,
                " fill-current w-auto h-auto  mb-1 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black"
              )}
            ></i>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-black">
              {page.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
