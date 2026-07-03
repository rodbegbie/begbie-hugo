# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Hugo static site for Rod Begbie's personal/coaching site (`coaching.begbie.com`), using a
vendored copy of the **portio** theme (Bootstrap 5.3.8). Deployed to Cloudflare Pages via `wrangler`.

## Commands

```bash
hugo server -D        # local dev server with drafts, live reload
hugo                   # build to public/ (generated, gitignored)
```

Hugo version is pinned to **0.163.3** — set via `HUGO_VERSION` in `wrangler.jsonc`, which is what
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

**Design tokens live in `themes/portio/assets/scss/_tokens.scss`.** CSS custom properties
(`--accent`, `--ink`, `--bg`, etc.) plus Sass variables for fonts/spacing/radii. New components
should reference these, not hardcode hex/px values.

**Decorative blob backgrounds use `layouts/partials/blob.html`**, called as
`{{ partial "blob.html" (dict "id" "unique-gradient-id" "color" "var(--accent)" "stopOpacity" ".08") }}`
inside a `.blob-wrap` wrapper div. One shared partial for every section's blob — don't hand-copy
the inline SVG again.

**Résumé data is split into `recent`/`earlier` lists**, not one flat list sliced by `first N`.
`data/resumeSection.yml`'s `recent` entries render as cards; `earlier` entries generate the
"Earlier: ..." summary line directly in the template. Add a new job by moving the oldest `recent`
entry into `earlier`, not by editing prose by hand.

**Content types:**
- `content/blog/*.md` — blog posts (front matter: `title`, `date`, `featureImage`,
  `featureImageAnchor` (optional, overrides smart-crop anchor — see below), `subtitle`), rendered
  through `themes/portio/layouts/blog/{list,single}.html`.
- There is no `/contact/` page — removed (was unlinked from nav/hero/footer, its form posted to an
  unconfigured Formspree placeholder). Site contact is the homepage's `#contact` footer CTA
  (mailto link) or `data/aboutSection.yml`/`data/hero.yml` links.
- Everything else on the homepage (`hero`, `about`, `resume`, `testimonials`, etc.) is YAML in
  `data/`, not Markdown content.

**Static verification files** like `static/.well-known/apple-developer-merchantid-domain-association`
are opaque payloads required by third parties (Apple Pay) — don't reformat or "clean up" their
contents.

## Gotchas

**Clear the Hugo cache before testing image changes.** `rm -rf public resources/_gen
.hugo_build.lock` before `hugo`/`hugo server` when iterating on `.Fill`/`.Resize` calls — Hugo
caches processed image variants keyed by the processing-spec string, and stale cached files can
mask whether an edit actually took effect.

**Responsive images use width-descriptor srcset + `sizes`, not `1x`/`2x`.** Bootstrap 5's grid
makes `.row > *` full-width by default below the column's breakpoint (e.g. `col-lg-4` is 100%
wide below `lg`), so images/thumbnails often render *larger* on mobile/tablet than in a desktop
multi-column layout — the opposite of the naive assumption. Compute real per-breakpoint CSS widths
from the actual column math before picking `sizes` breakpoints for any new responsive image.

**`featureImageAnchor` front matter** (e.g. `Left`, `TopLeft`, `Center`) overrides Hugo's default
`smart` crop anchor for a post's `featureImage`, applied via
`.Params.featureImageAnchor | default "smart"` in both the thumbnail and banner `Fill` calls.

**Hugo template scoping inside nested `with`/`range`:** `.` becomes the resource (not the page)
inside `{{ with resources.Get ... }}`, and `$` still refers to the template's original entrypoint
context (not the loop item) inside `{{ range }}` — capture `{{ $post := . }}` before entering
nested scopes if you need page fields inside them.

**JSON-LD in `<script>` tags needs `| safeJS`** after `| jsonify` — otherwise Go's `html/template`
autoescaper treats the bare text as a JS string literal and double-encodes the whole blob.

**Cloudflare Rocket Loader** (zone-level, `coaching.begbie.com` only — not `*.pages.dev` previews)
rewrites `<script>` `type` attributes, breaking any script not marked `data-cfasync="false"`. If JS
works on a PR preview but not production, check this before assuming a code regression.

**`gh pr review --approve` always fails** with "Can not approve your own pull request" for this
repo/account — expected, not a bug. Skip straight to `gh pr merge --squash --delete-branch`.

**`git add path1 path2 ...` aborts entirely if any path doesn't exist** (common after `git mv`/`rm`
leaves a path already staged) — no files get staged, not just the missing one. Run `git status`
first and pass only currently-existing paths.

**SVG `<stop>` elements need `style="stop-color: var(--x)"`, not `stop-color="var(--x)"`.** The
bare presentation attribute doesn't resolve CSS custom properties — only the `style` attribute
goes through the CSS cascade. Applies to any gradient referencing a design token.

**Passing a variable into `style="..."` in a Go template trips the CSS-context auto-escaper** —
`style="stop-color: {{ $color }}"` silently renders literal `ZgotmplZ` instead of the value if
`$color` isn't a compile-time string literal. Build the string with `printf` and pipe through
`| safeCSS`: `style="{{ printf "stop-color: %s;" $color | safeCSS }}"`. Always grep the built
`public/` output for `ZgotmplZ` after adding a partial with dynamic inline styles — it fails
silently, no build error.

**Bootstrap's `$utilities` map is trimmed to only what's currently used** (see
`themes/portio/assets/scss/_utilities-trim.scss`) — down from Bootstrap's ~50
default utility categories to the 11 this site actually uses (`display`,
`justify-content`, `align-items`, `margin-top`/`-end`/`-bottom`/`-x`/`-y`,
`padding`, `text-align`, `color`), each restricted to only its in-use values.
`$grid-breakpoints`/`$container-max-widths` are similarly trimmed to
`xs`/`sm`/`md`/`lg` (`xl`/`xxl` unused). If a template needs a stock Bootstrap
utility class not already covered (e.g. `mt-3`, `bg-primary`, `rounded-pill`),
it silently resolves to no CSS — not a build error. Add the missing key/value
to `_utilities-trim.scss` rather than assuming any Bootstrap utility class
will work out of the box. The `forms` and `pagination` Bootstrap SCSS modules
are no longer imported either (zero/near-zero usage) — re-add the import in
`style.scss` if a future page actually needs form controls or paginated
listings.

**`position: relative` alone does NOT create a stacking context.** A child with `z-index: -1`
needs its positioned ancestor to also declare `z-index` (even `z-index: 0`), or the negative
z-index escapes to a page-wide shared layer *below every section's own background* — including
sections with an opaque background that then paint over it, making the child invisible with no
error. Every section that wraps a decorative blob (`.hero`, `.about_content-thumb`,
`.blog-preview`, `.breadCrumb`, `.singleBlog__feature`, `.footer`) sets `position: relative;
z-index: 0;` together for this reason — keep them paired in any new section.

**External links get `target="_blank"` via a render hook, not `unsafe = true`.**
`themes/portio/layouts/_default/_markup/render-link.html` compares the link's host against
`site.BaseURL` and adds `target="_blank" rel="noopener noreferrer"` only for external links.
Don't re-enable `markup.goldmark.renderer.unsafe` in `config.toml` — it disables HTML
sanitization for every markdown field on the site to solve a problem this hook already covers.

**Hugo's `smart` crop anchor can clip a portrait's headroom.** For hero/about-style headshots,
`Top`-anchored `.Fill` calls are a safer default than `smart` when the subject's hair/head must
stay fully visible — `smart` optimizes for overall visual interest, not for "don't cut off the
top of the frame."

## Deployment

Cloudflare Pages, configured by `wrangler.jsonc`. `pages_build_output_dir` points at `public/`.

Pages project name is `begbie-hugo` (matches `name` in `wrangler.jsonc`). To check deployment
status/logs, use the `cloudflare-api` MCP tool against
`/accounts/{accountId}/pages/projects/begbie-hugo/deployments` rather than the dashboard.
