import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="flex items-center justify-center h-screen text-black">
        <div className="divide-x-3 divide-black">
          <div className="inline-block pr-6 text-3xl font-medium align-top">
            <h1 className="pt-1">404</h1>
          </div>
          <div className="inline-block pl-6">
            <p className="text-md font-normal m-0">Elvesztünk?</p>
            <Link className="flex items-center gap-1 text-current" href="\">
              <span className="text-default-600">Vissza </span>
              <p className="text-primary">haza!</p>
            </Link>
            <br />

            <Link
              className="flex items-center gap-1 text-current"
              href={siteConfig.links.feedback}
            >
              <p className="text-red-700 font-medium">Hibát</p>
              <span className="text-default-600">találtál?</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
