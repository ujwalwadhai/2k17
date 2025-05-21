function deviceInfo(ua) {
  const browser = ua.browser || "Unknown browser";
  const version = ua.version || "";
  const os = ua.os || "Unknown OS";
  const platformType = ua.isMobile
    ? "Mobile"
    : ua.isTablet
    ? "Tablet"
    : "Desktop";

  return `${browser} on ${os} (${platformType})`;
}

module.exports = deviceInfo