export default function OGURL() {
  if (typeof window === "undefined") return;
  const allowedDomains = ["info.e5vosdo.hu"];
  const currentDomain = window.location.hostname;

  if (!allowedDomains.includes(currentDomain)) {
    window.location.href = "https://info.e5vosdo.hu" + window.location.pathname;
  }
}
