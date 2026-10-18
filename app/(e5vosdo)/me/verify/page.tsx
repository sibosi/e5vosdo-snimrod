import { getAuth } from "@/db/dbreq";
import PleaseLogin from "../redirectToLogin";
import VerifyStudentData from "./VerifyStudentData";

export default async function VerifyStudentDataPage() {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return <VerifyStudentData selfUser={selfUser} />;
}
