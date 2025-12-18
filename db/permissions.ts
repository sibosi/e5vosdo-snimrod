import { PossibleUserType } from "./dbreq";

export const PERMISSIONS = [
  "user",
  "student",
  "admin",
  "organiser",
  "head_of_parlament",
  "delegate",
  "delegate_counter",
  "matchOrganiser",
  "media_admin",
];

/**
Permissions & access to API endpoints
user: elementary API access
student: no value
admin: access to all API endpoints & permission management
organiser: E5N system - can view the list of signupers
head_of_parlament: can manage parlaments
delegate: can see the list of parlaments
delegate_counter: can register delegates to parlaments
matchOrganiser: can manage matches
media_admin: can manage media images, tags, and import XML metadata
*/

export function gate(
  user: PossibleUserType,
  permission: string | string[],
  type: "boolean" | "throw" = "throw",
) {
  if (!user) {
    if (type === "boolean") return false;
    throw new Error("Permission denied");
  }
  let hasPermission = false;
  if (user.permissions.includes("super_admin")) hasPermission = true;
  if (typeof permission === "string") {
    if (user.permissions.includes(permission)) hasPermission = true;
  } else if (permission.some((p) => user.permissions.includes(p)))
    hasPermission = true;

  if ("teacher" === permission && !user.is_verified) hasPermission = true;
  if (type === "boolean") return hasPermission;
  if (hasPermission) return;
  throw new Error("Permission denied");
}
