export type TeachersConfig = typeof teachersConfig;

const headers = [
  { name: "dátum", show: true },
  { name: "hiányzó tanár", show: true },
  { name: "óra / terem", show: true },
  { name: "csoport", show: true },
  { name: "tárgy", show: true },
  { name: "helyettes tanár", show: true },
  { name: "megjegyzés", show: true },
];

const showIndexes = [];
for (let index = 0; index < headers.length; index++) {
  if (headers[index].show) {
    showIndexes.push(index);
  }
}

const showHeaders = [];
for (let index = 0; index < headers.length; index++) {
  if (headers[index].show) {
    showHeaders.push(headers[index].name);
  }
}

export const teachersConfig = {
  headers: headers,
  showIndexes: showIndexes,
  showHeaders: showHeaders,
};
