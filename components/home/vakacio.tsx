export function getVacationText(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
  let weekdaysLeft = 0;
  const temp = new Date(now);
  while (temp < targetDate) {
    const dayOfWeek = temp.getDay();
    if (dayOfWeek !== 5 && dayOfWeek !== 6) weekdaysLeft++;
    temp.setTime(temp.getTime() + MILLISECONDS_IN_DAY);
  }

  const fullText = "VAKÁCIÓ!";
  const displayedText = fullText.substring(weekdaysLeft);
  return displayedText;
}

export const Vakacio = ({ date }: { date: string }) => {
  const targetDate = new Date(date);

  return (
    <p className="mx-auto max-w-fit bg-linear-to-l from-selfsecondary-200 to-selfsecondary-500 bg-clip-text pt-2 text-center text-5xl font-bold text-transparent transition-all duration-500 ease-in-out">
      {getVacationText(targetDate)}
    </p>
  );
};
