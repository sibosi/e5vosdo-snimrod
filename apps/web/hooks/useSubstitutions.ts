import { useEffect, useState } from "react";
import { TeacherChange } from "@/apps/web/app/api/route";

export interface TeacherChangesByDate {
  [date: string]: TeacherChange[];
}

function getTeacherChangesByDate(changesByTeacher: TeacherChange[]) {
  const changesByDate: TeacherChangesByDate = {};
  let teachersByDate: { [date: string]: string[] } = {};

  changesByTeacher.forEach((teacher) => {
    teacher.changes.forEach((change) => {
      if (!changesByDate[change.date]) {
        changesByDate[change.date] = [];
        teachersByDate[change.date] = [];
      }
      if (!teachersByDate[change.date].includes(teacher.name)) {
        changesByDate[change.date].push({
          name: teacher.name,
          photoUrl: teacher.photoUrl,
          subjects: teacher.subjects,
          changes: [],
        });
        teachersByDate[change.date].push(teacher.name);
      }

      changesByDate[change.date].forEach((teacherChange) => {
        if (teacherChange.name === teacher.name)
          teacherChange.changes.push(change);
      });
    });
  });

  const sortedKeys = Object.keys(changesByDate).sort((a, b) =>
    a.localeCompare(b),
  );
  const sortedChangesByDate: TeacherChangesByDate = {};
  sortedKeys.forEach((key) => {
    sortedChangesByDate[key] = changesByDate[key];
  });

  return sortedChangesByDate;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export function useSubstitutions() {
  const [tableData, setTableData] = useState<TeacherChangesByDate>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetcher("/api/")
      .then((data: TeacherChange[]) => {
        setTableData(getTeacherChangesByDate(data));
        setIsLoaded(true);
      })
      .catch((err) => {
        setError(err);
        setIsLoaded(true);
      });
  }, []);

  return { tableData, isLoaded, error };
}
