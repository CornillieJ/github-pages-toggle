const BADGE_OK = "#3fb950";
const BADGE_MISS = "#f85149";

async function getActiveTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function handleToggle(newTab) {
  const tab = await getActiveTab();
  const destination = await togglePagesUrl(tab.url);
  if (!destination) {
    flashBadge(tab.id, "×", BADGE_MISS);
    return;
  }

  if (newTab) {
    await browser.tabs.create({ url: destination });
  } else {
    await browser.tabs.update(tab.id, { url: destination });
  }
  flashBadge(tab.id, "✓", BADGE_OK);
  window.close();
}

document.getElementById("toggle").addEventListener("click", () => handleToggle(false));
document.getElementById("toggle-new-tab").addEventListener("click", () => handleToggle(true));

const keyInput = document.getElementById("key");
const savedMsg = document.getElementById("saved-msg");

browser.storage.local.get("shortcutKey").then((result) => {
  keyInput.value = result.shortcutKey || "p";
});

document.getElementById("save").addEventListener("click", async () => {
  const raw = keyInput.value.trim();
  if (!/^[a-z0-9]$/i.test(raw)) {
    keyInput.style.borderColor = BADGE_MISS;
    return;
  }

  const value = raw.toLowerCase();
  keyInput.value = value;
  keyInput.style.borderColor = "#30363d";
  await browser.storage.local.set({ shortcutKey: value });

  savedMsg.style.visibility = "visible";
  setTimeout(() => {
    savedMsg.style.visibility = "hidden";
  }, 1200);
});
