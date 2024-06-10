'''
A PROGRAM MŰKÖDÉSE

1. Adott helyettesítési táblázat letöltése


2. A kapott xlsx fájl felső szövegét átírni "cim"-é
Példa átirandó szöveg: "TEREMVÁLTOZÁSOK EMELT SZINTŰ SZÓBELI ÉRETTSÉGI MIATT"


3. A kapott xlsx fájl átalakítása JSON formátumba
https://excel2json.io/editor

4. A JSON-t átmásolni e file mappájának "tablak" mappákába


A kapott fájl valahogy így néz ki:
[
{
"1": null, "2": null, "3": null, "4": null, "5": null,
"6": null, "7": null, "8": null, "9": null, "cim": null, "": "HÉTFŐ"
},
{
"1": "1.", "2": "2.", "3": "3.", "4": "4.", "5": "5.",
"6": "6.", "7": "7.", "8": "8.", "9": "9.", "cim": null, "": "0."
},
{
"1": "9.\r\nn4", "2": "10.\r\nfr2", "3": null, "4": null, "5": "9.A\r\nbi1",
"6": "9.CDF\r\na3", "7": "9.CDF\r\na3", "8": null, "9": null, "cim": "305-ből", "": null
},
{
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
{ dátum : {"A" : [fogások], "B" : [fogások], "nap" : a hét napja},
  dátum : {"A" : [fogások], "B" : [fogások], "nap" : a hét napja} }
'''

import json
from datetime import timedelta, datetime
import os

CIM = 'cim'


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

def en_to_hu(word: str) -> str:
    word = word.lower()
    return {'monday': 'hétfő', 'tuesday': 'kedd', 'wednesday': 'szerda', 'thursday': 'csütörtök', 'friday': 'péntek', 'saturday': 'szombat', 'sunday': 'vasárnap'}[word]
    

current_dir = os.path.dirname(os.path.realpath(__file__))
tablak_path = os.path.join(current_dir, "tablak")
files_in_dir = os.listdir(tablak_path)

print(files_in_dir)

if len(files_in_dir) == 1:
    file = files_in_dir[0]
else:
    file = input('Choose a file: ')

path = os.path.join(tablak_path, file)
with open(path, 'r', encoding='utf-8') as outfile:
    nyers_cserek = json.loads(outfile.read())

##############################

keys = list('123456789')
keys.append(CIM)
keys.append('')

quick_forras = []

for sor in nyers_cserek:
    tmp = []
    for key in keys:
        tmp.append(sor[key])
    quick_forras.append(tmp)
    
##############################


KEZDO_DATUM = '2024.06.10'

ossz_cserek = []

ma = kovetkezo_datum(KEZDO_DATUM, -1)

i = 0
mai_cserek = []
while i < len(quick_forras):
    sor = quick_forras[i]
    kov_sor = quick_forras[i+1]
    if (not sor[keys.index(CIM)] or sor[keys.index(CIM)] == '  ') and not sor[keys.index('1')]:
        if mai_cserek != []: ossz_cserek.append([ma, mai_cserek])
        ma = kovetkezo_datum(ma)
        mai_cserek = []
        if en_to_hu(het_napja(ma).lower()).lower() != sor[keys.index('')].lower():
            print('A kezdő dátum nem egyezik a táblázattal.\nA műveletet megszakítottuk.')
            print(en_to_hu(het_napja(ma).lower()).lower(), sor, sor[keys.index('')], keys.index(''))
            exit()
        i += 1
        continue
    elif sor[keys.index('1')] == '1.':
        i += 1
        continue

    for ora in range(0, 9):
        if sor[ora] != None:
            print(ora+1)
            print(sor[keys.index(CIM)].split('-')[0])
            print(kov_sor[ora])
            print(sor[ora].split('\n')[0])
            print(sor[ora].split('\n')[1])
            mai_cserek.append([ora+1, sor[keys.index(CIM)].split('-')[0], kov_sor[ora], sor[ora].split('\n')[0], sor[ora].split('\n')[1]])
    i += 2
if mai_cserek != []: ossz_cserek.append([ma, mai_cserek])

print(ossz_cserek)
for i in ossz_cserek:
    print(i[0], len(i[1]))
input('Ellenőrzd a helyettesítések számát! ')
####################

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

with open('public\\storage\\roomchanges.json', 'w', encoding='utf-8') as outfile:
    json.dump(shorted_quickRoomchangesConfig, outfile)

