# Útmutató új szervezet hozzáadásához

Ez az útmutató bemutatja, hogyan adhatsz hozzá egy új szervezetet az E5vös DÖ oldal szervezeti kulcskölcsönző rendszeréhez.

## 1. Előkészületek

### Szükséges eszközök

* [Visual Studio Code](https://code.visualstudio.com/) – ajánlott, de nem kötelező.
* [Git](https://git-scm.com/) – a projekt letöltéséhez és a módosítások beküldéséhez.
* [Node.js](https://nodejs.org/) és az npm – a projekt függőségeinek telepítéséhez.
* Python és pip – a Python-függőségek telepítéséhez.

> [!IMPORTANT]
> **Tesztadatbázis-hozzáférés**
>
> Ha nincs hozzáférésed a tesztadatbázishoz, az új szervezeti kulcskölcsönző tesztelése nem, vagy csak jelentős nehézségek árán lesz lehetséges.

## 2. A projekt letöltése

*Ha még nem dolgoztál ezen a projekten, innen kezdd!*

Nyisd meg a terminált, majd klónozd le a repository-t:

```bash
git clone https://github.com/sibosi/e5vosdo-snimrod.git
```

Lépj be a projekt mappájába:

```bash
cd e5vosdo-snimrod
```

Telepítsd a szükséges csomagokat:

```bash
npm install
pip install -r requirements.txt
```

*Ha már korábban fejlesztetted a DÖ oldalt, ugorj a következő fejezetre.*

## 3. Az új szervezet létrehozása

### 3.1. A mappa létrehozása

Navigálj az alábbi könyvtárba:

```text
app/(e5vosdo)/keys/
```

Hozz létre itt egy új mappát a szervezet nevével.

**Fontos elnevezési szabályok:**

* Használj kisbetűket.
* Ne használj ékezeteket.
* Ne használj szóközöket.
* A mappanév legyen rövid és egyértelmű.

Például:

```text
app/(e5vosdo)/keys/
├── radio/
├── suliradio/
└── ...
```

A továbbiakban a `#{NAME}` helyőrző jelöli a szervezet nevét. **Minden előfordulását cseréld le a létrehozott mappa nevére!**

Például, ha a mappa neve `suliradio`, akkor a `#{NAME}` helyére mindenhol `suliradio` kerül.

### 3.2. A `page.tsx` létrehozása

Az új szervezet mappájában hozz létre egy `page.tsx` nevű fájlt.

Másold bele az alábbi kódot:

```tsx
import Client from "../KeyClient";
import { hasPermission } from "@/db/permissions";
import { getAuth } from "@/db/dbreq";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { dbreq } from "@/db/presentationSignup";

export default async function Page() {
  const selfUser = await getAuth();

  if (!selfUser) redirect("/");

  const hasAccess = hasPermission(selfUser, "#{NAME}_access");
  const #{NAME} = await dbreq("SELECT * FROM #{NAME}_key_status");
  const #{NAME}Status = #{NAME}[0];

  return (
    <div className="overflow-hidden">
      {hasAccess && (
        <Client
          borrowed={#{NAME}Status.borrowed}
          borrowedBy={#{NAME}Status.borrowed_by}
          borrowedAt={#{NAME}Status.borrowed_at}
          name={selfUser.name}
          title="EGYÉNI"
          org="#{NAME}"
          svg={1}
        />
      )}
    </div>
  );
}
```

> [!WARNING]
> A `#{NAME}` szöveg nem érvényes TypeScript-változónév. A teljes kódban cseréld le a szervezet tényleges nevére, beleértve a változóneveket, az SQL-lekérdezést, a jogosultságot és az `org` prop értékét is.

Például `suliradio` esetén a jogosultság neve `suliradio_access`, az adatbázistábla neve pedig `suliradio_key_status`.

**Megjegyzés:** a `motion` import jelenleg nincs használva a példában. Ha nincs rá szükség, eltávolíthatod.

## 4. Az adatbázis beállítása

Az új szervezet mappájában hozz létre egy `setup.sql` nevű fájlt.

Másold bele az alábbi SQL-parancsokat:

```sql
CREATE TABLE #{NAME}_key_logs LIKE radio_key_logs;

CREATE TABLE #{NAME}_key_status LIKE radio_key_status;

INSERT INTO #{NAME}_key_status
  (borrowed, borrowed_by, borrowed_at)
VALUES
  (0, NULL, NULL);
```

Cseréld le a `#{NAME}` helyőrzőt a szervezet mappanevére, ugyanúgy, mint a `page.tsx` fájlban.

Ez a beállítás:

1. Létrehozza a szervezet saját naplózási tábláját.
2. Létrehozza a szervezet kulcskölcsönzési állapotát tároló táblát.
3. Kezdeti állapotba állítja a kulcsot: nincs kölcsönben, nincs kölcsönvevő és nincs kölcsönvételi időpont.

> [!IMPORTANT]
> A `setup.sql` fájl létrehozása önmagában nem futtatja le az SQL-parancsokat. Az adatbázis-módosításokat arra jogosult személynek kell végrehajtania a megfelelő adatbázisban.

## 5. A módosítások beküldése

Ha nincs hozzáférésed a tesztadatbázishoz, a módosításokat tesztelés nélkül is beküldheted felülvizsgálatra.

Nyisd meg a terminált a projekt gyökérkönyvtárában, majd futtasd az alábbi parancsokat **egyesével, sorrendben**.

### 5.1. Új Git-ág létrehozása

```bash
git branch -M #{NAME}
```

### 5.2. A módosítások előkészítése

```bash
git add "app/(e5vosdo)/keys"
```

### 5.3. Commit készítése

```bash
git commit -m "Hozzáadtam egy új szervezetet."
```

### 5.4. A branch feltöltése GitHubra

```bash
git push origin #{NAME}
```

Itt is cseréld le a `#{NAME}` helyőrzőt a szervezet tényleges nevére.

A parancsok futtatása után a módosítások felkerülnek a GitHub-repository egy külön ágára, ahonnan azok felülvizsgálhatók és szükség esetén beolvaszthatók.

## 6. Kész!

Ezzel elkészült az új szervezet alapvető fájlstruktúrája és adatbázis-beállítása, a módosítások pedig beküldhetők felülvizsgálatra.

**Ellenőrzőlista a beküldés előtt:**

* [ ] A szervezet mappaneve kisbetűs, ékezet és szóköz nélküli.
* [ ] A `page.tsx` fájlban minden `#{NAME}` helyőrzőt lecseréltél.
* [ ] A `setup.sql` fájlban is minden helyőrzőt lecseréltél.
* [ ] Az adatbázis beállítását egyeztetted az arra jogosult személlyel.
* [ ] A módosításokat a szervezet nevével létrehozott Git-ágra töltötted fel.

Ha minden pont teljesült, az új szervezet készen áll a felülvizsgálatra.
