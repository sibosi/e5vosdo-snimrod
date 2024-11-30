import { User } from "@/db/dbreq";

export const EJG_CLASSES = [
  "7.A",
  "7.B",
  "8.A",
  "8.B",
  "9.A",
  "9.B",
  "9.C",
  "9.D",
  "9.E",
  "9.F",
  "9.N",
  "10.A",
  "10.B",
  "10.C",
  "10.D",
  "10.E",
  "10.F",
  "11.A",
  "11.B",
  "11.C",
  "11.D",
  "11.E",
  "11.F",
  "12.A",
  "12.B",
  "12.C",
  "12.D",
  "12.E",
  "12.F",
];

const getUserClass = (selfUser: User | undefined) => {
  if (!selfUser || !selfUser.coming_year || !selfUser.class_character)
    return null;
  // How many year after the coming year aug. 1st.

  const msInAYear = 1000 * 60 * 60 * 24 * 365.25;

  const evfolyam =
    Math.floor(
      (new Date().getTime() - new Date("2023/08/01").getTime()) / msInAYear,
    ) +
    +(["A", "B"].includes(selfUser.class_character)
      ? 7
      : ["C", "D", "F"].includes(selfUser.class_character)
        ? 9
        : // Az Ny osztály
          8);
  const EJG_class =
    (["N", "Ny"].includes(selfUser.class_character) && evfolyam == 8
      ? 9
      : evfolyam) +
    "." +
    selfUser.class_character;
  return EJG_class;
};

export default getUserClass;
