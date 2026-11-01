const RESPECT_TXT =
  "Köszönjük a Technikusi Szervezet és az Eötvös Média munkáját, akiknek köszönhetően iskolánk falai között nap mint nap élvezetes, sokszínű és színvonalas események valósulhatnak meg.";

// order by value desceding, then by key ascending
const UNPAID_WORKERS: Record<string, number> = {
  "Gőz Barnabás": 50,
  "Nagy Ábel": 50,
  "Simon Nimród": 50,
  "Zólyomi Péter": 50,

  "Doman Gergely": 20,
  "Lengyel-Barsi Dominik (Nikó)": 20,
  "Sonkoly Bence": 20,

  "Barlai-Hünlich Olivér": 15,
  "Drimmer Mátyás": 15,
  "Szepesi Géza": 15,

  "Balog Levente": 8,

  "Benedek Marcell": 5,
  "Kondor Levente": 5,
  "Kovács Lénárd": 5,
  "Molnár Márton": 5,

  "Nagy Johanna": 3,
  "Perger Luca": 3,
  "Wieszt Henrik": 3,
  "Wieszt Roland": 3,
  "Zólyomi Anita": 3,

  "Horváth Bence": 2,
  "Palai Panna": 2,
  "Tóth Dániel": 2,
  "Weisz Alíz": 2,
  "Weisz Máté": 2,
};

// Súlyozott véletlen sorrend: kulcs = -ln(u) / súly, növekvő rendezés.
// Nagyobb súly -> kisebb várható kulcs -> nagyobb eséllyel kerül előre.
function weightedShuffle(weights: Record<string, number>): string[] {
  return Object.entries(weights)
    .map(([name, weight]) => ({
      name,
      // 1 - Math.random() ∈ (0, 1], így nem lehet log(0)
      key: -Math.log(1 - Math.random()) / weight,
    }))
    .sort((a, b) => a.key - b.key)
    .map(({ name }) => name);
}

export default function getRespect() {
  return [RESPECT_TXT, ...weightedShuffle(UNPAID_WORKERS)];
}

export function respectAB(
  menu_listA: string[],
  menu_listB: string[],
): [string[], string[]] {
  if (!menu_listA.includes("respect") && !menu_listB.includes("respect")) {
    return [menu_listA, menu_listB];
  }

  const respectList = getRespect();
  const newMenuA = menu_listA.filter((item) => item !== "respect");
  const newMenuB = menu_listB.filter((item) => item !== "respect");

  return [
    [...respectList, ...newMenuA],
    [...respectList, ...newMenuB],
  ];
}
