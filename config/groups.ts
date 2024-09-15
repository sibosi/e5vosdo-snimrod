export type GroupsConfig = Group[];

export interface Link {
  type:
    | "facebook"
    | "instagram"
    | "website"
    | "email"
    | "phone"
    | "classroom"
    | "youtube";
  title: string;
  value: string;
}
interface Group {
  title: string;
  image: string;
  details: string;
  description: string;
  links: Link[];
}

export const clubsOrder: string[] = [
  "Eötvös Podcast",
  "Eötvös Diák",
  "Eötvös Média",
  "ZöldBiz",

  "Debate Club",

  "Elsősegélynyújtó Diákkör",

  "Eötvös Kosárlabdacsapat",
  "Eötvös Vakondok",
  "Kéktúra-szakkör",
  "TársasTár",

  "Színjátszó",
  "MUN-Club",
  "Nekünk X",
  "Sakk - klub",
  "Sulirádió",

  "Technikusi Szervezet",

  "Bimun",
  "Eötvös Alkotó Műhely",
];

export const clubsConfig: Group[] = [
  {
    title: "ZöldBiz",
    details:
      "A Zöld Bizottság egy diákokból álló szervezet, akikkel az a célunk, hogy minél környezettudatosabbá tegyük az iskola működését. Ezenkívül célunk, hogy bővítsük egymás tudását, figyelemfelkeltő és szórakoztató programokat szervezzünk környezettudatos témákban, és tudatos életre ösztönözzük diáktársaikat, a közösségi média eszközeivel is.",
    image: "/groups/zoldbiz.png",
    description: "",
    links: [
      {
        title: "ZöldBiz Facebook",
        value: "https://www.facebook.com/eotvos.zoldbiz",
        type: "facebook",
      },
      {
        title: "ZöldBiz Instagram",
        value: "https://www.instagram.com/e5vos.zoldbiz/",
        type: "instagram",
      },
      {
        title: "Csurdi Csenge",
        value: "csurdi.csenge@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Debate Club",
    details:
      "A Debate club egy lehetőség az Eötvös József Gimnázium diákjai számára, hogy jó hangulat és érdekes témák között fejlesszék a vita tudásukat angol nyelven. Heti egy alkalommal és számos csapatépítő programmal várunk minden érdeklődőt!",
    image: "/groups/debate.png",
    description: "",
    links: [
      {
        title: "Debate Club Instagram",
        value: "https://www.instagram.com/e5vosdebate/",
        type: "instagram",
      },
      {
        title: "Lukács Lujza",
        value: "lukacs.lujza@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Eötvös Diák",
    details:
      "Az Eötvös Diák iskolánk nagyrabecsült újsága, amelyet mi, a diákság írunk, illusztrálunk, tördelünk és szerkesztünk. Egyaránt megjelennek benne szépirodalmi, ismeretterjesztő, kritikai szövegek, illetve minden, ami foglalkoztatja az Eötvös Népét. Ha szeretnéd, hogy a te műved is szerepeljen a következő számban, keress minket Instagramon (@e5vosdiak) vagy e-mailben (pillar.blanka@e5vos.hu), és kapcsolódj be - akár év közben is!",
    image: "/groups/diak.jpg",
    description: "",
    links: [
      {
        title: "Eötvös Diák Instagram",
        value: "https://www.instagram.com/e5vosdiak/",
        type: "instagram",
      },
      {
        title: "Pillár Blanka",
        value: "pillar.blanka@e5vos.hu",
        type: "email",
      },
      {
        title: "Kriston tanár Úr",
        value: "kriston.attila@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Elsősegélynyújtó Diákkör",
    details:
      "Elege van abból, hogy tehetetlen, mikor mindenki haldoklik maga körül? Esetleg Ön tervez elhalálozni? Azonnal, rutinosan használható tudást szeretne? Stresszhelyzetben is helyesen végezné el az Esmarch-féle műfogást? Naprakész, könnyen alkalmazható tudást szerezhet most velünk. Ha kedve úgy tartja, életeket menthet, ha nem, külön kívánságra speciális kínzási módszereket tanulhat.\n\nKomolyra fordítva a szót, nálunk megtanulhatsz csapatban dolgozni, részt vehetsz magas színvonalú versenyeken és egyéb rendezvényeken a Vöröskereszt szervezésében. Természettudományos érdeklődésűeknek különösen ajánjuk a részvételt, hisz az itt elhangzottak legnagyobb részben biológiára és a józan eszünkre támaszkodnak. Ha még nem is annyira hoz lázba a termtud, az itt átadott tudással a mindennapokban magabiztosnak érezheted magad elsősegélynyújtó képességeidben. Mindezekhez az elméleti és gyakorlati tudást, melyet akár jogosítvány megszerzésénél is hasznosíthatsz, családias légkörben egy befogadó és jófej közösség részeként szerezheted meg.\n\nCsatlakozz Te is az Elsősegélynyújtó Diákkörhöz!",
    image: "/groups/elsosegely.jpg",
    description: "",
    links: [
      {
        title: "Elsősegélynyújtó Diákkör Instagram",
        value: "https://www.instagram.com/firstaid_ejg/",
        type: "instagram",
      },
      {
        title: "Pulay Johanna",
        value: "pulay.johanna.reka@e5vos.hu",
        type: "email",
      },
      {
        title: "Kompolti Áron",
        value: "kompolti.aron@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Kéktúra-szakkör",
    details:
      "Célunk, hogy eötvösös éveink során az Országos Kéktúra 1172,5 km hosszú útvonalát egy lelkes csapattal bejárjuk. Havonta általában 1 alkalom kerül megrendezésre, ezek változóan egynaposak vagy ottalvósak. Mindenképp ajánljuk szakkörünket, ha szereted az erdőt járni vagy csak kedvet érzel magadban ahhoz, hogy kiszakadj a szürke hétköznapokból, s eltölts egy napot egy vidám csapattal!",
    image: "/groups/kektura.jpg",
    description: "",
    links: [
      {
        title: "Kéktúra-szakkör Facebook",
        value: "https://www.facebook.com/groups/ejgkektura/",
        type: "instagram",
      },
      {
        title: "Kéktúra-szakkör Instagram",
        value: "https://www.instagram.com/tehen_kek",
        type: "instagram",
      },
    ],
  },
  {
    title: "Eötvös Kosárlabdacsapat",
    details:
      "Legyél te is az Eötvös amatőr kosárcsapatának tagja, és légy részese a diákolimpia első helyéért folyó éves küzdelemnek! Szívesen várunk mindenkit, aki szeretné magát kipróbálni a kosárpályán, illetve szeretne tagja lenni egy összetartó, egymást segítő, vidám közösségnek. Kezdők és haladók egyaránt jöhetnek, de fontos, hogy csak az játszhat a diákolimpia mérkőzésein, aki legalább 1 éve nem igazolt játékos, tehát nem tagja egyesületnek.",
    image: "/groups/kosar.jpeg",
    description: "",
    links: [
      {
        title: "Eötvös Kosárlabdacsapat Instagram",
        value: "https://www.instagram.com/e5vosnegerek/",
        type: "instagram",
      },
      {
        title: "Eötvös Kosárlabdacsapat Facebook",
        value: "https://www.facebook.com/eotvosbasketball/",
        type: "facebook",
      },
    ],
  },
  {
    title: "Eötvös Média",
    details:
      "Idén is lesz Eötvös Média! Mi dokumentáljuk az összes programot az Eötvösben. Ott vagyunk minden fontos eseményen, fotózunk, videózunk, megörökítjük az iskola legmeghatározóbb emlékeit. Gyere, csatlakozz hozzánk!",
    image: "/groups/media.jpg",
    description: "",
    links: [
      {
        title: "Eötvös Média Facebook",
        value: "https://www.facebook.com/eotvosmedia",
        type: "facebook",
      },
      {
        title: "Eötvös Média Instagram",
        value: "https://www.instagram.com/eotvosmedia",
        type: "instagram",
      },
      {
        title: "Eötvös Média email",
        value: "mediabrigad@e5vos.hu",
        type: "email",
      },
      {
        title: "Eötvös Média Levelezőlista",
        value: "https://listmonk.e5vosmedia.hu/subscription/form",
        type: "email",
      },
      {
        title: "Eötvös Média Weboldal",
        value: "https://e5vosmedia.hu",
        type: "website",
      },
    ],
  },
  {
    title: "MUN-Club",
    details:
      "Nálunk kipróbálhatod magad egy ENSZ delegált cipőjében, és fejlesztheted a public speaking képességed, az önbizalmad, az angol tudásod. Miközben nemzetközi problémákat és kríziseket oldasz meg, tanulhatsz a modern geopolitikáról, és arról, hogyan működik a nemzetközi diplomácia, és, hogy mit jelent felelős vezetőnek lenni (vagy éppen diktátornak). Velünk tarthatsz a nemzetközi konferenciákra, és az itthoniakra egyaránt. Ha még sosem próbáltad a munozást, akkor se aggódj, tapasztalt mentorokkal várunk, akik végigkísérnek a tanuláson! Sok szeretettel várunk téged is a közösségünkben!",
    image: "/groups/munclub.png",
    description: "",
    links: [
      {
        title: "MUN-Club Instagram",
        value: "https://www.instagram.com/munclubejg/",
        type: "instagram",
      },
      {
        title: "Pajor Blanka",
        value: "pajor.blanka@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Nekünk X",
    details: "Iskolai közösségi szolgálatos órák összegyűjtésében segítünk.",
    image: "/groups/old/nekunkx.jpg",
    description: "",
    links: [
      {
        title: "Nekünk X Instagram",
        value: "https://www.instagram.com/nekunk_x/",
        type: "instagram",
      },
      {
        title: "Nekünk X email",
        value: "iksz.program@e5vos.hu",
        type: "email",
      },
      {
        title: "Nekünk X Weboldal",
        value: "https://nekunk-x.site/",
        type: "website",
      },
    ],
  },
  {
    title: "Sulirádió",
    details:
      "Mi irányítjuk az iskolai szünetekben és az Eötvös programjain a stúdiót. Mi vagyunk az iskola audió formájú hangulatfelelősei. Olyanokat várunk a csapatunkba, akik képesek a közjót, az iskola hangulatát szolgálni empatikus, alázatos módon, nem pedig a saját extrém ízlésüket prezentálni ezer állampolgár kínzatásául.",
    image: "/groups/suliradio.png",
    description: "",
    links: [
      {
        title: "Iskolarádió Instagram",
        value: "https://www.instagram.com/eotvossuliradio/",
        type: "instagram",
      },
    ],
  },
  {
    title: "Sakk - klub",
    details:
      "Szeretsz sakkozni, de nincs kivel? Szeretnéd fejleszteni a sakk tudásod? Szeretnéd kipróbálni, fejleszteni játékod vagy taktikád? Akkor a legjobb helyen jársz! Itt elsajátíthatsz mindent a sakkozás alapjairól és egy CM-rel (Candidate Master) is találkozhatsz akár oktatóként, akár diákként. Már három oktatónk is van, és a résztvevők száma is egyre nő. Ha szeretnél egy vidám környezetben sakkozni barátaiddal és osztálytársaiddal jelentkezz a Sakk - klubba és mehet a parti.",
    image: "/groups/sakk.jpg",
    description: "",
    links: [
      {
        title: "Illés Gergő",
        value: "illes.gergo@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Színjátszó",
    details:
      "Színt játszunk. Szeretjük az összes színt, a kéket, a pirosat, a zöldet, de még a khakit, meg a bézst is. Komolyra fordítva a szót, igyekszünk minden évben rendezni egy darabot -idén akár kettőt is?!-, és rengeteget játszunk. Minden péntek délután sokszínű gyakorlatokkal, és ikonikus játékokkal készülünk a darabra.",
    image: "/groups/szinjatszo.png",
    description: "",
    links: [
      {
        title: "Színjátszó YouTube",
        value: "https://youtube.com/@szinjatszosdoku2492",
        type: "youtube",
      },
    ],
  },
  {
    title: "TársasTár",
    details:
      "Szeretsz társasozni? Új játékokat szeretnél megismerni? Gyere el a havi rendszerességű TársasDélutánra, garantált a jó társaság, jó játékok!",
    image: "/groups/tarsastar.jpg",
    description: "",
    links: [
      {
        title: "TársasTár email",
        value: "tarsaskonyvtar@e5vos.hu",
        type: "email",
      },
      {
        title: "Classroom csoport",
        value: "https://classroom.google.com/c/NDM5NTQ2NTg4NTc4?cjc=egly4eh",
        type: "classroom",
      },
    ],
  },
  {
    title: "Technikusi Szervezet",
    details:
      "Mi vagyunk a Technikusi Szervezet. Ott vagyunk mindenhol: évnyitó, évzáró, KMT, könnyűzenei, jazz koncert, M15, karácsony. Hangosítunk, fényezünk, videózunk, technikát gyártunk, rendezvényt szervezünk, újító technikai megoldásokkal állunk elő.",
    image: "/groups/technikusi.png",
    description: "",
    links: [
      {
        title: "Technikusi Szervezet Instagram",
        value: "https://www.instagram.com/e5vos.technikusi.szervezet/",
        type: "instagram",
      },
      {
        title: "Technikusi Szervezet email",
        value: "tsz@e5vos.hu",
        type: "email",
      },
      {
        title: "Gőz Barnabás",
        value: "goz.barnabas@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Eötvös Vakondok",
    details:
      "A csapat, ami három éven keresztül letaszíthatatlan volt a diákolimpia trónjáról, tavaly megkezdte az újjáépítést, várunk mindenkit, aki szeretne kipróbálni egy új sportot, és emellett jól érezni magát!",
    image: "/groups/eotvosvakondok.png",
    description: "",
    links: [
      {
        title: "Márkus Benedek",
        value: "markus.benedek@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Bimun",
    image: "/groups/bimun.jpg",
    details:
      "A BIMUN egy minden évben megrendezésre kerülő nemzetközi MUN-konferencia, melyet az iskola és az ide járó diákok szerveznek. Többféle módon is van lehetőség ebben részt venni. Lehet szervezői pozíciókra jelentkezni, akik az esemény megvalósításáért felelősek. Vannak olyan pozíciók is, akik a konferencia alatt segítik a sikerességét, például staffként, médiásként, pressesként, hostként, supervisorként. Ez azért nagy lehetőség a számunkra, mert így nem csak a konferenciára érkező résztvevők, hanem a szervezői gárda is találkozhatunk külföldi diákokkal, és akár életre szóló ismeretségeket köthetnek. Minden évben remek csapat áll össze, hogy megvalósítsa iskolánk egyik fontos rendezvényét.",
    description: "",
    links: [
      {
        title: "BIMUN Facebook",
        value: "https://www.facebook.com/bimun2011",
        type: "facebook",
      },
      {
        title: "BIMUN Nekünk",
        value: "https://www.facebook.com/bimunnekunk",
        type: "facebook",
      },
      {
        title: "BIMUN Instagram",
        value: "https://www.instagram.com/bimun.official/",
        type: "instagram",
      },
      {
        title: "BIMUN Nekünk Instagram",
        value: "https://www.instagram.com/bimun.nekunk/",
        type: "instagram",
      },
      {
        title: "BIMUN Website",
        value: "https://www.bimun.hu/",
        type: "website",
      },
      {
        title: "BIMUN Email",
        value: "bimun@bimun.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Eötvös Alkotó Műhely",
    details:
      "Az V. Kerületi Eötvös József Gimnáziumban működő E5vös Alkotó Műhely egy tér a játékhoz, az alkotáshoz, a tanuláshoz, a mentoráláshoz, a feltaláláshoz. Másképp megfogalmazva a tanulás és az innováció helye. Ez a nyitott tanulói tér a diákok és tanárok számára egyaránt rendelkezésre áll a projektjeik és ötleteik megvalósításához. A Műhely hozzáférést biztosít egy egyedi alkotókörnyezethez, ami segít a különböző hard és soft skillek elsajátításában azáltal, hogy a legkorszerűbb technológiákhoz, szoftverekhez és anyagokhoz nyújt hozzáférést. Így az iskola polgárai képesek elkészíteni (szinte) akármit , amit csak el tudnak képzelni.",
    image: "/groups/eam.png",
    description: "",
    links: [
      {
        title: "Eötvös Alkotó Műhely Weboldal",
        value: "https://sites.google.com/e5vos.hu/e5vosalkotomuhely/",
        type: "website",
      },
    ],
  },
  {
    title: "Eötvös Podcast",
    details:
      "Az első műhelyfoglalkozásokon meghívott újságírók segítségével és saját műsorok készítésén keresztül mélyebben megismerjük a műfajt. Tervezünk rövidebb interjúkat és elmélyülős portrébeszélgetéseket, eötvösös hírműsort és egy-egy témában elmélyülő oktatási podcastet. Ha szívesen lennél állandó műsorkészítő várunk szeretettel Jelentkezhetsz egyénileg vagy két három főből álló műsorstábbal is. A szakkör tagjaival havonta egyszer találkozunk egy szombati műhelymunkára.",
    image: "/groups/podcast.png",
    description: "",
    links: [
      {
        title: "Eötvös Podcast Instagram",
        value: "https://www.instagram.com/e5_podcast/",
        type: "instagram",
      },
    ],
  },
];
