import { addLog, getAuth, getAllUsersNameByEmail } from "@/db/dbreq";
import { getParlament, getParlamentParticipants } from "@/db/parlament";
import { redirect } from "next/navigation";
import ParlamentIDClient from "./ParlamentIDClient";

const ParlamentIDPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const selfUser = await getAuth();
  if (!selfUser) {
    redirect("/");
  }

  addLog("parlament", selfUser?.email ?? "unknown");

  try {
    const [selectedParlament, participants, usersNameByEmail] =
      await Promise.all([
        getParlament(selfUser, Number(id)),
        getParlamentParticipants(selfUser, Number(id)),
        getAllUsersNameByEmail(),
      ]);

    console.log("Selected Parlament:", selectedParlament);

    return (
      <ParlamentIDClient
        parlamentId={Number(id)}
        initialParlament={selectedParlament}
        initialParticipants={participants}
        usersNameByEmail={usersNameByEmail}
      />
    );
  } catch (error) {
    console.error("Error loading parlament:", error);
    return (
      <div className="font-semibold text-foreground">
        <h1>Hiba történt a parlament betöltése közben!</h1>
      </div>
    );
  }
};

export default ParlamentIDPage;
