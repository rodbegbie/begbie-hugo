# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Hugo static site for Rod Begbie's personal/coaching site (`coaching.begbie.com`), using a
vendored copy of the **portio** Bootstrap 4 theme. Deployed to Cloudflare Pages via `wrangler`.

## Commands

```bash
hugo server -D        # local dev server with drafts, live reload
hugo                   # build to public/ (generated, gitignored)
```

Hugo version is pinned to **0.157.0** — set via `HUGO_VERSION` in `wrangler.jsonc`, which is what
Cloudflare Pages reads to pick the build image. There is no package.json, Makefile, or test suite;
content/template correctness is verified by building and checking `public/` or the dev server.

## Architecture

**Theme is vendored, not a submodule.** `themes/portio` is a full copy of the theme committed
directly into this repo (see commit `55bde54`, "Copy in the portio theme, instead of submoduling
it"). `.gitmodules` exists but is empty — don't expect `git submodule update` to do anything.
Theme edits happen directly under `themes/portio/layouts`; there is no project-level `layouts/`
override directory.

**Homepage is built from toggleable, data-driven sections.** Each section partial in
`themes/portio/layouts/partials/` (e.g. `aboutSection.html`, `heroSection` via `hero.html`,
`resumeSection.html`, `serviceSection.html`, `skillSection.html`, `portfolioSection.html`,
`testimonialSection.html`, `blogSection.html`) reads its content from a same-named YAML file in
`data/` (e.g. `data/aboutSection.yml`). Every data file starts with `enable: true|false`, and the
partial wraps itself in `{{ if .enable }}` — flip that flag to show/hide a section, no template
changes needed. Currently disabled: `portfolioSection`, `serviceSection`, `skillSection`.

**Data is read via `hugo.Data.<name>`, not `.Site.Data.<name>`.** This was changed in commit
`d4d2e42` ("Fix Hugo compatibility for modern versions") when upgrading to Hugo 0.157 — `.Site.Data`
is deprecated and `resources.ToCSS` was replaced with `css.Sass`. If you add a new data-driven
section or touch SCSS compilation, follow these same patterns rather than older portio-theme
examples found online (`themes/portio/exampleSite` still uses the old API and is reference-only,
not built).

**Content types:**
- `content/blog/*.md` — blog posts (front matter: `title`, `date`, `featureImage`, `postImage`,
  `subtitle`), rendered through `themes/portio/layouts/blog/{list,single}.html`.
- `content/contact/_index.md` — the contact page.
- Everything else on the homepage (`hero`, `about`, `resume`, `testimonials`, etc.) is YAML in
  `data/`, not Markdown content.

**Static verification files** like `static/.well-known/apple-developer-merchantid-domain-association`
are opaque payloads required by third parties (Apple Pay) — don't reformat or "clean up" their
contents.

## Deployment

Cloudflare Pages, configured by `wrangler.jsonc` (the active config — `wrangler.toml` is an older
auto-generated file, also present). `pages_build_output_dir` points at `public/`.
