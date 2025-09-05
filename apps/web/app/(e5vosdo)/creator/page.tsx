import { getAuth } from "@/apps/web/db/dbreq";
import PleaseLogin from "../me/redirectToLogin";
import { Alert } from "@/apps/web/components/home/alert";
import CreateEvent from "./CreateEvent";

const CreatorPage = async ({ id = undefined }: { id?: number }) => {
  const selfUser = await getAuth();
  if (!selfUser) return <PleaseLogin />;

  return (
    <>
      <h2 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Esemény létrehozása
      </h2>
      <Alert className="border-selfprimary-100 bg-selfprimary-50 text-selfprimary-900">
        Adj hozzá eseméyeket és rendezvényeket, hogy a DÖ oldalon bárki
        láthassa!
      </Alert>
      <div>
        <CreateEvent selfUser={selfUser} id={id} />
      </div>
    </>
  );
};

export default CreatorPage;
