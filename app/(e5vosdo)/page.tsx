import "@/styles/bgimage.css";
import IsVerified from "./jelentkezes/isVerified";
import Table from "./jelentkezes/table";
import { getAuth } from "@/db/dbreq";

export default async function Home() {
  const selfUser = await getAuth();
  return (
    <div>
      <IsVerified selfUser={selfUser} />

      <Table selfUser={selfUser} />

      <div className="hidden">
        {
          "Az oldal a Budapest V. Kerületi Eötvös József Gimnázium (más néven EJG) Diákönkormányzatának (más néven DÖ) tájékoztató oldala."
        }
      </div>
    </div>
  );
}
