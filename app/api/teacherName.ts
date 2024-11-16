import TeachersName from "@/public/storage/teachersName.json";
const teachersName = TeachersName as any as { [key: string]: string };

export default function teacherName(name: string) {
  return teachersName[name] ?? name;
}
