# Homepage Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the Claude Design homepage redesign (teal accent,
Bricolage Grotesque/Instrument Sans typography, token-driven components,
3-card testimonial/writing grids, restyled hero/about/experience/contact)
as Hugo templates/partials in the `portio` theme, replacing the current
dated Poppins/Yeseva One look — in place, on this branch, as one PR.

**Architecture:** A design-tokens task lands first (`_tokens.scss`, new
fonts) so every later task can consume `var(--accent)` etc. instead of
hardcoding values. Sections are then restyled one at a time, each as an
independent, individually-buildable commit: Nav → Hero → About →
Experience → Testimonials → Writing → Contact/Footer. **Responsive
behavior is folded into each section's own task (2–8) rather than a
separate task 9** — every component SCSS file already organizes its
rules under this theme's `@include desktop/tablet/mobile` breakpoint
mixins (`_mixins.scss`: `desktop` = `max-width:991px`, `tablet` =
`max-width:767px`, `mobile` = `max-width:575px`), so adding a
breakpoint's rules to a file that's already open for that section's
restyle avoids re-touching and re-verifying an already-committed file.
Task 9 is instead a dedicated **responsive QA pass**: no new component
code, just a cross-section browser walkthrough at the three breakpoints
verifying what tasks 2–8 already shipped. Task 10 is final full-site
verification (cache-cleared build, every real link, JSON-LD check) per
this repo's established closing pattern.

The one new shared animation primitive — the wrapper-level drift/rotate
motion behind the hero/about/writing blobs — is added to the *existing*
`themes/portio/assets/scss/components/_blob.scss` (which already defines
the `blob-morph` keyframe + `.blob` class used on the hero's inline SVG
`<path>`) rather than a second file, so there is exactly one blob
technique in the codebase, matching this repo's existing pattern and the
spec's explicit instruction not to introduce the design handoff's
CSS-border-radius blob alternative.

**Tech Stack:** Hugo Pipes (`css.Sass`), this repo's vendored Bootstrap
5.3.8 SCSS (already upgraded — no Bootstrap changes in this plan), Google
Fonts CDN, no test suite (verification is `hugo` build + `hugo server`
+ manual browser check).

## Global Constraints

- **Accent color is final and non-negotiable:** `#0E8A8F` (teal). Every
  task that touches color must reference `var(--accent)` (or a token
  derived from it), never a new hardcoded hex.
- **No test suite exists in this repo** (per `CLAUDE.md`) — verification
  is `hugo`/`hugo server -D` + manual browser check, every task.
- **Fonts load via Google Fonts CDN `<link>`** in `head.html` — this was
  an explicit, already-settled decision in the design spec (matching how
  the theme already loads Poppins/Yeseva One today). Do not self-host
  fonts or introduce a build step for them.
- **One branch, one PR, in-place edits.** No `-v2`/`-new` parallel files.
  Every task edits the real file that ships.
- **Bootstrap grid classes stay in use for structure** (`row`,
  `col-lg-*`, `col-md-*`) — this repo's `CLAUDE.md` documents that
  `.row > *` is full-width by default below a column's own breakpoint
  class (Bootstrap 5.2+ behavior), which is exactly what this plan relies
  on for the 4-up→2-up→1-up and 3-up→1-up grid collapses. Do not add
  extra `.col-12` classes to "fix" this — it already works.
- **Exactly one blob animation system**: the SVG `<path class="blob">` +
  `blob-morph` keyframe already in
  `themes/portio/assets/scss/components/_blob.scss`. Task 1 extends that
  same file with a second, complementary keyframe (`blob-drift`, for the
  wrapper's slow drift/rotate) — it does not create a new file or a
  CSS-`border-radius`-based blob.
- **This theme's breakpoint mixins are inverted-sounding — read
  carefully:** `@include desktop { }` in `_mixins.scss` means "at
  `max-width: 991px` and below" (i.e. *below* desktop, matching
  Bootstrap's `lg` breakpoint), `@include tablet { }` means
  `max-width: 767px` (matching `md`), `@include mobile { }` means
  `max-width: 575px` (matching `sm`). Every responsive rule in this plan
  uses these three mixins and no others.

---

### Task 1: Design tokens & typography

**Files:**

- Create: `themes/portio/assets/scss/_tokens.scss`
- Modify: `themes/portio/assets/scss/style.scss`
- Modify: `themes/portio/assets/scss/_variables.scss`
- Modify: `themes/portio/assets/scss/_common.scss`
- Modify: `themes/portio/assets/scss/components/_blob.scss`
- Modify: `themes/portio/layouts/partials/head.html`

**Interfaces:**

- Consumes: nothing from other tasks (this is the foundation task).
- Produces (consumed by Tasks 2–8):
  - CSS custom properties: `--bg`, `--bgAlt`, `--ink`, `--inkSoft`,
    `--accent`, `--accentSoft`, `--accentInk`, `--line`.
  - Sass variables: `$content-max-width`, `$content-padding-x`,
    `$section-padding-y`, `$radius-pill`, `$radius-card`,
    `$radius-card-lg`, `$radius-image`, `$radius-hero-image`,
    `$radius-about-image`, `$font-display`, `$font-body`, `$font-mono`,
    `$fs-hero`, `$fs-h2`, `$fs-h2-section`, `$fs-h3`, `$fs-lead`,
    `$fs-body`, `$fs-small`, `$fs-mono-label`.
  - A global `.container` override (1280px max-width, 40px horizontal
    padding) applied automatically to every section — every homepage
    partial already wraps its content in Bootstrap's `.container`, so no
    template touches this again.
  - A global `body` rule (`background: var(--bg); color: var(--ink);`)
    so the whole page — not just restyled sections — sits on the new
    palette from this task onward.
  - `blob-drift` keyframe + `.blob-wrap` class in `_blob.scss`, applied
    by Tasks 3, 4, and 7 to the wrapper `<div>` around each section's
    decorative blob SVG (the existing `.blob`/`blob-morph` keyframe
    stays on the inner `<path>` unchanged — the two animations combine,
    matching the design spec's "blobMove + blobMorph" description).

- [ ] **Step 1: Create the tokens file**

Create `themes/portio/assets/scss/_tokens.scss`:

```scss
/*!------------------------------------------------------------------
[DESIGN TOKENS — 2026-07 homepage redesign]

Colors are CSS custom properties (needed so `--accentSoft` can be
derived from `--accent` at paint time via `color-mix()`, instead of
hardcoded and going stale if the accent ever changes again). Layout,
radius, and type-scale values are plain Sass variables, consumed
directly by component partials at build time.
-------------------------------------------------------------------*/

:root {
  --bg: oklch(96.5% 0.006 250);
  --bgAlt: oklch(92% 0.015 250);
  --ink: oklch(23% 0.02 260);
  --inkSoft: oklch(46% 0.025 260);
  --accent: #0e8a8f;
  // Derived from --accent, not hardcoded -- this is the fix for the
  // design handoff's flagged bug (accentSoft was authored against an
  // earlier violet accent and never re-derived when it changed to teal).
  --accentSoft: color-mix(in oklch, var(--accent) 12%, white);
  --accentInk: oklch(99% 0.006 290);
  --line: oklch(0% 0 0 / 0.08);
}

// Layout
$content-max-width: 1280px;
$content-padding-x: 40px;
$section-padding-y: 70px;

// Radius
$radius-pill: 999px;
$radius-card: 20px;
$radius-card-lg: 24px;
$radius-image: 16px;
$radius-hero-image: 24px;
$radius-about-image: 20px;

// Fonts
$font-display: "Bricolage Grotesque", sans-serif;
$font-body: "Instrument Sans", sans-serif;
$font-mono: ui-monospace, Menlo, monospace;

// Type scale
$fs-hero: min(6vw, 74px);
$fs-h2: 38px;
$fs-h2-section: 34px;
$fs-h3: 26px;
$fs-lead: 19px;
$fs-body: 17px;
$fs-small: 14px;
$fs-mono-label: 12px;
```

- [ ] **Step 2: Import tokens before Bootstrap in `style.scss`**

In `themes/portio/assets/scss/style.scss`, replace:

```scss
@import "variables";

@import "../bootstrap-5.3.8/scss/functions";
```

with:

```scss
@import "variables";

@import "tokens";

@import "../bootstrap-5.3.8/scss/functions";
```

- [ ] **Step 3: Point the theme's base font variables at the new fonts**

In `themes/portio/assets/scss/_variables.scss`, replace:

```scss
// Fonts
$font-family-base: "Poppins", sans-serif;
$headings-font-family: "Yeseva One", cursive;
```

with:

```scss
// Fonts
$font-family-base: "Instrument Sans", sans-serif;
$headings-font-family: "Bricolage Grotesque", sans-serif;
```

This is a site-wide change (blog list/single pages included), which is
correct here: `head.html`'s font `<link>` (Step 6) removes Poppins/Yeseva
One from the page entirely, so leaving these variables pointed at the
old names would silently fall back to the browser's default serif/
sans-serif — not a real "old look preserved" option.

- [ ] **Step 4: Add the global container and body rules**

In `themes/portio/assets/scss/_common.scss`, append to the end of the
file (this file is imported after Bootstrap's `grid.scss`, so this
`.container` override correctly wins the cascade over Bootstrap's own
`.container` rule at equal specificity):

```scss

body {
  background: var(--bg);
  color: var(--ink);
}

// Every homepage section wraps its content in Bootstrap's `.container`;
// overriding it once here gives every section the design's 1280px/40px
// content measure without any template markup changes. Safe on narrow
// viewports: `max-width` only caps rendering above 1280px, `width: 100%`
// (from Bootstrap's own rule) still governs everything narrower.
.container {
  max-width: $content-max-width;
  padding-left: $content-padding-x;
  padding-right: $content-padding-x;
}
```

- [ ] **Step 5: Add the shared blob-drift animation to `_blob.scss`**

In `themes/portio/assets/scss/components/_blob.scss`, the file currently
ends with:

```scss
.blob {
  animation: blob-morph 12s ease-in-out infinite alternate;
}
```

Append after that block:

```scss

// Wrapper-level drift/rotate motion, layered on top of the `.blob`
// path's own shape-morph animation above. Applied to the positioning
// `<div>` that wraps each section's blob SVG (the inner `<path
// class="blob">` keeps using blob-morph unchanged) -- this is the same
// blob technique, just its second animation layer, not a new system.
@keyframes blob-drift {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-3%, 3%) rotate(4deg);
  }
}

.blob-wrap {
  animation: blob-drift 16s ease-in-out infinite;
}
```

- [ ] **Step 6: Swap the font `<link>` in `head.html`**

In `themes/portio/layouts/partials/head.html`, replace:

```html
  {{ "<!-- Fonts -->" | safeHTML }}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900|Yeseva+One&display=swap">
```

with:

```html
  {{ "<!-- Fonts -->" | safeHTML }}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400..700&display=swap">
```

- [ ] **Step 7: Build and verify the tokens compiled**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
grep -c -- "--accent:#0e8a8f" public/scss/style.min.*.css
grep -c "color-mix(in oklch" public/scss/style.min.*.css
grep -c "Bricolage" public/index.html
```

Expected: build succeeds with no Sass errors; both `grep -c` calls
against the compiled CSS report at least 1 match (confirms the `:root`
block and the `color-mix()` derivation both survived minification); the
`Bricolage` grep against `public/index.html` reports at least 1 (the new
font `<link>` is present).

- [ ] **Step 8: Commit**

```bash
git add themes/portio/assets/scss/_tokens.scss \
  themes/portio/assets/scss/style.scss \
  themes/portio/assets/scss/_variables.scss \
  themes/portio/assets/scss/_common.scss \
  themes/portio/assets/scss/components/_blob.scss \
  themes/portio/layouts/partials/head.html
git commit -m "Add homepage redesign design tokens and swap in Bricolage Grotesque/Instrument Sans"
```

---

### Task 2: Nav restyle

**Files:**

- Modify: `themes/portio/assets/scss/components/_navbar.scss`

**Interfaces:**

- Consumes: tokens from Task 1 (`var(--accent)`, `var(--accentInk)`,
  `var(--ink)`, `var(--bg)`, `$radius-pill`, `$font-display`,
  `$font-body`).
- Produces: nothing later tasks depend on. `navbar.html` markup is
  untouched — the existing `.hire_button` class on the "Work With Me"
  pill (`themes/portio/layouts/partials/navbar.html:23`) is reused
  as-is.

- [ ] **Step 1: Replace `_navbar.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_navbar.scss` with:

```scss
.navbar {
    padding: 26px 0;
    background: transparent;
    transition: all 0.3s ease;
    @include desktop {
        background: var(--bg);
    }
    @include desktop {
        padding: 15px 20px;
        margin: 10px 10px 0;
        border-radius: 5px;
    }
    .navbar-brand {
        font-family: $font-display;
        font-weight: 700;
        font-size: 20px;
        letter-spacing: -0.01em;
        color: var(--ink);
        img {
            @include desktop {
                width: 80%;
            }
        }
    }
    .nav-link {
        font-family: $font-body;
        font-weight: 500;
        font-size: 14px;
        opacity: 0.75;
        &:hover {
            opacity: 1;
        }
    }
    .hire_button {
        border-radius: $radius-pill;
        padding: 11px 22px;
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accentInk);
        font-family: $font-body;
        font-weight: 600;
        font-size: 14px;
        &:hover {
            background: var(--accent);
            border-color: var(--accent);
            color: var(--accentInk);
            opacity: 0.9;
        }
    }
    &.nav__color__change {
        background: var(--bg);
        padding: 20px 0;
        box-shadow: 0px 10px 20px 0px rgba(50, 65, 141, 0.1);
        @include desktop {
            padding: 15px 20px;
        }
    }
    @include desktop {
        .navbar-toggler {
            outline: 0;
            padding: 0;
            &-icon {
                height: 2px;
                width: 25px;
                transition: all 0.2s;
                background: var(--ink);
                display: block;
                &:not(:last-child) {
                    margin-bottom: 5px;
                }
                &:nth-child(1) {
                    transform: rotate(45deg);
                    transform-origin: 10% 10%;
                }
                &:nth-child(2) {
                    opacity: 0;
                    filter: alpha(opacity=0);
                }
                &:nth-child(3) {
                    transform: rotate(-45deg);
                    transform-origin: 10% 90%;
                }
            }
            &.collapsed {
                .navbar-toggler-icon {
                    &:nth-child(1) {
                        transform: rotate(0);
                    }
                    &:nth-child(2) {
                        opacity: 1;
                        filter: alpha(opacity=1);
                    }
                    &:nth-child(3) {
                        transform: rotate(0);
                    }
                }
            }
        }
    }
}
```

Only the values changed from the current file: vertical padding
`40px 0` → `26px 0` (horizontal padding now comes from Task 1's global
`.container` override at 40px), `background: $white`/`#000`-derived
colors → `var(--bg)`/`var(--ink)`, and the four new rules for
`.navbar-brand`, `.nav-link`, `.hire_button` (font/color/pill styling —
none of these selectors existed in the file before). The
`@include desktop { }` mobile-collapse structure (hamburger icon
rotation, background swap for the collapsed menu) is untouched, so the
existing JS-driven collapse behavior keeps working unmodified.

- [ ] **Step 2: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
grep -c "0e8a8f" public/scss/style.min.*.css
```

Expected: build succeeds; grep reports at least 1 (nav pill picked up
the accent color).

- [ ] **Step 3: Dev-server visual check**

```bash
hugo server -D
```

Open `http://localhost:1313/`, confirm: nav sits transparent over the
hero on load, logo reads in Bricolage Grotesque, "Work With Me" is a
teal pill, and resizing the browser below ~992px still shows/toggles the
hamburger menu correctly (unchanged JS behavior).

- [ ] **Step 4: Commit**

```bash
git add themes/portio/assets/scss/components/_navbar.scss
git commit -m "Restyle nav with design tokens: teal pill CTA, Bricolage Grotesque logo"
```

---

### Task 3: Hero restyle

**Files:**

- Modify: `data/hero.yml`
- Modify: `themes/portio/layouts/partials/hero.html`
- Modify: `themes/portio/assets/scss/components/_hero-section.scss`

**Interfaces:**

- Consumes: tokens from Task 1; `.blob`/`blob-morph` (pre-existing) and
  `.blob-wrap`/`blob-drift` (Task 1) for the photo's background blob;
  the existing `video-popup.js` contract, which does
  `document.querySelector(".popup-button")` then reads that element's
  `href` attribute — the new video badge markup keeps the exact class
  name `popup-button` on the clickable element so this JS keeps working
  unmodified.
- Produces: `heroFadeUp` keyframe (local to this file, hero-only — not
  reused elsewhere, so it stays here rather than in the shared tokens
  file). New `hero.yml` fields `eyebrow`, `headlinePrefix`,
  `headlineAccent`, `headlineSuffix`, `subhead`, `button2Name`,
  `button2URL`, `videoLabel` — consumed only by `hero.html` in this same
  task.

- [ ] **Step 1: Restructure `hero.yml`'s content fields**

Replace the entire contents of `data/hero.yml` with:

```yaml
---
enable: true
eyebrow: Software Engineering Leadership Coach
headlinePrefix: Level up your
headlineAccent: engineering
headlineSuffix: leadership.
subhead: >
  Providing coaching and mentorship to engineering leaders – from senior software engineers looking to level-up their scope of impact, to startup CTOs facing the challenges of scaling their organizations.
buttonName: Contact me
buttonURL: "#contact"
button2Name: Watch intro
button2URL: https://www.youtube.com/watch?v=xnZAMk-xIGk
videoLabel: Being Right is Only Half the Battle (30 min)
image: images/hero/hero-portrait.jpg
videoURL: https://www.youtube.com/watch?v=xnZAMk-xIGk
```

This drops the old single `content` markdown blob (`# Rod Begbie` /
`### Software Engineering Leadership Coach` / paragraph) in favor of
the design prototype's actual benefit-led headline copy, confirmed
with Rod: the old `### Software Engineering Leadership Coach` subline
becomes the `eyebrow` pill, the old `# Rod Begbie` name-as-heading is
replaced by the prototype's "Level up your **engineering**
leadership." headline (split into `headlinePrefix` /
`headlineAccent` / `headlineSuffix`, with "engineering" as the one
accent-colored word, matching the prototype exactly), and the old
paragraph becomes `subhead` verbatim, unchanged. The unused
`videoThumb` field is removed — the new video badge (Step 2) is a
text/dot pill, not a thumbnail image (confirmed with Rod), so nothing
reads it anymore.

- [ ] **Step 2: Replace `hero.html`'s contents**

Replace the entire contents of `themes/portio/layouts/partials/hero.html`
with:

```html
{{ with hugo.Data.hero }}
{{ if .enable }}
<section class="hero" id="home">
  <div class="container">
    <div class="row align-items-center">
      <div class="col-lg-7">
        <div class="hero_content">
          <span class="hero_eyebrow">{{ .eyebrow }}</span>
          <h1 class="hero_headline">{{ .headlinePrefix }} <span class="accent">{{ .headlineAccent }}</span> {{ .headlineSuffix }}</h1>
          <p class="hero_subhead">{{ .subhead }}</p>
          <div class="hero_ctas">
            <a class="btn btn-lg btn-primary btn-zoom hero_cta-primary"
              href="{{ .buttonURL | absURL }}">{{ .buttonName }} →</a>
            <a class="btn btn-lg btn-outline-secondary btn-zoom hero_cta-secondary"
              href="{{ .button2URL }}">{{ .button2Name }}</a>
          </div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="hero_figure">
          <div class="hero_figure-blob blob-wrap">
            <svg viewBox="0 0 550 550">
              <defs>
                <linearGradient id="hero-blob-gradient" x1=".069" x2=".753" y1=".116" y2=".858"
                  gradientUnits="objectBoundingBox">
                  <stop offset="0" stop-color="#0e8a8f" />
                  <stop offset="1" stop-color="#0e8a8f" stop-opacity=".08" />
                </linearGradient>
              </defs>
              <g data-name="blob-shape (3)">
                <path class="blob" fill="url(#hero-blob-gradient)"
                  d="M455.4 151.1c43.1 36.7 73.4 92.8 60.8 136.3-12.7 43.5-68.1 74.4-111.3 119.4-43.1 45-74 104.1-109.8 109-35.9 5-76.7-44.2-111.8-89.2-35.2-45-64.7-85.8-70.8-132.6-6-46.8 11.6-99.6 46.7-136.3 35.2-36.6 88-57.2 142.4-58.8 54.5-1.7 110.6 15.6 153.8 52.2z" />
              </g>
            </svg>
          </div>
          {{ with resources.Get .image }}
          {{ $hero500 := .Fill "500x625 smart jpg q82" }}
          {{ $hero750 := .Fill "750x938 smart jpg q82" }}
          {{ $hero1000 := .Fill "1000x1250 smart jpg q82" }}
          {{ $hero1400 := .Fill "1400x1750 smart jpg q82" }}
          {{ $hero500Webp := .Fill "500x625 smart webp q75 picture" }}
          {{ $hero750Webp := .Fill "750x938 smart webp q75 picture" }}
          {{ $hero1000Webp := .Fill "1000x1250 smart webp q75 picture" }}
          {{ $hero1400Webp := .Fill "1400x1750 smart webp q75 picture" }}
          {{ $sizes := "(min-width: 1400px) 500px, (min-width: 1200px) 430px, (min-width: 992px) 360px, (min-width: 768px) 696px, (min-width: 576px) 516px, calc(100vw - 24px)" }}
          <picture class="hero_figure-photo">
            <source type="image/webp" sizes="{{ $sizes }}"
              srcset="{{ $hero500Webp.RelPermalink }} 500w, {{ $hero750Webp.RelPermalink }} 750w, {{ $hero1000Webp.RelPermalink }} 1000w, {{ $hero1400Webp.RelPermalink }} 1400w">
            <img src="{{ $hero750.RelPermalink }}" sizes="{{ $sizes }}"
              srcset="{{ $hero500.RelPermalink }} 500w, {{ $hero750.RelPermalink }} 750w, {{ $hero1000.RelPermalink }} 1000w, {{ $hero1400.RelPermalink }} 1400w"
              width="{{ $hero750.Width }}" height="{{ $hero750.Height }}"
              alt="{{ site.Title }}, {{ site.Params.subtitle }}">
          </picture>
          {{ end }}

          {{ if .videoURL }}
          <a href="{{ .videoURL }}" class="hero_video-badge popup-button">
            <span class="hero_video-badge_dot"></span>
            <span class="hero_video-badge_label">▶ Watch: {{ .videoLabel }}</span>
          </a>
          {{ end }}
        </div>
      </div>
    </div>
  </div>
</section>
{{ end }}
{{ end }}
```

Notable changes from the old file: the old `hero_background-svg`/
`hero_footer-svg`/`figure-svg` decorative squiggle markup is gone
(replaced by the blob), the photo switches from `.Resize` (preserves
original aspect) + a `-webkit-mask` SVG cutout to `.Fill "...smart..."`
at a 4:5 ratio (`500x625`, `750x938`, etc.) with a plain
`border-radius` (added in Step 3's SCSS) — matching the design spec's
"4:5 aspect ratio, `border-radius:24px`" photo treatment instead of the
old organic mask-shape crop. The video badge drops the old thumbnail-
image popup entirely in favor of the design's dot+label pill, but keeps
the exact `popup-button` class and `href="{{ .videoURL }}"` attribute
`video-popup.js` needs, so clicking it still opens the same JS video
overlay unchanged.

- [ ] **Step 3: Replace `_hero-section.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_hero-section.scss` with:

```scss
.hero {
  padding: 220px 0 100px;
  position: relative;
  overflow: hidden;
  @include desktop {
    padding: 160px 0 60px;
  }

  &_content {
    animation: heroFadeUp 0.7s ease both;
  }

  &_eyebrow {
    display: inline-block;
    font-family: $font-mono;
    font-size: $fs-mono-label;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accentSoft);
    border-radius: $radius-pill;
    padding: 8px 16px;
    margin-bottom: 24px;
    animation: heroFadeUp 0.7s ease 0.1s both;
  }

  &_headline {
    font-family: $font-display;
    font-weight: 700;
    font-size: $fs-hero;
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--ink);
    margin-bottom: 24px;
    animation: heroFadeUp 0.8s ease 0.2s both;
    .accent {
      color: var(--accent);
    }
  }

  &_subhead {
    font-family: $font-body;
    font-size: $fs-lead;
    line-height: 1.6;
    color: var(--inkSoft);
    max-width: 480px;
    margin-bottom: 40px;
    animation: heroFadeUp 0.8s ease 0.3s both;
  }

  &_ctas {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    animation: heroFadeUp 0.8s ease 0.4s both;
  }

  &_cta-primary {
    border-radius: $radius-pill;
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accentInk);
    font-family: $font-body;
    font-weight: 600;
    font-size: 16px;
    padding: 16px 30px;
    &:hover {
      background: var(--accent);
      border-color: var(--accent);
      opacity: 0.9;
    }
  }

  &_cta-secondary {
    border-radius: $radius-pill;
    background: transparent;
    border: 1.5px solid var(--line);
    color: var(--ink);
    font-family: $font-body;
    font-weight: 600;
    font-size: 16px;
    padding: 16px 30px;
    &:hover {
      background: var(--bgAlt);
      border-color: var(--line);
      color: var(--ink);
    }
  }

  &_figure {
    position: relative;
    animation: heroFadeUp 0.8s ease 0.3s both;
    @include desktop {
      margin-top: 60px;
    }

    &-blob {
      position: absolute;
      z-index: -1;
      top: -15%;
      right: -15%;
      width: 90%;
      height: 90%;
      opacity: 0.12;
      svg {
        width: 100%;
        height: 100%;
      }
      @include mobile {
        width: 70%;
        height: 70%;
      }
    }

    &-photo {
      display: block;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: $radius-hero-image;
      }
    }
  }

  &_video-badge {
    position: absolute;
    bottom: -22px;
    left: -30px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: $white;
    border-radius: $radius-pill;
    padding: 14px 22px 14px 16px;
    box-shadow: 0 12px 30px rgba(30, 20, 60, 0.15);
    max-width: 280px;
    text-decoration: none;
    transition: transform 0.2s ease;
    @include tablet {
      position: static;
      margin-top: 20px;
      max-width: none;
    }
    &:hover {
      transform: scale(1.03);
    }
    &_dot {
      flex-shrink: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
    }
    &_label {
      font-family: $font-body;
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
      line-height: 1.3;
    }
  }
}

@keyframes heroFadeUp {
  0% {
    opacity: 0;
    transform: translateY(16px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Responsive behavior included here: below `lg` (`@include desktop`,
991px), the figure gets `margin-top: 60px` since the row stacks (photo
drops below content — this is the theme's existing DOM order:
`col-lg-7` content comes before `col-lg-5` figure in the markup, so it
already stacks content-above-photo with no extra CSS needed). Below `md`
(`@include tablet`, 767px), the video badge switches from
`position: absolute` overlapping the photo's corner to
`position: static`, reflowing to sit below the photo instead of
clipping against stacked content. Below `sm` (`@include mobile`, 575px),
the blob shrinks from 90%/90% to 70%/70% of its wrapper to avoid
crowding a narrow viewport.

- [ ] **Step 4: Clear image cache and build**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
```

Expected: build succeeds with no errors (this repo's `.Fill`-call cache
gotcha from `CLAUDE.md` means a stale `resources/_gen` here could mask a
broken crop spec, hence the clear before build).

- [ ] **Step 5: Dev-server visual + interaction check**

```bash
hugo server -D
```

Open `http://localhost:1313/`, confirm: eyebrow pill renders in teal on
`--accentSoft`, "Level up your **engineering** leadership." headline
has "engineering" in teal, both CTAs render as pills (filled teal /
outlined), hero content fades up on
load, the photo is a plain rounded rectangle (no more organic mask
cutout), the video badge sits as a white pill overlapping the photo's
bottom-left corner, and clicking the video badge still opens the
existing JS video overlay (not a raw navigation to YouTube). Resize
below ~768px and confirm the badge reflows to sit below the photo
instead of overlapping it.

- [ ] **Step 6: Commit**

```bash
git add data/hero.yml \
  themes/portio/layouts/partials/hero.html \
  themes/portio/assets/scss/components/_hero-section.scss
git commit -m "Restyle hero: 58/42 split, accent headline word, new video badge, blob background"
```

---

### Task 4: About restyle

**Files:**

- Modify: `data/aboutSection.yml`
- Modify: `themes/portio/layouts/partials/aboutSection.html`
- Modify: `themes/portio/assets/scss/components/_about-section.scss`

**Interfaces:**

- Consumes: tokens from Task 1; `.blob`/`blob-morph` and
  `.blob-wrap`/`blob-drift` (Task 1) for the photo's background blob.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Add the eyebrow and tighten the heading in `aboutSection.yml`**

Replace the entire contents of `data/aboutSection.yml` with:

```yaml
---
enable: true
topTitle: About
title: >
  ## Two decades of shipping software, and helping others do the same.
content: >
  ### An experienced engineering leader with over two decades of product engineering and leadership experience.

  * Originally from Scotland, Rod now lives in San Francisco and is Director of Engineering for Infrastructure and Engineering Velocity at Splice, alongside independent coaching and mentorship for engineering leaders.

  * Before this, he led engineering for Splice Sounds, ran a TV games engineering org at Volley, and was a Senior Engineering Manager at Discord and Dropbox. Past lives have been as Co-Founder & CTO of Sosh, VP of Software Engineering at Anova Culinary, and writing code at places like Slide, Bose, and – for 39 days – Google.

  * His writing is featured on [LeadDev.com](https://leaddev.com/community/rod-begbie) and in O'Reilly's [*97 Things Every Programmer Should Know:* Collective Wisdom from the Experts](https://www.oreilly.com/library/view/97-things-every/9780596809515/), and he's spoken at conferences including LeadDev New York and Calibrate.
button1Name: Work with me
button1Target: "#contact"
image: images/about/about-portrait.jpg
```

The only real changes are un-commenting/setting `topTitle: About` (now
rendered as the new eyebrow chip) and tightening `title` from
`## About me` to the shorter, punchier
`## Two decades of shipping software, and helping others do the same.`
— **this heading is drafted copy and needs Rod's sign-off before
merge**, per the design spec's explicit instruction that the tightened
heading be "reviewed by Rod before merge." The three-bullet `content`
block is unchanged, per the spec ("content is already correct").

- [ ] **Step 2: Replace `aboutSection.html`'s contents**

Replace the entire contents of
`themes/portio/layouts/partials/aboutSection.html` with:

```html
{{ with hugo.Data.aboutSection }}
{{ if .enable }}
<section class="section about" id="about">
    <div class="container">
        <div class="row">
            <div class="col-lg-12">
                <div class="about_content">
                    <div class="about_content-thumb">
                        <div class="about_content-thumb-blob blob-wrap">
                            <svg viewBox="0 0 550 550">
                                <defs>
                                    <linearGradient id="about-blob-gradient" x1=".069" x2=".753" y1=".116" y2=".858"
                                        gradientUnits="objectBoundingBox">
                                        <stop offset="0" stop-color="#0e8a8f" />
                                        <stop offset="1" stop-color="#0e8a8f" stop-opacity=".08" />
                                    </linearGradient>
                                </defs>
                                <g data-name="blob-shape (3)">
                                    <path class="blob" fill="url(#about-blob-gradient)"
                                        d="M455.4 151.1c43.1 36.7 73.4 92.8 60.8 136.3-12.7 43.5-68.1 74.4-111.3 119.4-43.1 45-74 104.1-109.8 109-35.9 5-76.7-44.2-111.8-89.2-35.2-45-64.7-85.8-70.8-132.6-6-46.8 11.6-99.6 46.7-136.3 35.2-36.6 88-57.2 142.4-58.8 54.5-1.7 110.6 15.6 153.8 52.2z" />
                                </g>
                            </svg>
                        </div>
                        <div class="about_content-thumb-image">
                            {{ with resources.Get .image }}
                            {{ $about500 := .Fill "500x625 smart jpg q82" }}
                            {{ $about750 := .Fill "750x938 smart jpg q82" }}
                            {{ $about1000 := .Fill "1000x1250 smart jpg q82" }}
                            {{ $about1400 := .Fill "1400x1750 smart jpg q82" }}
                            {{ $about500Webp := .Fill "500x625 smart webp q75 picture" }}
                            {{ $about750Webp := .Fill "750x938 smart webp q75 picture" }}
                            {{ $about1000Webp := .Fill "1000x1250 smart webp q75 picture" }}
                            {{ $about1400Webp := .Fill "1400x1750 smart webp q75 picture" }}
                            {{ $sizes := "(min-width: 1400px) 350px, (min-width: 1200px) 300px, (min-width: 992px) 250px, (min-width: 768px) 696px, (min-width: 576px) 516px, calc(100vw - 48px)" }}
                            <picture>
                                <source type="image/webp" sizes="{{ $sizes }}"
                                    srcset="{{ $about500Webp.RelPermalink }} 500w, {{ $about750Webp.RelPermalink }} 750w, {{ $about1000Webp.RelPermalink }} 1000w, {{ $about1400Webp.RelPermalink }} 1400w">
                                <img src="{{ $about750.RelPermalink }}" sizes="{{ $sizes }}"
                                    srcset="{{ $about500.RelPermalink }} 500w, {{ $about750.RelPermalink }} 750w, {{ $about1000.RelPermalink }} 1000w, {{ $about1400.RelPermalink }} 1400w"
                                    width="{{ $about750.Width }}" height="{{ $about750.Height }}" alt="{{ site.Title }}">
                            </picture>
                            {{ end }}
                        </div>
                    </div>
                    <div class="about_content-inner">
                        <span class="about_eyebrow">{{ .topTitle }}</span>
                        <div class="about_content-inner-heading">
                            {{ .title | markdownify }}
                        </div>
                        <div class="about_content-inner-body">
                            {{ .content | markdownify }}
                        </div>
                        <div>
                            <a class="btn btn-primary me-3 btn-zoom about_cta"
                                href="{{ .button1Target | absURL }}">{{ .button1Name }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
{{ end }}
{{ end }}
```

Changes from the old file: the centered heading row above the two-column
split is gone (the eyebrow/heading now live inside the 70% content
column, next to the photo, per the design's "portrait photo left (30%),
heading + two paragraphs + pill CTA right (70%)" layout); the old
decorative `about-svg` squiggle image is replaced by the blob
technique (moved to sit behind the *photo*, matching the design spec's
"blob behind the hero photo, the about photo, and the writing image
row"); the dark navy card wrapper (`.about_content-inner` previously had
`background: #1b2031` and the markup had a `text-light` class) is
dropped — the new design has no inverted panel here, so `about_content-
inner`'s text now uses the light-background ink tokens (styled in
Step 3).

- [ ] **Step 3: Replace `_about-section.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_about-section.scss` with:

```scss
.about {
  overflow: hidden;
  padding: $section-padding-y 0;

  &_content {
    display: flex;
    align-items: center;
    gap: 60px;
    flex-wrap: wrap;
    @include desktop {
      gap: 30px;
    }

    &-thumb {
      width: 30%;
      position: relative;
      @include desktop {
        width: 100%;
      }

      &-blob {
        position: absolute;
        z-index: -1;
        top: -20%;
        left: -20%;
        width: 130%;
        height: 130%;
        opacity: 0.12;
        svg {
          width: 100%;
          height: 100%;
        }
        @include tablet {
          width: 100%;
          height: 100%;
        }
      }
    }

    &-thumb-image {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: $radius-about-image;
      }
    }

    &-inner {
      width: 70%;
      @include desktop {
        width: 100%;
      }
    }
  }

  &_eyebrow {
    display: inline-block;
    font-family: $font-mono;
    font-size: $fs-mono-label;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accentSoft);
    border-radius: $radius-pill;
    padding: 8px 16px;
    margin-bottom: 20px;
  }

  &_content-inner-heading {
    font-family: $font-display;
    font-weight: 700;
    font-size: $fs-h2-section;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 24px;
  }

  &_content-inner-body {
    font-family: $font-body;
    font-size: $fs-body;
    line-height: 1.6;
    color: var(--inkSoft);
    margin-bottom: 32px;
    ul,
    ol {
      padding-left: 20px;
    }
  }

  &_cta {
    border-radius: $radius-pill;
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accentInk);
    font-family: $font-body;
    font-weight: 600;
    padding: 14px 28px;
    &:hover {
      background: var(--accent);
      border-color: var(--accent);
      opacity: 0.9;
    }
  }
}
```

Responsive: below `lg` (`@include desktop`, 991px), the 30/70 flex split
stacks to full-width thumb-then-content (matching the design's "about
photo above content, as an introductory element" mobile plan). Below
`md` (`@include tablet`, 767px), the blob wrapper expands to fill its
container fully rather than overhanging by 30% on each side (avoiding
horizontal scroll at narrow widths).

- [ ] **Step 4: Clear cache, build, and dev-server check**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
hugo server -D
```

Open `http://localhost:1313/#about`, confirm: 30/70 photo/content split,
"ABOUT" eyebrow chip above the heading, plain rounded-rect photo with a
soft teal blob visible behind it, no dark navy card. Resize below
~992px and confirm it stacks photo-above-content.

- [ ] **Step 5: Commit**

```bash
git add data/aboutSection.yml \
  themes/portio/layouts/partials/aboutSection.html \
  themes/portio/assets/scss/components/_about-section.scss
git commit -m "Restyle about section: 30/70 split, eyebrow label, tightened heading"
```

---

### Task 5: Experience ("Where I've led") restyle

**Files:**

- Modify: `data/resumeSection.yml`
- Modify: `themes/portio/layouts/partials/resumeSection.html`
- Modify: `themes/portio/assets/scss/components/_resume-section.scss`

**Interfaces:**

- Consumes: tokens from Task 1.
- Produces: nothing later tasks depend on. New `education[].year`,
  `.title`, `.company`, `.description` fields on the first 4 entries
  only; existing `.content`/`.time` fields on those same 4 entries are
  left in place (unused by the new template, kept non-destructively per
  the design spec).

- [ ] **Step 1: Add structured fields to the first 4 `education` entries**

In `data/resumeSection.yml`, add a top-level `earlier` block and
`year`/`title`/`company`/`description` fields to the first four
`education` entries. Replace:

```yaml
education:
  - content: >
      #### Director of Engineering, Infrastructure & Engineering Velocity, _Splice_

      * Leading three teams — Engineering Velocity, Data Engineering, and Site Reliability Engineering — 15 engineers and two managers, reporting to the CTO.

      * Founded the Engineering Velocity team from scratch: investigated developer friction company-wide and defined four workstreams (AI Enablement, Toil & Papercuts, Ownership & Knowledge, and CI/CD) to fix it.

      * Before this, led product engineering for Splice Sounds, including the release of a cross-platform VST3/AU/AAX plugin that puts Splice directly inside producers' DAWs.
    time: 2025–Present
  - content: >
      #### Director of Engineering, _Volley Games_

      * Led over half the company's engineering effort — five product teams, four engineering managers, 25 engineers — building voice-powered games for Roku and Fire TV.

      * Turned engineering's reputation from "always late and buggy" into a team that could negotiate scope and reliably hit deadlines with quality work.
    time: 2024–2025
  - content: >
      #### Senior Engineering Manager, _Discord_

      * Group lead for four teams (21 engineers) shipping new in-app features for Nitro, Discord's premium subscription.

      * Drove a "Progress over Perfection" culture of fast, iterative shipping — recognised with "The 80/20 Thinker" award from senior leadership.
    time: 2022–2023
  - content: >
      #### Senior Engineering Manager, _Dropbox_

      * Led teams of web, desktop and mobile engineers building _Dropbox Paper_ and _Dropbox Spaces_. Shipped tons of new functionality, hit company growth goals, and made processes like on-call manageable and less painful.
      
      * Built strong partnerships with Product & Design peers to maximise impact engineering teams could deliver.
      
      * Created and led IGNITE, Dropbox's apprenticeship program for new engineers from non-traditional backgrounds. In first two years, 17 apprentices joined DBX for six month placements, with 13 receiving (and accepting) full-time offers.
      
      * Worked on question set and designed & delivered interviewer training for Dropbox's behavioural interviews.
    time: 2016–2020
```

with:

```yaml
earlier: >
  Earlier: VP Eng at Anova Culinary, Co-Founder/CTO at Sosh, EM at Slide.
earlierLinkedIn: https://linkedin.com/in/rodbegbie

education:
  - year: 2025–Present
    title: Director of Engineering, Infrastructure & Engineering Velocity
    company: Splice
    description: >
      Leading three teams — Engineering Velocity, Data Engineering, and Site Reliability Engineering — 15 engineers and two managers, reporting to the CTO. Founded the Engineering Velocity team from scratch to fix developer friction company-wide.
    content: >
      #### Director of Engineering, Infrastructure & Engineering Velocity, _Splice_

      * Leading three teams — Engineering Velocity, Data Engineering, and Site Reliability Engineering — 15 engineers and two managers, reporting to the CTO.

      * Founded the Engineering Velocity team from scratch: investigated developer friction company-wide and defined four workstreams (AI Enablement, Toil & Papercuts, Ownership & Knowledge, and CI/CD) to fix it.

      * Before this, led product engineering for Splice Sounds, including the release of a cross-platform VST3/AU/AAX plugin that puts Splice directly inside producers' DAWs.
    time: 2025–Present
  - year: 2024–2025
    title: Director of Engineering
    company: Volley Games
    description: >
      Led over half the company's engineering effort — five product teams, four engineering managers, 25 engineers — building voice-powered games for Roku and Fire TV.
    content: >
      #### Director of Engineering, _Volley Games_

      * Led over half the company's engineering effort — five product teams, four engineering managers, 25 engineers — building voice-powered games for Roku and Fire TV.

      * Turned engineering's reputation from "always late and buggy" into a team that could negotiate scope and reliably hit deadlines with quality work.
    time: 2024–2025
  - year: 2022–2023
    title: Senior Engineering Manager
    company: Discord
    description: >
      Group lead for four teams (21 engineers) shipping new in-app features for Nitro, Discord's premium subscription.
    content: >
      #### Senior Engineering Manager, _Discord_

      * Group lead for four teams (21 engineers) shipping new in-app features for Nitro, Discord's premium subscription.

      * Drove a "Progress over Perfection" culture of fast, iterative shipping — recognised with "The 80/20 Thinker" award from senior leadership.
    time: 2022–2023
  - year: 2016–2020
    title: Senior Engineering Manager
    company: Dropbox
    description: >
      Led teams of web, desktop and mobile engineers building Dropbox Paper and Dropbox Spaces, and created IGNITE, Dropbox's apprenticeship program for engineers from non-traditional backgrounds.
    content: >
      #### Senior Engineering Manager, _Dropbox_

      * Led teams of web, desktop and mobile engineers building _Dropbox Paper_ and _Dropbox Spaces_. Shipped tons of new functionality, hit company growth goals, and made processes like on-call manageable and less painful.
      
      * Built strong partnerships with Product & Design peers to maximise impact engineering teams could deliver.
      
      * Created and led IGNITE, Dropbox's apprenticeship program for new engineers from non-traditional backgrounds. In first two years, 17 apprentices joined DBX for six month placements, with 13 receiving (and accepting) full-time offers.
      
      * Worked on question set and designed & delivered interviewer training for Dropbox's behavioural interviews.
    time: 2016–2020
```

The remaining `education` entries (Anova Culinary onward) are untouched
— only the first 4 (the ones the new template pulls via `first 4`) get
the new fields. `earlierLinkedIn` reuses the URL already referenced in
this same file's `title` intro copy (`https://linkedin.com/in/rodbegbie`).

- [ ] **Step 2: Replace `resumeSection.html`'s contents**

Replace the entire contents of
`themes/portio/layouts/partials/resumeSection.html` with:

```html
{{ with hugo.Data.resumeSection }}
{{ if .enable }}
<section class="section resume" id="resume">
    <div class="container">
        <div class="row mb-5">
            <div class="col-lg-8">
                <div class="resume__heading">
                    {{ .title | markdownify }}
                </div>
            </div>
        </div>
        <div class="row resume__grid">
            {{ range first 4 .education }}
            <div class="col-lg-3 col-md-6">
                <div class="resume__card">
                    <span class="resume__card_year">{{ .year }}</span>
                    <h3 class="resume__card_title">{{ .title }}</h3>
                    <p class="resume__card_company">{{ .company }}</p>
                    <p class="resume__card_description">{{ .description }}</p>
                </div>
            </div>
            {{ end }}
        </div>
        <div class="row">
            <div class="col-lg-12">
                <div class="resume__earlier">
                    <span class="resume__earlier_text">{{ .earlier }}</span>
                    <a class="resume__earlier_link" href="{{ .earlierLinkedIn }}" target="_blank"
                        rel="noopener">Full story on LinkedIn →</a>
                </div>
            </div>
        </div>
    </div>
</section>
{{ end }}
{{ end }}
```

This drops the old tab-pane wrapper (`.tab-content`/`.tab-pane`, never
actually toggled by any JS in this theme — only `education`/`tab1`
was ever rendered) and the skewed dark-navy `resume__background` band,
in favor of a plain `col-lg-3 col-md-6` 4-card grid (per this repo's
documented `.row > *` full-width-below-breakpoint behavior in
`CLAUDE.md`, this alone gives 4-up at `lg`+, 2-up between `md` and `lg`,
1-up below `md` — no extra classes needed) plus the new "Earlier: ..."
summary line with its LinkedIn link.

- [ ] **Step 3: Replace `_resume-section.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_resume-section.scss` with:

```scss
.resume {
  position: relative;
  padding: $section-padding-y 0;
  background: var(--bgAlt);
  @include desktop {
    padding: 60px 0;
  }

  &__heading {
    font-family: $font-display;
    font-weight: 700;
    font-size: $fs-h2-section;
    color: var(--ink);
    a {
      color: var(--accent);
    }
  }

  &__grid {
    row-gap: 20px;
  }

  &__card {
    background: $white;
    border: 1px solid var(--line);
    border-radius: $radius-card;
    padding: 24px;
    height: 100%;

    &_year {
      display: block;
      font-family: $font-mono;
      font-size: $fs-mono-label;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 12px;
    }

    &_title {
      font-family: $font-display;
      font-weight: 700;
      font-size: 17px;
      color: var(--ink);
      margin-bottom: 4px;
    }

    &_company {
      font-family: $font-body;
      font-size: 14px;
      color: var(--inkSoft);
      margin-bottom: 12px;
    }

    &_description {
      font-family: $font-body;
      font-size: 13.5px;
      line-height: 1.55;
      color: var(--inkSoft);
      margin-bottom: 0;
    }
  }

  &__earlier {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
    @include tablet {
      flex-direction: column;
      align-items: flex-start;
    }

    &_text {
      font-family: $font-body;
      font-size: 15px;
      color: var(--inkSoft);
    }

    &_link {
      font-family: $font-body;
      font-size: 15px;
      font-weight: 600;
      color: var(--accent);
      white-space: nowrap;
    }
  }
}
```

Responsive: `col-lg-3 col-md-6` in the markup handles the 4-up → 2-up
(`md`) → 1-up (below `md`) grid collapse per `CLAUDE.md`'s documented
Bootstrap behavior. Below `md` (`@include tablet`, 767px), the earlier-
line/LinkedIn-link row switches from a spread `justify-content: space-
between` row to a stacked column so the link doesn't get squeezed
against the summary text on narrow screens.

- [ ] **Step 4: Clear cache, build, and dev-server check**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
hugo server -D
```

Open `http://localhost:1313/#resume`, confirm: 4 white bordered cards on
a light `--bgAlt` band (no dark navy skew), each showing year/title/
company/description, "Earlier: VP Eng at Anova Culinary, Co-Founder/CTO
at Sosh, EM at Slide." with a working "Full story on LinkedIn →" link
below the grid. Resize the browser: 4-up above ~992px, 2-up between
~768–991px, 1-up below ~768px.

- [ ] **Step 5: Commit**

```bash
git add data/resumeSection.yml \
  themes/portio/layouts/partials/resumeSection.html \
  themes/portio/assets/scss/components/_resume-section.scss
git commit -m "Restyle experience section: 4-card grid, structured year/title/company fields"
```

---

### Task 6: Testimonials restyle

**Files:**

- Modify: `themes/portio/layouts/partials/testimonialSection.html`
- Modify: `themes/portio/assets/scss/components/_testimonial-section.scss`

**Interfaces:**

- Consumes: tokens from Task 1; the existing 3-item
  `data/testimonialSection.yml` `testimonial` list, unchanged.
- Produces: nothing later tasks depend on. Note: this task's new markup
  drops the `.testimonial__slider` class from the page entirely. The
  existing `themes/portio/assets/js/testimonial-carousel.js` guards
  itself with `if (!slider) return;` against exactly that class
  (`document.querySelector(".testimonial__slider")`), so once this
  markup ships, that script becomes a silent no-op — it is not edited in
  this task (still bundled and loaded harmlessly). Task 8 (footer)
  removes it from the JS bundle as a dead-code cleanup once the whole
  homepage no longer references it.

- [ ] **Step 1: Replace `testimonialSection.html`'s contents**

Replace the entire contents of
`themes/portio/layouts/partials/testimonialSection.html` with:

```html
{{ with hugo.Data.testimonialSection }}
{{ if .enable }}
<section class="section testimonial" id="testimonials">
    <div class="container">
        <div class="row text-center mb-5">
            <div class="col-lg-6 offset-lg-3">
                <span class="testimonial__eyebrow">{{ .topTitle }}</span>
                {{ .title | markdownify }}
            </div>
        </div>
        <div class="row testimonial__grid">
            {{ range $index, $item := .testimonial }}
            <div class="col-md-4">
                <div class="testimonial__card{{ if eq (mod $index 2) 1 }} testimonial__card--inverted{{ end }}">
                    <span class="testimonial__card_quote">&ldquo;</span>
                    <p class="testimonial__card_content">{{ $item.comment | markdownify }}</p>
                    <p class="testimonial__card_author"><span>{{ $item.name }}</span> | {{ $item.time }}</p>
                </div>
            </div>
            {{ end }}
        </div>
    </div>
</section>
{{ end }}
{{ end }}
```

This drops the JS-driven slider markup (`.testimonial__slider_track`,
`_dots`, `_pause` button) and the `star`-rating list entirely — the
design spec explicitly drops styling for the unused `star` field, and
none of the 3 real testimonials in `data/testimonialSection.yml` have a
non-zero `star` value anyway. `{{ if eq (mod $index 2) 1 }}` marks index
1 (the middle card, for exactly 3 items) as inverted, matching the
"alternating inverted middle card" rhythm the spec calls out to
preserve.

- [ ] **Step 2: Replace `_testimonial-section.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_testimonial-section.scss` with:

```scss
.testimonial {
  background: var(--bg);
  padding: $section-padding-y 0;
  @include desktop {
    padding: 60px 0;
  }

  &__eyebrow {
    display: inline-block;
    font-family: $font-mono;
    font-size: $fs-mono-label;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accentSoft);
    border-radius: $radius-pill;
    padding: 8px 16px;
    margin-bottom: 16px;
  }

  &__grid {
    row-gap: 24px;
  }

  &__card {
    background: var(--bgAlt);
    border-radius: $radius-card-lg;
    padding: 32px;
    height: 100%;

    &_quote {
      display: block;
      font-family: $font-display;
      font-size: 40px;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 12px;
    }

    &_content {
      font-family: $font-body;
      font-size: 16px;
      line-height: 1.6;
      color: var(--ink);
      margin-bottom: 20px;
    }

    &_author {
      font-family: $font-body;
      font-size: 13px;
      font-weight: 600;
      color: var(--inkSoft);
      margin-bottom: 0;
      span {
        color: var(--ink);
      }
    }

    &--inverted {
      background: var(--accent);
      .testimonial__card_quote {
        color: var(--accentInk);
      }
      .testimonial__card_content {
        color: var(--accentInk);
      }
      .testimonial__card_author {
        color: rgba(255, 255, 255, 0.75);
        span {
          color: var(--accentInk);
        }
      }
    }
  }
}
```

Responsive: `col-md-4` in the markup gives 3-up at `md`+ (768px) and
1-up below `md`, matching the design spec's explicit "3-up → 1-up at
`md` (stacking reads better than an uneven 2+1 split at tablet width for
quote content)" instruction.

- [ ] **Step 3: Build and dev-server check**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
hugo server -D
```

Open `http://localhost:1313/`, scroll to the testimonials section,
confirm: 3 cards in a row, no slider/dots/pause button, the middle card
has a solid teal background with white-ish text, the other two have a
light `--bgAlt` background. Resize below ~768px and confirm they stack
to 1-up.

- [ ] **Step 4: Commit**

```bash
git add themes/portio/layouts/partials/testimonialSection.html \
  themes/portio/assets/scss/components/_testimonial-section.scss
git commit -m "Restyle testimonials as a static 3-card grid with alternating inverted middle card"
```

---

### Task 7: Writing ("Recent for LeadDev") restyle

**Files:**

- Modify: `themes/portio/layouts/partials/blogSection.html`
- Modify: `themes/portio/assets/scss/components/_blog-section.scss`

**Interfaces:**

- Consumes: tokens from Task 1; `.blob`/`blob-morph` and
  `.blob-wrap`/`blob-drift` (Task 1); each post's existing `subtitle`
  front-matter field (already present, verbatim, on the 3 most recent
  non-draft posts — see teaser-copy note below).
- Produces: nothing later tasks depend on.

**Teaser copy check (done during planning, not a template change):** the
3 posts this section actually renders in production
(`site.RegularPages` sorted by date, excluding the draft
`markdown-formatting-demo.md`) are `filtering-your-language.md`
(2021-06-22), `job-success-profiles.md` (2021-04-19), and
`estimating-your-way-to-success.md` (2021-02-15) — all three already
have a real `subtitle` front-matter field:

- *Filtering your language as an engineering leader*: "The most painful
  lessons I've learned as an engineering leader have been when I have
  been imprecise with my language."
- *Increase your hiring success with job success profiles*: "Hiring the
  right person is a hard task. Don't make your life harder by not
  knowing who the right person is."
- *Estimating your way to success in software engineering*: "'Weeks of
  coding can save you hours of planning.' – Old software engineering
  proverb."

No drafted/placeholder teaser copy is needed for this task — the
template renders `.Params.subtitle` verbatim via a `{{ with }}` guard
(defensive for any future post that lacks the field, not a placeholder
for content that exists today).

- [ ] **Step 1: Replace `blogSection.html`'s contents**

Replace the entire contents of
`themes/portio/layouts/partials/blogSection.html` with:

```html
{{ with hugo.Data.blogSection }}
{{ if .enable }}
<section class="section blog-preview" id="blog">
	<div class="blog-preview__blob blob-wrap">
		<svg viewBox="0 0 550 550">
			<defs>
				<linearGradient id="writing-blob-gradient" x1=".069" x2=".753" y1=".116" y2=".858"
					gradientUnits="objectBoundingBox">
					<stop offset="0" stop-color="#0e8a8f" />
					<stop offset="1" stop-color="#0e8a8f" stop-opacity=".08" />
				</linearGradient>
			</defs>
			<g data-name="blob-shape (3)">
				<path class="blob" fill="url(#writing-blob-gradient)"
					d="M455.4 151.1c43.1 36.7 73.4 92.8 60.8 136.3-12.7 43.5-68.1 74.4-111.3 119.4-43.1 45-74 104.1-109.8 109-35.9 5-76.7-44.2-111.8-89.2-35.2-45-64.7-85.8-70.8-132.6-6-46.8 11.6-99.6 46.7-136.3 35.2-36.6 88-57.2 142.4-58.8 54.5-1.7 110.6 15.6 153.8 52.2z" />
			</g>
		</svg>
	</div>
	<div class="container">
		<div class="row mb-5">
			<div class="col-lg-8">
				<span class="blog-preview__eyebrow">{{ .topTitle }}</span>
				{{ .title | markdownify }}
			</div>
		</div>

		<div class="row blog-preview__grid">
			{{ range first 3 (where site.RegularPages "Type" "!=" "portfolio") }}
			<div class="col-md-4">
				<div class="blog-preview__card">
					<a class="blog-preview__card_thumb" href="{{ .RelPermalink }}">
						{{ $post := . }}
						{{ $anchor := .Params.featureImageAnchor | default "smart" }}
						{{ with resources.Get .Params.featureImage }}
						{{ $thumb400 := .Fill (printf "400x250 %s jpg q82" $anchor) }}
						{{ $thumb600 := .Fill (printf "600x375 %s jpg q82" $anchor) }}
						{{ $thumb900 := .Fill (printf "900x562 %s jpg q82" $anchor) }}
						{{ $thumb400Webp := .Fill (printf "400x250 %s webp q75 drawing" $anchor) }}
						{{ $thumb600Webp := .Fill (printf "600x375 %s webp q75 drawing" $anchor) }}
						{{ $thumb900Webp := .Fill (printf "900x562 %s webp q75 drawing" $anchor) }}
						{{ $sizes := "(min-width: 1200px) 373px, (min-width: 768px) 226px, (min-width: 576px) 516px, calc(100vw - 48px)" }}
						<picture>
							<source type="image/webp" sizes="{{ $sizes }}"
								srcset="{{ $thumb400Webp.RelPermalink }} 400w, {{ $thumb600Webp.RelPermalink }} 600w, {{ $thumb900Webp.RelPermalink }} 900w">
							<img src="{{ $thumb600.RelPermalink }}" sizes="{{ $sizes }}"
								srcset="{{ $thumb400.RelPermalink }} 400w, {{ $thumb600.RelPermalink }} 600w, {{ $thumb900.RelPermalink }} 900w"
								width="{{ $thumb600.Width }}" height="{{ $thumb600.Height }}" alt="{{ $post.Title }}">
						</picture>
						{{ end }}
					</a>
					<div class="blog-preview__card_content">
						<span class="blog-preview__card_date">{{ .PublishDate.Format "January 2, 2006" }}</span>
						<h3 class="blog-preview__card_title">
							<a href="{{ .RelPermalink }}">{{ .Title }}</a>
						</h3>
						{{ with .Params.subtitle }}
						<p class="blog-preview__card_teaser">{{ . }}</p>
						{{ end }}
					</div>
				</div>
			</div>
			{{ end }}
		</div>

		<div class="row">
			<div class="col-lg-12 text-center">
				<a class="blog-preview__more" href="{{ .buttonTarget | absURL }}">See more essays →</a>
			</div>
		</div>
	</div>
</section>
{{ end }} {{ end }}
```

Changes from the old file: the old `blog-preview__shape` rotating SVG
decoration is replaced by the blob technique; article thumbnails switch
from a 4:5-ish crop (`400x462`) to the design's 16:10 ratio (`400x250`,
`600x375`, `900x562`); each card now shows a teaser line pulled from
`.Params.subtitle`; the "See all posts" button (desktop/mobile duplicate
markup) is replaced by a single centered "See more essays →" text link,
matching the design spec.

- [ ] **Step 2: Replace `_blog-section.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_blog-section.scss` with:

```scss
.blog-preview {
	position: relative;
	padding: $section-padding-y 0;
	overflow: hidden;
	@include desktop {
		padding: 60px 0;
	}

	&__blob {
		position: absolute;
		z-index: -1;
		top: -10%;
		right: -10%;
		width: 40%;
		height: 60%;
		opacity: 0.1;
		svg {
			width: 100%;
			height: 100%;
		}
		@include tablet {
			display: none;
		}
	}

	&__eyebrow {
		display: inline-block;
		font-family: $font-mono;
		font-size: $fs-mono-label;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--accent);
		background: var(--accentSoft);
		border-radius: $radius-pill;
		padding: 8px 16px;
		margin-bottom: 16px;
	}

	&__grid {
		row-gap: 30px;
	}

	&__card {
		&_thumb {
			display: block;
			border-radius: $radius-image;
			overflow: hidden;
			margin-bottom: 16px;
			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				transition: transform 0.3s ease;
			}
			&:hover img {
				transform: scale(1.05);
			}
		}

		&_date {
			display: block;
			font-family: $font-body;
			font-size: 13px;
			color: var(--inkSoft);
			margin-bottom: 8px;
		}

		&_title {
			font-family: $font-body;
			font-weight: 600;
			font-size: 16px;
			line-height: 1.35;
			margin-bottom: 8px;
			a {
				color: var(--ink);
			}
		}

		&_teaser {
			font-family: $font-body;
			font-size: 14px;
			line-height: 1.5;
			color: var(--inkSoft);
			margin-bottom: 0;
		}
	}

	&__more {
		display: inline-block;
		font-family: $font-body;
		font-size: 15px;
		font-weight: 600;
		color: var(--accent);
		margin-top: 20px;
	}
}
```

Responsive: `col-md-4` in the markup gives 3-up at `md`+ and 1-up below
`md`, matching the same "1-up at `md`" instruction as the testimonials
grid. Below `md` (`@include tablet`, 767px), the decorative blob is
hidden entirely (`display: none`) — it's purely decorative and
`pointer-events`-irrelevant, so hiding it below tablet width costs
nothing functionally, matching the design spec's explicit guidance for
blobs that would otherwise cause clutter at narrow widths.

- [ ] **Step 3: Clear cache, build, and dev-server check**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
hugo server -D
```

Open `http://localhost:1313/#blog`, confirm: 3 article cards with 16:10
images, date, title, and a one-line teaser under each (verify it's the
post's real `subtitle`, not blank), "See more essays →" links to
`/blog`. Resize below ~768px and confirm 1-up stacking and the blob
disappearing.

- [ ] **Step 4: Commit**

```bash
git add themes/portio/layouts/partials/blogSection.html \
  themes/portio/assets/scss/components/_blog-section.scss
git commit -m "Restyle writing section: 3-card grid with real subtitle teasers, blob background"
```

---

### Task 8: Contact + Footer restyle

**Files:**

- Modify: `themes/portio/layouts/partials/footer.html`
- Modify: `themes/portio/assets/scss/components/_footer-section.scss`

**Interfaces:**

- Consumes: tokens from Task 1; `site.Params.contactLink`,
  `site.Params.copyright`, `site.Params.social` (all pre-existing,
  unchanged) from `config.toml`.
- Produces: nothing later tasks depend on. This task also removes
  `js/testimonial-carousel.js` from the JS bundle Hugo concatenates
  (`$navbarjs`/`$testimonialjs`/`$videopopupjs` → `$navbarjs`/
  `$videopopupjs`) — Task 6 made that script's target markup
  (`.testimonial__slider`) disappear from the page, so it's now dead
  code; this is the file that owns the bundle line, so the cleanup
  belongs here.

- [ ] **Step 1: Replace `footer.html`'s contents**

Replace the entire contents of
`themes/portio/layouts/partials/footer.html` with:

```html
<section class="footer" id="contact">
	<div class="container">
		<div class="row footer__cta">
			<div class="col-lg-6">
				<div class="footer__cta_col">
					<h3 class="footer__cta_heading">Coaching</h3>
					<p class="footer__cta_body">I combine my experience as an engineer, manager and startup co-founder with co-active life coaching techniques to guide my clients through the challenges and choices faced in the tech industry today. If you'd like to find out more about booking me for a coaching engagement, drop me a line.</p>
					<a class="btn footer__cta_action footer__cta_action--filled btn-zoom"
						href="{{ site.Params.contactLink | absURL }}">Get in touch</a>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="footer__cta_col">
					<h3 class="footer__cta_heading">Email</h3>
					<p class="footer__cta_body">For any other matters (consulting, writing, comparing Marvel Snap strategies), you can drop me an email at rod@begbie.com.</p>
					<a class="btn footer__cta_action footer__cta_action--outline btn-zoom"
						href="{{ site.Params.contactLink | absURL }}">Email me</a>
				</div>
			</div>
		</div>
		<div class="row footer__footer">
			<div class="col-lg-6">
				<div class="footer__footer_copy">
					<p>{{ site.Params.copyright }}</p>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="footer__footer_social">
					<ul class="unstyle-list">
						{{ $social := site.Params.social }}
						{{ range $social }}
						<li class="d-inline-block mx-2"><a target="_blank"
								href="{{ .url }}">{{ partial "icon.html" (dict "name" .icon) }}</a>
						</li>
						{{ end }}
					</ul>
				</div>
			</div>
		</div>
	</div>
</section>
{{ $navbarjs := resources.Get "js/navbar.js" }}
{{ $videopopupjs := resources.Get "js/video-popup.js" }}
{{ $bundle := slice $navbarjs $videopopupjs
  | resources.Concat "js/bundle.js" | minify | fingerprint }}
<script defer data-cfasync="false" src="{{ $bundle.RelPermalink }}"
  integrity="{{ $bundle.Data.Integrity }}" crossorigin="anonymous"></script>
```

Both `mailto:` CTAs (`Get in touch` and `Email me`) still point at
`site.Params.contactLink` unchanged (`mailto:rod@begbie.com` per
`config.toml`). Removed: the two decorative rotating-shape SVGs inside
the old CTA band (`.shape-1`/`.shape-2`), the `.footer__background_shape`
wavy divider SVG, and the `text-light` classes (now handled by CSS on
`.footer` itself, since the whole band is dark by default in the new
design, not conditionally light-texted).

- [ ] **Step 2: Replace `_footer-section.scss`'s contents**

Replace the entire contents of
`themes/portio/assets/scss/components/_footer-section.scss` with:

```scss
.footer {
	background: var(--ink);
	position: relative;
	padding: $section-padding-y 0 0;
	color: var(--bg);

	&__cta {
		padding: 70px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		@include desktop {
			padding: 50px 0;
		}
	}

	&__cta_col {
		@include desktop {
			text-align: center;
			margin-bottom: 40px;
		}
	}

	&__cta_heading {
		font-family: $font-display;
		font-weight: 700;
		font-size: 26px;
		color: var(--bg);
		margin-bottom: 16px;
	}

	&__cta_body {
		font-family: $font-body;
		font-size: 15px;
		line-height: 1.6;
		color: var(--bg);
		opacity: 0.75;
		margin-bottom: 24px;
	}

	&__cta_action {
		display: inline-block;
		border-radius: $radius-pill;
		font-family: $font-body;
		font-weight: 600;
		font-size: 15px;
		padding: 14px 28px;

		&--filled {
			background: var(--accent);
			border-color: var(--accent);
			color: var(--accentInk);
			&:hover {
				background: var(--accent);
				opacity: 0.9;
				color: var(--accentInk);
			}
		}

		&--outline {
			background: transparent;
			border: 1.5px solid rgba(255, 255, 255, 0.25);
			color: var(--bg);
			&:hover {
				background: rgba(255, 255, 255, 0.08);
				color: var(--bg);
			}
		}
	}

	&__footer {
		padding: 30px 0;
		@include desktop {
			text-align: center;
		}

		&_copy p {
			color: var(--bg);
			opacity: 0.6;
			margin-bottom: 0;
			font-size: 14px;
		}

		&_social {
			ul {
				float: right;
				margin: 0;
				@include desktop {
					margin: 16px auto 0;
					float: none;
				}
			}
			a {
				color: var(--bg);
				opacity: 0.6;
				&:hover {
					opacity: 1;
				}
			}
		}
	}
}
```

The social icons (`themes/portio/layouts/partials/icon.html`) render
inline SVGs with `fill="currentColor"`, so setting `color` on the
enclosing `<a>` (as above) controls their color with no icon-specific
CSS needed. Responsive: below `lg` (`@include desktop`, 991px), the two
CTA columns center-align and stack with spacing, and the copyright/
social row centers with the social icons list dropping its `float:
right` in favor of a centered, top-margined block.

- [ ] **Step 3: Clear cache, build, and dev-server check**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
grep -c "testimonial-carousel" public/js/bundle.*.js 2>/dev/null || echo "testimonial-carousel.js no longer in bundle, as expected"
hugo server -D
```

Open `http://localhost:1313/#contact`, confirm: dark full-bleed band,
"Coaching" filled teal pill CTA, "Email" outlined pill CTA, both open a
mail client to `rod@begbie.com`; copyright/social row below with visible
social icons in the right color.

- [ ] **Step 4: Commit**

```bash
git add themes/portio/layouts/partials/footer.html \
  themes/portio/assets/scss/components/_footer-section.scss
git commit -m "Restyle contact/footer band: dark full-bleed section, pill CTAs, drop dead carousel JS"
```

---

### Task 9: Responsive/mobile QA pass

**Files:** none (verification-only — every breakpoint rule needed was
already added, per-section, in Tasks 2–8; see this plan's Architecture
section for why responsive work was folded into those tasks rather than
deferred here).

**Interfaces:**

- Consumes: the compiled CSS from Tasks 2–8 (all already committed).
- Produces: nothing later tasks depend on. If this pass finds a real
  visual bug, fix it in the specific already-committed component file
  it belongs to and commit that fix here (a concrete example fix is
  included in Step 3 below in case the video badge reflow needs
  adjustment — apply the same fix-in-place approach to any other file if
  something else is found).

- [ ] **Step 1: Confirm the breakpoint media queries actually compiled**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
grep -c "max-width:991px" public/scss/style.min.*.css
grep -c "max-width:767px" public/scss/style.min.*.css
grep -c "max-width:575px" public/scss/style.min.*.css
```

Expected: all three report multiple matches (every section touched in
Tasks 2–8 added rules under at least one of these three breakpoints).
If any reports 0, a component's `@include desktop/tablet/mobile` block
didn't survive — go back to that task's file and check the mixin name
is spelled correctly (`desktop`, `tablet`, `mobile` — not `lg`/`md`/
`sm`, which don't exist as mixins in this theme).

- [ ] **Step 2: Manual resize walkthrough**

```bash
hugo server -D
```

In a browser at `http://localhost:1313/`, resize through three
representative widths (matching this theme's mixin breakpoints:
`desktop` ≤991px, `tablet` ≤767px, `mobile` ≤575px) and check each
section:

- **~960px wide** (below `desktop`/991px, above `tablet`/767px): nav
  shows the hamburger and the collapsed-menu white background; hero
  content stacks above the photo; about photo stacks above content;
  experience grid shows 2 cards per row; testimonials and writing still
  show 3-up (their breakpoint is `md`/767px, not yet reached); contact
  CTAs stack and center.
- **~700px wide** (below `tablet`/767px, above `mobile`/575px):
  experience grid drops to 1 card per row; testimonials and writing
  grids drop to 1-up; the hero video badge has reflowed to a static
  block below the photo (not overlapping its corner); the writing
  section's decorative blob is hidden.
- **~400px wide** (below `mobile`/575px): hero's background blob has
  shrunk to 70%/70% rather than overhanging past the photo's edges; no
  section causes horizontal scroll (check for a horizontal scrollbar at
  the bottom of the viewport, or run the DevTools console check below).

- [ ] **Step 3: Check for horizontal overflow at each width**

With the browser DevTools console open at each of the three widths from
Step 2, run:

```javascript
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

Expected: `false` at all three widths. If `true` at any width, use
DevTools' element inspector to find which element is wider than its
container — the most likely culprit given this plan's changes is a
blob wrapper's `width`/`left`/`right` percentages overhanging past
`overflow: hidden` on its parent section. If it's the hero's blob, in
`themes/portio/assets/scss/components/_hero-section.scss`, tighten the
`@include mobile { }` block inside `&_figure { &-blob { ... } }` from:

```scss
      @include mobile {
        width: 70%;
        height: 70%;
      }
```

to a smaller percentage (e.g. `50%`/`50%`) and rebuild/recheck. Apply
the same tightening pattern to whichever section's blob is actually
overflowing (`_about-section.scss`'s `&-thumb-blob` or
`_blog-section.scss`'s `&__blob`), using that file's own
`@include mobile { }` (or, for the writing blob, confirm the existing
`@include tablet { display: none; }` is actually applying — it's hidden
below `tablet`/767px, not `mobile`, so an overflow found in the ~700px
check would mean that rule isn't matching, most likely a typo in the
mixin name).

- [ ] **Step 4: Commit any fixes found**

If Step 3 required a change, commit it against the specific file it
belongs to, for example:

```bash
git add themes/portio/assets/scss/components/_hero-section.scss
git commit -m "Tighten hero blob mobile sizing to fix horizontal overflow below 575px"
```

If no fixes were needed, there is nothing to commit for this task — the
responsive rules from Tasks 2–8 already passed.

---

### Task 10: Final verification

**Files:** none (verification-only).

**Interfaces:**

- Consumes: the fully-restyled homepage from Tasks 1–9.
- Produces: nothing — this is the plan's closing task, matching this
  repo's established pattern of a final cache-cleared build + browser
  verification pass before considering a branch done.

- [ ] **Step 1: Full clean build**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public resources/_gen .hugo_build.lock
hugo --quiet
echo "Exit code: $?"
```

Expected: exit code `0`, no warnings printed about missing resources or
broken shortcodes.

- [ ] **Step 2: Dev-server link walkthrough**

```bash
hugo server -D
```

In a browser at `http://localhost:1313/`, click through every real link
on the homepage and confirm each one works as expected:

- **Nav anchors** (`Home`, `About`, `Résumé`, `Contact` → `#home`,
  `#about`, `#resume`, `#contact`; `Writing` → `/blog`): each scrolls to
  (or navigates to) the correct section/page.
- **Hero video badge** (`▶ Watch: Being Right is Only Half the Battle
  (30 min)`): click opens the existing JS video overlay embedding
  `https://www.youtube.com/watch?v=xnZAMk-xIGk` (not a raw tab
  navigation) — confirm the overlay's close button (`×`) and Escape key
  both dismiss it.
- **Hero "Watch intro" secondary CTA**: also opens/links to the same
  YouTube video (`button2URL` in `data/hero.yml`).
- **Experience "Full story on LinkedIn →"**: opens
  `https://linkedin.com/in/rodbegbie` in a new tab.
- **Writing "See more essays →"**: navigates to `/blog`.
- **Contact "Get in touch" and "Email me"**: both open a `mailto:`
  compose window addressed to `rod@begbie.com`.

- [ ] **Step 3: Confirm the JSON-LD structured-data partial still renders**

```bash
grep -A2 'application/ld+json' public/index.html
python3 -c "
import re, json
html = open('public/index.html').read()
m = re.search(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S)
json.loads(m.group(1))
print('JSON-LD parsed OK')
"
```

Expected: the `grep` shows the `<script type="application/ld+json">`
tag present in the built homepage; the Python one-liner prints
`JSON-LD parsed OK` (confirms the JSON itself is still well-formed —
`structured-data.html` reads several `.Params`/`site.Params` fields
untouched by this plan, but this check catches any accidental knock-on
breakage from the template changes around it in `head.html`).

- [ ] **Step 4: Visual sanity check against the design handoff screenshots**

Compare the running `hugo server -D` homepage section-by-section against
the reference screenshots noted in the design spec
(`design_handoff_coaching_landing_page/screenshots/01–06-homepage-full.png`,
if still available locally — these are for visual reference only, not
pixel-diffing, since the screenshots use placeholder imagery). Confirm
overall visual rhythm matches: teal accent throughout, Bricolage
Grotesque headings, Instrument Sans body text, no leftover Poppins/
Yeseva One rendering anywhere on the page (check via browser DevTools
"Computed" font-family panel on a heading and a paragraph if unsure).

- [ ] **Step 5: Final status check**

```bash
cd /Users/rod/build/begbie-hugo
git status
git log --oneline feature/homepage-redesign -12
```

Expected: working tree clean (every task's changes committed across
Tasks 1–9, plus this task if Task 9 needed a fix), and the commit log
shows one commit per task on this branch, in order, on top of the
existing approved design-spec commit.

---

## Self-Review

**Spec coverage:** every section of `docs/superpowers/specs/2026-07-02-
homepage-redesign-design.md` maps to a task — Design tokens/typography
(Task 1), Nav (Task 2), Hero (Task 3), About (Task 4), Experience (Task
5), Testimonials (Task 6), Writing (Task 7), Contact+Footer (Task 8),
Responsive/mobile design (folded into Tasks 2–8, QA'd in Task 9), and
the Testing/verification plan (Task 10, plus the cache-clear step
repeated in every image-touching task per the `CLAUDE.md` gotcha). All
four "Known gaps carried from the handoff" are explicitly resolved:
`--accentSoft` derived via `color-mix()` (Task 1), video badge copy/link
(Task 3), writing teaser copy sourced from real front matter (Task 7,
with the specific 3 posts and their subtitles verified during
planning), and the "no sticky nav/mobile menu/scroll animations" item
confirmed as already-existing-and-preserved (Tasks 2 and 3 explicitly
state the hamburger JS and video-popup JS are untouched).

**Placeholder scan:** no "TBD"/"restyle to match design"/"add
appropriate styling" language anywhere in this plan — every SCSS/HTML/
YAML block above is complete, real content. One piece of copy is
flagged as drafted-not-final per the spec's own instructions (About's
tightened heading in Task 4) — flagged for Rod's sign-off, not left as
an unfilled placeholder; the hero headline ("Level up your
**engineering** leadership.") and its accent word were confirmed
directly with Rod, not drafted.

**Type/name/field consistency across tasks:**

- `data/hero.yml`'s `eyebrow`, `headlinePrefix`, `headlineAccent`,
  `headlineSuffix`, `subhead`, `button2Name`, `button2URL`,
  `videoLabel` fields (Task 3, Step 1) are consumed by the exact same
  field names in `hero.html` (Task 3, Step 2) — verified matching.
- The `.blob-wrap`/`blob-drift` contract from Task 1 (Step 5) is
  consumed identically by Task 3 (`hero_figure-blob blob-wrap`), Task 4
  (`about_content-thumb-blob blob-wrap`), and Task 7
  (`blog-preview__blob blob-wrap`) — same class name, same keyframe,
  each section only adds its own positioning/opacity on top.
- The `popup-button` class contract (pre-existing, in
  `themes/portio/assets/js/video-popup.js`) is preserved verbatim on
  the new hero video badge `<a>` in Task 3 — confirmed against the JS
  file's `document.querySelector(".popup-button")` and
  `trigger.getAttribute("href")` calls.
- `data/resumeSection.yml`'s new `year`/`title`/`company`/`description`
  fields (Task 5, Step 1) are consumed by the identical field names in
  `resumeSection.html`'s `{{ range first 4 .education }}` loop (Task 5,
  Step 2) — verified matching. `earlierLinkedIn` (data) matches
  `.earlierLinkedIn` (template) exactly.
- Every component SCSS file references only tokens actually defined in
  Task 1 (`var(--accent)`, `var(--accentSoft)`, `var(--accentInk)`,
  `var(--ink)`, `var(--inkSoft)`, `var(--bg)`, `var(--bgAlt)`,
  `var(--line)`, `$content-max-width`, `$content-padding-x`,
  `$section-padding-y`, `$radius-pill`, `$radius-card`,
  `$radius-card-lg`, `$radius-image`, `$radius-hero-image`,
  `$radius-about-image`, `$font-display`, `$font-body`, `$font-mono`,
  `$fs-hero`, `$fs-h2-section`, `$fs-mono-label`) — no task introduces a
  new token name that Task 1 doesn't produce.
- Breakpoint mixin usage (`@include desktop/tablet/mobile`) is
  consistent with `_mixins.scss`'s actual `max-width` values
  (991px/767px/575px) in every task, and Task 9's QA steps check against
  those same three values — no task or verification step invents a
  `lg`/`md`/`sm` mixin name that doesn't exist in this codebase.

No gaps or inconsistencies found requiring further fixes.

---

## Execution Handoff

Plan complete and saved to
`docs/superpowers/plans/2026-07-02-homepage-redesign.md`. Two execution
options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per
   task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using
   `superpowers:executing-plans`, batch execution with checkpoints.

Which approach?
