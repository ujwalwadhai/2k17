// Returns device info from user agent
function deviceInfo(ua) {
  var browser = ua.browser || "Unknown browser";
  var version = ua.version || "";
  var os = ua.os || "Unknown OS";
  var platformType = ua.isMobile
    ? "Mobile"
    : ua.isTablet
    ? "Tablet"
    : "Desktop";

  return `${browser} on ${os} (${platformType})`;
}

module.exports = deviceInfo