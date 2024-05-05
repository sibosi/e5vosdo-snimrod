import requests
from bs4 import BeautifulSoup
import json

# Main: https://suli.ejg.hu/intranet/helyettes/refresh.php
# Test: https://www.w3schools.com/html/html_tables.asp
url = 'https://suli.ejg.hu/intranet/helyettes/refresh.php'
response = requests.get(url)
html_content = response.text
soup = BeautifulSoup(html_content, 'html.parser')


table = soup.find('table')

data = []
rows = table.find_all('tr')
for row in rows:
    cells = row.find_all('td')
    row_data = [cell.get_text() for cell in cells]
    if row_data != []: data.append(row_data)

with open('public\\storage\\teachers.json', 'w') as outfile:
    json.dump(data, outfile)
