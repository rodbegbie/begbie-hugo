# CSS purge: trim unused Bootstrap utilities

## Problem

Chrome DevTools reports ~90% of the site's compiled CSS is unused. A class-usage
audit (comparing every `class="..."` in the built `public/**/*.html` against every
class selector in the compiled `public/scss/style.min.*.css`) confirms this:

- Compiled CSS: 167,678 bytes, 2,077 distinct class selectors
- Classes actually used across all rendered pages: 138
- Classes defined but never used: 1,948 (93.8%)

The bulk of the unused CSS is not leftover clutter — it's Bootstrap's utilities
API doing exactly what it's designed to do: `_utilities.scss` defines ~50 utility
categories (opacity, shadows, all border-radius variants, sizing, position,
z-index, link-underline, background colors, etc.), each expanded across every
breakpoint in `$grid-breakpoints`. The site uses a small fraction of these
categories, and only 2 of Bootstrap's 6 breakpoints in any meaningful way
(`md`/`lg`, plus one single `sm` usage on `text-sm-center`; `xl`/`xxl` are unused
everywhere — grid columns, offsets, and utilities alike).

Additionally:
- `themes/portio/assets/scss/style.scss` imports Bootstrap's `forms` module, but
  zero `form-*` classes appear anywhere in `themes/portio/layouts` or `data/*.yml`.
- It also imports `pagination`, and `blog/list.html` unconditionally calls the
  `pagination` partial — but with the current post count no pagination markup
  renders. Per discussion with Rod: drop the import now; re-add later if/when
  pagination actually renders (rather than keeping dead weight against a
  hypothetical future).

## Goals

- Reduce compiled CSS size by trimming Bootstrap's SCSS configuration to only
  what the site's templates and data actually use.
- Do this without adding any new build tooling (no Node/npm/PurgeCSS) — stay
  consistent with the project's existing "just Hugo" build model.
- Zero visual regressions: every one of the 138 classes currently used in
  rendered output must still resolve to the same CSS after the trim.

## Non-goals

- Automated purging that reacts to future template changes (that's the
  PurgeCSS-based approach, rejected for now — see design discussion below).
- Restructuring the component-level custom SCSS (`components/*.scss`) — this is
  scoped entirely to the Bootstrap import/configuration layer in `_variables.scss`
  and `style.scss`.

## Approach

Subtractive customization of Bootstrap's SCSS config, informed by an exact
class-usage audit (see `Verification` below for the method — a small Python
script comparing rendered HTML classes against compiled CSS selectors).

### 1. Trim `$grid-breakpoints` / `$container-max-widths`

In `themes/portio/assets/scss/_variables.scss`, override these maps (before the
Bootstrap `variables`/`maps` imports) to drop `xl` and `xxl`, keeping only
`xs`/`sm`/`md`/`lg`. This shrinks every responsive utility and grid class by
2/6 breakpoints in one change, since Bootstrap's grid and utilities API both
loop over whatever's in `$grid-breakpoints`.

### 2. Override `$utilities` to only the categories actually used

Full audit of every class currently rendered maps to exactly these Bootstrap
utility keys (see `_utilities.scss` category names):

| Utility key       | Classes used              | Values needed | Responsive? |
|-------------------|----------------------------|---------------|-------------|
| `display`         | `d-flex`, `d-inline-block` | `flex`, `inline-block` | no |
| `justify-content` | `justify-content-center`, `justify-content-between` | `center`, `between` | no |
| `align-items`     | `align-items-center`       | `center`      | no |
| `margin-top`      | `mt-5`                     | `5`           | no |
| `margin-end`      | `me-3`                     | `3`           | no |
| `margin-bottom`   | `mb-5`, `.mb-3` via `@extend` in `_typography.scss:29` (`.top-title`) | `3`, `5` | no |
| `margin-x`        | `mx-2`, `mx-auto`          | `2`, `auto`   | no |
| `margin-y`        | `my-0`                     | `0`           | no |
| `padding`         | `p-2`                      | `2`           | no |
| `text-align`      | `text-center`, `text-sm-center` | `center` | **yes** (needs `sm`) |
| `color`           | `text-dark`                | `dark`        | no |

Every other key in Bootstrap's default `$utilities` map (`align` (vertical-align),
`float`, `object-fit`, `opacity`, `overflow*`, `shadow`, `focus-ring`, `position`,
`top`/`bottom`/`start`/`end`, `translate-middle`, all `border*`, all sizing
(`width`/`height`/etc.), `flex`/`flex-direction`/`flex-grow`/`flex-shrink`/
`flex-wrap`, `align-content`, `align-self`, `order`, bare `margin`, all
`negative-margin*`, `padding-x`/`padding-y`/`padding-top`/`padding-end`/
`padding-bottom`/`padding-start`, `gap`/`row-gap`/`column-gap`, all `font-*`,
`line-height`, `text-decoration`, `text-transform`, `white-space`, `word-wrap`,
`text-opacity`, `text-color`, all `link-*`, `background-color`, `bg-opacity`,
`subtle-background-color`, `gradient`, `user-select`, `pointer-events`, all
`rounded*`, `visibility`, `z-index`) gets removed via `map-remove`.

### 3. Drop unused component imports

In `themes/portio/assets/scss/style.scss`, remove the `forms` and `pagination`
`@import` lines.

## Risk: silent failure on future utility-class usage

If a future template or `data/*.yml` edit adds a stock Bootstrap utility class
that isn't in the trimmed `$utilities` map (e.g. someone writes `class="mt-3"`
on a new section), it will not error — the class simply won't resolve to any
CSS rule, and the failure mode is a silent visual layout bug, not a build
failure.

Mitigation: add a CLAUDE.md gotcha documenting the trimmed utility set and
where to extend it (`_variables.scss`'s `$utilities` override), so a future
"why doesn't this margin class do anything" investigation points straight at
the cause instead of being mistaken for a CSS specificity or cache issue.

## Verification plan

1. `rm -rf public resources/_gen .hugo_build.lock && hugo` — confirm build
   succeeds with no new warnings/errors.
2. Re-run the class-usage audit script: every one of the 138 currently-used
   classes must still resolve in the new compiled CSS (i.e. `used - defined`
   is empty). Report new file size and new unused-class percentage.
3. Manual visual pass via `hugo server -D`: homepage (hero, about, resume,
   testimonials, footer sections), a single blog post page, and the navbar
   collapse toggle at mobile width — since utility trimming is exactly the
   kind of change that can silently drop styling rather than break the build.
4. Grep built `public/` output for `ZgotmplZ` (per existing CLAUDE.md gotcha
   about the CSS-context auto-escaper) as a sanity check, even though this
   change doesn't touch dynamic inline styles.

**Audit methodology gap found during implementation:** the class-usage audit
script only scans rendered HTML for literal `class="..."` attributes. It
missed `themes/portio/assets/scss/_typography.scss:29`, which pulls in a
utility class via Sass `@extend .mb-3;` rather than a literal HTML class —
this class never appears in any `public/**/*.html` file, so the HTML-only
audit couldn't see it, but the build fails without it (`@extend` requires
the target selector to exist). Confirmed via grep this is the only `@extend`
of a utility class anywhere in the theme's SCSS. `margin-bottom` was widened
to keep both `3` and `5`. Future re-audits of this kind should also
`grep -rn "@extend \." themes/portio/assets/scss` for SCSS-internal utility
dependencies the HTML scan can't see.

## Design discussion: why not PurgeCSS

Considered and rejected for this pass: PurgeCSS would auto-adapt to future
template changes, but it introduces a Node/npm build dependency into a project
that currently has none (`wrangler.jsonc` only pins `HUGO_VERSION`), and needs
careful safelisting to avoid stripping JS-toggled classes (e.g. Bootstrap's
`.collapsing`/`.show` on the navbar collapse) that never appear in static HTML
output. The manual SCSS trim is more work up front but has no ongoing tooling
cost and fails in a way that's traceable to a specific, documented config file.
