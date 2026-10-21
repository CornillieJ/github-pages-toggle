// Shared between content.js and background.js (loaded as a plain script, not a module).
// Firefox exposes browser.storage to content scripts directly, so this file can be
// used as-is in either context.

function analyzeTogglePagesUrl(href) {
  let url;
  try {
    url = new URL(href);
  } catch (e) {
    return null;
  }

  if (url.hostname === "github.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [user, repo] = parts;
    const isUserSiteRepo = repo.toLowerCase() === `${user.toLowerCase()}.github.io`;
    const repoKey = `${user.toLowerCase()}/${repo.toLowerCase()}`;
    const fallbackUrl = isUserSiteRepo
      ? `https://${user}.github.io/`
      : `https://${user}.github.io/${repo}/`;

    return { direction: "toPages", repoKey, fallbackUrl };
  }

  if (url.hostname.endsWith(".github.io")) {
    const user = url.hostname.slice(0, -".github.io".length);
    if (!user) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const repo = parts.length === 0 ? `${user}.github.io` : parts[0];
    const repoKey = `${user.toLowerCase()}/${repo.toLowerCase()}`;

    return {
      direction: "toRepo",
      repoKey,
      repoRootUrl: `https://github.com/${user}/${repo}`,
      currentUrl: href,
    };
  }

  return null;
}

// Repo-ward always lands on the repo root. Pages-ward restores the last Pages
// URL visited for that repo, since GitHub Pages sub-paths don't always mirror
// the repo's file layout.
async function togglePagesUrl(href) {
  const info = analyzeTogglePagesUrl(href);
  if (!info) return null;

  if (info.direction === "toRepo") {
    await browser.storage.local.set({ [info.repoKey]: info.currentUrl });
    return info.repoRootUrl;
  }

  const stored = await browser.storage.local.get(info.repoKey);
  return stored[info.repoKey] || info.fallbackUrl;
}

// Resolves the repo owner/name regardless of which side (github.com or the
// Pages site) the current tab is on, for features that just need "which repo
// is this" rather than a toggle target.
function getRepoInfo(href) {
  let url;
  try {
    url = new URL(href);
  } catch (e) {
    return null;
  }

  if (url.hostname === "github.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const [user, repo] = parts;
    return { user, repo };
  }

  if (url.hostname.endsWith(".github.io")) {
    const user = url.hostname.slice(0, -".github.io".length);
    if (!user) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const repo = parts.length === 0 ? `${user}.github.io` : parts[0];
    return { user, repo };
  }

  return null;
}

if (typeof module !== "undefined") {
  module.exports = { analyzeTogglePagesUrl, togglePagesUrl, getRepoInfo };
}
