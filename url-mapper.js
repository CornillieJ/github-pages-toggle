// Shared between content.js and background.js (loaded as a plain script, not a module).

function getTogglePagesUrl(href) {
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
    const rest = parts.slice(2).join("/");

    if (repo.toLowerCase() === `${user.toLowerCase()}.github.io`) {
      return `https://${user}.github.io/${rest}${url.search}${url.hash}`;
    }
    return `https://${user}.github.io/${repo}/${rest}${url.search}${url.hash}`;
  }

  if (url.hostname.endsWith(".github.io")) {
    const user = url.hostname.slice(0, -".github.io".length);
    if (!user) return null;
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length === 0) {
      return `https://github.com/${user}/${user}.github.io`;
    }
    const repo = parts[0];
    const rest = parts.slice(1).join("/");
    return `https://github.com/${user}/${repo}${rest ? "/" + rest : ""}`;
  }

  return null;
}

if (typeof module !== "undefined") {
  module.exports = { getTogglePagesUrl };
}
