import { getAuth } from "@/db/dbreq";
import ManageEvents from "@/app/(e5vosdo)/admin/users/eventManager";
import PleaseLogin from "../me/redirectToLogin";

const DevPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <>
      <h1 className="pb-8 text-center text-5xl font-semibold text-foreground max-lg:hidden">
        Események kezelése
      </h1>
      <ManageEvents selfUser={selfUser} />
    </>
  );
};

export default DevPage;
