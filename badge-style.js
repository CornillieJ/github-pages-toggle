// Shared by content.js, page-badges.js (indirectly, via the color CSS
// variable), and popup.js. Controls whether on-page badges show at all, and
// what color they're drawn in.

const DEFAULT_BADGE_STYLE = {
  enabled: true,
  color: "#1f6feb",
};

// A fixed palette instead of a native <input type="color">: picking from the
// OS color dialog opens a separate window, which blurs (and therefore closes)
// the extension popup before a color can ever be committed.
const BADGE_COLOR_PRESETS = [
  "#1f6feb",
  "#3fb950",
  "#db6d28",
  "#f85149",
  "#8957e5",
  "#db61a2",
  "#39c5cf",
  "#d4a72c",
];

async function loadBadgeStyle() {
  const stored = await browser.storage.local.get("badgeStyle");
  return { ...DEFAULT_BADGE_STYLE, ...(stored.badgeStyle || {}) };
}

if (typeof module !== "undefined") {
  module.exports = { DEFAULT_BADGE_STYLE, BADGE_COLOR_PRESETS, loadBadgeStyle };
}
