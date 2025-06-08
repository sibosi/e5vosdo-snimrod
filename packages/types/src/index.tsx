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
