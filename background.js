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
  if (message.type === "toggleFromKey" && sender.tab) {
    performToggle({ tabId: sender.tab.id, url: sender.tab.url, newTab: message.newTab });
  }
});
