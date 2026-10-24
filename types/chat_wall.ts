import { DisplayUser } from "./users";

export interface TableChatWallMessages {
  id: number;
  timestamp: string; // ISO 8601 format
  user_email: string;
  parent_id: number | null; // null for top-level messages
  content: string;
}

export interface TableChatWallMessageMentions {
  message_id: number;
  mentioned_user_email: string;
}

export interface ChatWallMessage {
  id: number;
  timestamp: string; // ISO 8601 format
  author: DisplayUser; // The user who posted the message
  parent_id: number | null; // null for top-level messages
  content: string;
  mentioned_users: DisplayUser[]; // Array of mentioned user emails
  replies?: ChatWallMessage[]; // Optional array of replies
}
