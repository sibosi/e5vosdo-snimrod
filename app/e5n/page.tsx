import { getAuth } from "@/db/dbreq";
import Table from "./table";
import PleaseLogin from "../me/redirectToLogin";
import SeeSignupers from "./seeSignupers";
import MyPre from "./mypre";
import teachers from "./teachers.json";

const E5NPage = async () => {
  const selfUser = await getAuth();
  return (
    <div className="fixed left-0 top-0 z-0 flex h-full w-full flex-col justify-center bg-background bg-opacity-90 px-5">
      <h1 className="mb-2 text-center text-3xl font-semibold text-foreground">
        Ezt a felületet felejtsük el. Elnézést a kellemetlenségekért - a
        fejlesztő
      </h1>
    </div>
  );
  if (!selfUser)
    return (
      <div className="font-semibold text-foreground">
        <PleaseLogin />
      </div>
    );

  if (
    selfUser?.permissions.includes("organiser") ||
    teachers.includes(selfUser?.email)
  )
    return (
      <div className="font-semibold text-foreground">
        <Table selfUser={selfUser} />
      </div>
    );
  else
    return (
      <div className="font-semibold text-foreground">
        <MyPre selfUser={selfUser} />
      </div>
    );
};

export default E5NPage;
