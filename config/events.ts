type EventsConfig = {
  events: {
    title: string;
    time: string;
    _hide_time_: string;
    image: string;
    _show_time_?: string;
    _img_src_?: string;
    details?: string;
    tags?: string[];
  }[];
};

const eventsConfig = {
  events: [
    {
      title: "Példa esemény",
      time: "május 20. 17:43",
      _show_time_: "2024/4/2",
      _hide_time_: "2024/5/21",
      image: undefined,
      details: undefined,
      tags: ["9. évf", "7.A"],
    },
    {
      title: "Dzsungel könyve előadások",
      time: "május 27./30. 18:00",
      _show_time_: "2024/4/2",
      _hide_time_: "2024/5/31",
      image: "/events/junglebook.jpg",
      details:
        "A Színjátszó szakkör egyhetes előadássorozata, mely a Dzsungel könyvét hozza színpadra. Jegyek vásárlása a büfénél.",
      tags: ["előadás"],
    },
    {
      title: "Pedagógus nap",
      time: "május 31.",
      _show_time_: "2024/4/2",
      _hide_time_: "2024/5/2",
      image: "/events/pedagogusnap.png",
      details: undefined,
      tags: [],
    },
    {
      title: "Kertmozi: Kék Pelikán",
      time: "június 17. - Hétfő",
      _hide_time_: "2024/6/18",
      image: "/events/kekpelikan.jpg",
      _img_src_:
        "https://assets.snitt.hu/system/covers/normal/covers_127630.jpg?1709542655",
      details:
        "Június 17-én, délutáni filmnézés az udvaron, a Kertmozi keretében. \nFilm: Kék Pelikán \nmoderátor: Ott Anna (irodalmár) \n\nLesz büfé is. ( :",
      tags: ["filmezés"],
    },
    {
      title: "Kertmozi: Semmelweis",
      time: "június 18. - Kedd",
      _hide_time_: "2024/6/19",
      image: "/events/semmelweis.jpeg",
      _img_src_: "https://wmn.hu/picture/112586/normal/298/00298459.jpeg",
      details:
        "Június 18-án, délutáni filmnézés az udvaron, a Kertmozi keretében. \nFilm: Semmelweis \nmoderátor: Hargitai Petra (korábbi DÖ elnök) \n\nLesz büfé is. ( :",
      tags: ["filmezés"],
    },
    {
      title: "Kertmozi: Hadik",
      time: "június 19. - Szerda.",
      _hide_time_: "2024/6/20",
      image: "/events/hadik.jpg",
      _img_src_: "https://wmn.hu/picture/112586/normal/298/00298459.jpeg",
      details:
        "Június 19-én, délutáni filmnézés az udvaron, a Kertmozi keretében. \nFilm: Hadik \nmoderátor: Bosznai Tibor (Hadik étterem és kávéház tulajdonosa és ügyvezetője) \n\nLesz büfé is. ( :",
      tags: ["filmezés"],
    },
    {
      title: "Eötvös/Apáczai röplabda bajnokság",
      time: "június 14. 16:00",
      _show_time_: "2024/6/2",
      _hide_time_: "2024/6/15",
      image: "/events/ropi2.jpg",
      details:
        "Helyszín: Eötvös nagy tornaterem \nCsapatok: 4+1 fős csapatok jelentkezését várjuk.\nMindkét iskolából 4/4 csapatra számítunk, túljelentkezés esetén az iskola megszavazza, hogy mely csapatok induljanak.",
      tags: ["sport", "E5vos x Apáczai"],
    },
    {
      title: "Tanévzáró ünnepség",
      time: "június 21.",
      _show_time_: "2024/6/2",
      _hide_time_: "2024/6/22",
      image: "/events/evnyito.jpg",
      details: undefined,
      tags: [],
    },
  ],
};

export default eventsConfig as unknown as EventsConfig;
