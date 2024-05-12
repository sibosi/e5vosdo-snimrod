import requests
from bs4 import BeautifulSoup
import json

TEACHER_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcOsfFbgyCMm_frzL_cdUQfSjOJD1RSWhHFKKUKZWhaQ&s'

# Main: https://suli.ejg.hu/intranet/helyettes/refresh.php
# Test: https://www.w3schools.com/html/html_tables.asp
# Test: https://www.nbcolympics.com/tokyo-2020-medal-standings
# EJG : https://www.ejg.hu/tanarok/tanarok/
url = 'https://suli.ejg.hu/intranet/helyettes/refresh.php'
response = requests.get(url)
html_content = response.text
soup = BeautifulSoup(html_content, 'html.parser')


table = soup.find('table')

data = [['Ma', 'Deák Anna', '3', '4', '5'], ['Ma', 'Szeredás Lőrinc', '3', '4', '5'],['Ma', 'Tóthné Tarsoly Zita', '3', '4', '5'],['Holnap', 'Deák Anna', '3', '4', '5']]
rows = table.find_all('tr')
for row in rows:
    cells = row.find_all('td')
    row_data = [cell.get_text() for cell in cells]
    if row_data != []: data.append(row_data)

with open('public\\storage\\teachers.json', 'w') as outfile:
    json.dump(data, outfile)



with open('components\\helyettesites\\osszestanar.json', 'r', encoding='utf-8') as outfile:
    tanarok_tabla = outfile.read()
    tanarok_tabla = json.loads(tanarok_tabla)

quick_data = [] # [ [A,[1, 2]], [B,[1, 2]] ]
for new_event in data:
    i = 0
    for added_event in quick_data:
        
        if new_event[1] in added_event:
            quick_data[i][2].append(new_event)
            i = None
            break
        i+=1
        
    if i != None:
        for tanar in tanarok_tabla:
            found = False
            if tanar["Name"] == new_event[1]:
                quick_data.append([new_event[1], tanar["Photo"], [new_event]])
                found = True
                break

        if not found:
            quick_data.append([new_event[1], TEACHER_AVATAR, [new_event]])
        

with open('public\\storage\\quick-teachers.json', 'w') as outfile:
    json.dump(quick_data, outfile)
