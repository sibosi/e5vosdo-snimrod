--@block
DROP TABLE carousel;
CREATE TABLE IF NOT EXISTS carousel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uri VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT
);
INSERT INTO carousel (uri, title, description)
VALUES
--    ('/events/osziszunet.jpg', 'Boldog őszi szünetet!', 'Találkozunk november 4-én!'),
--    ('/groups/bimun.jpg', 'BIMUN Day', 'Kedves Diákok! \n\nMint már sokan tudjátok, idén is megrendezésre kerül a Bimun tavasszal az iskolánkban. Mivel mi, az egész organiser csapattal úgy tartjuk, hogy a konferencia egy kihagyhatatlan élmény egy eötvösös diák életében, szeretnénk megismertetni veletek a betölthető pozíciókat és a felejthetetlen hangulatot, ezért holnap várunk titeket sok szeretettel a BIMUN Day-en! \n\nNézzetek körül holnap, a 2-5. szünetben a második emeleti folyosókon és ismerjétek meg a szervező csapat tagjait, nézzetek körül az állomásokon, játszatok velünk és persze ha kérdésetek van, tegyétek fel, mert mi nagyon szívesen válaszolunk!\n\nAzok akik az összes állomás játékát teljesítik, a büfénél ínycsiklandó nyereményt is kaphatnak. \n\nA pozíciókra való jelentkezés holnap megnyílik, az alábbi linken találjátok: https://www.bimun.hu/registration \n\nReméljük sokatokkal találkozunk holnap, és átadhatjuk nektek a Bimun hangulatát! Gyertek legyetek részesei Ti is a BIMUN csapatának!\n\nÜdvözlettel,\nOrganiser Team'),
--    ('/events/santaletter.jpg', 'Mikulás-üzenetküldés', 'Kedves Diákok!\n\nA büféhez kikerültek a mikulás zsákok, szerda 15:30-ig tudtok üzenetet küldeni diáktársaitoknak, tanáraitoknak.\n\nÜdvözlettel,\nEötvös DÖ Kormány'),
    ('/groups/diak.jpg', 'Pénteki workshop\nEötvös Diák', '/(Az Eötvös Diák gimnáziumunk iskolaújsága.)/\nSzervezünk egy tördelés workshopot nem csak a tördelés iránt érdeklődőknek, aminek időpontja december 6-a 15:30, vagyis most péntek (valószínűleg a 209-ben)! Megmutatom nektek a tördelés alapjait és lesz nasi is úgyhogy nem csak a tördelés iránt érdeklődőknek lesz érdemes benézni!'),
    ('/events/faragatlanok.jpg', 'FARAGATLANOK\nOlasz komédia', 'Kedves Diákok!\n\nDecember 13-án adjuk elő a Díszterem színpadán az általam fordított és rendezett, Carlo Goldoni: Faragatlanok c. olasz komédiát, amely a nyár eleji premierjén már nagy sikert aratott az RS9 Színházban.\n\nKét időpontban fogjuk előadni a darabot ezen a pénteki napon:\n13:30-tól (a 6-7. órában)\nés\n17:00-tól\nEötvös-diákok mindkét időpontra kedvezményesen, 1000 Ft-ért szerezhetnek jegyet. A jegyek hozzáférhetők a szereplőknél és a Büfében egyaránt.\n\nÉrdeklődőknek lejjebb mellékelem a darab szinopszisát és a plakátunkat.\nVárunk Titeket szeretettel, gyertek sokan!\n\nÜdvözlettel,\nSchreck Péter, 12. F'),
    ('/events/santa-streetball.jpg', 'Mikulás Streetball\nbajnokság', 'Kedves Diákok!\n\nDecemberben újra megmozdul a pálya, hiszen Mikulás alkalmából egy izgalmas kosárlabda bajnokságra invitálunk titeket! Ha szereted a kosárlabdát, és kipróbálnád magad egy remek közösségben, mindenképp jelentkezz!\n\nMikulás Streetball Bajnokság\nDátum: December 11. - Szerda\nIdőpont: 15:30\nHelyszín: Nagytornaterem\n\nProgramok:\n-3v3 Streetball Verseny\n-Hárompontos Dobó Verseny\n\nVersenyszabályok:\nA streetball verseny szabályait megtaláljátok az alábbi linken:\nhttps://docs.google.com/document/d/17N-Nmv7JalgSRprcbrjJOJMukUVEpbMfJLF4Bc-_Bsk/edit?tab=t.0\n\nJelentkezés:\n3v3 Streetball Verseny:\nhttps://docs.google.com/forms/d/1Z_LaBy0dlI2ZRTfRMMTXCFDu1mvkJmRftqN4RmePUMo/edit?ts=674e2b6b\n\nHárompontos Dobó Verseny: https://docs.google.com/forms/d/e/1FAIpQLSdGVYOkZ0_Rh_rmZ375BE3-Zb5I6p0cGfrpktbLpdHUUO_R_g/viewform?usp=sf_link\nÁlljatok össze egy csapattal a streetballra, vagy jelentkezzetek egyénileg a hárompontos dobó versenyre, és mutassátok meg, mit tudtok!\nNe hagyjátok ki ezt az izgalmas eseményt – várunk titeket szeretettel a pályán!\n\nÜdvözlettel,\nEötvös DÖ Kormány'),
    ('groups/kosar.jpeg', 'Kosarazz az\n Eötvösben!', 'Örömmel jelentjük be, hogy a megszokott módon idén is elindultak a fiú kosárlabda edzések. A “szakkör” célja az, hogy felkészüljünk a Diákolimpia “B” kategóriás kosárlabda bajnokságra. Elsősorban a játék szeretetéért kosárlabdázunk, de ezzel együtt nyerni is szeretnénk. Ehhez először a regionális bajnokság fordulóiban, majd pedig az országos bajnokságban kell felülkerekednünk ellenfeleinken.\n\nHabár új névvel folytatjuk tovább, az elán megmaradt, és az eddigieknél talán még több effortot fordítunk a csapat népszerűsítésére. A névadás egy hosszabb folyamatot vesz majd igénybe, ezért a végleges név megszületéséig a csapatra E5vös Basketball Teamként fogunk hivatkozni, vagy csak úgy, mint a Kosárcsapat.\n\nGyere le edzésre vagy szurkolni, mert megéri!\n\nHa edzésre jönnél:\n\nSzívesen várunk mindenkit, aki szeretné magát kipróbálni a kosárpályán, illetve szeretne tagja lenni egy összetartó, egymást segítő, vidám közösségnek.\n\nKezdők és haladók egyaránt jöhetnek, de fontos, hogy csak az játszhat a Diákolimpia mérkőzésein, aki legalább 1 éve nem igazolt játékos.\n\nHa szurkolni jönnél:\n\nAhogy már Thuküdidész is megmondá: “Az Eötvösnek szurkolni felettébb fontos, mivel (…)” - csak viccelünk, Thuküdidész sajnos nem mondott ilyet 😉.\n\nLégy részese Te is annak a felemelő élménynek, hogy együtt, egy célért, az iskola továbbjutásáért szurkolsz, miközben a csapatot győzelemhez segíted, vagy egy esetleges vereség esetén támogatod. Eötvösös rigmusok skandálásával, dobbal, dudával, hangosbeszélővel tehetjük a szurkolást még hangulatosabbá. De ez még nem minden!\n\nAz Eötvös Médiával való tartós együttműködés keretében fotóanyagokkal tudjuk megörökíteni a meccsek legjobb pillanatait. (Videózni is tervezünk, de az már nem a Média hatásköre lesz.)\n\nAz Eötvös DÖ-vel való alkalmi együttműködések keretében igyekszünk feldobni a meccsnézés és szurkolás felejthetetlen élményét. Habár ezeket rendszeresen nem tudjuk garantálni, több alkalommal lesznek közösen szervezett programok, illetve lesz, hogy segítenek szurkolást segítő elemekben: Akár kajáról, akár megvalósítható sportfogadásról, akár valami másról lesz szó. A konkrét részletekről majd később írunk.\n\nHa érdeklődnél az edzésekről vagy a csapatról, akkor nyugodtan vedd fel velünk, edzőkkel a kapcsolatot.\n\nAz edzők:\nNagy Barnabás 12. e\nnagy.barnabas@e5vos.hu\n\nNyerges Tamás 12. e\nnyerges.tamas@e5vos.hu\n\nMindenképp kövess be minket hivatalos social media oldalainkon, ahol rendszeres contentekkel, a legújabb információkkal, többek között a várható meccsidőpontokkal érkezünk.\n\nInstagram: https://www.instagram.com/e5vos.basketball/\nFacebook: https://www.facebook.com/profile.php?id=61568996802794\n\nRemélem, hogy kedvet kaptál ahhoz, hogy részesévé válj a csapat életének, akár szurkolóként, akár játékosként.\n\nKöszönöm, hogy végigolvastad az e-mailt.\n\nÜdvözlettel:\nNyerges Tamás, csapatkapitány\na Kosárcsapat nevében.\n\nEötvös Basketball Team\nsince 1935'),
    ('/groups/szinjatszo.png', 'Szervezz\nfarsangot!', 'Kedves Diákok!\n\nIdén arra gondoltunk, hogy egy új programot vezetnénk be, egy egész iskolának szóló farsangot. \n\nViszont ehhez a segítségetekre lenne szükségünk, mert egyelőre kevesen vannak a szervezői csapatban.\n\nA főszervező a 8.A osztály lenne, a DÖ csak segítőként venne részt a program kivitelezésében. \n\nÍgy hát aki szeretne egy ütős buli megszervezésében részt venni, az jelentkezzen a formson:\n\nhttps://forms.gle/RBjS1SNa4fzvVwVh7\n\nÜdvözlettel,\n8.A és az Eötvös DÖ'),
    ('https://web.ejg.hu/wp-content/uploads/Schmieder_Laszlo.jpg', 'Ericsson dij 2024\nSchmieder László', 'https://www.youtube.com/watch?v=JH6k2rxXOr0'),
    ('https://www.millennium-project.org/wp-content/uploads/2024/05/voices_of_the_future.png', 'Voices of the Future\nÉnekkar - jelentkezz!', 'Kedves Diákok!\n\nEgy életre szóló lehetőség előtt álltok! Na de a drámai kezdés után mire is gondolok: Iskolánk énekkara meghívást kapott, hogy részt vegyen a Budafoki Dohnányi Zenekarral közösen egy rendkívüli koncerten, ahol Carl Orff: Carmina Burana című mesterművét adjuk elő. Az előadásra 2025. március 30-án, vasárnap este kerül sor a Művészetek Palotájában, Budapest szívében. Sajnos (vagy éppen nem sajnos) az énekkar éves koncertnaptára rendkívül telített lett, ezért nem tudtunk már új felkérésnek eleget tenni, de most lehetőséget biztosítok mindenkinek, aki szeretne csatlakozni ehhez a páratlan élményhez. Akár kórusos vagy, akár nem, ha mindig is vágytál arra, hogy egy ilyen nagyszabású zenei projekt részese légy, most itt a lehetőség! Ezt a művet azokkal a diákokkal tanuljuk és adjuk elő, akik szeretnének részt venni, és vállalják ezt a kihívást.\n\nA projekt során nem csak mi fogunk énekelni: egy egyesített kórus áll majd össze, amely körülbelül 250-300 főből, 14-20 éves középiskolás diákból fog állni. Az előadást Hollerung Gábor, kiváló karmester vezényli, és a Budafoki Dohnányi Zenekar kíséri. \n\nA koncertre 2025. március 30-án, vasárnap este kerül sor, és ezen a napon, délelőtt lesz a főpróba. A zenekari próba egy nappal korábban, március 29-én, szombaton lesz, budapesti vagy környéki helyszínen.\n\nA műből külön kóruspróbákat tartunk "házon belül" várhatóan hetente-két hetente, előre megbeszélt, fix időpontokban, valószínűleg főként hétvégén. Lehet hogy a suliban, lehet külső helyszínen tartunk próbát, ez még nagyon képlékeny, egyeztetnem szükséges ezügyben. Minden résztvevőnek szólamtanuló anyagokat is kell otthon hallgatnia a találkozások között, és így minden probléma nélkül abszolválható lesz a mű megtanulása. Az összevont próba, amely minden résztvevő iskola számára kötelező, 2025. március 15-16-án, szombat-vasárnap lesz megtartva Dohnányi Zenekar próbatermében (Stadionok metróállomáshoz közel)\n\nTudom, hogy a Carmina Burana nagy kihívás, és ez egy nagy projekt de kérlek ne ijedjetek meg! A mű hatalmas élményt nyújt, és bár elsőre talán nehéznek tűnik, hamar rá fogtok érezni a ritmusára és varázsára. Egy ilyen darabnak a részese lenni életre szóló élmény, és biztos vagyok benne, hogy aki jelentkezik, az élvezni fogja a próbák és a koncert során szerzett élményeket.\n\nLétszámtól függetlenül próbálni fogunk, ha 100-an, ha 10-en jövünk össze a suliból, ezen ne aggódjon senki. Lehet, hogy olykor a más sulival közösen is lesz próba, ugyanis engem megkértek, hogy más iskolákban is tartsak próbákat, lehet, hogy néha ötvözzük a két társaságot. (meg persze aki túlbuzgó az oda is jöhet próbálni :))\n\nKérek mindenkit, hogy aki csatlakozna, az legyen oly kedves csütörtök estig jelentkezni, mert akármennyire hiszem azt, hogy könnyű a mű, azért nincs hátra olyan sok idő.\n\nKedvcsinálónak csatolok néhány híres (és egyben talán legnehezebb) részletet.\n\n\n\nhttps://www.youtube.com/watch?v=GXFSK0ogeg4\n\nhttps://www.youtube.com/watch?v=j-X5z4UH9v0\n\nhttps://www.youtube.com/watch?v=Dfz89UVbLAA\n\n\n\nSzeretettel,\n\nNZ');
--    ('https://i1.sndcdn.com/artworks-OKpHDxJXKqw6Nepg-5XyylQ-t500x500.jpg', 'HVG Podcast\n"Nem vagyunk versenyistálló"', 'A hallgatáshoz kattins a "listen in browser"-re<br/><iframe        width="100%"        height="166"        scrolling="no"        frameborder="no"        allow="autoplay"        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1941990415&color=ff5500"      ></iframe>      <div        style={{ fontSize: "10px", color: "#cccccc", lineBreak: "anywhere", wordBreak: "normal", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontFamily:   "Interstate, Lucida Grande, Lucida Sans Unicode, Lucida Sans, Garuda, Verdana, Tahoma, sans-serif", fontWeight: 100,        }}      >        <a href="https://soundcloud.com/hvgonline" title="HVG Podcastok" target="_blank" style={{   color: "#cccccc",   textDecoration: "none", }}        > HVG Podcastok        </a> · <a href="https://soundcloud.com/hvgonline/nem-vagyunk-versenyistallo-a-hvg-kozepiskolai-rangsoranak-elen-allo-eotvos-igazgatoja-a-fulkeben" title="„Nem vagyunk versenyistálló” – A HVG középiskolai rangsorának élén álló Eötvös igazgatója a Fülkében" target="_blank" style={{   color: "#cccccc",   textDecoration: "none", }}>„Nem vagyunk versenyistálló” – A HVG középiskolai rangsorának élén álló Eötvös igazgatója a Fülkében</a></div>'),
--    ('/e5podcast_food.png', 'Új Podcast\nÉtelek', '<Player />');
--    ('/events/eotvosnapok.jpg', 'Ajánlott programok', 'https://info.e5vosdo.hu/api/programok');
--    ('https://spartacusbubblesoccer.co.uk/wp-content/uploads/2023/12/Nerf-Guns-and-Ammunition-on-Grass-02-1024x657.jpg', 'Nerf Csata\n13:30-16 | 307. terem', 'Kedves Mindenki, \nHolnap a 307-es teremben az osztályunk nerf csatát rendez, 13:30-16:00-ig. A játék részleteiről majd a helyszínen tájékoztatunk mindenkit, de gyertek a barátaitokkal együtt, max hatan-heten. \nVárunk titeket!\n9.b'),
--    ('/events/turi2.jpg', 'Eötvös Turi\nA 108-as teremben', 'Kedves E5vösösök!\n\nEmlékeztetni szeretnénk Titeket, hogy az E5vös Turi idén is megrendezésre kerül. Továbbra is hozhattok jó állapotú ruhákat, játékokat és ékszereket a 108-as terembe. Mindenkit várunk csütörtökön és pénteken (délután) ezen a hangulatos eseményen!\n\nSzép estét,\na 11.B és a 7.B'),
--    ('/events/KMT.jpg', 'Ki Mit Tud?\n18:00-tól - díszt.', 'Kedves Diákok!\n\nItt a KiMitTud? fellépők sorrendje és egy leegyszerűsített időrend:\n\nKezdés 18:00-kor\nKiss Lilla, Kovács Petra - zongora és hegedű\nNagy Matyi - monodráma\nVida Bálint - ének\nPulay Johanna, Veres Rebeka - fuvola és zongora\n\n15 perces szünet\nDynamos - ének\nÁdány Barnabás, Boros Marcel - ének és színi játék\nKovács Gregor - zongora\nVirág Máté - standup\n\n15 perces szünet\nBoBoBoys - BoBoBoys\n\n(Tervezett) vége: 20:40\nNagy szeretettel várunk mindenkit!\n\nEötvös Dö és TechTeam'),
--    ('/groups/tarsastar.jpg', 'TársasTár\n14-18 óra között', 'Tisztelt Eötvös Népe,\n\nÖrömmel jelentjük be, hogy az Eötvös Napok alatt, csütörtökön 14:00-18:00 időpontban bepótoljuk a szeptemberben elmaradt Társas Délutánt. Várunk titeket a 202-es teremben!'),
--    ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRynmwLZGWc0lLT5KTYMezeRJpvLqByliQeiw&s', 'Szabadulószoba\n305-ös teremben', 'Kedves Eötvös Népe!\n\nÖrömmel jelentjük, hogy a mostani Eötvös - napok keretében szabaduló szobát rendezünk a 305-ös teremben mind a két napon.\nA szabadulószoba témája: Alice csodaországban. \nJelentkezni kb. hat fős csapatokban lehet az alábbi táblázatban. Akiket érdekel, légyszí írják be magukat, hogy minden gördülékenyen menjen.\n\nhttps://docs.google.com/spreadsheets/d/1-qpUYrOgppTGuABqvT8nFlFgn12iHDR54VWWyTwqX3U/edit?usp=drivesdk\n\nVárunk titeket szeretettel!\n11.F'),
--    ('/groups/bimun.jpg', 'BIMUN szoba\n14-16 | 200-as terem', 'Kedves Eötvös népe!\n\nHolnap 14:00-16:00-ig vár minden kedves érdeklődőt a BIMUN szoba, a 200-as teremben! Ha érdekel a BIMUN, és hogy hogyan vehetsz részt egy több száz fős nemzetközi konferencián, akkor mindenképp érdemes ellátogatnod!\nOtt találkozunk, és egy kis finomsággal is készülünk nektek! ✨🧇\n\nÜdvözlettel,\nBIMUN Organisers 🌍'),
--    ('/groups/epas.png', 'EPAS szoba\nFöci terem (10.)', 'Kedves Diákság!\nIdén a földrajz terembe (10-es) megrendezésre kerül az EPAS szoba, ahol érdekes és vicces vitatémák illetve egy Kahoot is vár titeket!\nSzeretettel várunk titeket!\nEPAS csapat'),

--    ('/events/e5n_eloadas.jpg', 'E5N - Gyere\nelőadónak!', 'Kedves Diákság!\n\nÖrömmel értesítünk benneteket, hogy az előadók jelentkezési határidejét október 17-ig meghosszabbítottuk. Szeretnénk mindenkinek további lehetőséget biztosítani, hogy csatlakozzon az Eötvös Napok előadásaihoz előadóként.\n\nAz előadássávok a következőek:\n\n\nCsütörtök (10.24.)\n\n9:00-9:45 - első előadássáv\n\n10:00-10:45 - második előadássáv\n\n\nPéntek(10.25.):\n\n10:15-11:00 - első előadássáv\n\n11:15-12:00 - második előadássáv\n\n\nA további részletek a forms leírásában találhatók, ha bármi egyéb kérdés, bizonytalanság vagy probléma merül fel az előadásokkal kapcsolatban, nyugodtan keressetek minket! \n\nhttps://forms.gle/uBgrZ4GVznmLaDfs5 \n\n\nÜdvözlettel,\n\nEötvös DÖ Kormány'),
--    ('/events/ropi.jpg', 'E5N röpi\n13-tól | nagytesi', 'Kedves Diákok!\n\nAz Eötvös Napok sportprogramjai idén is izgalmas kihívásokkal várnak titeket! Két nagyszerű bajnokságra invitálunk benneteket a csütörtöki nap folyamán, ahol megmutathatjátok, mire vagytok képesek, és összemérhetitek tudásotokat a legjobbakkal.\n\nEötvös Röplabdabajnokság\nDátum: Október 24.\nIdőpont: 13:00 órától\nFormátum: Egyenes kiesés\n\nLink a jelentkezéshez: \nhttps://docs.google.com/forms/d/e/1FAIpQLSe-4UgdQSVdLFcigG-tD3b-QLg8EX2H9EQnV2ipBnno128gCg/viewform?usp=sf_link\n\nAz alábbiakban találjátok a részletes szabályokat:\n-A szabályokat helyben fogjuk ismertetni, 15 pontos meccseket fogunk játszani.\n\nNe maradjatok ki! Álljatok össze a csapattal, és jelentkezzetek minél előbb!\n\nÜdvözlettel,\nEötvös DÖ Kormány'),
--    ('/events/ropi2.jpg', 'E5N foci\n15-től | nagytesi', 'Kedves Diákok!\n\nAz Eötvös Napok sportprogramjai idén is izgalmas kihívásokkal várnak titeket! Két nagyszerű bajnokságra invitálunk benneteket a csütörtöki nap folyamán, ahol megmutathatjátok, mire vagytok képesek, és összemérhetitek tudásotokat a legjobbakkal.\n\nEötvös Focibajnokság\n\nDátum: Október 24.\n\nIdőpont: 15:00 órától\n\nFormátum: Egyenes kiesés\n\nLink a jelentkezéshez: https://docs.google.com/forms/d/e/1FAIpQLSf6srNePqFJmmgF7rthM5YHvmT3nTlsPLp_QUpyHcv0Vc7rHA/viewform?usp=sf_link\n\nAz alábbiakban találjátok a részletes szabályokat:\n\n-A focibajnokság alatt minden résztvevő a következő szabályokat köteles tiszteletben tartani: \n-A mérkőzések 10 percesek, két 5 perces félidőre bontva.\n-A labda csakis akkor kerül ki játékból, ha a játékteret az alapvonalon hagyja el(vagy bordásfal mögé beesik). Ilyenkor a kapustól, földről indul újra a játék.\n-A labdát hazaadni nem lehet, azaz a csapattárstól érkező passzt a kapus kézzel nem foghatja meg.\n-Különösen veszélyes és agresszív megmozdulások piros lappal büntetendők, ilyenkor a büntetett játékos 2 percig nem állhat vissza a játékba(azaz le sem cserélhető) és csapata emberhátrányban folytatja a mérkőzést.\n-Ezenfelül a megszokott szabályok érvényesek a kezezésre, a kapus területére és a szabadrúgásokra.\n-A kirúgást csak a földről lehet elvégezni\n\nÜdvözlettel,\n\nEötvös DÖ Kormány\n');

--    ('https://supercell.com/images/1a5b69311180a4a1c374e10556941f05/1681/hero_bg_brawlstars.a385872a.webp', 'Brawl Stars\nbajnokság', 'Brawl Stars bajnokság\nIdőpont: 13:30-tól\nA versenyre 3 fős csapatok jelentkezését várjuk, részletek és jelentkezés az alábbi linken:\nhttps://docs.google.com/forms/d/e/1FAIpQLSfTvdRfKZaKRQU3fgGDo2QTAd_fKuy7b7VtkCKx4UceLCCJEw/viewform?usp=sf_link\nA bajnokságokra vasárnapig lehet jelentkezni (okt 20.).\nVárunk mindenkit sok szeretettel, a programok pontos helyszíneiről hamarosan tájékoztatunk Benneteket!'),
--    ('https://media.istockphoto.com/id/1425158165/photo/table-tennis-ping-pong-paddles-and-white-ball-on-blue-board.jpg?s=612x612&w=0&k=20&c=KSdi4bEGoxdhaGMnl6CZaqTLbKbobArgrrpLem3oN98=', 'Pingpong-\nbajnokság', 'Pingpongbajnokság\nIdőpont: 15:00-tól\nJelentkezés az alábbi linken:\nhttps://docs.google.com/forms/d/e/1FAIpQLSeraj4ul12o09Oe7lruexn1dU7EVQC8CXA4SdZKtyZc-8D8uQ/viewform?usp=sf_link\nA bajnokságokra vasárnapig lehet jelentkezni (okt 20.).\nVárunk mindenkit sok szeretettel, a programok pontos helyszíneiről hamarosan tájékoztatunk Benneteket!'),
--    ('https://openclipart.org/download/228573/1443610712.svg', 'Ninja\nWarrior', 'Pingpongbajnokság\nIdőpont: 15:00-tól\nJelentkezés az alábbi linken:\nhttps://docs.google.com/forms/d/e/1FAIpQLSeraj4ul12o09Oe7lruexn1dU7EVQC8CXA4SdZKtyZc-8D8uQ/viewform?usp=sf_link\nA bajnokságokra vasárnapig lehet jelentkezni (okt 20.).\nVárunk mindenkit sok szeretettel, a programok pontos helyszíneiről hamarosan tájékoztatunk Benneteket!'),
--    ('/events/spikeball.jpg', 'Spikeball', 'Spikeball\nIdőpont: 15:00-tól\nA Spikeball egy gyors tempójú, ütős labdajáték, amelyet négy játékos játszik két csapatban egy kisméretű háló körül, a földön. A játék célja úgy visszaütni a labdát a hálóra, hogy az ellenfél ne tudja azt visszaadni, hasonlóan a röplabdához.\nA bajnokságokra vasárnapig lehet jelentkezni (okt 20.).\nVárunk mindenkit sok szeretettel, a programok pontos helyszíneiről hamarosan tájékoztatunk Benneteket!'),
--    ('/events/e5merch.png', 'E5 Merch\nrendelés', 'Kedves Diákság!\n\n\nÖrömmel értesítünk titeket, hogy megérkeztek az új Eötvös-merch termékek, amelyek mostantól megvásárolhatók. Kínálatunkban megtalálhatóak a kényelmes pulóverek, praktikus kulacsok és környezettudatos vászontáskák, amelyek tökéletesen illeszkednek a mindennapi élethez és iskolai tevékenységekhez.\n\nRendelési határidő: okt. 25\n\nMit kínálunk?\n\nEötvös pulóver\nKulacs\nVászontáska\nAmellett, hogy ezek a termékek hasznosak, kiváló módot kínálnak arra is, hogy kifejezd a kötődésed iskolánkhoz.\n\nTekintsd meg a teljes kínálatot itt:\n\nhttps://pullowear.hu/termekkategoria/ejg/?fbclid=IwZXh0bgNhZW0CMTEAAR26FQl4iDNW5RqN8egTt4lGapag-MaYeddvGrhsGZY5CZtPMiK4ap0NPyQ_aem_qUN12gkYlO5veTVKY4eppQ\n\n\n\nVárhatóan a termékeket november közepén fogjátok tudni átvenni.\n\n\n\nÜdvözlettel,\n\nEötvös DÖ Kormány'),
--    ('/events/challange.png', 'Javaslat E5N\nkihívásra', 'Kedves Diákok!\nJavaslatokat küldhettek az E5N-i kihívásokra. Ezt az alábbi linken tehetitek meg:\nhttps://docs.google.com/forms/d/e/1FAIpQLScFTJDKHiXhhEZeoJu8ACjsxM0DyrdzSW4nzI18OTYJXEVqmw/viewform \n(Ki kell választani a "Javaslat kihívásra opciót")\nKihívások még nem biztosan leszenk az E5 Napokon.'),
--    ('/events/turi2.jpg', 'Turi - Hozd el\nhasznált ruháid!', 'Kedves Diákok!\n\nIdén is megrendezésre kerül az E5vösTuri az E5N idején. Kérünk mindenkit, hogy addig is gyűjtögesse, válogassa azokat ruháit, könyveit, társasait esetleg plüsseit, ékszereit, amiket úgy érzi behozna, hogy új gazdára találjanak!\n\nMi már nagyon várjuk, hogy sok lelkes arcot lássunk ismét a turiban!\n\nKövessetek be minket az e5vosturi instagram oldalon, további információkért!\n\nÜdv,\nE5vösTuri csapata'),
--    ('/events/mome.jpg', 'MOME\nworkshop', 'Kedves Diákok!\n\nEgy momés tanárszakos halgató levelét továbbítom nektek:\n\n"Fogok tartani a MOME-n egy 4 alkalmas formatervező kurzus, ahol egy-egy egyedi kisállatház elkészítésén keresztül megtanítom a résztvevőknek hogy hogyan kell egy ötletet a tervezéstől a kivitelezésig végig vinni, és hogy az elkészítéshez szükséges eszközöket és szerszámokat hogyan kell szakszerűen használni. A tanfolyam végére mindenki hazaviheti a saját, 4 nap alatt elkészített kisállatházát, és a szakmai tudást, amit saját projekteknél alkalmazhat.\n\nAjánlom azoknak, akiket érdekel a formatervezés, barkácsolás, a MOME-ra készülnek, vagy csak szívesen kedveskednének háziállatuknak egy új házikóval.\nElső alkalom: november 9.\nHelyszín: MOME\n\nÉs itt van hozzá egy link a részletekről és a jelentkezési felületről.\nhttps://craft.mome.hu/pet-house/index.html \n\nÜdvözlettel,\n\nKormos Panni"\n\nÜdv.:\nBG');S