import { Link } from "@nextui-org/link";

type EventsConfig = {
  events: {
    title: string;
    time: string;
    _hide_time_: string;
    image: string;
    _show_time_?: string;
    _img_src_?: string;
    details?: React.ReactNode;
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
      title: "Eötvös/Apáczai röplabda bajnokság",
      time: "június 14. 16:00",
      _hide_time_: "2024/6/15",
      image: "/events/ropi2.jpg",
      details:
        "Időpont: június 14. (péntek) 16:00 \n Helyszín: Eötvös nagy tornaterem \n\n Jelentkezni 4+1 fős csapatoknak lehet.\nMindkét iskolából 4/4 csapatra számítunk, túljelentkezés esetén az iskola megszavazza, hogy mely csapatok induljanak.",
      tags: ["sport", "E5vos x Apáczai"],
    },
    {
      title: "Tremoloes koncert",
      time: "június 14. 19:00",
      _hide_time_: "2024/6/15",
      image: "/events/disztomeg.jpg",
      details:
        "Június 14-én szeretettel várunk mindenkit a Tremoloes 1 éves jubileumi koncertjén 19:00-tól a díszteremben! Családtagokat, külsős barátokat bátran hozzatok magatokkal! \n\n Szeretettel vár a Tremoloes",
      tags: ["koncert"],
    },
    {
      title: "Kertmozi: Kék Pelikán",
      time: "június 17. - Hétfő",
      _hide_time_: "2024/6/18",
      image: "/events/kekpelikan.jpg",
      _img_src_:
        "https://assets.snitt.hu/system/covers/normal/covers_127630.jpg?1709542655",
      details: (
        <>
          {
            "Időpont: június 17. (Hétfő) 20:00 - 23:00 \n Helyszín: Eötvös udvara\nFilm: Kék Pelikán \nmoderátor: Ott Anna (irodalmár) \n\n A filmalatt büfé is áll a rendelkezésetekre. Várunk Titeket szeretettel! "
          }

          <Link
            href="https://port.hu/adatlap/film/mozi/kek-pelikan-kek-pelikan/movie-227896"
            className="fill-blue-500"
          >
            További információ a filmről
          </Link>
        </>
      ),
      tags: ["filmezés"],
    },
    {
      title: "Kertmozi: Semmelweis",
      time: "június 18. - Kedd",
      _hide_time_: "2024/6/19",
      image: "/events/semmelweis.jpeg",
      _img_src_: "https://wmn.hu/picture/112586/normal/298/00298459.jpeg",
      details: (
        <>
          {
            "Időpont: június 18. (Kedd) 20:00 - 23:00 \n Helyszín: Eötvös udvara\nFilm: Semmelweis \nmoderátor: Hargitai Petra (korábbi DÖ elnök) \n\n A filmalatt büfé is áll a rendelkezésetekre. Várunk Titeket szeretettel! "
          }

          <Link
            href="https://port.hu/adatlap/film/mozi/semmelweis-semmelweis/movie-249788"
            className="fill-blue-500"
          >
            További információ a filmről
          </Link>
        </>
      ),
      tags: ["filmezés"],
    },
    {
      title: "Kertmozi: Hadik",
      time: "június 19. - Szerda.",
      _hide_time_: "2024/6/20",
      image: "/events/hadik.jpg",
      _img_src_: "https://wmn.hu/picture/112586/normal/298/00298459.jpeg",
      details: (
        <>
          {
            "Időpont: június 18. (Kedd) 20:00 - 23:00 \n Helyszín: Eötvös udvara\nFilm: Hadik \nmoderátor: Bosznai Tibor (Hadik étterem és kávéház tulajdonosa és ügyvezetője) \n\n A filmalatt büfé is áll a rendelkezésetekre. Várunk Titeket szeretettel! "
          }

          <Link
            href="https://port.hu/adatlap/film/mozi/hadik-hadik/movie-244512"
            className="fill-blue-500"
          >
            További információ a filmről
          </Link>
        </>
      ),
      tags: ["filmezés"],
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
