// Shared by content.js, popup.js. Defines every repo action that can get a
// configurable key binding, besides the GitHub <-> Pages toggle (which has its
// own dedicated logic in url-mapper.js because it also restores last-visited
// pages).

const REPO_ACTIONS = {
  copyHttps: {
    label: "Copy HTTPS clone URL",
    kind: "copy",
    build: (repo) => `https://github.com/${repo.user}/${repo.repo}.git`,
  },
  copySsh: {
    label: "Copy SSH clone URL",
    kind: "copy",
    build: (repo) => `git@github.com:${repo.user}/${repo.repo}.git`,
  },
  issues: {
    label: "Open Issues",
    kind: "open",
    build: (repo) => `https://github.com/${repo.user}/${repo.repo}/issues`,
  },
  prs: {
    label: "Open Pull requests",
    kind: "open",
    build: (repo) => `https://github.com/${repo.user}/${repo.repo}/pulls`,
  },
  actionsTab: {
    label: "Open Actions",
    kind: "open",
    build: (repo) => `https://github.com/${repo.user}/${repo.repo}/actions`,
  },
  releases: {
    label: "Open Releases",
    kind: "open",
    build: (repo) => `https://github.com/${repo.user}/${repo.repo}/releases`,
  },
  deepwiki: {
    label: "Open DeepWiki",
    kind: "open",
    build: (repo) => `https://deepwiki.com/${repo.user}/${repo.repo}`,
  },
  gitdiagram: {
    label: "Open GitDiagram",
    kind: "open",
    build: (repo) => `https://gitdiagram.com/${repo.user}/${repo.repo}`,
  },
};

// Display/config order for the popup's shortcuts list. "toggle" isn't in
// REPO_ACTIONS since its behavior lives in url-mapper.js, but it still gets a
// row here since it's configurable the same way.
const SHORTCUT_FIELDS = [
  {
    id: "toggle",
    label: "Toggle GitHub ↔ Pages",
    description: "Jump between this repo and its Pages site",
  },
  {
    id: "copyHttps",
    label: REPO_ACTIONS.copyHttps.label,
    description: "Copy the HTTPS git clone URL",
  },
  {
    id: "copySsh",
    label: REPO_ACTIONS.copySsh.label,
    description: "Copy the SSH git clone URL",
  },
  {
    id: "issues",
    label: REPO_ACTIONS.issues.label,
    description: "Open this repo's Issues tab",
  },
  {
    id: "prs",
    label: REPO_ACTIONS.prs.label,
    description: "Open this repo's Pull requests tab",
  },
  {
    id: "actionsTab",
    label: REPO_ACTIONS.actionsTab.label,
    description: "Open this repo's Actions tab",
  },
  {
    id: "releases",
    label: REPO_ACTIONS.releases.label,
    description: "Open this repo's Releases tab",
  },
  {
    id: "deepwiki",
    label: REPO_ACTIONS.deepwiki.label,
    description: "AI-generated wiki & architecture docs",
  },
  {
    id: "gitdiagram",
    label: REPO_ACTIONS.gitdiagram.label,
    description: "Interactive system diagram of the repo",
  },
];

// Reads the configured shortcuts, migrating the older single "shortcutKey"
// value (pre-2.0, toggle-only) into the new per-action map on first read.
async function loadShortcuts() {
  const stored = await browser.storage.local.get(["shortcuts", "shortcutKey"]);
  if (stored.shortcuts) return stored.shortcuts;

  const migrated = { toggle: stored.shortcutKey || "p" };
  await browser.storage.local.set({ shortcuts: migrated });
  return migrated;
}

if (typeof module !== "undefined") {
  module.exports = { REPO_ACTIONS, SHORTCUT_FIELDS, loadShortcuts };
}
