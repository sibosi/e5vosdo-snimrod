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
    <p className="from-selfsecondary-200 to-selfsecondary-500 mx-auto max-w-fit bg-gradient-to-l bg-clip-text pt-2 text-center text-5xl font-bold text-transparent transition-all duration-500 ease-in-out">
      {"VAKÁC--IÓ!".substring(timeLeft)}
    </p>
  );
};
