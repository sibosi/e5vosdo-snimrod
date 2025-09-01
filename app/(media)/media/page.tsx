import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../../(e5vosdo)/me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <PhotoGridWrapper
      GOOGLE_CLIENT_ID={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    />
  );
};

export default MediaPage;
