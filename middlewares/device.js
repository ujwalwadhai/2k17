// Returns device info from user agent
function deviceInfo(ua) {
  var browser = ua.browser || (ua.includes("Chrome") ? "Chrome" : (ua.includes("Firefox") ? "Firefox" : (ua.includes("Edge") ? "Edge" : "Unknown Browser")));
  var version = ua.version || "";
  var os = ua.os || "Unknown OS";
  var platformType = ua.isMobile
    ? "Mobile"
    : ua.isTablet
    ? "Tablet"
    : "Desktop";

  return `${browser} on ${platformType}`;
}

module.exports = deviceInfo