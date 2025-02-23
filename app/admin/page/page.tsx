import { redirect } from "next/navigation";
import { getAuth, hasPermission } from "@/db/dbreq";
import NewNotification from "@/components/account/notification";
import PageSettings from "@/components/pagesettings";
import { Section } from "@/components/home/section";
import PresentationAPIButtons from "./PresentationAPIButtons";

const PagePage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  return (
    <div>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        Oldal kezelése
      </h1>
      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <NewNotification />
      ) : (
        <></>
      )}

      <PresentationAPIButtons />

      {selfUser.permissions.includes("admin") ? (
        <Section
          title="Oldalbeállítások"
          dropdownable={false}
          defaultStatus="opened"
        >
          <PageSettings />
        </Section>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PagePage;
