'''
A PROGRAM MŰKÖDÉSE

1. Adott hónap menüjének lekérése PDF-ben
https://www.ejg.hu/kat/etkezessel-kapcsolatos-informaciok/


2. A kapott PDF átalakítása táblázattá (xlsx)
https://smallpdf.com/pdf-to-excel#r=convert-to-excel


3. Az xlsx fájl tábláit egy táblába (tab-ba) összefűzni

4. A kapott xlsx fájl átalakítása JSON formátumba
https://excel2json.io/

A kapott fájl valahogy így néz ki:
[
{ "1": null,     "2": null,                 "KinderF.ésK.Kft.": "Hartyán konyha",   "": null   },
{ "1": null,     "2": "2024.04.29.-05.03.", "KinderF.ésK.Kft.": null,           "": "Gimnázium"},
{ "1": "B menü", "2": null,                 "KinderF.ésK.Kft.": "18.hét",        "": "A menü"  },

{ "1": "Hamis gulyásleves", "2": null,  "KinderF.ésK.Kft.": "Hétfő",  "": "Hamis gulyásleves" },
{ "1": "Tonhalrúd rántva",  "2": null,  "KinderF.ésK.Kft.": null,     "": "Zöldborsófőzelék"  },
{ "1": "Párolt rizs",       "2": null,  "KinderF.ésK.Kft.": null,     "": "Főtt tojás 2db"    },
{ "1": "Tartár mártás",     "2": null,  "KinderF.ésK.Kft.": null,     "": "Tk.kenyér"         },
{ "1": "Tárkonyos raguleves","2": null, "KinderF.ésK.Kft.": "Kedd",   "": "Tárkonyos raguleves"}
]

Általánosan:
Egy listát kapunk, az első három sor a fejléc
A dátum az alábbi helyen található: file[1]["2"]
Utána szótárak következnek. Minden szótár 3-as vagy 4-es csoportba lehet rakni. (Attól függően, aznap mennyi fogást osztanak ki, de lehet 1-is (pl.: Ünnepnap))

Az indexelés:
INDEX ["1"] : B menü
INDEX [""]  : A menü
INDEX ["KinderF.ésK.Kft."] : a hét száma vagy a hét napja


CÉL az alábbi formátum elérése:
{ dátum : {"A" : [fogások], "B" : [fogások], "nap" : a hét napja},
  dátum : {"A" : [fogások], "B" : [fogások], "nap" : a hét napja} }
'''

import json
from datetime import timedelta, datetime
import os

KINDERF_KFT = "KinderF.ésK.Kft."
JSON_PATH = os.path.join('public', 'storage', 'mindenkorimenu.json')

import os

if not os.path.exists(JSON_PATH):
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        f.write('{}')

def load_json_with_encoding(path: str):
    """Betölti a JSON fájlt különböző kódolásokkal próbálkozva."""
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
    
    for encoding in encodings:
        try:
            with open(path, 'r', encoding=encoding) as outfile:
                content = outfile.read()
                data = json.loads(content)
                print(f"Sikeresen beolvasva {encoding} kódolással: {path}")
                return data
        except UnicodeDecodeError:
            continue
        except json.JSONDecodeError as e:
            print(f"JSON hiba {encoding} kódolással: {e}")
            continue
    
    print(f"Nem sikerült beolvasni a fájlt: {path}")
    return None

def main (path : str):
    nyers_menu = load_json_with_encoding(path)
    if nyers_menu is None:
        return

    havi_menu = {}

    # példa: "2024.04.29.-05.03."
    datum = nyers_menu[1]["2"]
    # tördelés: "2024.04.29."
    datum = datum.split('-')[0]

    def kovetkezo_datum(datum : str, lepes=1) -> str:
        ev = int( datum.split('.')[0] )
        ho = int( datum.split('.')[1] )
        nap = int( datum.split('.')[2] )
        next_day_date = datetime(ev, ho, nap) + timedelta(days=lepes)

        format_string = '%Y.%m.%d'
    
        # Convert the datetime object to a string in the specified format 
        next_day_date = next_day_date.strftime(format_string) 

        return next_day_date

    def het_napja(datum : str) -> str:
        ev = int( datum.split('.')[0] )
        ho = int( datum.split('.')[1] )
        nap = int( datum.split('.')[2] )
        datum = datetime(ev, ho, nap)
        nap = datum.strftime('%A')
        return nap
        
    datum = kovetkezo_datum(datum, lepes=-1)
    for sor in nyers_menu:

        if (sor['1'] == 'B menü' and sor[''] == 'A menü') or (sor['1'] == sor['2'] == sor[""] == None) or (sor[KINDERF_KFT] == "Gimnázium" or sor[""] == "Gimnázium"): continue
        
        if sor[KINDERF_KFT] != None:
            datum = kovetkezo_datum(datum)
            if het_napja(datum=datum) == 'Saturday' and sor[KINDERF_KFT] != 'Szombat':
                datum = kovetkezo_datum(datum=datum, lepes=2)
            elif het_napja(datum=datum) == 'Sunday' and sor[KINDERF_KFT] != 'Vasárnap':
                datum = kovetkezo_datum(datum=datum, lepes=1)

            havi_menu.update({datum : {'A' : [], 'B' : [], 'nap' : het_napja(datum)}})
        havi_menu[datum]['A'].append(sor[""])
        havi_menu[datum]['B'].append(sor["1"])
        
    mindenkori_menu = havi_menu

    with open(JSON_PATH, 'r', encoding='utf-8') as outfile:
        data = outfile.read()
        if data == '': data = '{}'
        data = json.loads(data)
        mindenkori_menu.update(data)

    with open(JSON_PATH, 'w', encoding='utf-8') as outfile:
        json.dump(mindenkori_menu, outfile, ensure_ascii=False, indent=2)


current_dir = os.path.dirname(os.path.realpath(__file__))
tablak_path = os.path.join(current_dir, "tablak")
files_in_dir = os.listdir(tablak_path)

print(files_in_dir)
for file in files_in_dir:
    main(os.path.join(tablak_path, file))
