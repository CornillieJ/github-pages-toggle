// Injects small shortcut-key badges onto GitHub's own repo nav (Issues, Pull
// requests, Actions) and, when present, the sidebar Releases link. Only runs
// on github.com repo pages - never on Pages sites, and never for actions that
// have no single stable on-page element to anchor to (clone URL, DeepWiki,
// GitDiagram).
//
// GitHub is a Turbo (Hotwired) single-page app, so elements get swapped out
// on in-app navigation without a full page reload. We re-run on "turbo:load"
// to catch that; see https://github.com uses `data-turbo-*` throughout.

function injectBadgeStyleOnce() {
  if (document.getElementById("repotools-badge-style")) return;
  const style = document.createElement("style");
  style.id = "repotools-badge-style";
  // Inline (not absolutely positioned) on purpose: GitHub's nav container
  // clips anything that overflows a tab's own box, so a corner-overlay badge
  // gets cut off. Appending it as a normal flow child, the same way GitHub's
  // own issue/PR count bubbles work, avoids that entirely.
  style.textContent = `
    .repotools-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 6px;
      background: #1f6feb;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      line-height: 1;
      padding: 1px 6px;
      border-radius: 10px;
      vertical-align: middle;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
  `;
  document.head.appendChild(style);
}

function setPageBadge(el, text) {
  if (!el) return;

  let badge = el.querySelector(":scope > .repotools-badge");
  if (!text) {
    if (badge) badge.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement("span");
    badge.className = "repotools-badge";
    el.appendChild(badge);
  }
  badge.textContent = text;
}

function injectReleasesBadge(repo, key, attempt = 0) {
  // The sidebar Releases link is hydrated client-side, so it may not exist
  // yet when we first run. Retry a few times, then give up quietly (the repo
  // page simply might not have a Releases section).
  const target = `/${repo.user}/${repo.repo}/releases`;
  const link = document.querySelector(`a[href="${target}"]`);
  if (link) {
    setPageBadge(link, key);
    return;
  }
  if (attempt >= 6) return;
  setTimeout(() => injectReleasesBadge(repo, key, attempt + 1), 800);
}

function injectPageBadges(shortcuts) {
  if (window.location.hostname !== "github.com") return;

  const repo = getRepoInfo(window.location.href);
  if (!repo) return;

  injectBadgeStyleOnce();

  setPageBadge(
    document.querySelector('a[data-tab-item="issues"]'),
    shortcuts.issues ? shortcuts.issues.toUpperCase() : ""
  );
  setPageBadge(
    document.querySelector('a[data-tab-item="pull-requests"]'),
    shortcuts.prs ? shortcuts.prs.toUpperCase() : ""
  );
  setPageBadge(
    document.querySelector('a[data-tab-item="actions"]'),
    shortcuts.actionsTab ? shortcuts.actionsTab.toUpperCase() : ""
  );

  injectReleasesBadge(repo, shortcuts.releases ? shortcuts.releases.toUpperCase() : "");
}
