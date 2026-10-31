import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../../(e5vosdo)/me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";
import { Link } from "@heroui/react";

type PageProps = {
  searchParams: Promise<{ tags?: string | string[] }>;
};

const MediaPage = async ({ searchParams }: PageProps) => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;
  const params = await searchParams;
  const rawTags = Array.isArray(params.tags) ? params.tags : [params.tags ?? ""];
  const initialTags = rawTags
    .flatMap((value) => value.split(","))
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col">
      <Link
        href="/media/szalagavato"
        className="mx-auto w-full max-w-lg justify-center rounded-xl bg-selfsecondary-300 px-3 py-2 text-sm text-foreground"
      >
        <span className="text-center">Szalagavatós képek megtekintése ➜</span>
      </Link>
      <PhotoGridWrapper initialTags={initialTags} />
    </div>
  );
};

export default MediaPage;
