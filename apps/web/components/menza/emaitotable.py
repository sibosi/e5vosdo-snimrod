#!/usr/bin/env python3
"""
Feldolgozza a megadott mappában lévő összes .xlsx fájlt és
frissíti/összeolvasztja a public/storage/mindenkorimenu.json fájlt.
"""

import os
import re
import json
import glob
from datetime import datetime
import pandas as pd

# --- Konfiguráció (szerkeszthető) ---
JSON_PATH = os.path.join('public', 'storage', 'mindenkorimenu.json')
XLSX_DIR_PATH = os.path.join('components', 'menza', 'email-xlsx')
# Ha az almappákat is be akarod vonni, állítsd True-ra:
RECURSIVE = False
# -------------------------------------

def find_best_col(cols, candidates):
    cols_lower = [str(c).lower() for c in cols]
    for cand in candidates:
        for i,c in enumerate(cols_lower):
            if cand in c:
                return cols[i]
    return None

def parse_date_val(x):
    if pd.isna(x):
        return None
    if isinstance(x, (pd.Timestamp, datetime)):
        return x.date()
    s = str(x).strip()
    # prefer explicit YYYY.*MM.*DD
    m = re.search(r'^\s*(\d{4})\D+(\d{1,2})\D+(\d{1,2})', s)
    if m:
        y, mo, d = m.groups()
        try:
            return datetime(int(y), int(mo), int(d)).date()
        except:
            pass
    # pandas fallback (dayfirst)
    try:
        dt = pd.to_datetime(s, dayfirst=True, errors='coerce')
        if not pd.isna(dt):
            return dt.date()
    except Exception:
        pass
    # d/m/yyyy fallback
    m2 = re.search(r'(\d{1,2})[^\d]+(\d{1,2})[^\d]+(\d{4})', s)
    if m2:
        d,mo,y = m2.groups()
        try:
            return datetime(int(y), int(mo), int(d)).date()
        except:
            pass
    return None

def split_food(s):
    if pd.isna(s):
        return []
    parts = re.split(r',|;|\n', str(s))
    items = [p.strip() for p in parts if p.strip()!='']
    return items

def parse_workbook(path):
    """
    Visszaad egy dict-et: { "YYYY.MM.DD": { "A": [...], "B":[...], "nap": "Monday" }, ... }
    A workbook minden sheet-jét megpróbálja feldolgozni (ha tartalmazza a szükséges oszlopokat).
    """
    xls = pd.ExcelFile(path)
    parsed = {}
    for sheet in xls.sheet_names:
        try:
            df = xls.parse(sheet)
        except Exception:
            continue
        cols = list(df.columns)
        date_col = find_best_col(cols, ['dátum','datum','date'])
        menu_col = find_best_col(cols, ['menü','menu','type','meny'])
        food_col = find_best_col(cols, ['étel','etel','food','meals','meal'])
        if not date_col or not menu_col or not food_col:
            # ez a sheet nem felel meg, kihagyjuk
            continue

        work = df[[date_col, menu_col, food_col]].copy()
        work.columns = ['date','menu','food']
        work['parsed_date'] = work['date'].apply(parse_date_val)
        work['menu_norm'] = work['menu'].astype(str).str.strip().str.upper().str[0]
        work['items'] = work['food'].apply(split_food)

        for date, grp in work.groupby('parsed_date'):
            if date is None:
                continue
            key = date.strftime("%Y.%m.%d")
            entry = {'A': None, 'B': None}
            for _, row in grp.iterrows():
                m = row['menu_norm']
                if m not in ['A','B']:
                    if any('ünne' in it.lower() for it in row['items']):
                        entry['A'] = ["Ünnep"]
                        entry['B'] = ["Ünnep"]
                    continue
                entry[m] = row['items'] if len(row['items'])>0 else [None]
            # Ha csak az egyik létezik, pad-eljük a másikat same-size-ra
            if entry['A'] is None and entry['B'] is not None:
                entry['A'] = [None]*len(entry['B'])
            if entry['B'] is None and entry['A'] is not None:
                entry['B'] = [None]*len(entry['A'])
            entry['nap'] = date.strftime("%A")
            parsed[key] = entry
    return parsed

def load_existing(json_path):
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def write_json(json_path, data):
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    # fájllista
    pattern = '**/*.xlsx' if RECURSIVE else '*.xlsx'
    search_path = os.path.join(XLSX_DIR_PATH, pattern)
    files = glob.glob(search_path, recursive=RECURSIVE)
    files = sorted(files)
    if not files:
        print("Nem találtam .xlsx fájlokat az alábbi mappában:", XLSX_DIR_PATH)
        return

    print(f"Talált {len(files)} .xlsx fájlt. Feldolgozás folyamatban...")
    combined_new = {}
    processed_files = 0
    for f in files:
        try:
            parsed = parse_workbook(f)
            if parsed:
                # ha ugyanaz a dátum több fájlban is szerepel, a későbbi fájl felülírja az előzőt (fájl sorrend szerint)
                combined_new.update(parsed)
            processed_files += 1
            print(f"  -> feldolgozva: {f} ({len(parsed)} dátum bejegyzés)")
        except Exception as e:
            print(f"  !! hiba a feldolgozás során: {f} : {e}")

    existing = load_existing(JSON_PATH)
    before_keys = set(existing.keys())
    # update/merge
    existing.update(combined_new)
    after_keys = set(existing.keys())

    write_json(JSON_PATH, existing)

    added = len(after_keys - before_keys)
    updated = len(combined_new) - added
    print("Kész.")
    print(f"Feldolgozott fájlok: {processed_files}/{len(files)}")
    print(f"Új/hozzáadott dátumok: {added}")
    print(f"Frissített/felülírt dátumok a meglévő fájlban: {updated}")
    print(f"Összes kulcs a JSON-ban most: {len(existing)}")
    print("JSON mentve ide:", JSON_PATH)

if __name__ == "__main__":
    main()
