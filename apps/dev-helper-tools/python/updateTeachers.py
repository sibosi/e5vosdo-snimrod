import requests
from bs4 import BeautifulSoup
import json

'''

A simple row:
<tr>
<td>Acosta-Varga Sára</td>
<td><img decoding="async" src="https://www.ejg.hu/wp-content/uploads/Varga_Sara2-scaled.jpg" alt="Varga Sára" width="40" height="80" border="0"></td>
<td>történelem, etika</td>
<td>10. F</td>
<td>&nbsp;</td>
<td><a href="mailto:acosta.varga.sara@e5vos.hu">acosta.varga.sara@e5vos.hu</a></td>
</tr>


The teacherDataByNames.json example:
{
"Acosta-Varga Sára": {
    "Name": "Acosta-Varga Sára",
    "Photo": "https://www.ejg.hu/wp-content/uploads/Varga_Sara2-scaled.jpg",
    "Subjects": "történelem, etika",
    "Head": "9. F",
    "Others": "KT vezető",
    "Mail": "acosta.varga.sara@e5vos.hu"
  },
}

'''

URL = 'https://www.ejg.hu/tanarok/tanarok/'
TITLES = ['Name', 'Photo', 'Subjects', 'Head', 'Others', 'Mail']
response = requests.get(URL, verify=False)
html_content = response.text
html_content = html_content.replace('</tr\n', '</tr>\n') # I know. It hurts me too. But it's necessary.
soup = BeautifulSoup(html_content, 'html.parser')

# There are multiple tables on the page. We need that one which has an id == 'tanarok_elerhetosege'
table = soup.find('table', id='tanarok_elerhetosege')

data = []
rows = table.find_all('tr')
for row in rows:
    
    cells = row.find_all('td')
    row_data = []
    for cell in cells:
        if cell.find('img') != None:
            row_data.append(cell.find('img')['src'])
        elif cell.find('a') != None:
            row_data.append(cell.find('a')['href'])
        else:
            # Replace &nbsp; with empty string
            row_data.append(cell.text.replace('\xa0', ''))
    
    row_data = dict(zip(TITLES, row_data))

    if row_data != {}: data.append(row_data)

teacherDataByNames = {}

for teacher in data:
    teacherDataByNames[teacher['Name']] = teacher

with open('public/storage/teacherDataByNames.json', 'w', encoding="UTF-8") as f:
    f.write(json.dumps(teacherDataByNames, ensure_ascii=False, indent=2))
    f.close()

print('Successfully created teacherDataByNames.json')
