import { redirect } from "next/navigation";
import { getAuth } from "@/db/dbreq";
import TimetableWeek from "@/components/timetable/timetableweek";
import TimetableDay from "@/components/timetable/timetableday";
// import { exportTimetable } from "@/timetable/export";

const AboutPage = async () => {
  const selfUser = await getAuth();
  if (!selfUser) redirect("/");

  // const timetable = await exportTimetable();

  return (
    <>
      <h1 className="pb-8 text-4xl lg:text-5xl font-semibold text-foreground text-center">
        🚧 Dev 🚧
      </h1>
      <div>
        <TimetableWeek />
        <TimetableDay selfUser={selfUser} />
      </div>
    </>
  );
};

export default AboutPage;
