const BADGE_OK = "#3fb950";
const BADGE_MISS = "#f85149";

async function performToggle({ tabId, url, newTab }) {
  const destination = await togglePagesUrl(url);
  if (!destination) {
    flashBadge(tabId, "×", BADGE_MISS);
    return;
  }

  if (newTab) {
    await browser.tabs.create({ url: destination });
  } else {
    await browser.tabs.update(tabId, { url: destination });
  }
  flashBadge(tabId, "✓", BADGE_OK);
}

browser.runtime.onMessage.addListener((message, sender) => {
  if (!sender.tab) return;
  const tabId = sender.tab.id;

  if (message.type === "toggleFromKey") {
    performToggle({ tabId, url: sender.tab.url, newTab: message.newTab });
  } else if (message.type === "openUrl") {
    browser.tabs.create({ url: message.url }).then(() => {
      flashBadge(tabId, "✓", BADGE_OK);
    });
  } else if (message.type === "badgeFeedback") {
    flashBadge(tabId, message.ok ? "✓" : "×", message.ok ? BADGE_OK : BADGE_MISS);
  }
});
