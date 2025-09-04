# Kamera Modul

Ez a modul lehetővé teszi az adminoknak, hogy közvetlenül a böngészőből fényképeket készítsenek és feltöltsenek a Google Drive-ba.

## Komponensek

### CameraUpload

Kamera komponens, amely:

- Elindítja a webkamerát vagy mobilkamerát
- Lehetővé teszi fotók készítését
- Automatikusan feltölti a képeket a Google Drive mappájába

### PhotoGallery

Képgaléria komponens, amely:

- Megjeleníti a legújabb képet nagyban
- Az előző 3 képet kicsiben mutatja
- Automatikusan frissíti magát

### CameraAdmin

Admin felület, amely kombinálja a kamera feltöltést és galériát.

### CameraDisplay

Nyilvános megjelenítés, amely csak a galériát mutatja, opcionális automatikus frissítéssel.

## API végpontok

### POST /api/upload

Meglévő feltöltési végpont, frissítve a kamera képek támogatásával.

- Directory: "camera-photos" esetén Google Drive-ba tölt fel
- Csak adminok használhatják
- Használja a `CAMERA_PHOTOS_DRIVE_FOLDER_ID` környezeti változót

### GET /api/camera-photos

Új API végpont a kamera képek lekéréséhez.

- Visszaadja a Google Drive mappából a képeket
- Időrendi sorrendben (legújabb először)
- Használja a `CAMERA_PHOTOS_DRIVE_FOLDER_ID` környezeti változót

## Oldalak

### /camera (Admin)

- Csak adminok számára elérhető
- Teljes kamera funkciók (feltöltés + galéria)

### /photos (Nyilvános)

- Mindenki számára elérhető
- Csak a galéria megjelenítése
- Automatikus frissítés 30 másodpercenként

## Használat

1. Admin bejelentkezik
2. Elmegy a `/camera` oldalra
3. "Kamera indítás" gombbal elindítja a kamerát
4. Készít egy fényképet
5. Feltölti a képet
6. A kép automatikusan megjelenik a galériában
7. A `/photos` oldalon mindenki láthatja a képeket

## Technikai részletek

- Kamera access: `navigator.mediaDevices.getUserMedia()`
- Kép formátum: JPEG, 80% minőség
- Tárolás: Google Drive mappa
- Fájlnév: `camera-photo-TIMESTAMP.jpg`
- UI: HeroUI komponensek
- Responsive design: Tailwind CSS
- Public URL: `https://drive.google.com/uc?id={fileId}&export=view`

## Környezeti változók

A Google Drive integrációhoz szükséges változók:

- `SERVICE_ACCOUNT_KEY` vagy `SERVICE_ACCOUNT_KEY_PATH` - Google Service Account kulcs
- `CAMERA_PHOTOS_DRIVE_FOLDER_ID` - A Drive mappa ID, ahol a kamera képek tárolódnak

## Drive mappa beállítás

1. Hozz létre egy mappát a Google Drive-ban
2. Jegyezd fel a mappa ID-jét (az URL-ből: `https://drive.google.com/drive/folders/{FOLDER_ID}`)
3. Add hozzá az `CAMERA_PHOTOS_DRIVE_FOLDER_ID` környezeti változóhoz
4. Győződj meg róla, hogy a Service Account hozzáfér a mappához
