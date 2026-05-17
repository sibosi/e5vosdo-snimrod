import { getAuth } from "@/db/dbreq";
import PleaseLogin from "@/app/(e5vosdo)/me/redirectToLogin";
import PhotoGridWrapper from "../PhotoGridWrapper";
import { Link } from "@heroui/react";

type PageProps = {
  params: Promise<{ requiredTag: string }>;
};

const MediaPage = async ({ params }: PageProps) => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  const { requiredTag } = await params;
  const encodedRequiredTag = decodeURIComponent(requiredTag);
  console.log("Required tag from params:", encodedRequiredTag);

  return (
    <div className="flex flex-col">
      <Link
        href="/media/szalagavato"
        className="mx-auto w-full max-w-lg justify-center rounded-xl bg-selfsecondary-300 px-3 py-2 text-sm text-foreground"
      >
        <span className="text-center">Szalagavatós képek megtekintése ➜</span>
      </Link>
      <PhotoGridWrapper requiredTag={encodedRequiredTag} />
    </div>
  );
};

export default MediaPage;
