# A program célja az osztályok órarendjének digitalizálása, azaz az osztályok órarendjének táblázatból való beolvasása, majd az órákhoz tartozó tanárok, terem és tantárgyak hozzárendelése.
# A program 3 táblázatot dolgoz fel:
# - Osztályórarend
# - Tanári órarend
# - Terembeosztás
# A program először létrehozza a Terembeosztás táblázat felhasználásával az órákat.
# Fontos, hogy nem tudjuk, hogy melyik osztály melyik órán jelenik meg, csak lehetőségeket állítunk fel.
# Ezután a program a Tanári órarend táblázat felhasználásával megpróbálja a lehetőségeket pontosítani.
# Végül az Osztályórarend táblázat felhasználásával a lehetőségeket pontosítja.

# A program nem képes minden esetben pontosan meghatározni az órákat, mivel a táblázatok nem egyértelműek.
# Azonban a program képes a lehetőségek szűkítésére, és a pontosításra.
# Problémás esetek:
# - nyelvi csoportok,
# - 7-8. osztályok, ahol összevonás történik,
# - félévente változó órarendek,

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

step2_exceptions = [{
    'EJG_class': '11.F',
    'day': 'K',
    'lesson_index' : 4,
    'subject': 'magyar',
    'teacher': 'Eszes Valéria'
},
{
    'EJG_class': '11.F',
    'day': 'CS',
    'lesson_index' : 2,
    'subject': 'magyar',
    'teacher': 'Eszes Valéria'
}]

def is_in_exceptions(EJG_class, day, lesson_index, subject, teacher):
    for exception in step2_exceptions:
        if exception['EJG_class'] == EJG_class and exception['day'] == day and exception['lesson_index'] == lesson_index and exception['subject'] == subject and exception['teacher'] == teacher:
            return True
    return False

class Lesson():
    def __init__(self, EJG_class_options: list, day: str, start_time: str, room=None, teacher=None, subject=None, group=None):

        valid_EJG_class_options = []
        if EJG_class_options == []: self.EJG_classes = []
        else: self.EJG_classes = [EJG_class_options[0]]

        # Több osztály lehetséges
        # egy osztály:  10.C
        # több osztály: 9.CDF
        # egy évfolyam: 9.
        # több évfolyam: 7-8.
        # Egyéb, nem osztály: matek szk.

        for EJG_class_option in EJG_class_options:
            if EJG_class_option[-1] == ' ': EJG_class_option = EJG_class_option[:-1]
            # Ha a vége " évf."
            if EJG_class_option[-5:] == ' évf.': EJG_class_option = EJG_class_option[:-5]
            # Ha valós osztály / évfolyam
            if '.' in EJG_class_option and EJG_class_option[0].isdigit():
                # Ha évfolyam(ok)
                if EJG_class_option.split('.')[1] == '':
                    EJG_class_option = EJG_class_option.split('.')[0]
                    # Ha több évfolyam
                    if '-' in EJG_class_option:
                        for EJG_class_option in EJG_class_option.replace('.', '').split('-'):
                            for letter in EJG_EVFOLYAMOK_DICT[EJG_class_option]:
                                valid_EJG_class_options.append(f"{EJG_class_option}.{letter}")
                    # Ha egy évfolyam
                    else:
                        for letter in EJG_EVFOLYAMOK_DICT[EJG_class_option]:
                            valid_EJG_class_options.append(f"{EJG_class_option}.{letter}")
                # Ha osztály(ok)
                elif len(EJG_class_option.split('.')) == 2:
                    EJG_class_option = EJG_class_option.replace('Ny', 'N')
                    evfolyam = EJG_class_option.split('.')[0]
                    # Ha több osztály
                    if len(EJG_class_option.split('.')[1]) > 1:
                        for EJG_class_option in EJG_class_option.split('.')[1]:
                            valid_EJG_class_options.append(f"{evfolyam}.{EJG_class_option}")
                    # Ha egy osztály
                    else:
                        valid_EJG_class_options.append(EJG_class_option)
                # Egyébként hiba
                else: raise ValueError(f'Invalid EJG_class: {EJG_class_option}')
            # Egyéb, nem osztály
            else: valid_EJG_class_options.append(EJG_class_option)
        if valid_EJG_class_options == []: valid_EJG_class_options = ['']
        self.EJG_classes.append(valid_EJG_class_options)

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
        return f"Class: {self.EJG_classes}, {self.day} {self.start_time}, Subject: {self.subject}/{self.group} Room: {self.room} Teacher: {self.teacher}"
    
def get_str_list(list: list) -> str:
    response = ''
    for item in list:
        response += f"\n{item}, "
    return response[:-2]

def get_lessons(attributes: dict, auto_find=False, specific_group=True) -> list[Lesson] | None:
    keys = list(attributes.keys())

    lessons = table
    def get_lessons(lessons, key: str, value):
        response = []

        for lesson in lessons:
            lesson: Lesson
            if key == 'EJG_class':
                if specific_group:
                    if value in lesson.EJG_classes:
                        response.append(lesson)
                else:
                    if len(lesson.EJG_classes) >= 2:
                        if value in lesson.EJG_classes[1]:
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
                if lesson.group == value or lesson.group == None or lesson.group == '?':
                    response.append(lesson)
            
        return response

    for key in keys:
        lessons = get_lessons(lessons, key, attributes[key])

    return lessons
    if len(lessons) > 1:
        return lessons
        raise ValueError(f'There are more than one lesson with the given attributes.\n{get_str_list(lessons)}')
    elif len(lessons) == 0:
        return lessons
        if 'group' in keys and auto_find:
            if attributes['group'] == 1: attributes['group'] = 2
            elif attributes['group'] == 2: attributes['group'] = 1
            else: return None

            return get_lessons(attributes, auto_find=False)
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


# A TEREMBEOSZTÁS TÁBLÁZAT FELDOLGOZÁSA ÉS AZ ÓRÁK LÉTREHOZÁSA
def step1():
    df = pd.read_excel(ROOM_TABLE_PATH)
    print("A TEREMBEOSZTÁS TÁBLÁZAT FELDOLGOZÁSA")
    for row_index, row in df.iterrows():
        if row_index > 0 and row_index != 54:
            # Az aktuális terem, aminek a beosztását feldolgozzuk
            if len(row.iloc[0].split('\n')[0]) == 3 or len(row.iloc[0].split('\n')[0]) == 4:
                room = row.iloc[0].split('\n')[-1]
            else: room = row.iloc[0].replace('\n', ' ')
            

            for day_index, day in enumerate(['H', 'K', 'SZ', 'CS', 'P']):
                for lesson_block_index in range(0, 10):
                    # A terem összes celláját feldolgozzuk, naponként
                    lesson_block = str(row.iloc[day_index * 10 + lesson_block_index + 1])
                    if lesson_block in ['nan', '', ' ']: continue
                    subject_options = lesson_block.split('\n')[-1]

                    # Az órarendben a több tantárgy is szerepelhet egy cellában, pl. 'fiz/ké/bi'
                    real_subjects = []
                    for subject in subject_options.split('/'):
                        # Az órarendben a tantárgyak végén szerepelhet a csoport száma, pl. 'a1'
                        group = None
                        if subject[-1].isdigit():
                            group = int(subject[-1])
                            subject = subject[:-1]

                        if subject in LESSON_DICT.keys():
                            subject = LESSON_DICT[subject]
                        
                        real_subjects.append((subject, group))


                    EJG_class_options = lesson_block.split('\n')[:-1]
                    for real_subject in real_subjects:
                        Lesson(EJG_class_options, day, ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30', '15:25', '16:20'][lesson_block_index], room=room, subject=real_subject[0], group=real_subject[1])


# A TANÁRI ÓRAREND TÁBLÁZAT FELDOLGOZÁSA
def fit_teachers_to_lessons():
    teacher_block_counter = 0
    df = pd.read_excel(TEACHER_TABLE_PATH)
    print("A TANÁRI ÓRAREND TÁBLÁZAT FELDOLGOZÁSA")
    for row_index, row in df.iterrows():
        if row_index > 0:
            # Az aktuális tanár, akinek az órarendjét feldolgozzuk
            teacher = row.iloc[0]
            for day_index, day in enumerate(['H', 'K', 'SZ', 'CS', 'P']):
                for lesson_block_index in range(0, 8):
                    # A tanár összes celláját feldolgozzuk, naponként
                    lesson_block = str(row.iloc[day_index * 8 + lesson_block_index + 1 + 6])
                    if lesson_block in ['nan', ' ', 'H', '']: continue
                    if teacher == 'Sándor István': continue
                    subject = lesson_block.split('\n')[-1]
                    if subject in ['nan', '', ' ', '  ']: continue

                    # Az órarendben a tantárgyak végén szerepelhet a csoport száma, pl. 'a1'
                    group = None
                    if subject[-1].isdigit():
                        group = int(subject[-1])
                        subject = subject[:-1]

                    if subject in LESSON_DICT.keys():
                        subject = LESSON_DICT[subject]
                    
                    real_subject = (subject, group)


                    EJG_class = lesson_block.split('\n')[0]
                    lessons = get_lessons({
                        'EJG_class': EJG_class,
                        'day': day,
                        'start_time': ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30'][lesson_block_index],
                        'subject': real_subject[0],
                        'group': real_subject[1],
                    })
                    teacher_block_counter += 1
                    if len(lessons) != 1: 
                        if is_in_exceptions(EJG_class, day, lesson_block_index, real_subject[0], teacher):
                            continue
                        else:
                            step2_exceptions.append({
                                'EJG_class': EJG_class,
                                'day': day,
                                'lesson_index' : lesson_block_index,
                                'subject': real_subject[0],
                                'teacher': teacher,
                                'group': real_subject[1]
                            })

                            # raise ValueError(f'Invalid lesson count: {len(lessons)}\n{lessons}\n{teacher} {EJG_class} {day} {lesson_block_index} {real_subject[0]} {real_subject[1]}')
                    else:
                        lesson = lessons[0]
                        lesson.teacher = teacher
    
    return teacher_block_counter
                    


# AZ OSZTÁLYÓRAREND TÁBLÁZAT FELDOLGOZÁSA
def fit_classes_to_lessons():    
    df = pd.read_excel(CLASS_TABLE_PATH)
    print("AZ OSZTÁLYÓRAREND TÁBLÁZAT FELDOLGOZÁSA")
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


def print_table(step=len(table), table=table):
    i = 0
    for lesson in table:
        if i % step == 0: input('Hit enter to continue' + '\n' * 4 + str(i) + '/' + str(len(table)))
        print(lesson)
        i += 1

def find_lessons():
    txt = ''
    while txt == '':
        txt = input('Find lesson: ')
        if txt != '': break

        EJG_class = input('EJG_class: ')
        day = input('day: ')
        start_time = input('start_time: ')
        subject = input('subject: ')

        if subject == '': lessons = get_lessons({'EJG_class': EJG_class, 'day': day, 'start_time': start_time})
        else: lessons = get_lessons({'EJG_class': EJG_class, 'day': day, 'start_time': start_time, 'subject': subject})


        print('Possible lessons:')
        for lesson in lessons:
            print(lesson)

def print_exceptions():
    for exception in step2_exceptions:
        print(exception)

def export_table():
    # Export table in JSON
    import json
    with open('timetable.json', 'w') as f:
        json.dump([vars(lesson) for lesson in table], f)


step1()
teacher_block_counter = fit_teachers_to_lessons()

no_teacher_lessons = get_lessons({'teacher': None})

EXPECTED_LESSON_COUNT = 5 * 8 * 29
print('\nVárható órák száma:', EXPECTED_LESSON_COUNT)
print('Órák száma', len(table))
print('Tanár - óra nem található', len(step2_exceptions))
print('Tanár nélküli órák:', len(no_teacher_lessons))
print('\nFake success', round((len(table) - len(step2_exceptions)) / len(table) * 100, 4), '%\n')
print('Real success', round((len(table) - len(no_teacher_lessons)) / len(table) * 100, 4), '%\n')


print('Tanár blokkok száma:', teacher_block_counter)

# find_lessons()

print(get_str_list(get_lessons({
    'EJG_class': '9.C',
    'day': 'H',
    'start_time': '13:35',
    'subject': 'angol',
    'group': 4
}, specific_group=False)))


# print_table(10, no_teacher_lessons)

# print_table(10, step2_exceptions)

export_table()

