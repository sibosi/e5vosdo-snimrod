#!/usr/bin/env python3
"""
compress_resize.py
Középre vágja a képeket 100x100 px-re, majd tömöríti őket célméret (alap: 2 KB) alá.

Használat:
  python compress_resize.py --input-folder ./images --inplace

Opciók:
  --input-folder PATH    : a feldolgozandó mappa (alap: ./images)
  --output-folder PATH   : kimeneti mappa (ha nincs --inplace megadva) (alap: ./out)
  --inplace              : felülírja az eredeti fájlokat
  --target-kb N          : célméret KB-ban (alap: 2)
  --min-quality Q        : minimális minőség (alap: 5)
  --verbose              : részletes naplózás
"""
import os
import io
import argparse
from PIL import Image, ImageOps

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif', '.webp'}

def is_image_file(name: str):
    return os.path.splitext(name.lower())[1] in IMAGE_EXTS

def center_crop_to_square(img: Image.Image) -> Image.Image:
    # Középre vágás négyzetre (a rövidebb oldal alapján), majd pontosan 100x100-re átméretezés
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((100, 100), Image.LANCZOS)
    return img

def ensure_rgb_for_format(img: Image.Image, fmt: str) -> Image.Image:
    # JPEG nem támogat alfa-csatornát -> fehér háttérre helyezés
    if fmt.upper() in ('JPEG',) and img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        bg = Image.new('RGB', img.size, (255,255,255))
        bg.paste(img, mask=img.split()[-1])
        return bg
    if fmt.upper() in ('JPEG','WEBP') and img.mode not in ('RGB','L'):
        return img.convert('RGB')
    return img

def try_save_to_bytes(img: Image.Image, fmt: str, **save_kwargs):
    buf = io.BytesIO()
    img.save(buf, format=fmt, **save_kwargs)
    data = buf.getvalue()
    return data

def compress_to_target(img_orig: Image.Image, target_bytes: int, min_quality: int=5, verbose=False):
    """
    Megpróbál WebP-et, majd JPEG-et; folyamatosan csökkenti a quality-t.
    Visszatér: (best_bytes, chosen_format, details_dict)
    details_dict tartalmaz: 'quality', 'size_bytes', 'success'
    """
    formats_to_try = ['WEBP', 'JPEG', 'PNG']
    best = None
    best_meta = None

    for fmt in formats_to_try:
        try:
            # próbáljuk meg menteni pár minőség-értékkel
            if fmt == 'PNG':
                # PNG-nél először kvantálunk 256 színre, ami gyakran sokat segít
                img = img_orig.convert('RGBA') if img_orig.mode != 'RGBA' else img_orig.copy()
                # kvantálás: 256 szín (ha alfa van, előbb össze kell olvasztani)
                if 'A' in img.mode:
                    # alfa -> fehér alap
                    tmp = Image.new('RGB', img.size, (255,255,255))
                    tmp.paste(img, mask=img.split()[-1])
                    img_for_png = tmp.convert('P', palette=Image.ADAPTIVE, colors=128)
                else:
                    img_for_png = img.convert('P', palette=Image.ADAPTIVE, colors=128)
                data = try_save_to_bytes(img_for_png, 'PNG', optimize=True)
                size = len(data)
                if verbose:
                    print(f"PNG attempt: {size} bytes")
                if size <= target_bytes:
                    return data, 'PNG', {'quality': None, 'size_bytes': size, 'success': True}
                # ha nem elég jó, vegyük ezt az eredményt alapnak, de folytatjuk a JPEG/WebP próbát
                if best is None or size < len(best):
                    best = data
                    best_meta = {'quality': None, 'size_bytes': size, 'success': False, 'fmt':'PNG'}
                continue

            # WebP és JPEG: quality loop
            for q in range(80, min_quality-1, -5):
                fmt_try = fmt
                img = ensure_rgb_for_format(img_orig, fmt_try)
                try:
                    if fmt_try == 'WEBP':
                        data = try_save_to_bytes(img, 'WEBP', quality=q, method=6, optimize=True)
                    else:  # JPEG
                        data = try_save_to_bytes(img, 'JPEG', quality=q, optimize=True, progressive=True)
                except OSError:
                    # pl. WebP nincs támogatva
                    if verbose:
                        print(f"{fmt_try} nem támogatott a környezetben.")
                    raise
                size = len(data)
                if verbose:
                    print(f"{fmt_try} q={q} -> {size} bytes")
                if size <= target_bytes:
                    return data, fmt_try, {'quality': q, 'size_bytes': size, 'success': True}
                if best is None or size < len(best):
                    best = data
                    best_meta = {'quality': q, 'size_bytes': size, 'success': False, 'fmt':fmt_try}
        except Exception as e:
            if verbose:
                print(f"Hiba a {fmt} próbálkozásnál: {e}")
            continue

    # ha ide jutunk, nem sikerült target alatt, visszaadjuk a legjobb próbálkozást
    if best is not None:
        return best, best_meta.get('fmt','UNKNOWN'), best_meta
    # máskülönben mentjük alap formátumban
    fallback = try_save_to_bytes(img_orig.convert('RGB'), 'JPEG', quality=50, optimize=True, progressive=True)
    return fallback, 'JPEG', {'quality':50, 'size_bytes':len(fallback), 'success':False}

def process_folder(input_folder: str, output_folder: str, inplace: bool, target_kb: int, min_quality: int, verbose: bool):
    target_bytes = target_kb * 1024
    if not os.path.isdir(input_folder):
        raise FileNotFoundError(f"Input folder nem található: {input_folder}")
    if not inplace:
        os.makedirs(output_folder, exist_ok=True)

    files = [f for f in os.listdir(input_folder) if is_image_file(f)]
    if not files:
        print("Nincs feldolgozható kép az input mappában.")
        return

    for fname in files:
        path = os.path.join(input_folder, fname)
        try:
            with Image.open(path) as im:
                im = ImageOps.exif_transpose(im)  # helyes orientáció EXIF alapján
                im_cropped = center_crop_to_square(im)
                data, fmt, meta = compress_to_target(im_cropped, target_bytes, min_quality=min_quality, verbose=verbose)
                out_name = fname
                ext = '.' + fmt.lower()
                if not out_name.lower().endswith(ext):
                    out_name = os.path.splitext(out_name)[0] + ext
                if inplace:
                    backup_path = path + '.bak'
                    if not os.path.exists(backup_path):
                        os.rename(path, backup_path)
                    out_path = path  # felülírjuk eredeti névvel
                else:
                    out_path = os.path.join(output_folder, out_name)

                with open(out_path, 'wb') as f:
                    f.write(data)

                status = "OK" if meta.get('success') else "BEST_EFFORT"
                print(f"{fname} -> {out_path}  ({len(data)} bytes) [{fmt} q={meta.get('quality')}] {status}")

        except Exception as e:
            print(f"Hiba fájlnál {fname}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Resize (100x100) and compress images to small size.")
    parser.add_argument('--input-folder', '-i', default='./images', help='Input folder with images')
    parser.add_argument('--output-folder', '-o', default='./out', help='Output folder (if not --inplace)')
    parser.add_argument('--inplace', action='store_true', help='Overwrite originals (backs up as .bak)')
    parser.add_argument('--target-kb', type=int, default=2, help='Target size in KB (default 2)')
    parser.add_argument('--min-quality', type=int, default=5, help='Minimum quality to try (default 5)')
    parser.add_argument('--verbose', action='store_true', help='Verbose logging')
    args = parser.parse_args()

    process_folder(args.input_folder, args.output_folder, args.inplace, args.target_kb, args.min_quality, args.verbose)
