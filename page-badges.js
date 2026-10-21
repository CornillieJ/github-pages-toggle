// Injects small shortcut-key badges floating over GitHub's own repo nav
// (Issues, Pull requests, Actions), the green "Code" clone-URL button, and,
// when present, the sidebar Releases link. Plus a plain (non-floating) hint
// appended to the end of the nav itself for the GitHub <-> Pages toggle key.
// Only runs on github.com repo pages - never on Pages sites, and never for
// actions that have no single stable on-page element to anchor to (DeepWiki,
// GitDiagram).
//
// Floating badges are appended to document.body, not nested inside GitHub's
// own elements - GitHub's nav tabs clip anything that overflows their own box
// (used to contain their underline-indicator), so a badge nested inside one
// and positioned past its corner gets cut off. Living in document.body and
// being positioned with absolute page coordinates (computed from the
// anchor's getBoundingClientRect, offset by scroll position) avoids that
// entirely and touches none of GitHub's own markup, styles, or layout.
//
// GitHub is a Turbo (Hotwired) single-page app, so elements get swapped out
// on in-app navigation without a full page reload. We re-run on "turbo:load"
// to catch that.

const PAGE_BADGE_IDS = {
  issues: "repotools-badge-issues",
  prs: "repotools-badge-prs",
  actionsTab: "repotools-badge-actions",
  releases: "repotools-badge-releases",
  cloneUrl: "repotools-badge-clone",
};

function injectBadgeStyleOnce() {
  if (document.getElementById("repotools-badge-style")) return;
  const style = document.createElement("style");
  style.id = "repotools-badge-style";
  style.textContent = `
    .repotools-badge {
      position: absolute;
      transform: translate(-50%, -50%);
      background: #1f6feb;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      line-height: 1;
      padding: 2px 5px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      z-index: 2147483647;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      white-space: nowrap;
    }
    .repotools-pages-hint-item {
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 600;
      color: #8b949e;
      white-space: nowrap;
      cursor: default;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
  `;
  document.head.appendChild(style);
}

function positionBadge(badge, anchor) {
  const rect = anchor.getBoundingClientRect();
  badge.style.top = `${rect.top + window.scrollY}px`;
  badge.style.left = `${rect.right + window.scrollX}px`;
}

function setPageBadge(id, anchor, text) {
  let badge = document.getElementById(id);

  if (!text || !anchor) {
    if (badge) badge.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement("span");
    badge.id = id;
    badge.className = "repotools-badge";
    document.body.appendChild(badge);
  }
  badge.textContent = text;
  positionBadge(badge, anchor);
}

function repositionAllPageBadges() {
  for (const id of Object.values(PAGE_BADGE_IDS)) {
    const badge = document.getElementById(id);
    if (!badge) continue;
    const anchor = badge._repotoolsAnchor;
    if (anchor && anchor.isConnected) {
      positionBadge(badge, anchor);
    } else {
      badge.remove();
    }
  }
}

function setPageBadgeTracked(id, anchor, text) {
  setPageBadge(id, anchor, text);
  const badge = document.getElementById(id);
  if (badge) badge._repotoolsAnchor = anchor;
}

function buildCloneBadgeText(shortcuts) {
  const parts = [];
  if (shortcuts.copyHttps) parts.push(`${shortcuts.copyHttps.toUpperCase()}(https)`);
  if (shortcuts.copySsh) parts.push(`${shortcuts.copySsh.toUpperCase()}(ssh)`);
  return parts.join(" ");
}

function findCloneButton() {
  // The green "Code" button is the page's only primary-variant button;
  // matching on its icon too guards against that ever not being unique.
  const buttons = document.querySelectorAll('button[data-variant="primary"]');
  for (const btn of buttons) {
    if (btn.querySelector("svg.octicon-code")) return btn;
  }
  return null;
}

function injectReleasesBadge(repo, key, attempt = 0) {
  // The sidebar Releases link is hydrated client-side, so it may not exist
  // yet when we first run. Retry a few times, then give up quietly (the repo
  // page simply might not have a Releases section).
  const target = `/${repo.user}/${repo.repo}/releases`;
  const link = document.querySelector(`a[href="${target}"]`);
  if (link) {
    setPageBadgeTracked(PAGE_BADGE_IDS.releases, link, key);
    return;
  }
  if (attempt >= 6) return;
  setTimeout(() => injectReleasesBadge(repo, key, attempt + 1), 800);
}

function appendPagesHintItem(toggleKey) {
  const id = "repotools-pages-hint-item";
  let item = document.getElementById(id);

  if (!toggleKey) {
    if (item) item.remove();
    return;
  }

  // Found structurally from a tab we already trust, rather than guessing at
  // a Settings selector (that tab only exists for repo admins, and we can't
  // verify its data-tab-item value without an authenticated session).
  const anyTab =
    document.querySelector('a[data-tab-item="code"]') ||
    document.querySelector('a[data-tab-item="issues"]');
  const list = anyTab && anyTab.closest("ul");
  if (!list) {
    if (item) item.remove();
    return;
  }

  if (!item) {
    item = document.createElement("li");
    item.id = id;
    item.className = "repotools-pages-hint-item";
    list.appendChild(item);
  } else if (item.parentElement !== list) {
    list.appendChild(item);
  }
  item.textContent = `${toggleKey} → Pages`;
}

function injectPageBadges(shortcuts) {
  if (window.location.hostname !== "github.com") return;

  const repo = getRepoInfo(window.location.href);
  if (!repo) return;

  injectBadgeStyleOnce();

  setPageBadgeTracked(
    PAGE_BADGE_IDS.issues,
    document.querySelector('a[data-tab-item="issues"]'),
    shortcuts.issues ? shortcuts.issues.toUpperCase() : ""
  );
  setPageBadgeTracked(
    PAGE_BADGE_IDS.prs,
    document.querySelector('a[data-tab-item="pull-requests"]'),
    shortcuts.prs ? shortcuts.prs.toUpperCase() : ""
  );
  setPageBadgeTracked(
    PAGE_BADGE_IDS.actionsTab,
    document.querySelector('a[data-tab-item="actions"]'),
    shortcuts.actionsTab ? shortcuts.actionsTab.toUpperCase() : ""
  );

  injectReleasesBadge(repo, shortcuts.releases ? shortcuts.releases.toUpperCase() : "");

  setPageBadgeTracked(PAGE_BADGE_IDS.cloneUrl, findCloneButton(), buildCloneBadgeText(shortcuts));

  appendPagesHintItem(shortcuts.toggle ? shortcuts.toggle.toUpperCase() : "");

  // Catch late layout shifts (web fonts loading, the Releases skeleton
  // resolving to its final size) without a full MutationObserver.
  setTimeout(repositionAllPageBadges, 300);
  setTimeout(repositionAllPageBadges, 1000);
  setTimeout(repositionAllPageBadges, 2000);
}

window.addEventListener("resize", repositionAllPageBadges);
