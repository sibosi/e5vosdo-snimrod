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
    <div className="space-y-4">
      {(await hasPermission(selfUser.email, "getUsers")) ? (
        <Section
          title="Új értesítés · csak adminoknak"
          dropdownable={false}
          defaultStatus="opened"
          isCard={true}
          titleClassName="text-2xl font-semibold text-foreground"
        >
          <NewNotification />
        </Section>
      ) : (
        <></>
      )}
      <Section
        title="Előadásjelentkezések kezelése"
        dropdownable={false}
        defaultStatus="opened"
        isCard={true}
      >
        <PresentationAPIButtons />
      </Section>

      {selfUser.permissions.includes("admin") ? (
        <Section
          title="Oldalbeállítások"
          dropdownable={false}
          defaultStatus="opened"
          isCard={true}
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
