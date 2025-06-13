export const Vakacio = ({ date }: { date: string }) => {
  const now = new Date();
  const targetDate = new Date(date);
  const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
  let weekdaysLeft = 0;

  while (now < targetDate) {
    const dayOfWeek = now.getDay();
    if (dayOfWeek !== 5 && dayOfWeek !== 6) weekdaysLeft++;
    now.setTime(now.getTime() + MILLISECONDS_IN_DAY);
  }

  return (
    <p className="mx-auto max-w-fit bg-gradient-to-l from-selfsecondary-200 to-selfsecondary-500 bg-clip-text pt-2 text-center text-5xl font-bold text-transparent transition-all duration-500 ease-in-out">
      {"VAKÁCIÓ!".substring(weekdaysLeft)}
    </p>
  );
};
