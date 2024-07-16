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

LESSON_DICT = {
    'a' : 'angol',
    'n' : 'német',
    '2.ny' : '2. nyelv',

    'fiz': 'fizika',
    'ké': 'kémia',
    'bi': 'biológia',
    'fö' : 'földrajz',

    'mt': 'matematika',
    'm' : 'magyar',
    'tö' : 'történelem',

    'of' : 'osztályfőnöki',
    'é' : 'ének',
    'dig': 'digitális kultúra',
    'inf': 'informatika',
    'nyt': 'nyelvtan',
    'tn': 'testnevelés',
    'et': 'etika',
    'hit': 'hittan',
    'r': 'rajz',

    'műv': 'művészetek',
    'tt' : 'technika és tervezés',
    'ápi' : 'állampolgári ismeretek',

    'MT': 'matematika fakt',
    'M': 'magyar fakt',
    'TÖ': 'történelem fakt',
    'FIZ': 'fizika fakt',
    'KÉ': 'kémia fakt',

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
    def __init__(self, EJG_class, day, start_time, room=None, teacher=None, subject=None):
        self.EJG_class = EJG_class
        self.evfolyam = EJG_class.split('.')[0]
        self.osztaly = EJG_class.split('.')[1]

        self.day = day
        self.start_time = start_time
        self.room = room
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
        return f"Class: {self.EJG_class}, Day: {self.day}, Start: {self.start_time}, Subject: {self.subject}"
    

def get_lessons(key: str, value):
    response = []

    for lesson in table:
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
        # print(f"Index: {index}, Row: {row.to_dict()}")
        actual_class = row['OSZTÁLY'].split('\n')[0]
        for day in range(0, 5):
            for i in range(0, 8):
                lesson_block = str(row[day * 8 + i + 1])
                # Split the lesson block by new line and by space
                lesson_blocks = [item for item in lesson_block.split('\n') if item != '']

                lesson_blocks = []
                for a in lesson_block.split('\n'):
                    for b in a.split(' '):
                        lesson_blocks.append(b)

                subjects = []
                if lesson_blocks == ['nan']:
                    continue
                
                for subject in lesson_blocks:
                    if subject in LESSON_DICT.keys():
                        subjects.append(LESSON_DICT[subject])
                    else:
                        subjects.append(subject)
                        if subject not in not_in_lesson_dict:
                            not_in_lesson_dict.append(subject)

                # print(day * i, lesson_block)
                if subjects != ['nan']:
                    Lesson(actual_class, ['H', 'K', 'SZ', 'CS', 'P'][day], ['07:15', '08:15', '09:15', '10:15', '11:15', '12:25', '13:35', '14:30'][i], subject=str(subjects))


