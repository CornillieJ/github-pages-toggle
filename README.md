# GitHub Pages Toggle

Firefox extension: press `p` (outside inputs) on a GitHub repo page to jump to its
GitHub Pages site, and back. Also works via the toolbar icon.

- `https://github.com/<user>/<repo>` → `https://<user>.github.io/<repo>`
- `https://<user>.github.io/<repo>` → `https://github.com/<user>/<repo>`
- Handles the `<user>.github.io` user-site repo special case and preserves sub-paths.

## Load temporarily in Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` in this folder
