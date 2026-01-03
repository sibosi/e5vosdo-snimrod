import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../../(e5vosdo)/me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";
import { gate } from "@/db/permissions";
import { redirect } from "next/navigation";

const MediaPage = async () => {
  redirect("/media/szalagavato");
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  if (!gate(selfUser, "media_admin", "boolean")) {
    return (
      <div className="p-4 text-danger-500">
        Az oldal karbantartás alatt áll.
      </div>
    );
  }

  return <PhotoGridWrapper />;
};

export default MediaPage;
