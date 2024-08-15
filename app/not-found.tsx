import { siteConfig } from "@/config/site";
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="flex h-screen items-center justify-center text-foreground">
        <div className="divide-x-3 divide-foreground">
          <div className="inline-block pr-6 align-top text-3xl font-medium">
            <h1 className="pt-1">404</h1>
          </div>
          <div className="inline-block pl-6">
            <p className="text-md m-0 font-normal">Elvesztünk?</p>
            <Link className="flex items-center gap-1 text-current" href="\">
              <span className="text-default-600">Vissza </span>
              <p className="text-primary">haza!</p>
            </Link>
            <br />

            <Link
              className="flex items-center gap-1 text-current"
              href={siteConfig.links.feedback}
            >
              <p className="font-medium text-red-700">Hibát</p>
              <span className="text-default-600">találtál?</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
