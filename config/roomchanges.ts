type RoomchangesConfig = [
  string, // Date string
  Array<[number, string, string, string, string]> // Array of tuples
][];

type QuickRoomchangesConfig = [
  string, // Date string
  Array<[string, [Array<[number, string, string, string]>]]> // Array of tuples
][];

const roomchangesConfig: RoomchangesConfig = [
  [
    "2024.06.07.",
    [
      [3, "308", "52", "11.E", "a2"],
      [3, "310", "59", "7.A", "tö2"],
      [3, "119", "103", "10.F", "m1"],
      [4, "119", "59", "11.E", "a1"],
      [1, "fizika ea.", "53", "11.", "MT7"],
      [2, "fizika ea.", "53", "11.", "MT7"],
      [3, "fizika ea.", "109", "10.AB", "fiz"],
      [4, "fizika ea.", "212", "9.E", "fiz"],
      [5, "fizika ea.", "103", "9.Ny", "mt1"],
      [6, "fizika ea.", "108", "7.A", "fiz1"],
    ],
  ],
  [
    "2024.06.07.",
    [
      [3, "308", "52", "11.E", "a2"],
      [3, "310", "59", "7.A", "tö2"],
      [3, "119", "103", "10.F", "m1"],
      [4, "119", "59", "11.E", "a1"],
      [1, "fizika ea.", "53", "11.", "MT7"],
      [2, "fizika ea.", "53", "11.", "MT7"],
      [3, "fizika ea.", "109", "10.AB", "fiz"],
      [4, "fizika ea.", "212", "9.E", "fiz"],
      [5, "fizika ea.", "103", "9.Ny", "mt1"],
      [6, "fizika ea.", "108", "7.A", "fiz1"],
    ],
  ],
];

let quickRoomchangesConfig: any = [];
// goal: [[day, [group, [change, change]]]]

roomchangesConfig.map((day, dayIndex) => {
  // day = [string, [ event, change ]]
  let gropDone: any = [];

  quickRoomchangesConfig.push([day[0], []]); // [[day]]
  day[1].map((change, changeIndex) => {
    // change = change
    if (!gropDone.includes(change[3])) {
      quickRoomchangesConfig[dayIndex][1].push([change[3], []]); // [[day, [group, []]]]
      gropDone.push(change[3]);
    }

    quickRoomchangesConfig[dayIndex][1].map(
      (group: string, groupIndex: number) => {
        // group = [group, [] ]]
        if (group[0] == change[3]) {
          quickRoomchangesConfig[dayIndex][1][groupIndex][1].push([
            change[0],
            change[1],
            change[2],
            change[4],
          ]);
        }
      }
    );
  });
});

export default quickRoomchangesConfig as QuickRoomchangesConfig;
