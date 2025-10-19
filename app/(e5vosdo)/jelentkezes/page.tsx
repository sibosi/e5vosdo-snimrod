import IsVerified from "./isVerified";
import Table from "./table";
import { getAuth } from "@/db/dbreq";

const SignupPage = async () => {
  const selfUser = await getAuth();
  return (
    <div>
      <IsVerified selfUser={selfUser} />
      <Table selfUser={selfUser} />
    </div>
  );
};

export default SignupPage;
