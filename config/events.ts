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
      time: "május 27.-30.",
      _hide_time_: "2024-5-31",
      image: "/events/junglebook.jpg",
      details:
        "A Színjátszó szakkör egyhetes előadássorozata, mely a Dzsungel könyvét hozza színpadra. Jegyek vásárlása a büfénél.",
      tags: ["9. évf", "7.A"],
    },
  ],
};