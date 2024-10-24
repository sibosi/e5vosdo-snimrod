import { getAuth } from "@/db/dbreq";
import Table from "./table";
import PleaseLogin from "../me/redirectToLogin";
import SeeSignupers from "./seeSignupers";
import MyPre from "./mypre";
import teachers from "./teachers.json";

const E5NPage = async () => {
  const selfUser = await getAuth();
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
