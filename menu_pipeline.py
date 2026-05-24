"""
menu_pipeline.py

Full automated pipeline:
  Website scrape → PDF download → pdfplumber table extraction → structured JSON

Real PDF structure (one table per page / week):
  row[0]  : header row  - contains the date range, e.g. "Gimnázium 2026.05.04.-05.08."
  row[1]  : column labels - "hét", "A menü", "B menü", ""
  row[2+] : one row per school day
             col 0 → day name  (Hétfő / Kedd / …)
             col 1 → A menu dishes, newline-separated
             col 2 → B menu dishes, newline-separated

Outputs:
  - components/menza/tablak/YYmMM.json   (e.g. 26m06.json) - this month only
  - public/storage/mindenkorimenu.json   - cumulative all-months file
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta

import pdfplumber
import requests
from bs4 import BeautifulSoup

# ── Config ────────────────────────────────────────────────────────────────────

MENU_PAGE_URL    = "https://www.ejg.hu/etlap-2/"
MINDENKORI_PATH  = os.path.join("public", "storage", "mindenkorimenu.json")
TABLAK_DIR       = os.path.join("components", "menza", "tablak")
PDF_PATH         = "menu_latest.pdf"

HET_NAPJAI = {"Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def monthly_json_path(year: int, month: int) -> str:
    """e.g. (2026, 6) → components/menza/tablak/26m06.json"""
    return os.path.join(TABLAK_DIR, f"{str(year)[-2:]}m{month:02d}.json")


def ensure_dir(path: str):
    os.makedirs(os.path.dirname(path), exist_ok=True)


def load_json(path: str) -> dict:
    if not os.path.exists(path):
        return {}
    for enc in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            with open(path, "r", encoding=enc) as f:
                return json.loads(f.read())
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    return {}


def write_json(path: str, data: dict):
    ensure_dir(path)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ── Step 1: Scrape + download PDF ─────────────────────────────────────────────

def find_pdf_urls(page_url: str) -> list[str]:
    """Return every unique *menu.pdf link found on the page."""
    resp = requests.get(page_url, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    seen, urls = set(), []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if not href.lower().endswith("menu.pdf"):
            continue
        if not href.startswith("http"):
            from urllib.parse import urljoin
            href = urljoin(page_url, href)
        if href not in seen:
            seen.add(href)
            urls.append(href)

    if not urls:
        raise ValueError(f"No *menu.pdf links found on {page_url}")
    print(f"Found {len(urls)} PDF(s): {urls}")
    return urls


def download_pdf(url: str, dest: str):
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    with open(dest, "wb") as f:
        f.write(resp.content)
    print(f"Downloaded PDF → {dest}")


# ── Step 2: PDF → structured menu dict ───────────────────────────────────────

def _extract_week_start(header_row: list):
    for cell in header_row:
        if not cell:
            continue
        m = re.search(r"(\d{4}\.\d{2}\.\d{2})\.", cell)
        if m:
            y, mo, d = (int(x) for x in m.group(1).split("."))
            return datetime(y, mo, d)
    return None


def parse_pdf(pdf_path: str) -> dict:
    """
    Returns a dict keyed by "YYYY.MM.DD":
      { "A": [dish, ...], "B": [dish, ...], "nap": "<English weekday>" }
    """
    result = {}
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                if len(table) < 3:
                    continue
                week_start = _extract_week_start(table[0])
                if week_start is None:
                    print(f"  WARNING: no date found in header: {table[0]}")
                    continue

                current = week_start
                for row in table[2:]:
                    day_name = (row[0] or "").strip()
                    if day_name not in HET_NAPJAI:
                        continue

                    a_raw    = row[1] or ""
                    b_raw    = row[2] or ""
                    date_key = current.strftime("%Y.%m.%d")

                    if a_raw.strip() == "Ünnep":
                        result[date_key] = {
                            "A": ["Ünnep"], "B": ["Ünnep"],
                            "nap": current.strftime("%A"),
                        }
                    else:
                        result[date_key] = {
                            "A": [d.strip() for d in a_raw.split("\n") if d.strip()],
                            "B": [d.strip() for d in b_raw.split("\n") if d.strip()],
                            "nap": current.strftime("%A"),
                        }
                    current += timedelta(days=1)
    return result


# ── Step 3: Save monthly file + update cumulative file ───────────────────────

def save_outputs(new_menu: dict):
    if not new_menu:
        print("Nothing parsed - nothing saved.")
        return

    # Determine year+month from the first date key ("YYYY.MM.DD")
    first_key  = sorted(new_menu.keys())[0]
    year, month = int(first_key[:4]), int(first_key[5:7])
    month_path = monthly_json_path(year, month)

    # ── Monthly file (this month only) ───────────────────────────────────────
    write_json(month_path, new_menu)
    print(f"Saved monthly  → {month_path}  ({len(new_menu)} days)")

    # ── Cumulative file (merge new on top of existing) ────────────────────────
    existing = load_json(MINDENKORI_PATH)
    existing.update(new_menu)
    write_json(MINDENKORI_PATH, existing)
    print(f"Saved cumul.   → {MINDENKORI_PATH}  ({len(existing)} days total)")


# ── Entry points ──────────────────────────────────────────────────────────────

def run_from_url(page_url: str = MENU_PAGE_URL):
    print("Scraping:", page_url)
    pdf_urls = find_pdf_urls(page_url)
    for pdf_url in pdf_urls:
        print("Processing:", pdf_url)
        download_pdf(pdf_url, PDF_PATH)
        menu = parse_pdf(PDF_PATH)
        print(f"Parsed {len(menu)} school days")
        save_outputs(menu)
        os.remove(PDF_PATH)
        print(f"Deleted {PDF_PATH}")


def run_from_local_pdf(pdf_path: str):
    menu = parse_pdf(pdf_path)
    print(f"Parsed {len(menu)} school days from {pdf_path}")
    save_outputs(menu)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_from_local_pdf(sys.argv[1])
    else:
        run_from_url()
