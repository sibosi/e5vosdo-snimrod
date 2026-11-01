import { redirect } from "next/navigation";

const getCurrentSchoolYear = () => {
  const now = new Date();

  // is after August 1st? If yes, the school year is the current year - next year, otherwise it's last year - current year
  const isAfterAugust1st = now.getMonth() >= 7; // August is month 7 (0-indexed)

  const startYear = isAfterAugust1st
    ? now.getFullYear()
    : now.getFullYear() - 1;

  return `${startYear}-${startYear + 1}`;
};

export function GET() {
  redirect("/media/" + getCurrentSchoolYear());
}
