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

function openInNewTab(url) {
  browser.tabs.create({ url });
}

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

(async () => {
  const tab = await getActiveTab();
  const repo = getRepoInfo(tab.url);

  if (!repo) {
    document.getElementById("no-repo").style.display = "block";
    return;
  }

  document.getElementById("repo-tools").style.display = "block";
  document.getElementById("explore").style.display = "block";

  const { user, repo: repoName } = repo;
  const repoUrl = `https://github.com/${user}/${repoName}`;

  document.getElementById("copy-https").addEventListener("click", (e) => {
    copyToClipboard(e.currentTarget, `${repoUrl}.git`);
  });
  document.getElementById("copy-ssh").addEventListener("click", (e) => {
    copyToClipboard(e.currentTarget, `git@github.com:${user}/${repoName}.git`);
  });

  document.getElementById("link-issues").addEventListener("click", () => openInNewTab(`${repoUrl}/issues`));
  document.getElementById("link-prs").addEventListener("click", () => openInNewTab(`${repoUrl}/pulls`));
  document.getElementById("link-actions").addEventListener("click", () => openInNewTab(`${repoUrl}/actions`));
  document.getElementById("link-releases").addEventListener("click", () => openInNewTab(`${repoUrl}/releases`));

  document.getElementById("link-deepwiki").addEventListener("click", () =>
    openInNewTab(`https://deepwiki.com/${user}/${repoName}`)
  );
  document.getElementById("link-gitdiagram").addEventListener("click", () =>
    openInNewTab(`https://gitdiagram.com/${user}/${repoName}`)
  );
})();
