export interface User {
  name: string;
  username: string;
  nickname: string;
  email: string;
  image: string;
  last_login: string;
  permissions: string[];
  EJG_code: string;
  food_menu: string;
  coming_year: number;
  class_character: string;
  order_number: number;
  tickets: string[];
  hidden_lessons: number[];
  default_group: number | null;
  push_permission: boolean;
  push_about_games: boolean;
  push_about_timetable: boolean;
}

export type UserType = User;
export type PossibleUserType = User | undefined | null;

export interface EventType {
  title: string | string[];
  image: string | null; // URL
  description: string | null;

  id: number;
  time: string;
  show_time: string | null;
  hide_time: string;
  tags: string[];

  author?: string;
  show_author?: boolean;
  show_at_carousel?: boolean;
  show_at_events?: boolean;
}

export interface EventByDateType {
  [date: string]: EventType[];
}

export interface UseEventsReturn {
  events: EventByDateType | undefined;
  archivedEvents: EventByDateType | undefined;
  futureEvents: EventByDateType | undefined;
  nextEvent: EventType | undefined;
  isLoading: boolean;
  isError: any;
}

export interface ChipProps {
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  version?: 'surface' | 'primary' | 'secondary' | 'tertiary';
}

export interface TimetableLesson {
  code: string;
  teacher: string;
  slot: string;
  subject_code: string;
  subject_name: string;
  room?: string;
  isSubstitution?: boolean;
  substitutionTeacher?: string;
}

export interface TimetableDay {
  0: TimetableLesson;
  1: TimetableLesson;
  2: TimetableLesson;
  3: TimetableLesson;
  4: TimetableLesson;
  5: TimetableLesson;
  6: TimetableLesson;
  7: TimetableLesson;
}

export interface TimetableWeek {
  Hétfő: TimetableDay;
  Kedd: TimetableDay;
  Szerda: TimetableDay;
  Csütörtök: TimetableDay;
  Péntek: TimetableDay;
}

export interface Change {
  date: string;
  missingTeacher: string;
  hourRoom: string;
  group: string;
  subject: string;
  replacementTeacher: string;
  replacementTeacherPhotoUrl: string;
  comment: string;
  day: string;
  period: string;
  room: string;
}

export interface TeacherChange {
  name: string;
  photoUrl: string;
  subjects: string;
  changes: Change[];
}
