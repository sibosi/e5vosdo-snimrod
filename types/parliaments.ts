export interface Parlament {
  id: number;
  date: string;
  title: string;
}

export interface ParlamentParticipant {
  id: number;
  email: string;
  class: string;
  parlament_id: number;
  is_applicant: boolean;
}
