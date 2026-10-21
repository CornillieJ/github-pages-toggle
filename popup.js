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

function flashButtonLabel(button, text, revertAfterMs = 1200) {
  const original = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = original;
  }, revertAfterMs);
}

async function copyToClipboard(button, text) {
  try {
    await navigator.clipboard.writeText(text);
    flashButtonLabel(button, "Copied!");
  } catch (e) {
    flashButtonLabel(button, "Copy failed");
  }
}

function openInNewTab(url) {
  browser.tabs.create({ url });
}

// --- Key badges -------------------------------------------------------------

function setKeyBadge(button, text) {
  if (!button) return;
  const existing = button.querySelector(".key-badge");
  if (existing) existing.remove();
  if (!text) return;

  const badge = document.createElement("span");
  badge.className = "key-badge";
  badge.textContent = text;
  button.appendChild(badge);
}

function renderKeyBadges(shortcuts) {
  const toggleKey = shortcuts.toggle ? shortcuts.toggle.toUpperCase() : "";
  setKeyBadge(document.getElementById("toggle"), toggleKey);
  setKeyBadge(document.getElementById("toggle-new-tab"), toggleKey ? `⇧${toggleKey}` : "");

  document.querySelectorAll("button[data-action]").forEach((button) => {
    const key = shortcuts[button.dataset.action];
    setKeyBadge(button, key ? key.toUpperCase() : "");
  });
}

// --- Shortcuts list -------------------------------------------------------

const shortcutsList = document.getElementById("shortcuts-list");
const savedMsg = document.getElementById("saved-msg");
const errorMsg = document.getElementById("error-msg");

function showError(text) {
  errorMsg.textContent = text;
  errorMsg.style.visibility = "visible";
  setTimeout(() => {
    errorMsg.style.visibility = "hidden";
  }, 2000);
}

function showSaved() {
  savedMsg.style.visibility = "visible";
  setTimeout(() => {
    savedMsg.style.visibility = "hidden";
  }, 1200);
}

function renderShortcutRows(shortcuts) {
  shortcutsList.innerHTML = "";
  for (const field of SHORTCUT_FIELDS) {
    const row = document.createElement("div");
    row.className = "shortcut-row";

    const text = document.createElement("div");
    text.className = "shortcut-text";

    const label = document.createElement("span");
    label.className = "shortcut-label";
    label.textContent = field.label;

    const description = document.createElement("span");
    description.className = "shortcut-description";
    description.textContent = field.description;

    text.appendChild(label);
    text.appendChild(description);

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.dataset.field = field.id;
    input.value = shortcuts[field.id] || "";

    row.appendChild(text);
    row.appendChild(input);
    shortcutsList.appendChild(row);
  }
}

document.getElementById("save-shortcuts").addEventListener("click", async () => {
  const inputs = Array.from(shortcutsList.querySelectorAll("input[data-field]"));
  const next = {};
  const seen = new Map();

  for (const input of inputs) {
    const raw = input.value.trim();
    if (!raw) {
      // Persist the blank explicitly, so a cleared field stays disabled
      // instead of falling back to its default on next load.
      next[input.dataset.field] = "";
      continue;
    }

    if (!/^[a-z0-9]$/i.test(raw)) {
      showError(`"${raw}" isn't a single letter or digit.`);
      return;
    }

    const key = raw.toLowerCase();
    if (seen.has(key)) {
      showError(`Key "${key}" is assigned twice.`);
      return;
    }
    seen.set(key, input.dataset.field);
    next[input.dataset.field] = key;
  }

  await browser.storage.local.set({ shortcuts: next });
  renderKeyBadges(next);
  showSaved();
});

// --- Badge style ------------------------------------------------------------

const badgeEnabledInput = document.getElementById("badge-enabled");
const colorPalette = document.getElementById("badge-color-palette");

badgeEnabledInput.addEventListener("change", async () => {
  const current = await loadBadgeStyle();
  await browser.storage.local.set({
    badgeStyle: { ...current, enabled: badgeEnabledInput.checked },
  });
});

function renderColorPalette(selectedColor) {
  colorPalette.innerHTML = "";
  for (const color of BADGE_COLOR_PRESETS) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.background = color;
    swatch.title = color;
    swatch.classList.toggle("selected", color.toLowerCase() === (selectedColor || "").toLowerCase());

    swatch.addEventListener("click", async () => {
      const current = await loadBadgeStyle();
      await browser.storage.local.set({ badgeStyle: { ...current, color } });
      renderColorPalette(color);
    });

    colorPalette.appendChild(swatch);
  }
}

// --- Repo tools / explore --------------------------------------------------

(async () => {
  const [tab, shortcuts, badgeStyle] = await Promise.all([
    getActiveTab(),
    loadShortcuts(),
    loadBadgeStyle(),
  ]);
  renderShortcutRows(shortcuts);
  renderKeyBadges(shortcuts);
  badgeEnabledInput.checked = badgeStyle.enabled;
  renderColorPalette(badgeStyle.color);

  const repo = getRepoInfo(tab.url);
  if (!repo) {
    document.getElementById("no-repo").style.display = "block";
    return;
  }

  document.getElementById("repo-tools").style.display = "block";
  document.getElementById("explore").style.display = "block";

  document.querySelectorAll("button[data-action]").forEach((button) => {
    const action = REPO_ACTIONS[button.dataset.action];
    button.addEventListener("click", () => {
      const value = action.build(repo);
      if (action.kind === "copy") {
        copyToClipboard(button, value);
      } else {
        openInNewTab(value);
      }
    });
  });
})();
