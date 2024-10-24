import { getAuth } from "@/db/dbreq";
import Table from "./table";
import PleaseLogin from "../me/redirectToLogin";
import SeeSignupers from "./seeSignupers";
import MyPre from "./mypre";

const E5NPage = async () => {
  const selfUser = await getAuth();

  return (
    <div className="font-semibold text-foreground">
      {selfUser ? <Table selfUser={selfUser} /> : <PleaseLogin />}
    </div>
  );

  return (
    <div className="font-semibold text-foreground">
      {selfUser ? <MyPre selfUser={selfUser} /> : <PleaseLogin />}
    </div>
  );

  
};

export default E5NPage;
