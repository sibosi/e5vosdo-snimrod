const weekAStart = new Date("2026-11-09T00:00:00");

export function getWeekLabel() {
  const now = new Date();

  // Get today's date without the time
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Calculate days since the start of Week A
  const diffDays = Math.floor(
    (today.getTime() - weekAStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Calculate which week we're in
  const weekNumber = Math.floor(diffDays / 7);
  const currentWeek = weekNumber % 2 === 0 ? "A" : "B";

  // Saturday = 6, Sunday = 0
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  if (isWeekend) {
    const nextWeek = currentWeek === "A" ? "B" : "A";
    return `${nextWeek} hét következik.`;
  }

  return `Jelenleg ${currentWeek} hét van.`;
}
