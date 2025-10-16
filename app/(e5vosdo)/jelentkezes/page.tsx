import PleaseLogin from "../me/redirectToLogin";
import Table from "./table";
import { getAuth } from "@/db/dbreq";

const SignupPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;
  return (
    <div>
      <Table selfUser={selfUser} />
    </div>
  );
};

export default SignupPage;
