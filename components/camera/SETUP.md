# Kameramodul - Google Drive Integráció - FRISSÍTVE

## ✨ Javított kamera inicializálás

A kameramodul frissítve lett, hogy jobban kezelje a desktop kamerákat és a különböző böngészőket.

### 🔧 Javítások:

1. **Több kamera konfiguráció**: Próbálja a hátsó kamerát (mobil), majd bármilyen kamerát (desktop)
2. **Loading állapot**: Mutat betöltő animációt a kamera inicializálása alatt
3. **Jobb hibakezelés**: Részletes hibaüzenetek különböző hibatípusokhoz
4. **Debug támogatás**: `debugCamera()` függvény a problémák diagnosztizálásához
5. **Video események**: Várja meg a video metadata betöltését
6. **Fallback timeout**: 5 másodperces timeout ha nem sikerül az inicializálás

### 🐛 Debug használata:

```javascript
import { debugCamera } from "@/components/camera";

// Konzolba írja a kamera információkat
debugCamera();
```

### 🚨 Gyakori problémák és megoldások:

#### 1. "Kamera hozzáférés megtagadva"

- Engedélyezd a kamerát a böngésző beállításokban
- Chrome: Címsor melletti kamera ikon → Engedélyezés
- Firefox: Címsor melletti kamera ikon → Engedélyezés

#### 2. "Nem található kamera"

- Ellenőrizd, hogy csatlakoztatva van-e kamera
- Windows: Eszközkezelő → Kamerák
- Próbáld meg más alkalmazásban (pl. Windows Kamera app)

#### 3. "Kamera már használatban"

- Zárd be a kamerát használó alkalmazásokat
- Frissítsd a böngészőt
- Restart szükséges lehet

#### 4. "HTTPS szükséges"

- Localhost kivétel (localhost:3000 működik)
- Production-ban HTTPS kötelező

### 🧪 Tesztelési lépések:

1. Menj a `/camera` oldalra (admin joggal)
2. Nyisd meg a böngésző konzolt (F12)
3. Kattints "Kamera indítás"-ra
4. Nézd a konzol üzeneteket a debug info-ért
5. Ha nem működik, futtasd `debugCamera()`-t a konzolban

---

## Új fájlok

1. **`db/driveStorage.ts`** - Google Drive integrációs modul

   - `uploadImageToDrive()` - Kép feltöltése Drive-ba
   - `getImagesFromDrive()` - Képek lekérése Drive-ból
   - `deleteImageFromDrive()` - Kép törlése Drive-ból

2. **`scripts/setup-camera-drive.ts`** - Setup script a Drive mappa létrehozásához/kereséshez
3. **`components/camera/.env.example`** - Példa környezeti változók

## Módosított fájlok

1. **`app/api/upload/route.ts`** - Frissítve Drive support-tal
2. **`app/api/camera-photos/route.ts`** - Drive-ból tölt be képeket
3. **`components/camera/README.md`** - Frissített dokumentáció
4. **`package.json`** - Új script hozzáadva

## Beállítás

### 1. Környezeti változók

Adj hozzá ezeket a `.env` fájlhoz:

```bash
# Már meglévő Google Service Account változók
SERVICE_ACCOUNT_KEY=your_service_account_json_here
# vagy
SERVICE_ACCOUNT_KEY_PATH=path/to/service-account-key.json

# Új változó
CAMERA_PHOTOS_DRIVE_FOLDER_ID=your_drive_folder_id
```

### 2. Drive mappa beállítása

Futtasd a setup scriptet:

```bash
npm run setup-camera-drive
```

Ez a script:

- Megkeresi a "Camera Photos" mappát a Drive-ban
- Ha nincs meg, létrehozza
- Kiírja a mappa ID-jét, amit a `.env`-be kell másolni

### 3. Service Account jogosultságok

Győződj meg róla, hogy a Service Account hozzáfér a Drive mappához:

1. Menj a Google Drive-ba
2. Jobb klikk a "Camera Photos" mappán → "Share"
3. Add hozzá a Service Account email címét (viewer vagy editor joggal)

## Működés

### Admin használat (`/camera`)

1. Admin bejelentkezik
2. "Kamera indítás" → webkamera elindul
3. Fényképezés → kép készül
4. "Feltöltés" → kép feltöltődik a Google Drive mappájába
5. Kép automatikusan megjelenik a galériában

### Nyilvános megtekintés (`/photos`)

- Bárki megnézheti a feltöltött képeket
- Automatikus frissítés 30 másodpercenként
- Legújabb kép nagyban, előző 3 kicsiben

## API végpontok

- **POST `/api/upload`** - Kép feltöltés (admin only)
  - `directory: "camera-photos"` esetén Drive-ba tölt fel
- **GET `/api/camera-photos`** - Képek lekérése Drive-ból

## Előnyök a Supabase helyett

1. **Integráció**: Már meglévő Google Drive infrastruktúra
2. **Backup**: A képek automatikusan a Drive backup részei
3. **Hozzáférés**: Egyszerű megosztás és jogosultság kezelés
4. **Korlátok**: Nagyobb tárhely a Drive-ban
5. **URL-ek**: Egyszerű public URL generálás

## Tesztelés

Futtasd le a teszteket:

```bash
npm run dev
```

Majd menj a `/camera` oldalra (admin joggal) vagy `/photos` oldalra (bárki).

A modul ready to use! 🎉
