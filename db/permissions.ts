import { PossibleUserType } from "./dbreq";

export const PERMISSIONS = [
  "user",
  "student",
  "tester",
  "developer",
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
tester: can access testing endpoints & features
developer: can access developer endpoints & features
admin: access to all API endpoints & permission management
organiser: E5N system - can view the list of signupers
head_of_parlament: can manage parlaments
delegate: can see the list of parlaments
delegate_counter: can register delegates to parlaments
matchOrganiser: can manage matches
media_admin: can manage media images, tags, and import XML metadata
*/

export function hasPermission(
  user: PossibleUserType,
  permission: string | string[],
) {
  if (!user) return false;
  if (user.permissions.includes("super_admin")) return true;

  if (typeof permission === "string") {
    if (user.permissions.includes(permission)) return true;
  } else if (permission.some((p) => user.permissions.includes(p))) return true;

  if ("teacher" === permission && !user.is_verified) return true;

  return false;
}

export function gate(
  user: PossibleUserType,
  permission: string | string[],
  type: "boolean" | "throw" = "throw",
) {
  if (type === "boolean") {
    console.warn(
      "Gate check with boolean is deprecated, please use hasPermission directly",
    );
    return hasPermission(user, permission);
  }

  if (!hasPermission(user, permission)) throw new Error("Permission denied");
}
