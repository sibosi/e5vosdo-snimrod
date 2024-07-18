# This project is a timetable management system for a school. It is a simple project that allows the admin to manage the timetable of the school. The admin can add, update, and delete timetable details. It does not have UI. This program will be translated into typescript and react in the future.
# The program has the following features:
# 1. Manage classes
# 2. Manage students
# 3. Manage teachers
# 4. Manage timetable
# 5. Others...

'''
id, name, description, slot_id, location_id, signup_type, is_competition, signup_dealine, organiser, capacity, img_url, starts_at, ends_at, deleted_at, created_at, updated_at, root_parent, direct_child, min_team_size, max_team_size
'''

EJG_EVFOLYAMOK_DICT = {
    '7' : ['A', 'B'],
    '8' : ['A', 'B'],
    '9' : ['A', 'B', 'C', 'D', 'E', 'F', 'Ny'],
    '10' : ['A', 'B', 'C', 'D', 'E', 'F'],
    '11' : ['A', 'B', 'C', 'D', 'E', 'F'],
    '12' : ['A', 'B', 'C', 'D', 'E', 'F'],

    '7-8' : ['7.A', '7.B', '8.A', '8.B'],
}

LESSON_DICT = {
    'a' : 'angol',
    'n' : 'német',
    '2.ny' : '2. nyelv',

    'fiz': 'fizika',
    'ké': 'kémia',
    'bi': 'biológia',
    'fö' : 'földrajz',

    'mt': 'matematika',
    'mat': 'matematika',
    'm' : 'magyar',
    'tö' : 'történelem',

    'of' : 'osztályfőnöki',
    'é' : 'ének',
    'dig': 'digitális kultúra',
    'inf': 'informatika',
    'nyt': 'nyelvtan',
    'tn': 'testnevelés',
    'et': 'etika',
    'eti': 'etika',
    'hit': 'hittan',
    'r': 'rajz',

    'műv': 'művészetek',
    'tt' : 'technika és tervezés',
    'ápi' : 'állampolgári ismeretek',
    'api' : 'állampolgári ismeretek',

    'MT': 'matematikaFakt',
    'M': 'magyar',
    'TÖ': 'történelem',
    'FIZ': 'fizika',
    'KÉ': 'kémia fakt',
    'BI': 'biológia fakt',

    'FA': 'A faktsáv',
    'FB': 'B faktsáv',
    'FC': 'C faktsáv',
    'FD': 'D faktsáv',


    '-': 'üres',
    '': 'üres',
}

not_in_lesson_dict = []

table = []

class Lesson():
    def __init__(self, EJG_class, day, start_time, room=None, teacher=None, subject=None, group=None):
        self.EJG_class = EJG_class
        self.evfolyam = EJG_class.split('.')[0]
        self.osztaly = EJG_class.split('.')[1]

        self.day = day
        self.start_time = start_time
        self.room = room
        self.group = group
        self.teacher = teacher
        self.subject = subject
        self._count_end_time()
        table.append(self)
    
    def _count_end_time(self, duration_minute=45):
        minute = int(self.start_time.split(':')[1]) + duration_minute
        hour = int(self.start_time.split(':')[0]) + (minute // 60)
        minute %= 60

        # Make it two digits
        minute = str(minute) if minute >= 10 else f"0{minute}"
        hour = str(hour) if hour >= 10 else f"0{hour}"

        self.end_time = f"{hour}:{minute}"
    
    def __str__(self):
        return f"Class: {self.EJG_class}, Day: {self.day}, Start: {self.start_time}, Subject: {self.subject}   Room: {self.room}   Teacher: {self.teacher}  Group: {self.group}"
    
def get_str_list(list: list) -> str:
    response = ''
    for item in list:
        response += f"\n{item}, "
    return response[:-2]

def get_lesson(attributes: dict, auto_find=True) -> Lesson | None:
    keys = list(attributes.keys())

    lessons = table
    def get_lessons(lessons, key: str, value):
        response = []

        for lesson in lessons:
            lesson: Lesson
            if key == 'EJG_class':
                if lesson.EJG_class == value:
                    response.append(lesson)
            elif key == 'day':
                if lesson.day == value:
                    response.append(lesson)
            elif key == 'start_time':
                if lesson.start_time == value:
                    response.append(lesson)
            elif key == 'subject':
                if lesson.subject == value:
                    response.append(lesson)
            elif key == 'room':
                if lesson.room == value:
                    response.append(lesson)
            elif key == 'teacher':
                if lesson.teacher == value:
                    response.append(lesson)
            elif key == 'group':
                if lesson.group == '?': return [lesson]
                if lesson.group == value:
                    response.append(lesson)
            
        return response

    for key in keys:
        lessons = get_lessons(lessons, key, attributes[key])

    if len(lessons) > 1:
        # Throw python error in terminal
        raise ValueError(f'There are more than one lesson with the given attributes.\n{get_str_list(lessons)}')
    elif len(lessons) == 0:
        if 'group' in keys and auto_find:
            if attributes['group'] == 1: attributes['group'] = 2
            elif attributes['group'] == 2: attributes['group'] = 1
            else: return None

            return get_lesson(attributes, auto_find=False)
        else:
            return None
    else:
        lesson = lessons[0]
        lesson: Lesson
        return lesson


import os
import pandas as pd

CURRENT_DIR = os.getcwd()

CLASS_TABLE_PATH = os.path.join(CURRENT_DIR, 'timetable\\Osztályórarend_EJG.xlsx')
TEACHER_TABLE_PATH = os.path.join(CURRENT_DIR, 'timetable\\Tanári_órarend_EJG.xlsx')
ROOM_TABLE_PATH = os.path.join(CURRENT_DIR, 'timetable\\Terembeosztás_EJG.xlsx')


#
# AZ OSZTÁLYÓRAREND TÁBLÁZAT FELDOLGOZÁSA
#
df = pd.read_excel(CLASS_TABLE_PATH)
print("Using iterrows():")
for index, row in df.iterrows():
    if index % 2 == 1:
        # Az aktuális osztály, akinek az órarendjét feldolgozzuk
        actual_class = row['OSZTÁLY'].split('\n')[0]
        for day in range(0, 5):
            for i in range(0, 8):
                # Az osztály összes celláját feldolgozzuk, naponként
                lesson_block = str(row.iloc[day * 8 + i + 1])
                # Az órarendben, ha több tantárgy is van egy cellában, akkor azokat külön-külön kezeljük
                lesson_blocks = [item for item in lesson_block.split('\n') if item != '']

                lesson_blocks = []
                for a in lesson_block.split('\n'):
                    for b in a.split(' '):
                        lesson_blocks.append(b)

                subjects = []
                if lesson_blocks == ['nan']: continue
                
                for subject in lesson_blocks:
                    if subject in LESSON_DICT.keys():
                        subjects.append(LESSON_DICT[subject])
                    else:
                        subjects.append(subject)
                        if subject not in not_in_lesson_dict:
                            not_in_lesson_dict.append(subject)

                # print(day * i, lesson_block)
                if subjects != ['nan']:
                    for index, subject in enumerate(subjects):
                        index += 1
                        if index == 3: index = 3
                        room = None
                        if subject in ['angol', 'német', '2. nyelv'] and subjects.count(subject) == 1:
                            index = '?'
                            room = 'változó / tmp value'
                        
                        Lesson(actual_class, ['H', 'K', 'SZ', 'CS', 'P'][day], ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30'][i], subject=subject, group=index, room=room)


#
# A TEREMBEOSZTÁS TÁBLÁZAT FELDOLGOZÁSA
#
all_room = 0
all_lesson_in_room = 0
detected_rooms = []
not_detected_rooms = []
room_conflicts = []
problematic_subjects = {}
df = pd.read_excel(ROOM_TABLE_PATH)
print("Using iterrows():")
for index, row in df.iterrows():
    if index > 0 and index != 54:
        # Az aktuális terem, aminek a beosztását feldolgozzuk
        if len(row.iloc[0].split('\n')[0]) == 3 or len(row.iloc[0].split('\n')[0]) == 4:
            room = row.iloc[0].split('\n')[-1]
        else: room = row.iloc[0].replace('\n', ' ')
        
        all_room += 1
        
        for day in range(0, 5):
            for i in range(0, 10):
                # A terem összes celláját feldolgozzuk, naponként
                lesson_block = str(row.iloc[day * 10 + i + 1])
                if lesson_block == 'nan': continue
                subject_options = lesson_block.split('\n')[-1]

                for subject in subject_options.split('/'):

                    # Az órarendben a tantárgyak végén szerepelhet a csoport száma, pl. 'a1'
                    group = 1
                    if subject[-1].isdigit():
                        group = int(subject[-1])
                        subject = subject[:-1]

                    if subject in LESSON_DICT.keys():
                        subject = LESSON_DICT[subject]
                    
                    classes = lesson_block.split('\n')[:-1]
                    if len(classes) == 0: EJG_classes = ['']

                    for EJG_class in classes:
                        need_EJG_classes = True
                        evfolyam = EJG_class.split('.')[0]
                        if '.' not in EJG_class:
                            EJG_classes = EJG_class
                            need_EJG_classes = False

                        if need_EJG_classes:
                            if len(EJG_class.split('.')) == 1:
                                if evfolyam[0].isdigit():
                                    osztalyok = EJG_EVFOLYAMOK_DICT[evfolyam]
                                    if '-' in osztalyok:
                                        EJG_classes = EJG_EVFOLYAMOK_DICT[evfolyam]
                                        need_EJG_classes = False
                            elif EJG_class.split('.')[1] == '':
                                if evfolyam[0].isdigit():
                                    osztalyok = EJG_EVFOLYAMOK_DICT[evfolyam]
                                    if '-' in osztalyok:
                                        EJG_classes = EJG_EVFOLYAMOK_DICT[evfolyam]
                                        need_EJG_classes = False
                            else:
                                osztalyok = list(EJG_class.split('.')[1])
                            if 'y' in osztalyok:
                                osztalyok.remove('y')
                                osztalyok.remove('N')
                                osztalyok.append('Ny')
                        
                        if need_EJG_classes:
                            EJG_classes = [f"{evfolyam}.{osztaly}" for osztaly in osztalyok]
                        
                        if EJG_classes == []:
                            print('HIBA!')
                            print(room, ['H', 'K', 'SZ', 'CS', 'P'][day], i, subject)
                            print(EJG_class)
                            print(EJG_class.split('.'))
                        
                    # print(room, ['H', 'K', 'SZ', 'CS', 'P'][day], ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30', '15:25', '16:20'][i], subject, EJG_classes)

                    for EJG_class in EJG_classes:
                        all_lesson_in_room += 1
                        lesson = get_lesson({
                            'day': ['H', 'K', 'SZ', 'CS', 'P'][day],
                            'start_time': ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30', '15:25', '16:20'][i],
                            'subject': subject,
                            'EJG_class': EJG_class,
                            'group': group
                        })
                        if lesson != None:
                            # print(str(lesson))

                            if lesson.room != None:
                                Lesson(lesson.EJG_class, lesson.day, lesson.start_time, subject=lesson.subject, room=room, group=group)
                            else:
                                lesson.room = room

                            detected_rooms.append([
                            room, ['H', 'K', 'SZ', 'CS', 'P'][day], ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30', '15:25', '16:20'][i], subject, EJG_class, group
                            ])
                        else:
                            not_detected_rooms.append([
                                room, ['H', 'K', 'SZ', 'CS', 'P'][day], ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30', '15:25', '16:20'][i], subject, EJG_class, group
                            ])


has_room = 0
no_room = 0

for item in table:
    if item.room == None:
        no_room += 1
        # print(item)
        problematic_subjects[item.subject] = problematic_subjects.get(item.subject, 0) + 1
    else:
        has_room += 1

print()
print('All lessons:', len(table))
print(f">>> Has room: {has_room}\n>>> No room: {no_room}")
print('All lessons in room:', all_lesson_in_room)
print(f'>>> Has lesson: {len(detected_rooms)}\n>>> No lesson: {len(not_detected_rooms)}')
print(f'\nSuccess rate: {round(has_room / (has_room + no_room) * 100, 4)}%\n')

print('Problematic subjects:')
# Sort by value
# Print in a readable table
problematic_subjects = dict(sorted(problematic_subjects.items(), key=lambda item: item[1], reverse=True))
for key in problematic_subjects.keys():
    
    subject_room = 0
    for item in not_detected_rooms:
        if item[3] == key:
            subject_room += 1

    print(f"{problematic_subjects[key]} lesson and {subject_room} room : {key}")

print('\n\nOther rooms with wrong subject:')
for item in not_detected_rooms:
    if item[3] not in problematic_subjects.keys():
        pass
        # print(item[3], item)


print('Not in lesson dict:')
print(not_in_lesson_dict)

def print_problematic_classes():
    # Print problematic classes
    print('\nProblematic classes:')
    EJG_classes = {}
    for item in table:
        if item.room == None:
            EJG_classes[item.EJG_class] = EJG_classes.get(item.EJG_class, 0) + 1

    EJG_classes = dict(sorted(EJG_classes.items(), key=lambda item: item[1], reverse=True))
    for key in EJG_classes.keys():
        print(f"{EJG_classes[key]} lesson: {key}")

    txt = None
    while txt != '':
        txt = input('\nPrint problematic classes? (ordinal number): ')
        if txt != '':
            EJG_class = (list(EJG_classes.keys())[int(txt) - 1])
            print(f"\n{EJG_class} lessons:")
            tmp1 = []
            for item in table:
                if item.room == None and item.EJG_class == EJG_class:
                    tmp1.append(item)
            
            print(f'{len(tmp1)} lesson:')
            for item in tmp1: print(item)
            
            print('\n\n')
            tmp2 = []
            for item in not_detected_rooms:
                if item[4] == EJG_class:
                    tmp2.append(item)
            
            print(f'{len(tmp2)} room:')
            for item in tmp2: print(item)



def print_problematic_subjects():
    # Print problematic subjects
    txt = None
    while txt != '':
        txt = input('\nPrint problematic subjects? (ordinal number): ')
        if txt != '':
            subject = (list(problematic_subjects.keys())[int(txt) - 1])
            print(f"\n{subject} lessons:")
            for item in table:
                item: Lesson
                if item.room == None and item.subject == subject:
                    print(item)
            
            print('\n\n')

            for item in not_detected_rooms:
                if item[3] == subject:
                    print(item)

print()
print('All lessons:', len(table))
print(f">>> Has room: {has_room}\n>>> No room: {no_room}")
print('All lessons in room:', all_lesson_in_room)
print(f'>>> Has lesson: {len(detected_rooms)}\n>>> No lesson: {len(not_detected_rooms)}')
print(f'\nSuccess rate: {round(has_room / (has_room + no_room) * 100, 4)}%\n')

# print_problematic_subjects()

print_problematic_subjects()
