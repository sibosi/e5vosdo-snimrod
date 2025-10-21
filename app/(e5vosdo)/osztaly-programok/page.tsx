import { getAuth } from "@/db/dbreq";
import VotingInterface from "./votingInterface";
import PleaseLogin from "../me/redirectToLogin";
import IsVerified from "../jelentkezes/isVerified";

const ClassProgramVotingPage = async () => {
  const selfUser = await getAuth();

  // Check if user is logged in
  if (!selfUser) return <PleaseLogin />;

  // Check if user is verified
  if (!selfUser.is_verified) {
    return <IsVerified topic="vote" selfUser={selfUser} />;
  }

  // User is authenticated and verified, show voting interface
  return <VotingInterface />;
};

export default ClassProgramVotingPage;
