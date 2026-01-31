<div align="center">

<picture>
<source media="(prefers-color-scheme: light)" srcset="public/icons/E5vösDÖ-black.svg">
<source media="(prefers-color-scheme: dark)" srcset="public/icons/E5vösDÖ-white.svg">
<img src="public/icons/E5vösDÖ-black.svg" alt="react-bits logo" width="1000">
</picture>

# e5vosdo-snimrod

### Modern webapplikáció az Eötvös József Gimnázium Diákönkormányzatának

_Tervezte és fejlesztette: [Simon Nimród](https://www.github.com/sibosi)_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

### 📱 Hamarosan Android alkalmazás!

<a href="https://play.google.com/store/apps/details?id=hu.e5vosdo.snimrod">
  <img src="https://play.google.com/intl/hu_hu/badges/static/images/badges/hu_badge_web_generic.png" alt="Szerezd be: Google Play" height="80"/>
</a>

_PWA változat már elérhető a weben, a bal fenti letöltés ikonra kattintva: [e5vosdo.hu](https://e5vosdo.hu)_

</div>

---

## 📋 Tartalom

- [🎯 Áttekintés](#-áttekintés)
- [🎨 Funkciók](#-funkciók)
- [🛠️ Technológiai stack](#-technológiai-stack)
- [🚀 Kezdő lépések](#-kezdő-lépések)
- [💻 Fejlesztés](#-fejlesztés)
- [📄 Licenc](#-licenc)
- [🙏 Köszönetnyilvánítás](#-köszönetnyilvánítás)

---

## 🎯 Áttekintés

Az **e5vosdo-snimrod** egy korszerű, full-stack webapplikáció, amely az Eötvös József Gimnázium diákjainak és tanárainak mindennapi iskolai életét segíti. A platform modern technológiákra épül, intuitív felhasználói élményt és gyors teljesítményt biztosítva.

A projekt nemcsak egy eszköz, hanem egy közösségi nyílt forrású kezdeményezés is, amely lehetővé teszi a diákok számára, hogy tapasztalatot szerezzenek a webfejlesztés terén, miközben hozzájárulnak iskolájuk digitális környezetének fejlesztéséhez.

### ✨ Miért ez a projekt?

- 🚀 **Modern architektúra**: Next.js 16 alapú, server-side rendering és optimalizált teljesítmény
- 💅 **Elegáns design**: HeroUI komponensek és Tailwind CSS styling
- 🔒 **Biztonságos**: Google authentikáció (szervezeti szintű) és jogosultságkezelés
- 📱 **Reszponzív**: Mobil-első megközelítés, minden eszközön tökéletes megjelenés
- 💡 **Szabad fejlesztés**: Nyílt forráskódú, közösségi hozzájárulásokra ösztönző projekt
- 🤝 **Közösségközpontú**: Eseményfeltöltési lehetőségek és közösségi interakciók

## 🎨 Funkciók

- 📅 **Órarend kezelés**: Valós idejű órarend és helyettesítések megjelenítése
- 🎭 **Események**: Iskolai programok és események koordinálása
- 🍽️ **Menza**: Naprakész menü információk
- ⚽ **Sport**: Sportprogramok és edzések nyilvántartása
- 👤 **Felhasználói profilok**: Személyre szabott beállítások és preferenciák
- 🔔 **Értesítések**: PWA támogatás push notifikációkkal
- 🌙 **Téma váltás**: Világos, sötét és egyedi témák
- 🏫 **Teremfoglaltság**: _Hamarosan_

---

## 🛠️ Technológiai stack

- **[Next.js 16](https://nextjs.org/)** - React framework server-side renderinggel
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe fejlesztés
- **[HeroUI](https://www.heroui.com/)** - Modern UI komponenskönyvtár
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animációk
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Téma kezelés
- **[MySQL](https://www.mysql.com/)** - Relációs adatbázis

### DevOps

- **Docker** - Konténerizált deployment
- **Python** - Segédeszközök és scraping

---

## 🚀 Kezdő lépések

### 1. Előfeltételek telepítése

- **Node.js & npm 18.x+**: https://nodejs.org/en/download/
- **Git verziókezelő**: https://git-scm.com/downloads
- **MySQL 8.4+**: https://dev.mysql.com/downloads/mysql/
- **Python 3.8+** (a setup script futtatásához & fejlesztői eszközökhöz): https://www.python.org/downloads/

### 2. Repo klónozása

```bash
git clone https://github.com/sibosi/e5vosdo-snimrod.git
cd e5vosdo-snimrod
```

### 3. Csomagok telepítése

```bash
npm install
```

```bash
pip install -r requirements.txt
```

### 4. Adatbázis séma letöltése

**FONTOS!** Az első lépésben le kell töltened az adatbázis sémát az admin endpointról:

1. Kérj hozzáférést a fő fejlesztőtől
2. Nyisd meg: **https://e5vosdo.hu/api/admin/export-schema**
3. Ez automatikusan letölt egy `db_schema_YYYY-MM-DD.sql` fájlt
4. Másold a fájlt a projekt gyökérkönyvtárába

### 5. Környezeti változók beállítása

Másold a `.env.example` fájlt `.env` néven:

```bash
cp .env.example .env
```

Írd át a `.env` fájlban a MySQL kapcsolati adatokat a saját környezetednek megfelelően.

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=e5info
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
```

### 6. Setup script futtatása

Futtasd az automatizált setup scriptet:

```bash
python setup_project.py
```

## 7. Fejlesztői szerver indítása

```bash
npm run dev
```

A projekt elérhető lesz a `http://localhost:3000` címen.

---

## 💻 Fejlesztés

### Egyéb használt technológiák

- Google Analytics
- Google Cloud
- Supabase Storage

---

## 📄 Licenc

A projekt vagy bármely része kizárólag a szerző írásos engedélyével terjeszthető vagy használható.

Licensed under the [MIT license](./LICENSE).

---

## 🙏 Köszönetnyilvánítás

Külön köszönet mindenkinek, aki hozzájárult a projekt sikeréhez:

### 💪 Támogatók

- **Domi** - Aki "jó fej" (mindenkori motivátor)
- **Zsolt** - Segítség mindenben is
- **Barnabás** - Tanácsadás és ihletszerzés
- **Lajos** - Szerverszerzési ötletek
- **Nikó** - A palánta
- **Ádám** - A transzfermester
- **Ábel** - Tanácsadás

### 🧪 Tesztelők

- **Vince** - Az örök Android tesztelő
- **Timi** - Az örök iOS tesztelő, aki sajnos (vagy nem sajnos) Androidra váltott
- **Hanna** - Az új iOS tesztelő

---

<div align="center">

**Készítette Simon Nimród**

_Az Eötvös József Gimnázium Diákönkormányzatának_

[📧 Email](mailto:snimrod28@gmail.com) • [🐛 Issue beküldése](https://github.com/sibosi/e5vosdo-snimrod/issues)

</div>
