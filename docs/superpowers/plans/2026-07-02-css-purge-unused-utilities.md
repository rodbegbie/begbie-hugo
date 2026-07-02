# CSS Purge: Trim Unused Bootstrap Utilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shrink the compiled site CSS by trimming Bootstrap's SCSS configuration to only the utility categories, breakpoints, and component imports the site's templates and data actually use.

**Architecture:** Subtractive customization at the Bootstrap import/config layer only (`themes/portio/assets/scss/_variables.scss` and `style.scss`), plus one new partial (`_utilities-trim.scss`) that trims Bootstrap's generated `$utilities` map after it's built but before `utilities/api` expands it into CSS. No new build tooling — same `hugo`/`hugo server` workflow as today.

**Tech Stack:** Hugo 0.163.3, Sass (Hugo's built-in `css.Sass` pipeline), vendored Bootstrap 5.3.8 SCSS source.

## Global Constraints

- No new build tooling (no Node/npm/PurgeCSS) — stay within the existing `hugo`/`wrangler` pipeline (spec: Goals).
- Every one of the 138 classes currently used in rendered HTML output must still resolve to CSS after the trim — zero visual regressions (spec: Goals).
- Scope is limited to the Bootstrap import/configuration layer — no changes to `themes/portio/assets/scss/components/*.scss` (spec: Non-goals).
- `forms` and `pagination` Bootstrap imports are dropped now, per Rod's explicit call (spec: Problem) — not deferred, not kept "just in case."

---

### Task 1: Trim grid breakpoints and container widths

**Files:**
- Modify: `themes/portio/assets/scss/_variables.scss`

**Interfaces:**
- Produces: `$grid-breakpoints` and `$container-max-widths` Sass maps, each restricted to `xs`/`sm`/`md`/`lg` (no `xl`/`xxl`). These are consumed by Bootstrap's own `variables`/`grid`/`utilities` partials imported later in `style.scss` — because our `_variables.scss` is `@import`ed first, and Bootstrap declares these maps with `!default`, our values win without needing `!default` ourselves.

- [ ] **Step 1: Add the trimmed breakpoint maps**

Append to the end of `themes/portio/assets/scss/_variables.scss`:

```scss

//
// Grid breakpoints / container widths
//
// Trimmed to the breakpoints actually used across templates/data (xs/sm/md/lg).
// xl/xxl are unused anywhere in grid columns, offsets, or utilities — see
// docs/superpowers/specs/2026-07-02-css-purge-unused-utilities-design.md
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
);

$container-max-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
);
```

- [ ] **Step 2: Build and confirm no Sass errors**

Run: `rm -rf public resources/_gen .hugo_build.lock && hugo`
Expected: build completes with the same warnings as before this change (two pre-existing `deprecated: ...languageCode...` warnings) and no new errors. A compiled CSS file still appears under `public/scss/`.

- [ ] **Step 3: Commit**

```bash
git add themes/portio/assets/scss/_variables.scss
git commit -m "Trim grid breakpoints to xs/sm/md/lg (xl/xxl unused)"
```

---

### Task 2: Trim the Bootstrap `$utilities` map

**Files:**
- Create: `themes/portio/assets/scss/_utilities-trim.scss`
- Modify: `themes/portio/assets/scss/style.scss:11-29`

**Interfaces:**
- Consumes: `$utilities` (Sass map, built by `../bootstrap-5.3.8/scss/utilities` — the file that must be imported immediately before `_utilities-trim.scss`), `$spacers` (Sass map, built by `../bootstrap-5.3.8/scss/variables`, already imported by the time this partial runs).
- Produces: a reassigned `$utilities` map containing only the 11 keys the site uses (`display`, `justify-content`, `align-items`, `margin-top`, `margin-end`, `margin-bottom`, `margin-x`, `margin-y`, `padding`, `text-align`, `color`), each restricted to only its in-use values. This is consumed by `../bootstrap-5.3.8/scss/utilities/api`, which must be imported immediately *after* `_utilities-trim.scss`.

- [ ] **Step 1: Create the trim partial**

Create `themes/portio/assets/scss/_utilities-trim.scss`:

```scss
//
// Trims Bootstrap's default $utilities map (built by the "utilities" partial,
// imported just before this file) down to only the utility categories and
// values this site's templates/data actually use. Full audit:
// docs/superpowers/specs/2026-07-02-css-purge-unused-utilities-design.md
//
// If a future template needs a Bootstrap utility class not covered by the
// "values" list below (e.g. a new `mt-3` or `bg-primary`), it will resolve
// to no CSS at all — silently, not a build error. Add the missing key/value
// here rather than assuming a stock Bootstrap utility class will work.

$utilities: map-remove(
  $utilities,
  "align", "float", "object-fit", "opacity", "overflow", "overflow-x", "overflow-y",
  "shadow", "focus-ring", "position", "top", "bottom", "start", "end", "translate-middle",
  "border", "border-top", "border-end", "border-bottom", "border-start", "border-color",
  "subtle-border-color", "border-width", "border-opacity",
  "width", "max-width", "viewport-width", "min-viewport-width",
  "height", "max-height", "viewport-height", "min-viewport-height",
  "flex", "flex-direction", "flex-grow", "flex-shrink", "flex-wrap",
  "align-content", "align-self", "order",
  "margin", "margin-start",
  "negative-margin", "negative-margin-x", "negative-margin-y",
  "negative-margin-top", "negative-margin-end", "negative-margin-bottom", "negative-margin-start",
  "padding-x", "padding-y", "padding-top", "padding-end", "padding-bottom", "padding-start",
  "gap", "row-gap", "column-gap",
  "font-family", "font-size", "font-style", "font-weight", "line-height",
  "text-decoration", "text-transform", "white-space", "word-wrap",
  "text-opacity", "text-color",
  "link-opacity", "link-offset", "link-underline", "link-underline-opacity",
  "background-color", "bg-opacity", "subtle-background-color", "gradient",
  "user-select", "pointer-events",
  "rounded", "rounded-top", "rounded-end", "rounded-bottom", "rounded-start",
  "visibility", "z-index"
);

$utilities: map-merge($utilities, (
  "display": map-merge(map-get($utilities, "display"), (
    responsive: false,
    values: inline-block flex,
  )),
  "justify-content": map-merge(map-get($utilities, "justify-content"), (
    responsive: false,
    values: (
      center: center,
      between: space-between,
    ),
  )),
  "align-items": map-merge(map-get($utilities, "align-items"), (
    responsive: false,
    values: (
      center: center,
    ),
  )),
  "margin-top": map-merge(map-get($utilities, "margin-top"), (
    responsive: false,
    values: (5: map-get($spacers, 5)),
  )),
  "margin-end": map-merge(map-get($utilities, "margin-end"), (
    responsive: false,
    values: (3: map-get($spacers, 3)),
  )),
  "margin-bottom": map-merge(map-get($utilities, "margin-bottom"), (
    responsive: false,
    values: (5: map-get($spacers, 5)),
  )),
  "margin-x": map-merge(map-get($utilities, "margin-x"), (
    responsive: false,
    values: (
      2: map-get($spacers, 2),
      auto: auto,
    ),
  )),
  "margin-y": map-merge(map-get($utilities, "margin-y"), (
    responsive: false,
    values: (0: map-get($spacers, 0)),
  )),
  "padding": map-merge(map-get($utilities, "padding"), (
    responsive: false,
    values: (2: map-get($spacers, 2)),
  )),
  "text-align": map-merge(map-get($utilities, "text-align"), (
    values: (center: center),
  )),
  "color": map-merge(map-get($utilities, "color"), (
    values: (dark: map-get(map-get(map-get($utilities, "color"), "values"), "dark")),
  )),
));
```

The `"color"` entry above uses three nested `map-get`s: get the `"color"` utility definition, get its `"values"` sub-map, get the `"dark"` entry from that — this reuses Bootstrap's own generated `text-dark` color expression instead of hand-guessing it, so the exact same CSS variable/opacity behavior is preserved.

- [ ] **Step 2: Wire the new partial into `style.scss`**

In `themes/portio/assets/scss/style.scss`, the current import block (lines 11-29) reads:

```scss
@import "../bootstrap-5.3.8/scss/functions";
@import "../bootstrap-5.3.8/scss/variables";
@import "../bootstrap-5.3.8/scss/variables-dark";
@import "../bootstrap-5.3.8/scss/maps";
@import "../bootstrap-5.3.8/scss/mixins";
@import "../bootstrap-5.3.8/scss/utilities";
@import "../bootstrap-5.3.8/scss/root";
@import "../bootstrap-5.3.8/scss/reboot";
@import "../bootstrap-5.3.8/scss/type";
@import "../bootstrap-5.3.8/scss/containers";
@import "../bootstrap-5.3.8/scss/grid";
@import "../bootstrap-5.3.8/scss/forms";
@import "../bootstrap-5.3.8/scss/buttons";
@import "../bootstrap-5.3.8/scss/transitions";
@import "../bootstrap-5.3.8/scss/nav";
@import "../bootstrap-5.3.8/scss/navbar";
@import "../bootstrap-5.3.8/scss/breadcrumb";
@import "../bootstrap-5.3.8/scss/pagination";
@import "../bootstrap-5.3.8/scss/utilities/api";
```

Replace it with:

```scss
@import "../bootstrap-5.3.8/scss/functions";
@import "../bootstrap-5.3.8/scss/variables";
@import "../bootstrap-5.3.8/scss/variables-dark";
@import "../bootstrap-5.3.8/scss/maps";
@import "../bootstrap-5.3.8/scss/mixins";
@import "../bootstrap-5.3.8/scss/utilities";
@import "utilities-trim";
@import "../bootstrap-5.3.8/scss/root";
@import "../bootstrap-5.3.8/scss/reboot";
@import "../bootstrap-5.3.8/scss/type";
@import "../bootstrap-5.3.8/scss/containers";
@import "../bootstrap-5.3.8/scss/grid";
@import "../bootstrap-5.3.8/scss/buttons";
@import "../bootstrap-5.3.8/scss/transitions";
@import "../bootstrap-5.3.8/scss/nav";
@import "../bootstrap-5.3.8/scss/navbar";
@import "../bootstrap-5.3.8/scss/breadcrumb";
@import "../bootstrap-5.3.8/scss/utilities/api";
```

(This removes the `forms` and `pagination` imports and inserts `utilities-trim` between `utilities` and `utilities/api`.)

- [ ] **Step 3: Build and confirm no Sass errors**

Run: `rm -rf public resources/_gen .hugo_build.lock && hugo`
Expected: build completes with no new errors (same two pre-existing deprecation warnings as before). If you see a Sass error mentioning `map-get` or `null`, it means a key name in the trim list doesn't match `_utilities.scss` exactly — check spelling/quoting against `themes/portio/assets/bootstrap-5.3.8/scss/_utilities.scss`.

- [ ] **Step 4: Commit**

```bash
git add themes/portio/assets/scss/_utilities-trim.scss themes/portio/assets/scss/style.scss
git commit -m "Trim Bootstrap utilities to only the categories this site uses"
```

---

### Task 3: Verify no visual regression via class-usage audit

**Files:**
- None modified — this task only runs verification and reports results. If it finds a gap, fix it by adding the missing key/value to `_utilities-trim.scss` from Task 2 before proceeding.

**Interfaces:**
- Consumes: the built `public/**/*.html` and `public/scss/*.css` from Task 2's build.

- [ ] **Step 1: Run the class-usage audit script**

Save this as a temporary script (anywhere outside the repo, e.g. `/tmp/css_audit.py`) and run it from the repo root:

```python
import re, glob

used = set()
for path in glob.glob("public/**/*.html", recursive=True):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    for m in re.finditer(r'class="([^"]*)"', html):
        used.update(m.group(1).split())

css_path = glob.glob("public/scss/*.css")[0]
with open(css_path, encoding="utf-8") as f:
    css = f.read()

defined = set()
for m in re.finditer(r'\.([a-zA-Z0-9_-]+)(?=[:,\s.>+~){\[]|$)', css):
    defined.add(m.group(1))

missing = used - defined
print("CSS file:", css_path)
import os
print("CSS size (bytes):", os.path.getsize(css_path))
print("Classes used in HTML:", len(used))
print("Classes defined in CSS:", len(defined))
print("Used classes MISSING from CSS (should be empty):", sorted(missing))
print("Percent of defined classes unused: {:.1f}%".format(
    100 * len(defined - used) / len(defined)
))
```

Run: `python3 /tmp/css_audit.py`

Expected:
- `Used classes MISSING from CSS` prints as an empty list `[]`. If it's non-empty, each name listed is a class the templates rely on that the trim removed — add it back to the appropriate `values` map in `_utilities-trim.scss` (Task 2) and rebuild.
- `CSS size (bytes)` is meaningfully smaller than the pre-change baseline of 167,678 bytes.
- `Percent of defined classes unused` is well below the pre-change baseline of 93.8%.

- [ ] **Step 2: Grep for the CSS-context auto-escaper failure mode**

Run: `grep -r "ZgotmplZ" public/ || echo "clean"`
Expected: `clean` (per the existing CLAUDE.md gotcha about Go's `html/template` CSS-context escaper — this change doesn't touch dynamic inline styles, but it's a cheap, fast sanity check).

- [ ] **Step 3: Manual visual check**

Run: `hugo server -D` and check in a browser:
- Homepage: hero, about, resume, testimonials, and footer sections all render with correct spacing/alignment (no missing margins/padding, flex layouts intact).
- A single blog post page renders correctly.
- Resize to mobile width and confirm the navbar collapse toggle (hamburger) still opens/closes the nav — this exercises Bootstrap's JS-driven `.collapsing`/`.show` classes, which aren't utility classes and are unaffected by this change, but are worth a quick confirmation since they're adjacent (`transitions.scss` import wasn't touched).

Expected: no visual regressions on any of the above.

---

### Task 4: Document the trimmed-utilities gotcha in CLAUDE.md

**Files:**
- Modify: `/Users/rod/build/begbie-hugo/CLAUDE.md` (add to the `## Gotchas` section)

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Add the gotcha**

Add this entry to the `## Gotchas` section of `CLAUDE.md` (alphabetical/thematic placement isn't enforced in this file — append near the other SCSS-related gotchas, e.g. after the "SVG `<stop>` elements" or "auto-escaper" entries):

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Document trimmed Bootstrap utilities in CLAUDE.md gotchas"
```
