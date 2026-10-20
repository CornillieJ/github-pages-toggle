# GitHub Pages Toggle

A tiny Firefox extension that jumps between a GitHub repo and its live GitHub Pages
site — press <kbd>P</kbd> or click the toolbar icon, either direction.

```
https://github.com/<user>/<repo>            https://<user>.github.io/<repo>
                               <── P ──>
```

## Why

GitHub Pages sites and their source repos live on different domains, so switching
between "here's the code" and "here's the live site" usually means editing the URL
by hand. This extension does that instantly, in either direction, keeping the
current sub-path (e.g. `/blob/main/docs/`) intact where it makes sense.

## Features

- **Press `P`** anywhere on a `github.com` or `*.github.io` page (ignored while
  typing in an input, textarea, or editable field) to toggle to the matching page.
- **Click the toolbar icon** to do the same without touching the keyboard.
- Preserves the path, query string, and hash when toggling a sub-page.
- Handles the `<user>.github.io` user/organization site repo as a special case
  (its Pages site has no `/repo` prefix).

## Examples

| From | To |
|---|---|
| `github.com/CornillieJ/omarchy` | `cornilliej.github.io/omarchy` |
| `github.com/CornillieJ/omarchy/blob/main/README.md` | `cornilliej.github.io/omarchy/blob/main/README.md` |
| `github.com/CornillieJ/CornillieJ.github.io` | `cornilliej.github.io` |

## Install

- **Firefox Add-ons (recommended):** [link once published on AMO]
- **Manual / development build:** see [Development](#development) below.

## Development

```sh
git clone https://github.com/CornillieJ/github-pages-toggle.git
cd github-pages-toggle
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
   cd github-pages-toggle
   zip -r -FS ../github-pages-toggle.xpi . -x ".git/*" "assets/*"
   ```
3. Upload the `.xpi` at [addons.mozilla.org/developers](https://addons.mozilla.org/developers/).

## License

[MIT](LICENSE)
