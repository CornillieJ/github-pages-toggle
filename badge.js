// Shared by background.js and popup.js (both have browserAction access; content
// scripts don't, so they never load this file).

function flashBadge(tabId, text, color) {
  browser.browserAction.setBadgeText({ tabId, text });
  browser.browserAction.setBadgeBackgroundColor({ tabId, color });
  setTimeout(() => {
    browser.browserAction.setBadgeText({ tabId, text: "" });
  }, 1500);
}

if (typeof module !== "undefined") {
  module.exports = { flashBadge };
}
