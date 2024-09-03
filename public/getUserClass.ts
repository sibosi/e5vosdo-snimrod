import { User } from "@/db/dbreq";

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
