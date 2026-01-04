import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../../(e5vosdo)/me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";
import { Link } from "@heroui/react";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <div className="flex flex-col">
      <Link
        href="/media/szalagavato"
        className="mx-auto w-full max-w-lg justify-center rounded-xl bg-selfsecondary-300 px-3 py-2 text-sm text-foreground"
      >
        <span className="text-center">Szalagavatós képek megtekintése ➜</span>
      </Link>
      <PhotoGridWrapper />
    </div>
  );
};

export default MediaPage;
