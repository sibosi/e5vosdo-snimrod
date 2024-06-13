"use client";

export const Vakacio = ({ date }: { date: string }) => {
  const timeLeft =
    Math.floor((+new Date(date) - +new Date()) / (1000 * 60 * 60 * 24)) + 1;

  const colors = [
    ["#39b2f8", "#2747fc"],
    ["#FF1CF7", "#b249f8"],
    ["#f5ab61", "#ecf55f"],
  ];

  return (
    <p className="text-center from-[#fdd273] to-[#ff7033] bg-clip-text text-transparent pb-6 text-5xl bg-gradient-to-l font-bold max-w-fit m-auto transition-all duration-500 ease-in-out">
      {"VAKÁCIÓ!!!".substring(timeLeft)}
    </p>
  );
};
