<div align="center">

<picture>
<source media="(prefers-color-scheme: light)" srcset="public/icons/E5vösDÖ-black.svg">
<source media="(prefers-color-scheme: dark)" srcset="public/icons/E5vösDÖ-white.svg">
<img src="public/icons/E5vösDÖ-black.svg" alt="react-bits logo" width="1000">
</picture>

# e5vosdo-snimrod

### Modern webapplikáció az Eötvös József Gimnázium Diákönkormányzatának

_Tervezte és fejlesztette: [Simon Nimród](https://www.github.com/sibosi)_

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
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

- 🚀 **Modern architektúra**: Next.js 15 alapú, server-side rendering és optimalizált teljesítmény
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

### Frontend

- **[Next.js 15](https://nextjs.org/)** - React framework server-side renderinggel
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe fejlesztés
- **[HeroUI](https://www.heroui.com/)** - Modern UI komponenskönyvtár
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animációk
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Téma kezelés

### DevOps

- **Docker** - Konténerizált deployment
- **Python** - Segédeszközök és scraping

---

## 🚀 Kezdő lépések

### Előfeltételek

- **Node.js** 18.x vagy újabb
- **npm** package manager
- **Git**

### Telepítés

1️⃣ **Repo klónozása**

```bash
git clone https://github.com/sibosi/e5vosdo-snimrod.git
cd e5vosdo-snimrod
```

2️⃣ **Függőségek telepítése**

```bash
npm install
```

3️⃣ **Környezeti változók beállítása**

Hozz létre egy `.env.local` fájlt a projekt gyökérkönyvtárában:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4️⃣ **Fejlesztői szerver indítása**

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

### Projekt struktúra

```
e5vosdo-snimrod/
├── app/                   # Next.js App Router
│   ├── (e5vosdo)/         # Fő alkalmazás route group
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React komponensek
├── db/                    # Database utilities
├── config/                # Konfiguráció fájlok
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Statikus fájlok
```

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
