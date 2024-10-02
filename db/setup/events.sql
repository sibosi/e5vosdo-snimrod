DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time DATE,
    hide_time DATE NOT NULL,
    image VARCHAR(255),
    details TEXT,
    tags JSON
);
INSERT INTO events (
        title,
        time,
        show_time,
        hide_time,
        image,
        details,
        tags
    )
VALUES 
    (
        'Tanévnyitó ünnepség',
        'szeptember 2. 9:00',
        '2024-09-02',
        '2024-09-03',
        '/events/evnyito.jpg',
        NULL,
        '[]'
    ),
    (
        'Klub Expo',
        'szeptember 6. 15:30',
        '2024-09-06',
        '2024-09-07',
        '/events/klubexpo.jpg',
        NULL,
        '["bemutató"]'
    ),
    (
        'Walk The Wish',
        'szeptember 20. 15:30',
        '2024-09-20 15:30',
        '2024-09-21',
        '/events/walkthewish.jpg',
        NULL,
        '["jótékonyság"]'
    ),
    (
        'Kilencedikes gólyatábor',
        'Kezdés: szeptember 27.',
        '2024-09-27',
        '2024-09-29',
        '/events/9golyatabor.jpg',
        NULL,
        '["9. évf", "tábor"]'
    ),
    (
        'Zene világnapja',
        'október 1.',
        '2024-10-01',
        '2024-10-02',
        '/events/ZVN.jpeg',
        NULL,
        '["zene"]'
    ),
    (
        'ZVN táncház',
        'október 1. 16:00 - 17:00',
        '2024-10-01 16:00',
        '2024-10-02',
        '/events/ZVN.jpeg',
        NULL,
        '["zene"]'
    ),
    (
        'ZVN esti koncert',
        'október 1. 18:00',
        '2024-10-01 18:00',
        '2024-10-02',
        '/events/zvn_koncert.jpg',
        NULL,
        '["zene", "koncert"]'
    ),
    (
        "Eötvös Diák Workshop",
        "október 2. 15:30",
        "2024-10-02 15:30",
        "2024-10-03",
        "/groups/diak.jpg",
        "Érdekel az ujságirás? Szeretsz illusztrálni, alkotni, van müvészi látásmódod? Vagy inkább egy lap végsö kinézete foglalkoztat?Szívesen pilantanál bele egy igazi szerkesztöség munkájába?\nHa bármelyik kérdésre is igennel válaszoltál, gyere el a workshopunkra!\nidópont: október 2, szerda,\n15:30, 300-as terem",
        '["workshop"]'
    ),
    (
        'A 10. évf. Esztergomban',
        'október 3.',
        '2024-10-03',
        '2024-10-04',
        '/events/esztergom.jpeg',
        'Kirándulás Esztergomba a NEP program keretében. A 10. évfolyam megbontva fog résztvenni. Együtt az ABC és együtt a DEF.',
        '["10. évf", "kirándulás"]'
    ),
    (
        "FLC előadás a bankkártyák témában",
        "okt. 3. 15:45 - fsz. földrajz terem",
        "2024-10-03 15:45",
        "2024-10-04",
        "/groups/FLC.jpg",
        NULL,
        '["pénzügy", "előadás"]'
    ),
    (
        'Ér-e bármit a fenntarthatóság cselekvés nélkül?',
        'október 3. 15:30',
        '2024-10-03 15:30',
        '2023-10-04',
        '/events/fenntarthato.jpg',
        'Szeretettel meghívunk titeket az alábbi előadásra, a Zöld Bizottság idei első programjára.\n\nKovács Szabolcsot (Green Sense) hívtuk az iskolába, ahol meghallgathatjuk az:\n\n\n"Ér-e bármit a fenntarthatóság cselekvés nélkül?"\n\n\ncímű előadását.\n\n\nAz előadás motiváló jellegű, lesz szó arról, hogy mit tehetünk mint egyén, és mint egy közösség a környezetért, továbbá fogunk kapni tippeket, tanácsokat.\n\n\nEgy rövid ismertető az előadóról:\n\n\n“Közgazdász, 13 éves Mastercard karrierjének utolsó 2 évében a magyarországi iroda fenntarthatósági menedzsere volt, rájött, hogy őt ez érdekli igazán, ez motiválja. Munka melletti projektként kezdett el foglalkozni a dolgozók környezettudatos szemléletformálásával, és észrevette, hogy módszereivel tud hatni a kollégákra, akik képesek voltak a zöld gondolatokat, szokásokat beépíteni mindennapjaikba. Ezekből a tapasztalatokból nőtt ki a GreenSense Consulting, és született meg első szolgáltatásuk: a GreenStorm, amely vállalati dolgozóknak tart gyakorlatorientált környezettudatos képzéseket.”\n\n\nAz előadás szeptember 26-án csütörtökön 15:30-tól kezdődik a 202-es teremben.\n\n\nAz alábbi űrlapon tudsz jelentkezni eötvösös email-címmel:\n\n\n<a href="https://forms.gle/6TbYwkLu6v5UpGju5" className="text-selfsecondary-700">https://forms.gle/6TbYwkLu6v5UpGju5</a>\n\n\nVárunk mindenkit szeretettel:\n\nA Zöld Bizottság💚',
        '["fenntarthatóság", "előadás"]'
    ),
    (
        'Társas Délután #1',
        'október 4. - 7. óra után',
        '2024-10-04',
        '2024-10-05',
        '/groups/tarsastar.jpg',
        'Örömmel jelentjük be, hogy idei tanévünk első társas délutánja most pénteken (okt. 4-én) kerül megrendezésre.\n\nVárunk minden új és visszatérő diákot péntek 7. óra után a 307-esben!',
        '["társasjáték"]'
    ),
    (
        "Filmklub - INCEPTION",
        "október 4. 15:30",
        "2024-10-04 15:30",
        "2024-10-05",
        "/groups/filmklub.jpg",
        "Hello Eötvös népe!\nÖrömmel jelentjük be, hogy ezen a héten pénteken (10.04.) megrendezésre kerül az elsö Filmklub session!\n15:30-tól várunk titeket a HÖKI-ben (Höközpont, alagsor), hogy megtekintsük az általatok kiválasztott filmet - INCEPTION.\nGyertek sokan, mindenkit szeretettel ölelünk!\nFilmklub vezetöség",
        '["filmklub"]'
    ),
    (
        'Eötvös Bazár',
        'október 19.',
        '2024-10-19',
        '2024-10-20',
        '/events/bazar.png',
        'Kedves Kollégák, kedves Diákok!\nEbben a tanévben is megszervezzük a most már hagyományosnak tekinthető Eötvös Bazárt, idén október 19-én (kb. 8 és 17 óra között lesz feladat, de nem kell minden jelentkezőnek egész nap itt lenni - erről még egyeztetünk majd). \n*A levél alján írok információt azoknak az új belépő kollégáknak és diákoknak, akik nem tudják még, mi is ez a nagyon jó hangulatú esemény.* \n\nAzoktól, akik ismerik a Bazárt, és idén is szívesen részesei lennének az eseménynek saját programjukkal, azt szeretném kérni, hogy az alábbi táblázatba írják be magukat. Ez a táblázat az elmúlt évek táblázatain alapszik, ezért sok program már előre be van írva, illetve otthagytam a "mi lesz ott?" és a "rövid leírás" részeket is, hogy emlékezzetek, mit csinált az elmúlt években az adott szakkör/program. Ezeket természetesen lehet módosítani, hozzá lehet írni olyat, ami hiányzik, ki lehet egészíteni új dolgokkal. Ha esetleg van olyan csapat, aki idén nem venne részt, az legyen szíves törölni a csapatot a táblázatból. Kérem, hogy vasárnapig (09. 22.) jelezzétek kitöltéssel a részvételi szándékot, szükség lesz egy kapcsolattartóra is. Minden egyéb részletről külön írok majd később azoknak, akik jönnek. \n\nAzok a diákok, akik nem programmal vennének részt, hanem a kommunikációban (Fb-esemény, Insta, terjesztés), szervezésben (ruhatár, útbaigazítás, R-Gárda) segítenének, a kommunikáció, szervezés fülre írják magukat az excelben. \n\nTudjuk, hogy nem ez mozgat benneteket a Bazárnál elsősorban, de továbbra is lehet IKSZ-es órát szerezni vele. \n\nBármi kérdés van, írjatok nyugodtan. Ti tudjátok megmutatni igazán, hogy miért jó ide járni, úgyhogy nagyon várunk minden programot hozót és érdeklődőt is!  \n\nA szervezők nevében,\nAVS\n\nMi az Eötvös Bazár? \n\nEzt a szombati napon tartott rendezvényt még nem ide járó, felvételi előtt álló általános iskolás diákoknak találtuk ki. A rendezvényt az a felvetés hívta életre, hogy nagyon jó lenne a nyílt napok órái mellett még valami, amivel meg tudjuk mutatni iskolánk sokszínűségét, egyediségét, ami elősegíthetné, hogy minket válasszanak a felvételiző diákok. \n\n\nAz eseményen bemutatkozik minden olyan csapat, program, szakkör, edzés, rendezvény, esemény, tábor, amitől az Eötvös az Eötvös. Az eseményen az adott témában érintett diákok külön termekben, helyszíneken bemutatják, hogy mi az, amit ők csinálnak az adott program keretében. Az érkező felvételizők pedig forgószínpados megoldással mennek teremről-teremre. Amikor egy teremnél összegyűlt megfelelő számú érdeklődő, akkor kapnak egy rövid ismertetőt, akár valamilyen szóróanyagot a diákjainktól az adott tevékenységről/rendezvényről. (Ennek az ismertetésnek a formája nagyon vegyes lehet, a kórus énekelhet akár zenevilágnapos zenészekkel, a kosarasok játszhatnak a tornateremben, a színjátszósok bemutathatnak rövid performanszot, a bimunosok moderálhatnak egy rövid vitát angolul. Mindenki a saját profiljának megfelelő bemutatót tart.) Ha láttad a KlubExpot, kicsit ahhoz hasonlít, csak nagyobb területen van, és nem a már idejáróknak, hanem az idevágyóknak szól.  🙂',
        '["nyílt nap", "bemutatók"]'
    ),
    ("Ki Mit Tud?"
    ,"október 24.",
    "2024-10-24",
    "2024-10-25",
    "/events/KMT.jpg",
    "Idén is elérkezett az idő, hogy megmutassátok, milyen rejtett tehetségekkel rendelkeztek! Az Eötvös Napok keretein belül megrendezésre kerül a már jól ismert KiMitTud? verseny, amelynek időpontja: október 24.\n\nEz egy fantasztikus lehetőség arra, hogy színpadra lépj, megcsillogtasd képességeidet, és egyúttal szórakoztasd is diáktársaidat! Akár énekelsz, táncolsz, zenélsz, előadói készségeid vannak, vagy valami igazán különlegeset tudsz – itt a helyed! Bármilyen műfajban indulhatsz, a lényeg, hogy merd megmutatni, mire vagy képes.\n\nNe hagyd ki ezt az izgalmas lehetőséget! Jelentkezni október 10-ig tudtok az alábbi linken keresztül, egyéni vagy csoportos produkció előadására:\n\n\n<a href='https://docs.google.com/forms/d/1fQQXcE0NwIF0PPrHfKoHW9bsAumsDOJU8cN4eCC1I6s/edit' className='text-selfsecondary-700'>https://docs.google.com/forms/d/1fQQXcE0NwIF0PPrHfKoHW9bsAumsDOJU8cN4eCC1I6s/edit</a>\n\n\nTedd emlékezetessé az idei Eötvös Napokat – légy te az, akire mindenki emlékezni fog!\n\nVárjuk a jelentkezéseiteket!\n\nÜdvözlettel,\nEötvös DÖ és TechTeam",
    '["vetélkedő"]'
    ),
    (
        'Eötvös napok',
        'október 24. - 25.',
        '2024-10-24',
        '2024-10-26',
        '/events/eotvosnapok.jpg',
        NULL,
        '[]'
    ),
    (
        'Őszi szünet',
        'október 26. - november 3.',
        '2024-10-26',
        '2024-11-04',
        '/events/osziszunet.jpg',
        NULL,
        '[]'
    ),
    (
        'Szalagavató',
        'november 30.',
        '2024-11-30',
        '2024-12-01',
        '/events/szalagavato.jpg',
        NULL,
        '[]'
    ),
    (
        'Téli szünet',
        'december 21. - január 5.',
        '2024-12-21',
        '2025-01-06',
        '/events/szunet.jpg',
        NULL,
        '[]'
    ),
    (
        '1. félév vége',
        'január 17.',
        '2025-01-17',
        '2025-01-18',
        '/events/felevvege.jpg',
        NULL,
        '[]'
    ),
    (
        'Bizonyítványosztás',
        'január 24.',
        '2025-01-24',
        '2025-01-25',
        '/events/bizonyitvanyosztas.jpg',
        NULL,
        '[]'
    );
--@block
SELECT *
FROM events;
