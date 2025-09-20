import { auth } from "@/auth";
import PleaseLogin from "../me/redirectToLogin";
import Table from "./table";

const SignupPage = async () => {
  const selfEmail = (await auth())?.user?.email;
  if (!selfEmail) return <PleaseLogin />;
  return (
    <div>
      <Table />
    </div>
  );
};

export default SignupPage;
