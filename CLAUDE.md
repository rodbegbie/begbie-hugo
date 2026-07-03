# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Hugo static site for Rod Begbie's personal/coaching site (`coaching.begbie.com`), using a
vendored copy of the **portio** theme (Bootstrap 5.3.8). Deployed to Cloudflare Pages via `wrangler`.

## Workflow gotchas

- **`gh pr review --approve` always fails** ("Can not approve your own pull request") for this
  repo/account — expected. Skip straight to `gh pr merge --squash --delete-branch`.
- **`git add path1 path2 ...` aborts entirely if any path doesn't exist** (common after
  `git mv`/`rm` leaves a path already staged) — no files get staged, not just the missing one.
  Run `git status` first and pass only currently-existing paths.

## Commands

```bash
hugo server -D        # local dev server with drafts, live reload
hugo                   # build to public/ (generated, gitignored)
```

- Hugo version is pinned to **0.163.3** via `HUGO_VERSION` in `wrangler.jsonc` — that's what
  Cloudflare Pages reads to pick the build image.
- No package.json, Makefile, or test suite. Verify content/template correctness by building and
  checking `public/` or the dev server.

## Architecture

- **Theme is vendored, not a submodule.** `themes/portio` is a full copy of the theme committed
  directly into this repo (commit `55bde54`). `.gitmodules` exists but is empty — `git submodule
  update` does nothing. Edit templates directly under `themes/portio/layouts`; there is no
  project-level `layouts/` override directory.
- **Homepage sections are toggleable and data-driven.** Each partial in
  `themes/portio/layouts/partials/` (`aboutSection.html`, `hero.html`, `resumeSection.html`,
  `serviceSection.html`, `skillSection.html`, `portfolioSection.html`, `testimonialSection.html`,
  `blogSection.html`) reads a same-named YAML file in `data/`. Every data file starts with
  `enable: true|false`; the partial wraps itself in `{{ if .enable }}` — flip that flag to
  show/hide a section. Currently disabled: `portfolioSection`, `serviceSection`, `skillSection`.
- **Read site data via `hugo.Data.<name>`, not `.Site.Data.<name>`** (changed in commit `d4d2e42`
  for Hugo 0.157 — `.Site.Data` is deprecated, `resources.ToCSS` became `css.Sass`). Follow this
  pattern for new data-driven sections; `themes/portio/exampleSite` is reference-only (uses the
  old API, not built).
- **Design tokens live in `themes/portio/assets/scss/_tokens.scss`** — CSS custom properties
  (`--accent`, `--ink`, `--bg`) plus Sass variables for fonts/spacing/radii. Reference these in
  new components; don't hardcode hex/px values.
- **Decorative blob backgrounds use `layouts/partials/blob.html`**, called as
  `{{ partial "blob.html" (dict "id" "unique-gradient-id" "color" "var(--accent)" "stopOpacity"
  ".08") }}` inside a `.blob-wrap` wrapper div. Don't hand-copy the inline SVG again.
- **Résumé data is split into `recent`/`earlier` lists**, not one flat list sliced by `first N`.
  `data/resumeSection.yml`'s `recent` entries render as cards; `earlier` entries generate the
  "Earlier: ..." summary line in the template. Add a new job by moving the oldest `recent` entry
  into `earlier`.
- **Content types:** `content/blog/*.md` are blog posts (front matter: `title`, `date`,
  `featureImage`, `featureImageAnchor` (optional), `subtitle`), rendered through
  `themes/portio/layouts/blog/{list,single}.html`. There is no `/contact/` page — removed (was
  unlinked, posted to an unconfigured Formspree placeholder); site contact is the homepage's
  `#contact` footer CTA or `data/aboutSection.yml`/`data/hero.yml` links. Everything else on the
  homepage is YAML in `data/`, not Markdown content.
- **Don't reformat static verification files** like
  `static/.well-known/apple-developer-merchantid-domain-association` — opaque payloads required
  by third parties (Apple Pay).

## Deployment

Cloudflare Pages, configured by `wrangler.jsonc`. `pages_build_output_dir` points at `public/`.
Pages project name is `begbie-hugo` (matches `name` in `wrangler.jsonc`). To check deployment
status/logs, use the `cloudflare-api` MCP tool against
`/accounts/{accountId}/pages/projects/begbie-hugo/deployments` rather than the dashboard.

**Cloudflare Rocket Loader** (zone-level, `coaching.begbie.com` only — not `*.pages.dev`
previews) rewrites `<script>` `type` attributes, breaking any script not marked
`data-cfasync="false"`. If JS works on a PR preview but not production, check this before
assuming a code regression.

## Reference documents

Claude Code auto-loads these when you touch a matching file path — no need to read them manually.

| Topic | File | Loads when touching |
|-------|------|----------------------|
| Hugo templating, image pipeline, responsive `sizes`/srcset | `.claude/rules/hugo-templates.md` | `themes/portio/layouts/**/*.html` |
| Bootstrap utilities trim, SVG/gradient CSS, stacking contexts | `.claude/rules/scss-css.md` | `themes/portio/assets/scss/**/*.scss` |

## Where new instructions belong

- Always-needed project facts (architecture, commands, workflow) → this file.
- Gotchas scoped to one file type → `.claude/rules/*.md` with a `paths:` frontmatter key, not
  inline here.
- One-off session details → don't record; they belong in the PR/commit, not CLAUDE.md.
