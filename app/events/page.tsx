import { title } from "@/components/primitives";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";
import { TeacherTable } from "@/components/helyettesites/teachers-table";

export default function EventsPage() {
  return (
    <div>
      <div className="py-2">
        <h1
          className={clsx(
            title(),
            linkStyles({ color: "foreground", isBlock: true })
          )}
        >
          Események
        </h1>
      </div>
      <TeacherTable />
    </div>
  );
}
