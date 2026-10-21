// Shared by content.js, page-badges.js (indirectly, via the color CSS
// variable), and popup.js. Controls whether on-page badges show at all, and
// what color they're drawn in.

const DEFAULT_BADGE_STYLE = {
  enabled: true,
  color: "#1f6feb",
};

async function loadBadgeStyle() {
  const stored = await browser.storage.local.get("badgeStyle");
  return { ...DEFAULT_BADGE_STYLE, ...(stored.badgeStyle || {}) };
}

if (typeof module !== "undefined") {
  module.exports = { DEFAULT_BADGE_STYLE, loadBadgeStyle };
}
