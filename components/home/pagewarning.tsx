import { siteConfig } from "@/config/site";
import Link from "next/link";

export const PageWarning = () => {
  return (
    <div className="mx-auto mb-3 w-auto max-w-xs rounded-lg border-3 border-amber-400 bg-amber-300 px-3 py-2 text-center text-sm text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="inline h-6 w-6 shrink-0 stroke-current"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="inline pl-1">
        {"Az oldal fejlesztés alatt áll. Segíts Te is a fejlesztésben!"}
      </p>
      <p className="inline">
        <Link
          href={siteConfig.links.feedback}
          className="pl-1 text-sm text-blue-700"
        >
          Funkció kérése Hiba jelentése
        </Link>
      </p>
    </div>
  );
};
