export type GroupsConfig = Group[];

export interface Link {
  type:
    | "facebook"
    | "instagram"
    | "website"
    | "email"
    | "phone"
    | "classroom"
    | "youtube"
    | "spotify";
  title: string;
  value: string;
}
interface Group {
  title: string;
  image: string;
  details: string;
  description?: string;
  links: Link[];
  new?: boolean;
}

export const clubsOrder: string[] = [
  "Közéleti vitaszakkör",
  "Horgolás és relax",
  "Egészségügyi szakkör",
  "E5vös StudenTalk",
  "FLC EJG",
  "Filmklub",
  "Eötvös Diák + Kreatív író műhely",
  // "EPAS", // TODO: Boti

  "Zöld Bizottság",
  "Eötvös Média",

  "Elsősegélynyújtó Diákkör",

  "Röplabda csapat",
  "Fiú Kosárlabdacsapat",
  "Lány Kosárlabdacsapat",
  // "Eötvös Vakondok", // TODO: Kornél
  "Kéktúra szakkör",
  "TársasTár",
  "Debate Club",

  "Színjátszó",
  "Nekünk X",

  "Technikusi Szervezet",
  "Eötvös Alkotó Műhely",

  "MUN-Club",
  "BIMUN",

  "Sulirádió",
  "E5vös Sakk",
];

export const clubsConfig: Group[] = [
  {
    // TODO: Solymoss Miklós
    title: "Egészségügyi szakkör",
    details:
      "Orvosokat, rezidenseket, orvostanhallhatókat hívunk előadni, hogy bemutassák az egészségügy világát.",
    description: "",
    image: "",
    links: [],
    new: true,
  },
  {
    // TODO: Timi
    title: "Lány Kosárlabdacsapat",
    details:
      "Hetente kétszer, jó hangulatban együtt gyakoroljuk a labdakezelést, a dobásokat és a csapatjátékot. Valamint felkészülünk a budapesti amatőr és profi meccsekre is.",
    description: "",
    image: "",
    links: [],
    new: true,
  },
  {
    // TODO: Morvai Gergely
    title: "Röplabda csapat",
    details: "Röplabda diákolimpiára felkészülés, a sport népszerűsítése.",
    description: "",
    image: "/groups/roplabda.png",
    links: [
      {
        title: "Röplabda csapat Instagram",
        value: "https://www.instagram.com/e5vos_roplabda/",
        type: "instagram",
      },
    ],
    new: true,
  },
  {
    title: "Horgolás és relax",
    details:
      "Van aki azért jön ide, mert tud horgolni.... van aki azért, mert nem tud horgolni.... van aki azért, mert szeret horgolni.... és van aki azért, mert csacsogni szeretne kicsit egy fárasztó nap után... :)) ",
    description: "",
    image: "/groups/horgoloszakkor.png",
    links: [
      {
        title: "Czirók Adrienn",
        value: "czirok.adrienn@e5vos.hu",
        type: "email",
      },
      {
        title: "Kámán Ildikó",
        value: "kaman.ildiko@e5vos.hu",
        type: "email",
      },
    ],
    new: true,
  },
  {
    // TODO: Varga Sándor
    title: "Közéleti vitaszakkör",
    details:
      "Hétről-hétre egy-egy érdekes, közösen kiválasztott témát dolgozunk fel, amelyben megszerzett tudásod később sikereseb használhatod más vitafórumokon is.(a szakkör magyar nyelven zajlik, így a nylevi akadályoktól sem kell tartani) ",
    description: "",
    image: "",
    links: [],
    new: true,
  },
  {
    title: "Zöld Bizottság",
    details:
      "A Zöldbizottság felelős elsősorban az Eötvös fenttarthatóbbá tevéséért. 2025ben elengedhetetlennek tartjuk, hogy ne legyen szívügye egy iskolának a Földünk jövője. A Zöldbiz lehetőségeket keres arra,hogy hogyan vonja be a diákságot, minél nagyobb és hatékonyabb környezet barát projektekbe.",
    image: "/groups/zoldbiz.png",
    description: "",
    links: [
      {
        title: "Zöld Bizottság Facebook",
        value: "https://www.facebook.com/eotvos.zoldbiz",
        type: "facebook",
      },
      {
        title: "Zöld Bizottság Instagram",
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
      "A Debate-club egy angol nyelven folyó vita klub, ahol rengeteg témán belül, heti foglalkozások keretében formális vitákat folytatunk le. A célunk, hogy minél többen megismerjék a versenyvita szépségét. Minden leendő Eötvösöst szívesen várunk egy-két vitázós, érvelős játékra, ahol belekóstolhattok a debate rejtelmeibe.",
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
    title: "Eötvös Diák + Kreatív író műhely",
    details:
      "Az Eötvös Diák az iskola nagy múltú, közel száz éves nyomtatott újságja. Várunk a laphoz, ha szívesen kipróbálnád magad újságíróként, szerkesztőként, rovatvezetőként, illusztrátorként, tördelőként, vagy szeretnéd közölni szépirodalmi munkáidat. Az Eötvös Diák együttműködik az iskolai podcasttel, és a kéthetente péntekenként tartott Kreatív író műhelyben is támogatást kaphatsz a cikkíráshoz; ezért nyugodtan jelentkezz egyszerre több szakkörbe is, ez nem jelent majd számodra többletterhelést. A szerkesztőség idén újralakul, és a tervezett négy lapszámban arra törekszünk majd, hogy színes, mindenkit foglalkoztató témákról tájékoztassuk az iskola nyilvánosságát.",
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
      "Szeretnél hasznos tudást szerezni, amellyel akár életeket is menthetsz? Érdekel, hogyan kell gyorsan és helyesen cselekedni váratlan helyzetekben? Akkor csatlakozz az Elsősegélynyújtó Diákkörhöz! \nNálunk megtanulhatod az alapvető és speciális elsősegélynyújtási technikákat, kipróbálhatod magad valósághű szituációkban, és elsajátíthatod, hogyan kell csapatban együttműködni. Lehetőséged lesz versenyeken részt venni, és olyan ismereteket szerezni, amelyek a mindennapokban is életmentők lehetnek. \nA szakkör célja, hogy magabiztossá tegyen vészhelyzetekben, és megtanítson arra, hogyan tudsz másokon segíteni. Akár az iskolában, akár a mindennapi életben, ezek a készségek valódi értéket képviselnek. \nCsatlakozz hozzánk, és legyél Te is az, aki tudja, mit kell tenni, amikor mások segítségre szorulnak!",
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
    title: "Kéktúraszakkör",
    details:
      "Szakkörünkben lehetőséged nyílik barátaiddal közösen végigjárni a kéktúra legszebb szakaszait, havonta egy, nem túl megterhelő, néha kétnapos túra keretében.",
    image: "/groups/kektura.jpg",
    description: "",
    links: [
      {
        title: "Kéktúra szakkör Facebook",
        value: "https://www.facebook.com/groups/ejgkektura/",
        type: "facebook",
      },
      {
        title: "Kéktúra szakkör Instagram",
        value: "https://www.instagram.com/tehen_kek",
        type: "instagram",
      },
    ],
  },
  {
    title: "Fiú Kosárlabdacsapat",
    details:
      "Milyen embereknek ajánljátok klubotokat? \nAkik kosaraznak/szeretnek kosarazni v akik nagyon magasak",
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
      "Idén is lesz Eötvös Média! Mi dokumentáljuk az összes programot az Eötvösben. Ott vagyunk minden fontos eseményen, fotózunk, videózunk, megörökítjük az iskola legmeghatározóbb emlékeit. Gyere, csatlakozz hozzánk! Jelentkezés / További információkért: mediabrigad@e5vos.hu",
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
        title: "Eötvös Média Weboldal",
        value: "https://e5vosdo.hu/media",
        type: "website",
      },
    ],
  },
  {
    title: "MUN-Club",
    details:
      "Nálunk kipróbálhatod magad egy ENSZ delegált cipőjében, és fejlesztheted a public speaking képességed, az önbizalmad, az angol tudásod. Miközben nemzetközi problémákat és kríziseket oldasz meg, tanulhatsz a modern geopolitikáról, és arról, hogyan működik a nemzetközi diplomácia, és, hogy mit jelent felelős vezetőnek lenni (vagy éppen diktátornak). Velünk tarthatsz a nemzetközi konferenciákra, és az itthoniakra egyaránt. Tapasztalt mentorokkal várunk, akik végigkísérnek a tanuláson, hogy ne legyen nehézség megérteni a szabályokat. Várunk téged is szeretettel a közösségünkbe!",
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
    image: "/groups/nekunkx.png",
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
        value: "https://iksz.e5vosdo.hu/",
        type: "website",
      },
    ],
  },
  {
    title: "Sulirádió",
    details:
      "Szünetekben a stúdióból zenéket tesznek be a tagok, amelyek hangulatot adnak az iskolának.",
    image: "/groups/suliradio.png",
    description: "",
    links: [
      {
        title: "Iskolarádió Instagram",
        value: "https://www.instagram.com/e5vos.suliradio/",
        type: "instagram",
      },
      {
        title: "Iskolarádió Spotify",
        value: "https://open.spotify.com/playlist/4qsZY2JmKxdsZ7KETT1qbb",
        type: "spotify",
      },
    ],
  },
  {
    title: "E5vös Sakk",
    details:
      "Szeretsz sakkozni? \nSzeretnél megtanulni megnyitásokat, vagy kipróbálni magad a táblán? Akkor gyere az E5vös sakk szakkörre! \nJó hangulat, baráti társaság és izgalmas partik várnak rád, ahol a sulistársaiddal is összemérheted a tudásodat.",
    image: "/groups/sakk.jpg",
    description: "",
    links: [
      {
        title: "E5vos Sakk Instagram",
        value: "https://www.instagram.com/e5vos_sakk/",
        type: "instagram",
      },
      {
        title: "Trautzsch Alexander",
        value: "trautzsch.alexander.mathieu@e5vos.hu",
        type: "email",
      },
    ],
  },
  {
    title: "Színjátszó",
    details:
      "Heti egy alkalommal összegyűlik egy energikus, játékos és felszabadult közösség. Játszunk, improvizálunk és közben össze állítunk egy darabot amelyet mi magunk írtunk.",
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
      "Mi vagyunk az Eötvös Technikusi Szervezet — ott vagyunk minden fontos eseménynél: évnyitó és évzáró, KiMitTud?, könnyűzenei és jazz koncertek, március 15-ei ünnepség, karácsony. Hangosítunk, fénytechnikát üzemeltetünk és tervezünk, videózunk, eszközöket építünk és fejlesztünk, valamint rendezvényeket szervezünk. Mindig új technikai megoldásokkal kísérletezünk, és örömmel várunk mindenkit, aki szeretne tanulni, alkotni és részese lenni a élmények létrehozásának.",
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
    title: "BIMUN",
    image: "/groups/bimun.jpg",
    details:
      "A BIMUN szervezői csapata egy összetartó közösség, amely egy egész éven átívelő projektet valósít meg közösen. Mindenki a saját ötleteivel, kreativitásával és munkájával járul hozzá ahhoz, hogy egy felejthetetlen élmény szülessen. A BIMUN az Eötvösös élet egyik legkiemelkedőbb eseménye, ahol szervezőként és résztvevőként egyaránt új barátságokra, nemzetközi kapcsolatokra és rengeteg élményre tehetsz szert.",
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
      "Több szakkör is indul: \nSzabad Műhely: Az év folyamán bárki bármikor résztvehet rajta akár alkalomszerűen ahl segítünk megvalósítani a terveiket, segítünk az iskolapolgárok IT problémáinak megoldásában. \n\nProjekt szakkör: A szabad Műhellyel egy időpontban a jelentkezőkkel közösen kiválasztunk egy tetszőleges projektet (arduino programozás, 3D nyomtatás, ...stb.) amelyet 2-3 hónapig folytatunk majd új témát választunk. \n\nRobotika szakkör: Ez egy olyan szakkör amelyet Majoros József tanárúr tart, ahol az ő segítségével lehetőség adódik akár nemzetközi szintű robotika versenyeken való indulás valamint felkészülés, mint például a WRO, CanSat,...",
    image: "/groups/eam.png",
    description: "",
    links: [
      {
        title: "Eötvös Alkotó Műhely Instagram",
        value: "https://www.instagram.com/e5vosalkotomuhely/",
        type: "instagram",
      },
      {
        title: "Eötvös Alkotó Műhely Weboldal",
        value: "https://sites.google.com/e5vos.hu/e5vosalkotomuhely/",
        type: "website",
      },
    ],
  },
  {
    title: "E5vös StudenTalk",
    details:
      "Az E5vös StudenTalk egy olyan csapat, amely izgalmas és gondolatébresztő podcastekkel látja el iskolánk diákjait.\nCélunk, hogy változatos témákkal, érdekes beszélgetésekkel és inspiráló vendégekkel szórakoztassunk és informáljunk benneteket.\nLegyen szó iskolai eseményekről, tanulmányi tippekről, aktuális társadalmi kérdésekről vagy akár könnyedebb, szórakoztató témákról, nálunk mindig találtok valami újat és izgalmasat.",
    image: "/groups/e5studentalk.png",
    description: "",
    links: [
      {
        title: "E5 StudenTalk Email",
        value: "podcast@e5vos.hu",
        type: "email",
      },
      {
        title: "E5 StudenTalk website",
        value: "http://sites.google.com/view/e5vos-studenttalk",
        type: "website",
      },
      {
        title: "E5 StudenTalk Bio",
        value: "https://www.yoursit.ee/e5_studentalk/",
        type: "website",
      },
      {
        title: "E5 StudenTalk Spotify",
        value: "https://open.spotify.com/show/2El9cQ7QqPYlDDnfJZNoeJ",
        type: "spotify",
      },
      {
        title: "E5 StudenTalk Instagram",
        value: "https://www.instagram.com/e5_studentalk/",
        type: "instagram",
      },
    ],
    new: true,
  },
  {
    title: "FLC EJG",
    image: "/groups/FLC.png",
    description: "",
    details:
      "A Financial Literacy Club lehetőséget biztosít a diákok pénzügyi és gazdasági ismereteinek fejlesztésére. Az FLC keretein belül többek között tanulmányi versenyekre, vendégelőadásokra és céglátogatásokra jelentkezhetnek az Eötvösös diákok, gyakorlati betekintést nyújtva a pénzügyi világba. \n\nA pénzügyi ismereteken túl a klub olyan alapvető készségek fejlesztésére összpontosít, mint a nyilvános beszéd, a vezetés, a prezentációs technikák, a csapatmunka és a kritikai gondolkodás. Ezek a készségek kulcsfontosságúak mind a tanulmányi, mind a szakmai sikerhez.",
    links: [
      {
        title: "FLC EJG Instagram",
        value: "https://www.instagram.com/flc_ejg/",
        type: "instagram",
      },
    ],
  },
  {
    title: "Filmklub",
    image: "/groups/filmklub.jpg",
    description: "",
    details: "Filmeket nézünk és értékelünk.",
    links: [
      {
        title: "Filmklub Instagram",
        value: "https://www.instagram.com/filmklub.ejg",
        type: "instagram",
      },
    ],
  },
  {
    title: "EPAS",
    image: "/groups/epas.png",
    description: "",
    details:
      "Itt olvashattok a programjaikrol az ev egesze alatt:\nEurópa Nap – március 28. péntek\n- Európa Fórum – Téma: EU Zöld Megállapodás -\n- EPAS (Európa) Bajnokság (12 órás foci) - minden csoport\n\nEurópai Filmklub – Európa Napon, Tavaszi Fesztiválon \n\nEurópa Kvíz - szeptembertől folyamatosan \n\nTavaszi Fesztivál – április \n- Európa Filmklub\n\nBIMUN - részvétel a 0. napon, krízis bizottság \n\nZöld Program – szeptembertől folyamatosan - Zöld Bizottság",
    links: [
      {
        title: "EPAS Instagram",
        value: "https://www.instagram.com/epas_eotvos/",
        type: "instagram",
      },
    ],
  },
];
