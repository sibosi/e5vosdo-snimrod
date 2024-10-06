import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
// import TimetableWeek from "@/components/timetable/timetableweek";
// import TimetableDay from "@/components/timetable/timetableday";
// import TimetableFromJSON from "./timetableFromJSON";
import FileUploader from "./uploader";
import EditEvents from "./editEvents";
// import { exportTimetable } from "@/timetable/export";

const AboutPage = async () => {
  const selfUser = await getAuth();
  // if (!selfUser) redirect("/");

  // const timetable = await exportTimetable();

  return (
    <>
      <h1 className="pb-8 text-center text-4xl font-semibold text-foreground lg:text-5xl">
        🚧 Dev 🚧
      </h1>
      <div>
        {"<TimetableWeek />"}
        {"<TimetableDay selfUser={selfUser} />"}
        {"<TimetableFromJSON />"}
        <FileUploader />
        <EditEvents />
      </div>
    </>
  );
};

export default AboutPage;
