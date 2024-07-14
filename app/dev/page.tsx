import { redirect } from "next/navigation";
import {
  apireq,
  getAdminUsersEmail,
  getAuth,
  getUsers,
  hasPermission,
} from "@/db/dbreq";

const AboutPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        🚧 Dev 🚧
      </h1>
      <div>
        <h2>LiveScore endpoint result</h2>
      </div>
    </>
  );
};

export default AboutPage;
