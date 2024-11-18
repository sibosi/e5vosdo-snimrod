import { UserType } from "./dbreq";

export const PERMISSIONS = [
  "user",
  "student",
  "admin",
  "organiser",
  "head_of_parlament",
  "delegate",
  "delegate_counter",
];

/**
Permissions & access to API endpoints
user: elementary API access
student: no value
admin: access to all API endpoints & permission management
organiser: E5N system - can view the list of signupers
head_of_parlament: can manage parlements
delegate: can see the list of parlements
delegate_counter: can register delegates to parlements
*/

export function gate(user: UserType, permission: string | string[]) {
  if (user.permissions.includes("super_admin")) return;
  if (typeof permission === "string") {
    if (user.permissions.includes(permission)) return;
  } else if (permission.some((p) => user.permissions.includes(p))) return;
  throw new Error("Permission denied");
}
