CREATE TABLE IF NOT EXISTS signups (
    email VARCHAR(255) NOT NULL PRIMARY KEY,
    presentation_id INTEGER NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations(id)
);
--@block
SELECT *
FROM presentations;
DROP TABLE IF EXISTS signups;
--@block
DROP TABLE IF EXISTS presentations;
CREATE TABLE IF NOT EXISTS presentations (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    adress VARCHAR(255) NOT NULL,
    requirements VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL DEFAULT 0
);
INSERT INTO presentations (
        name,
        description,
        requirements,
        adress,
        capacity
    )
VALUES (
        'Központi Fizikai Kutatóintézet ',
        'A Központi Fizikai Kutatóintézetben két csoportban meg tudják nézni a Fúziós Plazmafizika, a Vékonyréteg-fizika és a Sugárbiztonsági Laboratóriumokat, a program végén pedig lenne egy kerekasztal-beszélgetés a kutatói lét mindennapjairól',
        '14 éves kortól, személyi febr 27-ig',
        '29-33. Konkoly-Thege Miklós út, Budapest, 1121',
        22
    ),
    (
        'Flavorchem & Orchidia Fragrances',
        'A látogatás során aromák gyártásával ismerkedhetnek meg azok, akik ezt a programot választják. A legjobban a kémia tantárgyhoz kapcsolódik, pályaválasztási oldálról pedig az élelmiszer-mérnöki karrierhez. De mindenkit érdekel, hogy mitől van valaminek pl. mandula íze. ',
        '',
        'Kerepes',
        20
    ),
    (
        'IFUA Horváth',
        'Az IFUA Horváth a vezetési tanácsadás egyik meghatározó szereplője Magyarországon. Segítünk a vállalatoknak jobb döntéseket hozni a pénzügyi tervezés, stratégia és vállalatirányítás területén, emellett üzleti intelligenciát és a legújabb elemzési technológiákat alkalmazzuk, hogy ügyfeleink hatékonyabban működhessenek. A látogatás során megnézzük, - hogyan segítette az IFUA a nemzeti hidrogénstratégia megalkotását, ami a klímasemleges átállás egyik fontos eszköze lehet,- hogyan támogathatják a vállalati döntéshozatalt a riportokba integrált chatbotok,- hogyan lehet meglévő adatokból a gépi tanulás segítségével eldönteni, hol nyisson új üzletet egy vállalkozás.',
        '14 éves kortól, 9-11. osztály',
        '117 Budapest, Buda-part tér 2. (5.emelet), bejárat a Dombóvári út 27.',
        16
    ),
    (
        'Központi Statisztikai Hivatal',
        'Mi zajlik a Központi Statisztikai Hivatalban? Infláció, demográfia, GDP és minden, ami számmal leírható és segít az elemzésben, tervezésben. Emellett a történelmi épületet is meg lehet ismerni a Mechwart Liger szélén. ',
        'személyi',
        '1024 Budapest, Keleti Károly utca 5-7.',
        20
    ),
    (
        'Continental Automotive Hungary Kft.',
        'A Continental A.H. Kft. budapesti üzemei kimagaslóan fejlett és innovatív járműelektronikai termékeket szállítanak a világ meghatározó autógyártóinak. Gyártási eszközei és szoftverei a legmodernebb ipar 4.0 megoldásokat megtestesítik meg, saját szoftverfejlesztő központjával hozzájárul a gyártási rendszerek globális integrációjához és a termelésük hatékonyságának növeléséhez. ',
        '',
        '1106 Budapest, Napmátka 6.',
        20
    ),
    (
        'Yettel Magyarország',
        'A Yettel a 5G technológia, a hálózatfejlesztés, a kiberbiztonság és a mesterséges intelligencia alkalmazásának élvonalában van. A diákok betekintést nyerhetnek a telekommunikációs innovációkba, a felhőalapú szolgáltatások működésébe és a digitális világ gyors fejlődésének kihívásaiba.',
        '',
        'Törökbálint, Pannon út 1.',
        20
    ),
    (
        'HUN-REN Társadalomtudományi Kutatóközpont - Politikatudományi Intézet',
        'A HUN-REN Politikatudományi Intézet a társadalomtudományi kutatás, a politikai elemzés és a közpolitikák vizsgálatának központja. A diákok megismerhetik a választási rendszerek, a döntéshozatal és a politikai kommunikáció működését, valamint a tudományos kutatás szerepét a társadalmi folyamatok megértésében.',
        '',
        '1097 Budapest Tóth Kálmán utca 4.',
        20
    ),
    (
        'Kiscelli Múzeum ',
        'A Kiscelli Múzeum a múzeumpedagógia, a kiállításrendezés és a muzeológia világába enged betekintést. A diákok megismerhetik a kortárs és történeti kiállítások létrehozásának folyamatát, a műtárgyvédelem jelentőségét, valamint a kulturális örökség megőrzésének izgalmas kihívásait. Szatmári Judit kurátor és divattörténész (a divat szakterület, nem minősítés) vezetésével ismerhetjük meg a múzeum világát. ',
        '',
        '1037 Budapest, Kiscelli utca 108.',
        20
    ),
    (
        'CCC Hungary Shoes Kft.',
        'A CCC pályaorientációs programja bepillantást enged a divatkereskedelem, a marketing, a PR és az üzleti stratégiák világába. A diákok megismerhetik a vizuális merchandising, a CRM kommunikáció és az üzleti KPI-ok működését, valamint kipróbálhatják az üzletek operatív folyamatait interaktív feladatok keretében.',
        '',
        '1134 Bp., Váci út 45, Átrium Park, H ép. 2. emelet',
        10
    ),
    (
        'Colonnade Insurance S.A. Magyarországi Fióktelepe',
        'A Colonnade Biztosító programja betekintést nyújt a biztosítási szektor, a kockázatelemzés, és a pénzügyi szolgáltatások világába. A diákok megismerhetik a biztosítási termékek működését, a kockázatkezelési stratégiákat, valamint a digitális megoldások szerepét a modern biztosítási folyamatokban.',
        '',
        '1123 Budapest Váci ut 23-27',
        20
    ),
    (
        'Bistro Reklámügynökség',
        'A Bistro Reklámügynökségnél betekintést nyerhetnek a kreatív marketing, a márkaépítés és a digitális kommunikáció világába. Megismerhetik, hogyan születnek a reklámkampányok, hogyan működik a PR és a social media stratégia, és milyen szerepet játszik a kreativitás és az adatvezérelt döntéshozatal a reklámiparban.',
        '',
        '1118, Budapest, Hegyalja út 44.',
        5
    ),
    (
        'Országos Onkológiai Intézet',
        'Az Országos Onkológiai Intézet programja betekintést nyújt az egészségügyi szakmák világába. Megismerhetik a kórház működését, különböző egészségügyi szakemberek munkáját, és részt vehetnek gyakorlati foglalkozásokon, ahol például sebészi varrást, újraélesztést és vénázást próbálhatnak ki modellen. A program során betegekkel nem találkoznak.',
        'szülői beleegyező nyilatkozat, egészség!!!',
        '1122 Budapest, Ráth György utca 7-9.',
        20
    ),
    (
        'HungaroControl',
        'A HungaroControlnál betekinthetnek a légiforgalmi irányítás izgalmas világába. Megismerhetik, hogyan működnek a radarrendszerek, a légtérmenedzsment, és hogyan támogatja a mesterséges intelligencia és a szimulációs technológia a légiközlekedés biztonságát. Kipróbálhatják, milyen egy irányító munkaállomás és hogyan zajlik egy repülés koordinálása.',
        'szülői beleegyező nyilatkozat, személyi igazolvány szám',
        '1185 Budapest, Igló utca 33-35.',
        20
    ),
    (
        'E.ON Hungária Csoport',
        'Az E.ON Hungária Energia Parkban, Fóton megismerhetik a megújuló energiaforrások, az okoshálózatok és az energiahatékonyság szerepét a fenntartható jövőben. Betekinthetnek az elektromobilitás, a napelemrendszerek és az akkumulátoros energiatárolás működésébe, valamint megtudhatják, hogyan járul hozzá az energiainnováció a klímavédelemhez.',
        '',
        '2151 Fót, Vörösmarty Mihály tér 2',
        22
    ),
    (
        'MBH Befektetési Bank',
        'A történelmi belváros egyik legszebb épületében működő MBH Banknál betekinthetnek a pénzügyi szolgáltatások, a befektetések és a digitális bankolás világába. Megismerhetik, hogyan működnek a hitel- és kockázatelemzés, a vállalati és lakossági banki szolgáltatások, valamint a pénzügyi szektorban egyre nagyobb szerepet játszó fintech és digitális megoldások.',
        '',
        'Budapest V. ker Váci utca 38.',
        20
    ),
    (
        'Prezi',
        'Az alapító-tulajdonos vár minket egy izgalmas utazásra érdeklődésről, inspirációról és sikerről. Somlai-Fischer Ádám megmutatja, hogy a világsikerű startup hogyan indult, az ő karrierjében milyen helye van a művészetnek, a zenének, a tervezésnek és az újratervezésnek. ',
        '',
        'Nagymező utca 54-56 Prezi Irdoa',
        30
    ),
    (
        'BME INYK Tolmács- és Fordítóképző Központ',
        'Elsősorban azoknak a diákoknak, akiket érdekel a fordítás, fordítástechnológia és szeretnének bepillantást nyerni egy egyetemi belső fordítóiroda működésébe. Továbbá azoknak, akik kíváncsiak arra, hogy a fordítástechnológia és a mesterséges intelligencia hogyan dolgoznak össze és segítik a fordítók munkáját (Nem pedig helyettesítik azt. :) )',
        '',
        'Budapest, Egry József u. 1, 1111 E épület 806. ',
        20
    ),
    (
        'Gránit Alapkezelő ',
        'A Gránit Alapkezelőnél betekinthetnek a befektetések és a vagyonkezelés világába. Megismerhetik az ingatlan-, értékpapír- és magántőke-befektetések működését, valamint a kockázatkezelés, a sales, a marketing, és az ingatlanüzemeltetés szerepét a pénzügyi szektorban. Közgazdaságtan és üzleti jog iránt érdeklődőknek különösen hasznos program.',
        '',
        '1134 Budapest Kassák Lajos utca 19-25',
        20
    ),
    (
        'SZTFH Földtani Szolgálat Gyűjteményi Osztály',
        'A Magyar Királyi Földtani Intézet egykori épületében lehetőségük nyílik egy kötetlen épületsétára, amely során megismerhetik az intézet történetét és az épület különleges műemléki értékeit. A program során tudományos igényű beszélgetésre is lesz lehetőség, különösen a földtani kutatások, a természettudományos örökség és a földtan szerepe kapcsán.',
        '',
        'Budapest, XIV. Stefánia út 14.',
        30
    ),
    (
        'Nemzeti Népegészségügyi és Gyógyszerészeti Központ',
        'A Nemzeti Népegészségügyi és Gyógyszerészeti Központ (NNGYK) budapesti központjában lehetőségük nyílik 2-3 órás program keretében megtekinteni a kémiai, ökotoxikológiai és mikrobiológiai laboratóriumokat, beleértve azt a szennyvízvizsgáló laboratóriumot is, ahol a COVID-19 és influenza előrejelzéséhez szükséges vizsgálatok zajlanak. A program során betekintést nyerhetnek a közegészségügyi kutatások és elemzések gyakorlati folyamataiba, valamint megismerhetik a laboratóriumi munka mindennapjait.',
        '',
        '1097 Budapest, Albert Flórián út 2-6.',
        20
    ),
    (
        'Utiber Kft (út- vasút mérnoki)',
        'Az Utiber Kft.-nél betekinthetnek a közlekedési infrastruktúra tervezésének és kivitelezésének világába. Megismerhetik, hogyan zajlik egy út- és hídépítési projekt, milyen szerepet játszanak a mérnöki modellezések, a környezetvédelmi szempontok, és hogyan használják a legújabb digitális tervezési technológiákat az építőiparban.',
        '',
        'Budapest, Csóka u. 7-13, 1115',
        30
    ),
    ('egy cég véglegesítés alatt', '', '', '', 30),
    (
        'Varian Medical Systems Hungary Kft.',
        'A Varian Medical Systems Hungary Kft. azoknak az informatika és villamosmérnöki területek iránt érdeklődő diákoknak kínál betekintést, akik társadalmilag hasznos célért szeretnének dolgozni. Our Mission: A World without Fear of Cancer. Megismerhetik, hogyan járulnak hozzá a legmodernebb orvostechnológiai fejlesztések a rákkezeléshez és a betegek életminőségének javításához.',
        '',
        '1124 Budapest, Csörsz u 45.',
        20
    ),
    (
        'BKV ZRT - 4-es metró irányítás',
        'Érdekel, ki vezeti a 4-es metrót? A BKV 4-es metró telephelyén betekinthetnek a metróüzemeltetés kulisszatitkaiba. Megismerhetik, hogyan működnek az automata szerelvények, milyen szerepe van a forgalomirányításnak, a karbantartásnak és a biztonsági rendszereknek, valamint hogyan zajlik egy metróvonal mindennapi üzemeltetése.',
        '',
        '',
        20
    ),
    (
        'Boros Maja szabadúszó: Követő és szinkrontolmácsolás',
        'Érdekel, hogyan dolgoznak a tolmácsok élő eseményeken? Boros Maja szabadúszó tolmács bemutatja a követő és szinkrontolmácsolás világát. Megismerhetik, milyen készségekre van szükség ehhez a kihívásokkal teli szakmához, hogyan lehet valós időben pontosan fordítani, és milyen technikai eszközök segítik a tolmácsok munkáját.',
        '',
        '1053 Budapest, Reáltanoda u. 7. ',
        20
    ),
    (
        'Európai Bizottság/EU-óra',
        'Érdekel, hogyan működik az Európai Unió? Az Európa Pontban lehetőségük nyílik találkozni az Európai Bizottság és az Európai Parlament magyarországi munkatársaival. Megismerhetik az EU döntéshozatali folyamatait, a nemzetközi együttműködés szerepét, és hogy milyen lehetőségeket kínál az EU a fiatalok számára.',
        '',
        'Európai Unió Háza - 1024 Budapest, Lövőház u. 35.',
        30
    ),
    (
        'GE Healthcare',
        'Érdekel, hogyan készülnek a legmodernebb orvosi képalkotó eszközök? A GE Healthcare pátyi gyárában betekinthetnek a radiológiai berendezések gyártási folyamataiba. Megismerhetik, hogyan készülnek a CT- és MR-képalkotó rendszerek, milyen szerepe van az automatizációnak és a precíziós gyártástechnikának, valamint hogyan járulnak hozzá ezek az eszközök a betegellátás fejlődéséhez.',
        '',
        'npark Business Park, Building H, 2071 Páty, Csonka János utca 1-3',
        15
    ),
    (
        'Inda Galéria',
        'Érdekel, hogyan működik egy kortárs művészeti galéria? Az Inda Galériában betekinthetnek a kortárs művészet világába. Megismerhetik, hogyan zajlik egy kiállítás szervezése, milyen szerepe van a kurátornak és a műkereskedelemnek, valamint hogyan segíti egy galéria a művészeket és műveik nemzetközi bemutatását.',
        '',
        'Budapest, Király u. 34, 1061',
        20
    ),
    (
        'Magyar Ökomenikus Segélyszervezet',
        'Érdekel, hogyan lehet valódi segítséget nyújtani rászorulóknak? A Magyar Ökumenikus Segélyszervezetnél betekinthetnek a humanitárius segélyezés és a szociális munka világába. Megismerhetik, hogyan támogatják a rászorulókat Magyarországon és nemzetközi szinten, többek között Ukrajnában, Etiópiában és Afganisztánban, valamint milyen készségekre van szükség a segélyszervezeti munkához.',
        '',
        '1221 Budapest, Kossuth L. u. 64',
        15
    ),
    (
        'Munch Europe Kft. ',
        'A Munch Europe a fenntarthatóság és az élelmiszermentés területén kínál innovatív megoldásokat. Megismerhetik, hogyan működik a felesleges élelmiszerek megmentésére épülő üzleti modell, milyen szerepe van a digitális platformoknak a fenntartható fogyasztásban, és hogyan csökkenthető a pazarlás a vendéglátás és a kiskereskedelem területén.',
        '',
        '1051 Budapest Hercegprímás utca 18.',
        10
    ),
    (
        'CIRKO-GEJZÍR FILMSZÍNHÁZ',
        'A Cirko-Gejzír Mozi egy egyedülálló artmozi, amely a független filmek, a dokumentumfilmek és az európai művészmozi világába enged betekintést. Megismerhetik a filmforgalmazás, a vetítéstechnika és a kulturális menedzsment kulisszatitkait. Filmvetítéssel és beszélgetéssel. ',
        '',
        '',
        0
    );
UPDATE presentations
SET remaining_capacity = capacity;