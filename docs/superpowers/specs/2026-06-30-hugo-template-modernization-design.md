# Hugo template modernization design

## Context

The `portio` theme is vendored under `themes/portio` (not a submodule). A
previous fix (commit `d4d2e42`) brought it up to date with Hugo 0.157's actual
breaking changes: `.Site.Data` → `hugo.Data`, `resources.ToCSS` → `css.Sass`.

This round is not fixing breakage — it's adopting two idioms that Hugo's own
docs now recommend, even though the old forms still work:

- The global `site` function instead of the contextual `.Site` property,
  since it works regardless of template scope and removes the need for
  `$.Site` / capturing `$` purely to escape `range`/`with` scoping.
- `absURL`/`relURL` instead of raw `.Site.BaseURL` string concatenation,
  since direct `BaseURL` use is explicitly discouraged by Hugo's docs (it
  doesn't handle trailing-slash or multilingual edge cases correctly).

SCSS/Bootstrap/JS modernization is explicitly out of scope for this pass —
that's a separate, later piece of work.

## Scope

8 files under `themes/portio/layouts`, no other parts of the repo:

- `partials/navbar.html`
- `partials/footer.html`
- `partials/head.html`
- `partials/blogSection.html`
- `partials/portfolioSection.html`
- `blog/list.html`
- `blog/single.html`
- `contact/list.html`

## Changes

### 1. `.Site.X` / `$.Site.X` → `site.X`

Every contextual `.Site` access becomes the global `site` function. This
includes `.Site.Params.*`, `.Site.Menus.*`, `.Site.RegularPages`. In
`navbar.html`, this also removes the now-unneeded
`{{ $menu := .Site.Menus.main }}` indirection used only to dodge `range`
scoping — `site.Menus.main` can be called directly wherever needed.

### 2. Raw `BaseURL` concatenation → `absURL`/`relURL`

Five spots build URLs by concatenating `.Site.BaseURL` with a path fragment
instead of piping through `absURL`:

- Home/logo links (`navbar.html`, `blog/list.html`, `blog/single.html`,
  `contact/list.html`): `{{ .Site.BaseURL }}` → `{{ "" | absURL }}`
- Main nav menu loop (`navbar.html`): `{{ $.Site.BaseURL }}{{ .URL }}` →
  `{{ .URL | absURL }}` (menu `.URL` values are plain strings from
  `config.toml`, e.g. `"#home"`, `"blog"` — `absURL` path-joins these the
  same way the original concatenation did)
- Contact anchor (`navbar.html`): `{{ $.Site.BaseURL }}#contact` →
  `{{ "#contact" | absURL }}`

These are pure syntax changes — for this site's config (`baseURL` already
ends in `/`), `absURL` produces byte-identical output to the old
concatenation.

## Non-goals

- No change to rendered HTML/CSS/JS output.
- No SCSS, Bootstrap, or JS changes (tracked separately).
- No change to `themes/portio/exampleSite` (unused reference material, not
  built).
- No change to `data/*.yml` or `content/*.md`.

## Testing

1. `hugo` build before making changes; copy `public/` aside as a baseline.
2. Apply the template changes.
3. `hugo` build again.
4. Diff the two `public/` trees for the touched pages (home, blog list/single
   pages, contact page) — expect zero differences in generated `href`/`src`
   values or anywhere else.
