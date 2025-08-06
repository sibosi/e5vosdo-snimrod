import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import PhotoGrid from "./PhotoGrid";

const MediaPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return <PhotoGrid />;
};

export default MediaPage;
