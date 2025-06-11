"use client";
import React from "react";
import ESTLogo from "@/public/groups/e5vosst.svg";
import Link from "next/link";

const PodcastDrop = () => {
  const [isHidden, setIsHidden] = React.useState(false);
  const STORAGE_KEY = "ad_PodcastDropHidden_20250611";

  React.useEffect(() => {
    const storedVisibility = localStorage.getItem(STORAGE_KEY);
    if (storedVisibility === "true") {
      setIsHidden(true);
    }
  }, []);

  if (isHidden) return null;

  return (
    <Link
      className="relative mb-4 flex h-24 max-w-sm gap-2 overflow-hidden rounded-xl bg-selfprimary-50 xs:gap-4"
      href="/est"
    >
      <ESTLogo className="h-24 w-24 min-w-24 bg-[#6d1213] p-1.5 text-[#efefef]" />
      <div className="text-nowrap py-4">
        <h2 className="text-xl font-bold text-selfprimary-900">
          <span>E5 Student Talk? 👀</span>
        </h2>
        <p className="text-sm text-selfprimary-700">
          Podcastok diákoktól diákoknak. ➜
        </p>
        <p className="text-sm text-selfprimary-700">
          Hallgasd meg a legújabb epizódokat!
        </p>
      </div>
      <button
        className="absolute right-2 top-2 rounded-full bg-selfprimary-100 p-1.5 text-selfprimary-700 hover:bg-selfprimary-200"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsHidden(true);
          localStorage.setItem(STORAGE_KEY, "true");
        }}
        type="button"
        aria-label="Bezárás"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="text-blue-600 transition-transform duration-300"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
      </button>
    </Link>
  );
};

export default PodcastDrop;
