import IsVerified from "./isVerified";
import Table from "./table";
import { getAuth } from "@/db/dbreq";

const SignupPage = async () => {
  const selfUser = await getAuth();
  return (
    <div>
      {process.env.EXTERNAL_SIGNUPS !== "true" && (
        <IsVerified selfUser={selfUser} />
      )}
      <Table
        selfUser={selfUser}
        EXTERNAL_SIGNUPS={process.env.EXTERNAL_SIGNUPS === "true"}
        EXTERNAL_SIGNUPS_PRESENTATION_LIMIT={
          process.env.EXTERNAL_SIGNUPS_PRESENTATION_LIMIT
            ? Number.parseInt(process.env.EXTERNAL_SIGNUPS_PRESENTATION_LIMIT)
            : null
        }
      />
    </div>
  );
};

export default SignupPage;
