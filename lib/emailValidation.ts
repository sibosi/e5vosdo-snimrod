export function isValidEmailAddress(email: string) {
  if (email.length === 0 || email.length > 254 || /\s/.test(email)) {
    return false;
  }

  const atIndex = email.indexOf("@");
  if (
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf("@") ||
    atIndex === email.length - 1
  ) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  const firstDot = domain.indexOf(".");

  return localPart.length <= 64 && firstDot > 0 && firstDot < domain.length - 1;
}
