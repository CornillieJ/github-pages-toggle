# RepoTools

A small Firefox extension that turns the toolbar into a toolbelt for whatever
GitHub repo you're looking at: jump to its Pages site, copy a clone URL, open
Issues/PRs/Actions/Releases, or hand the repo to DeepWiki or GitDiagram.

## Features

### GitHub &harr; Pages toggle

- **Press your shortcut key** (default `p`) anywhere on a `github.com` or
  `*.github.io` page — ignored while typing in an input, textarea, or editable
  field — to toggle to the matching page.
- **Hold Shift** while pressing it to open the result in a new tab instead of
  navigating the current one.
- Change the shortcut key from the popup (not limited to Firefox's `commands`
  API, which requires a modifier key — this is our own key listener, so a bare
  letter works).
- A green checkmark flashes on the toolbar icon when a toggle succeeds, a red
  `×` when the current page isn't a GitHub repo or Pages site.
- **Repo-ward always goes to the repo root** (`github.com/<user>/<repo>`), since a
  Pages sub-path rarely matches the repo's actual file layout.
- **Pages-ward returns to the last Pages page you were on** for that repo,
  instead of guessing a URL from the repo path. First time toggling a given
  repo, it falls back to the Pages site root.
- Handles the `<user>.github.io` user/organization site repo as a special case
  (its Pages site has no `/repo` prefix).

```
https://github.com/<user>/<repo>            https://<user>.github.io/<repo>
                      <── key / Shift+key ──>
```

### Repo tools (in the popup)

- **Copy HTTPS / SSH clone URL** to the clipboard in one click.
- **Jump to Issues, Pull requests, Actions, or Releases** for the current repo.
- **Open in DeepWiki** — an AI-generated wiki with architecture diagrams and
  module explanations for the repo.
- **Open in GitDiagram** — an interactive system-architecture diagram of the
  repo, with clickable nodes linking back to the real files.

These all work whether you're currently on the `github.com` side or the
`*.github.io` side of a repo.

## Examples

| From | To |
|---|---|
| `github.com/CornillieJ/omarchy/blob/main/README.md` | `cornilliej.github.io/omarchy` (or wherever you last were on that site) |
| `cornilliej.github.io/omarchy/some/page` | `github.com/CornillieJ/omarchy` |
| `github.com/CornillieJ/CornillieJ.github.io` | `cornilliej.github.io/` |

## Install

- **Firefox Add-ons (recommended):** https://addons.mozilla.org/en-US/firefox/addon/github-pages-toggle/
- **Manual / development build:** see [Development](#development) below.

## Development

```sh
git clone https://github.com/CornillieJ/repotools.git
cd repotools
```

Load it temporarily in Firefox:

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` in this folder

Temporary installs are removed when Firefox restarts — for a permanent local
install, package and sign it (see [Publishing](#publishing)).

## Publishing

This repo ships as plain WebExtension source. To release a new version on
addons.mozilla.org:

1. Bump `version` in `manifest.json`.
2. Zip the extension's contents (not the folder itself):
   ```sh
   cd repotools
   zip -r -FS ../repotools.xpi . -x ".git/*" "assets/*" "README.md" "LICENSE" ".gitignore"
   ```
3. Upload the `.xpi` at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/).

## Credits

Icon built from [Lucide](https://lucide.dev)'s `wrench` icon (ISC licensed) and
the [Simple Icons](https://simpleicons.org) GitHub mark (CC0), used nominatively
to indicate what the tools are for — this project isn't affiliated with GitHub.

DeepWiki ([deepwiki.com](https://deepwiki.com)) and GitDiagram
([gitdiagram.com](https://gitdiagram.com)) are third-party services this
extension links to; it has no affiliation with either.

## License

[MIT](LICENSE)
