import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <PhotoGridWrapper
      GOOGLE_CLIENT_ID={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      NEXT_PUBLIC_MEDIA_FOLDER_ID={process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID!}
      NEXT_PUBLIC_GOOGLE_API_KEY={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!}
    />
  );
};

export default MediaPage;
