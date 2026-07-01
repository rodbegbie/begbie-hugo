# Bootstrap 5.3 upgrade

## Context

The vendored `portio` Hugo theme (`themes/portio`) currently uses
Bootstrap 4.5.2, vendored under `themes/portio/assets/bootstrap-4.5.2/`
(a full copy of Bootstrap's release tree, not a package dependency).
Prior phases already reduced how much of Bootstrap this theme actually
depends on:

- **CSS trim (Phase 1):** `style.scss` imports only 15 of Bootstrap's
  SCSS partials — `functions`, `variables`, `mixins`, `root`, `reboot`,
  `type`, `grid`, `forms`, `buttons`, `transitions`, `nav`, `navbar`,
  `breadcrumb`, `pagination`, `utilities` — not the full framework.
- **JS vanilla rewrite (Phase 2):** Bootstrap's JS bundle was removed
  entirely and replaced with a hand-rolled `navbar.js` that reads the
  mobile nav's `data-toggle`/`data-target` attributes directly. Nothing
  in this theme depends on Bootstrap's own JavaScript anymore.

This spec upgrades the vendored Bootstrap source from 4.5.2 to the
latest 5.3.x production release, updating whatever the upgrade breaks.

## Findings that shape this upgrade

- Of the 9.4MB currently vendored under `bootstrap-4.5.2/`, only the
  `scss/` subdirectory (476KB) is ever read by the build — `dist/`
  (prebuilt CSS/JS, 3.6MB), `site/` (Bootstrap's own docs, 3.6MB), `js/`
  (1.1MB, unused since Phase 2), and `build/`/`nuget/` (60KB, packaging
  tooling) have been dead weight in the repo since Phases 1–2.
- Grepping every `class="..."` in `themes/portio/layouts` for classes
  Bootstrap 5 renames or removes turns up exactly: 9× `.form-group`
  (`contact/list.html`), 2× `.form-row` (`contact/list.html`, one of
  them inside an already-commented-out example form), 1×
  `.float-right` (`skillSection.html`), 2× `.mr-3`
  (`aboutSection.html`, `portfolio/single.html`), 1× `.ml-3`
  (`portfolio/single.html`), 1× `.pr-3` (`contact/list.html`), 1×
  `.text-right` (`portfolio/single.html`). No `.custom-*` form classes,
  `.close`, `.card-deck`, `.sr-only`, or other Bootstrap 5 removals
  appear anywhere.
- Checked against Bootstrap's own 5.3 documentation and migration guide:
  `.form-group` has no direct replacement class — Bootstrap's own
  migration guide replaces it with a margin utility (`.mb-3`) on the
  wrapping element. `.form-row` is gone; the closest equivalent is a
  plain `.row` with a smaller gutter utility (`.gx-3`), since BS4's
  `.form-row` used a tighter gutter than a standard `.row`.
  Left/right-suffixed utilities (`.mr-*`/`.ml-*`/`.pr-*`/`.text-right`/
  `.float-right`) are renamed to logical-property equivalents
  (`.me-*`/`.ms-*`/`.pe-*`/`.text-end`/`.float-end`).
- Bootstrap 5.3's own "optimize imports" reference shows the import list
  needs three additions this project doesn't have today — `variables-dark`
  and `maps` (both new files in the `functions`/`variables`/`mixins`
  chain) and `containers` (BS5 split `.container`/`.container-fluid` out
  of `_grid.scss` into their own partial). It also splits `utilities`
  into two imports: the existing early one (Sass infrastructure only)
  and a new `utilities/api` import that must run **last**, after every
  component — this is what actually generates utility classes
  (`.d-flex`, `.text-*`, `.mb-*`, etc.) in Bootstrap 5. Skipping it would
  silently produce zero utility classes.
- The theme's own `_variables.scss` overrides several Bootstrap
  variables to set its fonts/colors/sizes: `$primary`, `$secondary`,
  `$headings-color`, `$body-color`, `$font-family-base`,
  `$headings-font-family`, `$font-size-base`, `$h1-font-size` through
  `$h6-font-size`, `$headings-margin-bottom`, `$line-height-base`,
  `$link-hover-decoration`. Checked against Bootstrap 5.3's actual
  source: `$font-size-base`, `$h1`–`$h6-font-size`,
  `$headings-margin-bottom`, `$line-height-base`,
  `$headings-font-family`, and `$headings-color` are all confirmed
  present with identical names and semantics. `$primary`/`$secondary`/
  `$body-color`/`$link-hover-decoration` are foundational, long-standing
  variable names with no indication of removal, but — per your
  preference for empirical verification over asserting from docs alone
  — the implementation plan confirms these the definitive way: `hugo`
  build output. Sass fails loudly and specifically (naming the exact
  undefined variable) if any of these were actually removed, so this
  gets a hard, concrete answer during implementation rather than a
  guess now.

## Changes

### 1. Vendor Bootstrap 5.3's SCSS source only

Per your call: fetch only the `scss/` directory from Bootstrap's 5.3.x
GitHub release (not the full repository) into
`themes/portio/assets/bootstrap-5.3.x/scss/` (exact patch version
pinned once fetched, e.g. `5.3.3`), and delete
`themes/portio/assets/bootstrap-4.5.2/` entirely. No `dist/`, `js/`,
`site/`, `build/`, or `nuget/` directories in the new vendor drop — none
of that was ever used.

### 2. Update the import list in `style.scss`

Starting point (subject to the build-driven verification described
above):

```scss
@import "../bootstrap-5.3.x/scss/functions";
@import "../bootstrap-5.3.x/scss/variables";
@import "../bootstrap-5.3.x/scss/variables-dark";
@import "../bootstrap-5.3.x/scss/maps";
@import "../bootstrap-5.3.x/scss/mixins";
@import "../bootstrap-5.3.x/scss/utilities";
@import "../bootstrap-5.3.x/scss/root";
@import "../bootstrap-5.3.x/scss/reboot";
@import "../bootstrap-5.3.x/scss/type";
@import "../bootstrap-5.3.x/scss/containers";
@import "../bootstrap-5.3.x/scss/grid";
@import "../bootstrap-5.3.x/scss/forms";
@import "../bootstrap-5.3.x/scss/buttons";
@import "../bootstrap-5.3.x/scss/transitions";
@import "../bootstrap-5.3.x/scss/nav";
@import "../bootstrap-5.3.x/scss/navbar";
@import "../bootstrap-5.3.x/scss/breadcrumb";
@import "../bootstrap-5.3.x/scss/pagination";
@import "../bootstrap-5.3.x/scss/utilities/api";
```

The project's own `_variables.scss` variable overrides continue to load
first, unchanged, exactly as they do today (Sass `!default` semantics —
the theme's values win as long as they're set before Bootstrap's own
`_variables` runs).

### 3. Fix the classes Bootstrap 5 renames or removes

- **`contact/list.html`** (the live contact form, not the
  already-commented-out example form further down in the same file,
  which stays untouched): change
  `<div class="form-row">` → `<div class="row gx-3">`; change every
  `<div class="form-group ...">` wrapper → drop `form-group` and add
  `mb-3` to whatever classes remain on that element (e.g.
  `<div class="form-group col-md-6 pr-3">` →
  `<div class="col-md-6 pe-3 mb-3">`); change `pr-3` → `pe-3`.
- **`aboutSection.html`**: `mr-3` → `me-3`.
- **`portfolio/single.html`** (unreachable today — no content of type
  `portfolio` exists — fixed anyway, matching Phase 1's precedent of
  fixing this same file's icons despite it being unreachable): `mr-3` →
  `me-3`, `ml-3` → `ms-3`, `text-right` → `text-end`.
- **`skillSection.html`** (unreachable today — `enable: false` — fixed
  anyway, same reasoning): `float-right` → `float-end`.

### 4. Rename data attributes for BS5 convention

Per your call: `navbar.html`'s `data-toggle="collapse"` →
`data-bs-toggle="collapse"`, `data-target="#navbarCollapse"` →
`data-bs-target="#navbarCollapse"`. `navbar.js`'s selector
(`document.querySelector('[data-toggle="collapse"]')`) updated to match
(`[data-bs-toggle="collapse"]`). Purely cosmetic — `navbar.js` is the
only code that reads these attributes, and it works identically either
way — but keeps the markup consistent with which major version's
convention this project is on.

## Non-goals

- No visual redesign. The `.form-row` → `.row.gx-3` swap is the one
  spot where an exact 1:1 spacing match isn't guaranteed (BS4's
  `.form-row` gutter and BS5's `.gx-3` gutter aren't necessarily
  identical pixel values) — verified visually during testing, and
  adjusted to the closest matching gutter class if `.gx-3` doesn't look
  right, rather than assumed correct.
- No change to any content, data files, or JS module behavior — this is
  a CSS framework version upgrade, not a redesign or the JS
  vanilla-rewrite scope from Phase 2.
- No move away from Bootstrap entirely (considered and explicitly
  rejected in favor of the literal upgrade, per your call).
- No further trimming or expansion of which Bootstrap partials are
  imported beyond what Section 2 lists as the starting point — if the
  build reveals a partial is missing (an undefined variable/mixin error)
  or a partial imported today turns out unnecessary in BS5's
  restructured file layout, that's corrected during implementation, but
  the goal is to preserve the same set of Bootstrap-provided
  functionality this theme uses today, not add or remove capability.

## Testing/verification

No test suite exists in this repo — verification is `hugo` build plus
browser checks, consistent with every prior phase:

1. **Build verification:** `hugo` build succeeds with no Sass errors
   (an undefined variable/mixin from a missing import, or a variable
   that no longer exists in BS5, fails the build with a specific,
   readable error naming the exact problem).
2. **Visual verification via browser:** load every page (home — hero,
   about, resume, testimonials, blog preview; blog list; a blog single
   post; contact) via the Chrome DevTools Protocol browsing skill and
   confirm: grid layout, spacing, buttons, mobile nav toggle (including
   the renamed `data-bs-toggle` attribute), breadcrumbs, and the
   contact form all render and behave the same as before the upgrade.
3. **Contact form spacing check specifically:** since `.form-row` →
   `.row.gx-3` is an approximation, compare the Name/Email field
   spacing before and after — if the gutter looks visibly different,
   try an adjacent gutter utility (`.gx-2` or `.gx-4`) until it matches.
4. **Unreachable-template sanity check:** `portfolio/single.html` and
   `skillSection.html` can't be visually verified in the running site
   (no portfolio content exists; skill section is disabled) — verified
   instead by confirming the Sass/Hugo template syntax is valid (the
   site still builds) and by reading the diff to confirm the class
   renames are correct 1:1 substitutions, same verification approach
   Phase 1 used for the same two files.
