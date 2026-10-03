import { addLog, getAuth, getAllUsersNameByEmail } from "@/db/dbreq";
import {
  getParlament,
  getParlamentParticipants,
  getParlamentApplicants,
} from "@/db/parlament";
import { redirect } from "next/navigation";
import ParliamentIDClient from "./ParliamentIDClient";
import { hasPermission } from "@/db/permissions";
import getUserClass from "@/public/getUserClass";
import { Link } from "@heroui/react";

const ParliamentIDPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const selfUser = await getAuth();
  if (!selfUser) {
    redirect("/");
  }

  void addLog("parlament", selfUser?.email ?? "unknown");

  try {
    const [selectedParlament, participants, applicants, usersNameByEmail] =
      await Promise.all([
        getParlament(selfUser, Number(id)),
        getParlamentApplicants(selfUser, Number(id)),
        getParlamentParticipants(selfUser, Number(id)),
        getAllUsersNameByEmail(),
      ]);

    console.log("Selected Parlament:", selectedParlament);

    const userClass = getUserClass(selfUser);

    return (
      <div className="flex flex-col gap-4">
        <Link href="/parlament">
          <span className="rotate-180">➜</span>&nbsp;Vissza a parlamentekhez
        </Link>
        <ParliamentIDClient
          parlamentId={Number(id)}
          initialParlament={selectedParlament}
          initialParticipants={participants}
          applicants={applicants}
          usersNameByEmail={usersNameByEmail}
          canEdit={hasPermission(selfUser, [
            "head_of_parlament",
            "delegate_counter",
          ])}
          selfUser={selfUser}
          userClass={userClass}
        />
      </div>
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

export default ParliamentIDPage;
