import json

# Open the file osszestanar.json
with open('src/osszestanar.json', 'r', encoding="UTF-8") as f:
    # Read the file
    data = f.read()
    # Convert the JSON data into a dictionary
    teacherDict = json.loads(data)

teacherDataByNames = {}

for teacher in teacherDict:
    teacherDataByNames[teacher['Name']] = teacher

# print(teacherDataByNames)

with open('public/storage/teacherDataByNames.json', 'w', encoding="UTF-8") as f:
    f.write(json.dumps(teacherDataByNames, ensure_ascii=False, indent=4))
    f.close()

print('Successfully created teacherDataByNames.json')
