# Asset Pipeline Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bundle the four vanilla JS modules into one fingerprinted,
deferred file; fingerprint the existing CSS output; and fix a font-
loading FOUC by hoisting the Google Fonts request out of a Sass
`@import` into preconnected `<link>` tags.

**Architecture:** Three independent changes to `head.html`/`footer.html`
(plus one line removed from `_variables.scss`), each using long-stable
Hugo Pipes functions (`resources.Concat`, `fingerprint`,
`.Data.Integrity`). No new files, no new dependencies.

**Tech Stack:** Hugo Pipes (`resources.Get`, `resources.Concat`,
`css.Sass`, `minify`, `fingerprint`), plain HTML `<link>`/`<script>`
attributes.

## Global Constraints

- No test suite exists (per `CLAUDE.md`) — verification is `hugo` build +
  browser checks, exactly as Phases 1 and 2 did.
- Cloudflare Pages pins Hugo 0.157.0 (`wrangler.jsonc`'s `HUGO_VERSION`);
  local dev uses a newer version. Every task must be verified on the
  actual Cloudflare Pages preview deploy for this branch, not only via
  local `hugo server` — Phase 2 shipped a real bug (`Permalink` producing
  production-anchored absolute URLs) that only appeared on the preview
  deploy, never locally. The PR's preview URL is commented on the PR by
  Cloudflare's bot once the branch is pushed.
- Every asset reference must use `.RelPermalink`, never `.Permalink`, for
  the same reason — `.Permalink` bakes in `site.BaseURL`
  (`https://coaching.begbie.com/`), which points at production instead of
  whatever domain is actually serving the current build.
- No change to the behavior of any of the four JS modules or to the
  CSS's visual output — this phase only changes packaging/delivery.
- Every task ends with `hugo` building cleanly and zero JS console errors
  (an SRI `integrity` mismatch shows up as a blocked resource load in the
  console, so this check also validates the fingerprint/integrity wiring
  is correct).

---

### Task 1: Bundle the four JS modules into one fingerprinted, deferred file

**Files:**

- Modify: `themes/portio/layouts/partials/footer.html`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: nothing later tasks depend on (Tasks 2 and 3 only touch
  `head.html`/`_variables.scss`).

- [ ] **Step 1: Replace the four individual script tags with one bundle**

In `themes/portio/layouts/partials/footer.html`, replace:

```html
{{ $navbarjs := resources.Get "js/navbar.js" | minify }}
<script src="{{ $navbarjs.RelPermalink }}"></script>
{{ $testimonialjs := resources.Get "js/testimonial-carousel.js" | minify }}
<script src="{{ $testimonialjs.RelPermalink }}"></script>
{{ $videopopupjs := resources.Get "js/video-popup.js" | minify }}
<script src="{{ $videopopupjs.RelPermalink }}"></script>
{{ $formhandler := resources.Get "js/form-handler.js" | minify }}
<script src="{{ $formhandler.RelPermalink }}"></script>
```

with:

```html
{{ $navbarjs := resources.Get "js/navbar.js" }}
{{ $testimonialjs := resources.Get "js/testimonial-carousel.js" }}
{{ $videopopupjs := resources.Get "js/video-popup.js" }}
{{ $formhandler := resources.Get "js/form-handler.js" }}
{{ $bundle := slice $navbarjs $testimonialjs $videopopupjs $formhandler
  | resources.Concat "js/bundle.js" | minify | fingerprint }}
<script defer src="{{ $bundle.RelPermalink }}"
  integrity="{{ $bundle.Data.Integrity }}" crossorigin="anonymous"></script>
```

Note the four `resources.Get` calls no longer pipe through `minify`
individually — `minify` now runs once on the concatenated bundle instead
of four times on the individual files, which is both simpler and avoids
redundant work. The bundle preserves the original load order (navbar,
testimonial-carousel, video-popup, form-handler) exactly as the four
separate tags did.

- [ ] **Step 2: Build and verify the bundle**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public && hugo --quiet
ls public/js/
```

Expected: exactly one file matching `bundle.*.min.js` (a content hash in
the filename, e.g. `bundle.a1b2c3d4.min.js`) — no `navbar.min.js`,
`testimonial-carousel.min.js`, `video-popup.min.js`, or
`form-handler.min.js` files present individually.

- [ ] **Step 3: Confirm the fingerprint changes when content changes**

```bash
echo "// touch" >> themes/portio/assets/js/navbar.js
rm -rf public && hugo --quiet
ls public/js/
git diff themes/portio/assets/js/navbar.js
git checkout themes/portio/assets/js/navbar.js
rm -rf public && hugo --quiet
```

Expected: the filename's hash differs between the two builds (proving
the fingerprint is content-derived, not a fixed string), and the final
`hugo --quiet` after `git checkout` restores the original bundle hash
since the source is back to its original content.

- [ ] **Step 4: Browser verification**

Push this commit and use the `superpowers-chrome:browsing` skill against
the Cloudflare Pages preview URL for this branch (check the PR's
Cloudflare bot comment for the URL). On the home page:

- Confirm exactly one `<script>` tag references `js/bundle.*.min.js`,
  with both `defer` and `integrity` attributes present
  (`{action: "eval", payload: "Array.from(document.querySelectorAll('script[src*=bundle]')).map(s => ({src: s.src, defer: s.defer, integrity: s.integrity}))"}`).
- Re-verify all four behaviors Phase 2 built now that they're loaded from
  one bundled file: the mobile hamburger menu opens/closes, the
  testimonial carousel shows 2 items desktop/1 mobile with working dots
  and autoplay, the hero video popup opens/closes, and the contact form
  still submits successfully.
- Check the console for zero errors (an SRI mismatch would show as a
  blocked script load with an integrity-related error message).

- [ ] **Step 5: Commit**

```bash
git add themes/portio/layouts/partials/footer.html
git commit -m "Bundle JS modules into one fingerprinted, deferred file"
```

---

### Task 2: Fingerprint the CSS output

**Files:**

- Modify: `themes/portio/layouts/partials/head.html`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: the exact `head.html` line range Task 3 will further modify
  (Task 3's brief includes the post-Task-2 content as its starting
  point).

- [ ] **Step 1: Add fingerprinting and SRI to the stylesheet link**

In `themes/portio/layouts/partials/head.html`, replace:

```html
  {{ "<!-- Stylesheets -->" | safeHTML }}
  {{ $style := resources.Get "scss/style.scss" | css.Sass | minify }}
  <link href="{{ $style.RelPermalink }}" rel="stylesheet" />
```

with:

```html
  {{ "<!-- Stylesheets -->" | safeHTML }}
  {{ $style := resources.Get "scss/style.scss" | css.Sass | minify | fingerprint }}
  <link href="{{ $style.RelPermalink }}" rel="stylesheet"
    integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous" />
```

- [ ] **Step 2: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public && hugo --quiet
ls public/scss/
```

Expected: exactly one file matching `style.*.min.css` (content hash in
the filename), no plain `style.min.css`.

- [ ] **Step 3: Confirm the fingerprint changes when content changes**

```bash
echo "// touch" >> themes/portio/assets/scss/_common.scss
rm -rf public && hugo --quiet
ls public/scss/
git checkout themes/portio/assets/scss/_common.scss
rm -rf public && hugo --quiet
```

Expected: the filename's hash differs between the two builds, confirming
it's content-derived.

- [ ] **Step 4: Browser verification**

Push this commit and use the `superpowers-chrome:browsing` skill against
the Cloudflare Pages preview URL for this branch. On the home page,
contact page, and a blog page:

- Confirm the `<link rel="stylesheet">` references `scss/style.*.min.css`
  and has an `integrity` attribute
  (`{action: "eval", payload: "document.querySelector('link[rel=stylesheet]').outerHTML"}`).
- Confirm the page still renders with correct styling (colors, layout,
  fonts) — an SRI mismatch would cause the browser to refuse the
  stylesheet entirely, which would be immediately visually obvious (an
  unstyled page).
- Check the console for zero errors.

- [ ] **Step 5: Commit**

```bash
git add themes/portio/layouts/partials/head.html
git commit -m "Fingerprint the compiled CSS output"
```

---

### Task 3: Fix Google Fonts loading (preconnect + hoist out of the Sass @import)

**Files:**

- Modify: `themes/portio/layouts/partials/head.html`
- Modify: `themes/portio/assets/scss/_variables.scss`

**Interfaces:**

- Consumes: `head.html`'s state after Task 2 (the stylesheet `<link>`
  now has `| fingerprint` and an `integrity` attribute — this task adds
  new lines immediately before that block, it doesn't touch the
  stylesheet link itself).
- Produces: nothing later tasks depend on (this is the last task).

- [ ] **Step 1: Remove the font @import from the Sass source**

In `themes/portio/assets/scss/_variables.scss`, replace:

```scss
// Fonts
@import url("https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900|Yeseva+One&display=swap");
$font-family-base: "Poppins", sans-serif;
```

with:

```scss
// Fonts
$font-family-base: "Poppins", sans-serif;
```

(`$font-family-base` and `$headings-font-family` — the actual
`font-family` values used throughout the theme's SCSS — are untouched;
only the line that fetched the font *files* is removed.)

- [ ] **Step 2: Add preconnect + font stylesheet link to head.html**

In `themes/portio/layouts/partials/head.html`, replace:

```html
  {{ "<!-- Stylesheets -->" | safeHTML }}
  {{ $style := resources.Get "scss/style.scss" | css.Sass | minify | fingerprint }}
  <link href="{{ $style.RelPermalink }}" rel="stylesheet"
    integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous" />
```

with:

```html
  {{ "<!-- Fonts -->" | safeHTML }}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900|Yeseva+One&display=swap">

  {{ "<!-- Stylesheets -->" | safeHTML }}
  {{ $style := resources.Get "scss/style.scss" | css.Sass | minify | fingerprint }}
  <link href="{{ $style.RelPermalink }}" rel="stylesheet"
    integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous" />
```

- [ ] **Step 3: Build and verify the @import is gone from the compiled CSS**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public && hugo --quiet
grep -o "fonts.googleapis.com[^)]*" public/scss/style.*.min.css || echo "no font @import in compiled CSS, as expected"
grep -o '<link rel=preconnect[^>]*>\|<link rel=stylesheet href=https://fonts[^>]*>' public/index.html
```

Expected: the first command finds nothing in the compiled CSS (the
`@import` is gone from the Sass source, so it can't appear in the
output); the second command shows both `preconnect` links and the font
stylesheet `<link>` present directly in the HTML `<head>`.

- [ ] **Step 4: Browser verification**

Push this commit and use the `superpowers-chrome:browsing` skill against
the Cloudflare Pages preview URL for this branch. On the home page:

- Confirm the page still renders with the correct fonts (Poppins body
  text, Yeseva One headings) — not a fallback font. Take a full-page
  screenshot and visually compare against a pre-Phase-3 screenshot if
  one is available, or simply confirm the heading font looks like a
  serif/display face (Yeseva One) rather than a generic system serif.
- Open the browser's network panel (or use `{action: "eval", payload:
  "performance.getEntriesByType('resource').filter(r => r.name.includes('fonts.g')).map(r => ({name: r.name, startTime: r.startTime}))"}`)
  and confirm the Google Fonts stylesheet request's `startTime` is close
  to the main stylesheet's `startTime` (starting in parallel), not
  waiting until after the main stylesheet's `responseEnd` (which would
  indicate the old @import-based waterfall is still happening somehow).
- Check the console for zero errors.

- [ ] **Step 5: Commit**

```bash
git add themes/portio/layouts/partials/head.html themes/portio/assets/scss/_variables.scss
git commit -m "Preconnect and hoist Google Fonts out of the Sass @import"
```
