import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <PhotoGridWrapper
      GOOGLE_CLIENT_ID={process.env.GOOGLE_CLIENT_ID || ""}
      NEXT_PUBLIC_MEDIA_FOLDER_ID={
        process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID || ""
      }
    />
  );
};

export default MediaPage;
