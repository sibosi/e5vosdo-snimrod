import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <PhotoGridWrapper
      NEXT_PUBLIC_GOOGLE_API_KEY={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}
      NEXT_PUBLIC_MEDIA_FOLDER_ID={
        process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID || ""
      }
    />
  );
};

export default MediaPage;
