'''     A PROGRAM MŰKÖDÉSE

1. Adott helyettesítési táblázat letöltése

2. A kapott xlsx fájl felső szövegét átírni "cim"-é
Példa átirandó szöveg: "TEREMVÁLTOZÁSOK EMELT SZINTŰ SZÓBELI ÉRETTSÉGI MIATT"

3. A kapott xlsx fájl átalakítása JSON formátumba
https://excel2json.io/editor

4. A JSON-t átmásolni e file mappájának "tablak" mappákába


A kapott fájl valahogy így néz ki:
[{
"1": null, "2": null, "3": null, "4": null, "5": null,
"6": null, "7": null, "8": null, "9": null, "cim": null, "": "HÉTFŐ"
},{
"1": "1.", "2": "2.", "3": "3.", "4": "4.", "5": "5.",
"6": "6.", "7": "7.", "8": "8.", "9": "9.", "cim": null, "": "0."
},{
"1": "9.\r\nn4", "2": "10.\r\nfr2", "3": null, "4": null, "5": "9.A\r\nbi1",
"6": "9.CDF\r\na3", "7": "9.CDF\r\na3", "8": null, "9": null, "cim": "305-ből", "": null
},{
"1": 219, "2": 108, "3": null, "4": null, "5": 20,
"6": 52, "7": 52, "8": null, "9": null, "cim": "hová", "": null
},

Általánosan:
A "cim" kulcsot manuálisan kell baállítani.
Ha egy sorban a "cim" == null, akkor vagy:
"1": 1, "2": 2, ... vagy
"": [AZ ADOTT NAP]
Egyébként a "cim" vagy az érintett terem (pl.: "100-ból") vagy "hová".



CÉL az alábbi formátum elérése:
{ dátum : {"osztály" : [
    [óra, "honnan", "hova", "tárgy"],
    [óra, "honnan", "hova", "tárgy"]
]}},
'''
import json
from datetime import timedelta, datetime
import os

CIM = 'TEREMVÁLTOZÁSOK\r\nkisérettségimiatt\r\n2024.szeptember11.szerda'
KEZDO_DATUM = '2024.09.11'

with open('public/storage/roomchanges.json', 'r', encoding='utf-8') as outfile:
    regi_cserek = json.loads(outfile.read())


def kovetkezo_datum(datum: str, lepes=1) -> str:
    ev, ho, nap = map(int, datum.split('.'))
    next_day_date = datetime(ev, ho, nap) + timedelta(days=lepes)
    return next_day_date.strftime('%Y.%m.%d')


def het_napja(datum: str) -> str:
    ev, ho, nap = map(int, datum.split('.'))
    datum = datetime(ev, ho, nap)
    return datum.strftime('%A')


def en_to_hu(word: str) -> str:
    return {
        'monday': 'hétfő', 'tuesday': 'kedd', 'wednesday': 'szerda',
        'thursday': 'csütörtök', 'friday': 'péntek',
        'saturday': 'szombat', 'sunday': 'vasárnap'
    }.get(word.lower(), word)


current_dir = os.path.dirname(os.path.realpath(__file__))
tablak_path = os.path.join(current_dir, "tablak")
files_in_dir = os.listdir(tablak_path)

if len(files_in_dir) == 1:
    file = files_in_dir[0]
else:
    for i, f in enumerate(files_in_dir):
        print(f'{i+1}. {f}')
    index = input('Choose a file: ')
    file = files_in_dir[int(index)-1]

path = os.path.join(tablak_path, file)
with open(path, 'r', encoding='utf-8') as outfile:
    nyers_cserek = json.loads(outfile.read())

keys = list('123456789')
keys.append(CIM)
keys.append('')

quick_forras = []
for sor in nyers_cserek:
    tmp = [sor.get(key) for key in keys]
    quick_forras.append(tmp)

input('A kezdő dátum: ' + KEZDO_DATUM + '\nHa helyes, nyomj entert! ')

ossz_cserek = []
ma = kovetkezo_datum(KEZDO_DATUM, -1)

i = 0
mai_cserek = []
while i < len(quick_forras):
    sor = quick_forras[i]
    kov_sor = quick_forras[i + 1]
    if (not sor[keys.index(CIM)] or sor[keys.index(CIM)] == '  ') and not sor[keys.index('1')]:
        if mai_cserek:
            ossz_cserek.append([ma, mai_cserek])
        ma = kovetkezo_datum(ma)
        mai_cserek = []
        if en_to_hu(het_napja(ma)) != sor[keys.index('')].lower():
            print('A kezdő dátum nem egyezik a táblázattal.\nA műveletet megszakítottuk.')
            exit()
        i += 1
        continue
    elif sor[keys.index('1')] == '1.':
        i += 1
        continue

    for ora in range(9):
        if sor[ora] is not None:
            mai_cserek.append([ora + 1, str(sor[keys.index(CIM)]).split('-')[0], kov_sor[ora], str(sor[ora]).split('\n')[0], str(sor[ora]).split('\n')[1]])
    i += 2

if mai_cserek:
    ossz_cserek.append([ma, mai_cserek])

quickRoomchangesConfig = []
roomchangesConfig = ossz_cserek

for dayIndex, day in enumerate(roomchangesConfig):
    gropDone = []
    quickRoomchangesConfig.append([day[0], []])

    for change in day[1]:
        if change[3] not in gropDone:
            quickRoomchangesConfig[dayIndex][1].append([change[3], []])
            gropDone.append(change[3])

        for groupIndex, group in enumerate(quickRoomchangesConfig[dayIndex][1]):
            if group[0] == change[3]:
                quickRoomchangesConfig[dayIndex][1][groupIndex][1].append([change[0], change[1], change[2], change[4]])

shorted_quickRoomchangesConfig = []
for day in quickRoomchangesConfig:
    data = day[1]
    shorted_quickRoomchangesConfig.append([day[0], sorted(data, key=lambda x: x[0])])

# Az új formátum előállítása
final_data = {}
for day in shorted_quickRoomchangesConfig:
    date = day[0]
    final_data[date] = {}
    for group in day[1]:
        osztaly = group[0].replace('\r', '')
        final_data[date][osztaly] = {
            'all' : []
        }
        for lesson in group[1]:
            if final_data[date][osztaly].get(lesson[0]) is None:
                final_data[date][osztaly][lesson[0]] = []
            final_data[date][osztaly][lesson[0]].append([lesson[0], lesson[1], lesson[2], lesson[3]])
            final_data[date][osztaly]['all'].append([lesson[0], lesson[1], lesson[2], lesson[3]])

# Add to the final data the old roomchanges
final_data = {**final_data, **regi_cserek}
# JSON fájl írása
output_path = os.path.join('public', 'storage', 'roomchanges.json')
with open(output_path, 'w', encoding='utf-8') as outfile:
    json.dump(final_data, outfile, indent=2, ensure_ascii=False)
