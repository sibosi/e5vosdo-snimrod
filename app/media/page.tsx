import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import PhotoGridWrapper from "./PhotoGridWrapper";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return <PhotoGridWrapper />;
};

export default MediaPage;
