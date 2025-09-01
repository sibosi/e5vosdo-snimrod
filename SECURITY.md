# Adatkezelési tájékoztató és Cookie szabályzat

**Hatályos:** 2025. szeptember 1.

## 1. Bevezető és kapcsolattartás

Ez az Adatkezelési tájékoztató ismerteti, hogyan gyűjtjük, kezeljük és védjük a személyes adatokat a DÖ-oldalon és a DÖ egyéb rendszerein.

**Adatkezelő:** Eötvös József Gimnázium Diákönkormányzata (DÖ)  
**Székhely:** 1053 Budapest, Reáltanoda utca 7.  
**E-mail:** do@e5vos.hu

**Fejlesztő és felhatalmozott:** Simon Nimród  
**E-mail:** simon.nimrod.zalan@e5vos.hu  
**Egyéb elérhetőség:** 221. terem

## 1. Kezelt személyes adatok köre és feldolgozási céljai

A különböző adatkezelések jogalapjai:

- Bejelentkezés és fiókkezelés: szerződés teljesítése / szervezeti követelmény
- Események adminisztrációja: szerződés teljesítése vagy jogos érdek
- Képek publikálása: külön, kifejezett hozzájárulás
- Analitika: felhasználói hozzájárulás
- Rendszer-naplók: jogos érdek (biztonság, üzemeltetés)

---

### Név, e-mail cím és profilkép

Bejelentkezéshez kötelező személyes adatok. Az oldalon csak az e5vos.hu végződésű fiókokkal lehet bejelentkezni, így biztosítva a szervezeti adatok biztonságát. A felhasználó elsődleges azonosítója az email címe (és az ahhoz tartozó Google fiókja). Mivel az összes bejelentkezett felhasználó a szervezethez tartozik, így az oldalon végzett tevékenységekre az intézmény és a Diákönkormányzat szabályzatai egyaránt érvényesek.

---

### Szervezeti (belsős) adatok és azonosítók

Az oldalra történő regisztrációt követően a felhasználó fiókjához akár már korábban az iskola vagy a DÖ számára megadott adatiai hozzárendelésre kerülhetnek. (Például EJG kód, osztály vagy évfolyam.) Előfordulhat, hogy efféle azonosítók manuális megadása is lehetséges az oldalon keresztül.

A bejelentkezett felhasználók jellemzően több szerepkört is betöltenek az iskola falai között (például "diák", "tanár", "klubvezető", "parlamenti képviselő" vagy "DÖ oldal adminja" szerepet). Ezen szerepkörök egy részét a DÖ az oldalán hozzárendelheti a felhasználókhoz hitelesítési és adatvédelmi célból.

Az oldal időnként az intézményen belüli események és porgramok jelentkezési felületeként szolgál. Ilyenkor a felhasználó jelentkezési adatai az esemény lebonyolítása érdekében felhasználásra kerülnek.

---

### Képek, videók és egyéb fájlok

A bejelentkezett felhasználóknak lehetőségük van, hogy az olalon megjelenő tartalmakra javaslatot tehessenek (például az iskolai események szekciójában). Az efféle javaslatkérvények benyújtásakor fájlok feltöltését is biztosíthatjuk, melyek feltöltésével a felhasználó feljogosítja a DÖ-t, hogy a feltöltött fájlokat kezelhesse és publikálhassa népszerűsítési célokból.

A feltötött tartalmak metaadatait (fájlnév, feltöltő, időpont) a DÖ gyűjtheti.

---

### Személyre szabás az oldalon

Az oldal összes látogatója preferenciákat állíthat be az oladl megjelenítését illetően (például megjelenített szekciók, menza vagy színpaletta).

---

### Analitika és naplózás

Az oldal naplózhatja az azon végzett tevékenységeket, köztük a belépéseket az alábbiak szerint:

- Minden látogatónak anomim módon: IP cím, böngésző információk, eszközadatok
- Bejelentkezett felhasználóknak: Belépési időpontok, oldalon végzett adatmódosítások és azok időpontjai

---

## 2. Adattárolás és adatfeldolgozás

Az oldalon rendszeres automatikus adattörlést nem végzünk. Teljes vagy részleges adattörlésért lásd a 6. pontot.

| Megnevezés és cég                | Hely      | Tárolt adatok / cél                |
| -------------------------------- | --------- | ---------------------------------- |
| Elsődleges szerver, DigitalOcean | Frankfurt | Teljes adatbázis, kód, feldolgozás |
| Supabase szerver                 | Frankfurt | Események képei                    |
| Google Drive                     | változó   | Biztonsági mentések és képek       |

## 3. Adattovábbítás

- **Authentikáció / identitás:** NextAuth.
- **Fájl- és képtárolás:** Supabase, Google Drive API (Google LLC).
- **Adatbázis:** DigitalOcean szerveren, MySQL.
- **Hosting / üzemeltetés:** DigitalOcean.
- **Analitika:** Google Analytics.

## 4. Az érintettek jogai

Az érintettek jogosultak:

- tájékoztatást kérni a róluk kezelt adatok köréről;
- hozzáférést kérni;
- helyesbítést kérni;
- törlést (elfeledtetés) kérni;
- a feldolgozás korlátozását kérni;
- tiltakozni bizonyos feldolgozások ellen;
- a hozzájárulás visszavonását kezdeményezni.

A jogok érvényesítéséhez kérjük, írj a DÖ vagy a Fejlesztő elérhetőségeire.

## 5. Cookie-k és hasonló technológiák

A weboldal sütiket használhat:

- Szükséges sütik (működéshez) — nem igényelnek hozzájárulást.
- Analitika sütik — csak a felhasználó hozzájárulásával.

## 6. Adatkezelési kérvény és egyéb megkeresések benyújtása

Személyes információkat kizárólag a szervezethez tartozó, hitelesített felhasználókról gyűjtünk. Kérvény benyújtása személyesen vagy a regisztrált e-mail címről lehetséges a DÖ e-mail címére. A kérésekre jellemzően 30 napon belül érdemi választ küldünk.

## 7. Módosítások

A tájékoztató frissülhet. Minden változást a honlapon közzéteszünk, és frissítjük a „Hatályos” dátumot. Az aktuális tájékoztatót megtalálod [az oldal forráskódjában](https://github.com/e5vos/e5vosdo-snimrod/blob/master/SECURITY.md) is.
