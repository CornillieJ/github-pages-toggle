let shortcuts = { toggle: "p" };
let badgeStyle = { enabled: true, color: "#1f6feb" };

function whenWindowLoaded(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback, { once: true });
  }
}

Promise.all([loadShortcuts(), loadBadgeStyle()]).then(([loadedShortcuts, loadedBadgeStyle]) => {
  shortcuts = loadedShortcuts;
  badgeStyle = loadedBadgeStyle;
  // Waiting for the full "load" event (not just document_idle, which can
  // fire before GitHub's client-side hydration has settled) reduces the
  // chance this first injection races against React replacing the DOM out
  // from under it before the MutationObserver below is even attached.
  whenWindowLoaded(() => injectPageBadges(shortcuts, badgeStyle));
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  let changed = false;
  if (changes.shortcuts) {
    shortcuts = changes.shortcuts.newValue || { toggle: "p" };
    changed = true;
  }
  if (changes.badgeStyle) {
    badgeStyle = { ...DEFAULT_BADGE_STYLE, ...(changes.badgeStyle.newValue || {}) };
    changed = true;
  }
  if (changed) injectPageBadges(shortcuts, badgeStyle);
});

// GitHub is a Turbo SPA: most navigation swaps the DOM without a full page
// reload, so re-inject badges whenever that happens.
document.addEventListener("turbo:load", () => injectPageBadges(shortcuts, badgeStyle));

// React also re-renders parts of the page in place (e.g. hydration finishing,
// counters updating) with no "turbo:load" at all, which can silently replace
// an anchor our badges are tracking. A debounced MutationObserver catches
// that generically. We disconnect while we write our own badges so that
// doesn't trigger itself in a loop.
if (window.location.hostname === "github.com") {
  let pageBadgeRetimer = null;
  const pageBadgeObserver = new MutationObserver(() => {
    clearTimeout(pageBadgeRetimer);
    pageBadgeRetimer = setTimeout(() => {
      pageBadgeObserver.disconnect();
      injectPageBadges(shortcuts, badgeStyle);
      pageBadgeObserver.observe(document.body, { childList: true, subtree: true });
    }, 200);
  });
  pageBadgeObserver.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const target = event.target;
  const isTyping =
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  if (isTyping) return;

  const key = event.key.toLowerCase();

  if (shortcuts.toggle && key === shortcuts.toggle.toLowerCase()) {
    browser.runtime.sendMessage({ type: "toggleFromKey", newTab: event.shiftKey });
    return;
  }

  // The repo tools (clone URL, Issues/PRs/Actions/Releases, DeepWiki,
  // GitDiagram) only make sense on the repo's own github.com page, not on
  // its Pages site.
  if (window.location.hostname !== "github.com") return;

  const actionId = Object.keys(REPO_ACTIONS).find(
    (id) => shortcuts[id] && shortcuts[id].toLowerCase() === key
  );
  if (!actionId) return;

  const repo = getRepoInfo(window.location.href);
  if (!repo) return;

  const action = REPO_ACTIONS[actionId];
  const value = action.build(repo);

  if (action.kind === "copy") {
    navigator.clipboard
      .writeText(value)
      .then(() => browser.runtime.sendMessage({ type: "badgeFeedback", ok: true }))
      .catch(() => browser.runtime.sendMessage({ type: "badgeFeedback", ok: false }));
    return;
  }

  // Clicking GitHub's own nav tab lets its Turbo router handle the
  // navigation in-place (no full reload), same as a user clicking it
  // themselves would. Only do this for the plain key - Shift explicitly asks
  // for a new tab, which always needs a real navigation anyway.
  if (!event.shiftKey) {
    const anchor = findRepoNavAnchor(actionId, repo);
    if (anchor) {
      anchor.click();
      browser.runtime.sendMessage({ type: "badgeFeedback", ok: true });
      return;
    }
  }

  browser.runtime.sendMessage({ type: "openUrl", url: value });
});
