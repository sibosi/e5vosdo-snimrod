export type EventsConfig = typeof eventsConfig;

export const eventsConfig = {
  events: [
    {
      title: "Példa esemény",
      time: "május 20. 17:43",
      _hide_time_: "2024-5-21",
      image: undefined,
      details: undefined,
      tags: ["9. évf", "7.A"],
    },
    {
      title: "Dzsungel könyve előadások",
      time: "május 27.-30. 18:00",
      _hide_time_: "2024-5-31",
      image: "/events/junglebook.jpg",
      details:
        "A Színjátszó szakkör egyhetes előadássorozata, mely a Dzsungel könyvét hozza színpadra. Jegyek vásárlása a büfénél.",
      tags: ["előadás"],
    },
    {
      title: "Pedagógus nap",
      time: "május 31.",
      _hide_time_: "2024-6-2",
      image: "/events/pedagogusnap.png",
      details: undefined,
      tags: [],
    },
    {
      title: "Tanévzáró ünnepség",
      time: "június 21.",
      _hide_time_: "2024-6-22",
      image: "/events/evnyito.jpg",
      details: undefined,
      tags: [],
    },
  ],
};
