# CSS Modernization Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut the two biggest CSS/asset payload contributors in the vendored
`portio` theme: Font Awesome's full icon webfont (1.1MB for 6 icons) and
Bootstrap's fully-imported SCSS (168KB compiled for a handful of used
components) — with zero visual change.

**Architecture:** A new Hugo partial (`icon.html`) renders inline SVG icons
(sourced verbatim from Font Awesome's own free SVG icon set) in place of
the `<i class="fa fa-x">` webfont glyphs; every call site and the one SCSS
selector that targets `<i>` directly are updated to match. Separately,
`style.scss`'s single `@import` of the entire Bootstrap framework is
replaced with an explicit list of only the partials the theme's templates
actually use.

**Tech Stack:** Hugo 0.157.0+ (Go templates, `css.Sass` pipe), Bootstrap
4.5.2 SCSS (vendored under `themes/portio/assets/bootstrap-4.5.2`), inline
SVG (no external icon library).

## Global Constraints

- No visual change to any page — icons must look identical (size, color,
  position), and grid/spacing/nav/buttons must render identically after
  the Bootstrap trim.
- Icon SVG path data must come from Font Awesome's own free icon set (same
  glyphs already in use) — this plan embeds the exact path data already
  fetched from `github.com/FortAwesome/Font-Awesome` (7.3.0, free, CC BY
  4.0 icons / MIT code license).
- Scope is exactly: `themes/portio/layouts/partials/icon.html` (new),
  `themes/portio/layouts/partials/testimonialSection.html`,
  `themes/portio/layouts/partials/footer.html`,
  `themes/portio/layouts/portfolio/single.html`,
  `themes/portio/layouts/partials/head.html`,
  `themes/portio/assets/scss/_common.scss`,
  `themes/portio/assets/scss/components/_testimonial-section.scss`,
  `themes/portio/assets/scss/style.scss`, and deleting
  `themes/portio/static/plugins/font-awesome/`. Nothing else (JS, other
  SCSS components, `data/*.yml`, `content/*.md`, `config.toml`) changes in
  this phase.
- `hugo` must be run from the repo root (`/Users/rod/build/begbie-hugo`).

---

## Task 1: Add the inline SVG icon partial and migrate every Font Awesome call site

**Files:**

- Create: `themes/portio/layouts/partials/icon.html`
- Modify: `themes/portio/layouts/partials/testimonialSection.html:24-34`
- Modify: `themes/portio/layouts/partials/footer.html:66-72,87-92`
  (the icon-bearing lines only)
- Modify: `themes/portio/layouts/portfolio/single.html:94-105`
- Modify: `themes/portio/layouts/partials/head.html:21-22`
- Modify: `themes/portio/assets/scss/_common.scss` (append rule)
- Modify: `themes/portio/assets/scss/components/_testimonial-section.scss:40-44`
- Delete: `themes/portio/static/plugins/font-awesome/` (directory)

- [ ] **Step 1: Create the icon partial**

Create `themes/portio/layouts/partials/icon.html`:

```go-html-template
{{- $icons := dict
  "fa-star" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z"/></svg>`
  "fa-phone" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"/></svg>`
  "fa-envelope" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M48 64c-26.5 0-48 21.5-48 48 0 15.1 7.1 29.3 19.2 38.4l208 156c17.1 12.8 40.5 12.8 57.6 0l208-156c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48L48 64zM0 196L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-188-198.4 148.8c-34.1 25.6-81.1 25.6-115.2 0L0 196z"/></svg>`
  "fa-map-marker" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"/></svg>`
  "fa-linkedin-square" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm5 170.2l66.5 0 0 213.8-66.5 0 0-213.8zm71.7-67.7a38.5 38.5 0 1 1 -77 0 38.5 38.5 0 1 1 77 0zM317.9 416l0-104c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9l0 105.8-66.4 0 0-213.8 63.7 0 0 29.2 .9 0c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9l0 117.2-66.4 0z"/></svg>`
  "fa-twitter-square" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM351.3 199.3c0 86.7-66 186.6-186.6 186.6-37.2 0-71.7-10.8-100.7-29.4 5.3 .6 10.4 .8 15.8 .8 30.7 0 58.9-10.4 81.4-28-28.8-.6-53-19.5-61.3-45.5 10.1 1.5 19.2 1.5 29.6-1.2-30-6.1-52.5-32.5-52.5-64.4l0-.8c8.7 4.9 18.9 7.9 29.6 8.3-9-6-16.4-14.1-21.5-23.6s-7.8-20.2-7.7-31c0-12.2 3.2-23.4 8.9-33.1 32.3 39.8 80.8 65.8 135.2 68.6-9.3-44.5 24-80.6 64-80.6 18.9 0 35.9 7.9 47.9 20.7 14.8-2.8 29-8.3 41.6-15.8-4.9 15.2-15.2 28-28.8 36.1 13.2-1.4 26-5.1 37.8-10.2-8.9 13.1-20.1 24.7-32.9 34 .2 2.8 .2 5.7 .2 8.5z"/></svg>`
  "fa-facebook-official" `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l98.2 0 0-145.8-52.8 0 0-78.2 52.8 0 0-33.7c0-87.1 39.4-127.5 125-127.5 16.2 0 44.2 3.2 55.7 6.4l0 70.8c-6-.6-16.5-1-29.6-1-42 0-58.2 15.9-58.2 57.2l0 27.8 83.6 0-14.4 78.2-69.3 0 0 145.8 129 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z"/></svg>`
-}}
{{- $class := .class | default "" -}}
<span class="icon icon--{{ .name }}{{ with $class }} {{ . }}{{ end }}">{{ index $icons .name | safeHTML }}</span>
```

This partial takes a dict argument with `name` (required, one of the 7 keys
above) and `class` (optional, extra classes to append — e.g. `"inactive"`
or `"btn-zoom"`). Every SVG uses `fill="currentColor"` so it inherits
color from CSS the same way a font-icon glyph did, and no explicit
`width`/`height` (sizing comes from the `.icon svg` CSS rule added in Step
6, matching how `<i>` font icons were sized by `font-size`).

- [ ] **Step 2: Migrate `testimonialSection.html`**

Replace:

```html
{{ if le $i $rating }}
<li><i class="fa fa-star"></i></li>
{{ else }}
<li><i class="fa fa-star inactive"></i></li>
{{ end }}
```

With:

```html
{{ if le $i $rating }}
<li>{{ partial "icon.html" (dict "name" "fa-star") }}</li>
{{ else }}
<li>{{ partial "icon.html" (dict "name" "fa-star" "class" "inactive") }}</li>
{{ end }}
```

- [ ] **Step 3: Migrate `footer.html`**

Three edits in this file — lines 66-72 and 87-92 below. (Line 40's
"Email me" link has no icon and is not touched by this task.)

Line 66-72 (inside the commented-out address widget — still
template-evaluated even though it renders as an HTML comment), replace:

```html
<li class="mb-2"><a class="text-light" href="tel:{{ $address.phone }}"><span class="fa-li"><i
              class="fa fa-phone"></i></span>{{ $address.phone }}</a></li>
<li class="mb-2"><a class="text-light" href="mailto:{{ $address.email }}"><span class="fa-li"><i
              class="fa fa-envelope"></i></span>{{ $address.email }}</a></li>
<li class="mb-2">
  <span class="fa-li"><i class="fa fa-map-marker"></i></span>{{ $address.address }}</a>
</li>
```

With:

```html
<li class="mb-2"><a class="text-light" href="tel:{{ $address.phone }}"><span class="fa-li">{{ partial "icon.html" (dict "name" "fa-phone") }}</span>{{ $address.phone }}</a></li>
<li class="mb-2"><a class="text-light" href="mailto:{{ $address.email }}"><span class="fa-li">{{ partial "icon.html" (dict "name" "fa-envelope") }}</span>{{ $address.email }}</a></li>
<li class="mb-2">
  <span class="fa-li">{{ partial "icon.html" (dict "name" "fa-map-marker") }}</span>{{ $address.address }}</a>
</li>
```

Line 87-92 (the active social icon loop), replace:

```html
{{ $social := site.Params.social }}
{{ range $social }}
<li class="d-inline-block mx-2"><a class="text-light" target="_blank" href="{{ .url }}"><i
              class="fa {{ .icon }}"></i></a>
</li>
{{ end }}
```

With:

```html
{{ $social := site.Params.social }}
{{ range $social }}
<li class="d-inline-block mx-2"><a class="text-light" target="_blank" href="{{ .url }}">{{ partial "icon.html" (dict "name" .icon) }}</a>
</li>
{{ end }}
```

This works unchanged with `config.toml`'s existing
`[[params.social]]` entries (`icon = "fa-linkedin-square"`,
`icon = "fa-twitter-square"`) because the partial's dict keys use the
same `fa-*` names.

- [ ] **Step 4: Migrate `portfolio/single.html`**

Replace:

```html
<div class="social">
            {{ $url := printf "%s" .Permalink | absLangURL }}
            <ul class="unstyle-list big">
              <li>
                <a href=" https://www.facebook.com/sharer/sharer.php?u={{ $url }}"><i
                    class="fa fa-facebook-official btn-zoom"></i></a>
              </li>
              <li>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ $url }}"><i
                    class="fa fa-linkedin-square btn-zoom"></i></a>
              </li>
              <li>
                <a href="https://twitter.com/intent/tweet?&url={{ $url }}"><i
                    class="fa fa-twitter-square btn-zoom"></i></a>
              </li>
            </ul>
          </div>
```

With:

```html
<div class="social">
            {{ $url := printf "%s" .Permalink | absLangURL }}
            <ul class="unstyle-list big">
              <li>
                <a href=" https://www.facebook.com/sharer/sharer.php?u={{ $url }}">{{ partial "icon.html" (dict "name" "fa-facebook-official" "class" "btn-zoom") }}</a>
              </li>
              <li>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ $url }}">{{ partial "icon.html" (dict "name" "fa-linkedin-square" "class" "btn-zoom") }}</a>
              </li>
              <li>
                <a href="https://twitter.com/intent/tweet?&url={{ $url }}">{{ partial "icon.html" (dict "name" "fa-twitter-square" "class" "btn-zoom") }}</a>
              </li>
            </ul>
          </div>
```

This template is currently unreachable (no content has `type: portfolio`)
but is fixed here so it isn't left with broken icon references once Font
Awesome's CSS/webfont is removed in Step 7.

- [ ] **Step 5: Add base CSS for the new `.icon` wrapper**

Append to `themes/portio/assets/scss/_common.scss`:

```scss
.icon {
  display: inline-block;
  vertical-align: -0.125em;
  svg {
    display: block;
    width: 1em;
    height: 1em;
  }
}
```

This keeps inline SVG icons sized and baseline-aligned the same way the
`<i>` font glyphs were (raw inline SVGs have a small baseline gap that
font icons don't, and default to their intrinsic pixel size rather than
`1em` — both are corrected here so nothing shifts visually).

- [ ] **Step 6: Update the testimonial star-rating color rule**

In `themes/portio/assets/scss/components/_testimonial-section.scss`,
replace:

```scss
        li {
          list-style: none;
          display: inline-block;
          i {
            color: #ffc219;
            &.inactive {
              color: #c2c8cc;
            }
          }
        }
```

With:

```scss
        li {
          list-style: none;
          display: inline-block;
          .icon {
            color: #ffc219;
            &.inactive {
              color: #c2c8cc;
            }
          }
        }
```

- [ ] **Step 7: Remove the Font Awesome plugin**

In `themes/portio/layouts/partials/head.html`, remove these two lines:

```html
  {{ "<!-- Font Awesome -->" | safeHTML }}
  <link rel="stylesheet" href="{{ "plugins/font-awesome/css/font-awesome.min.css" | absURL }}" />
```

Delete the directory:

```bash
rm -rf themes/portio/static/plugins/font-awesome
```

- [ ] **Step 8: Verify no Font Awesome references remain**

```bash
grep -rn 'class="fa \|fa fa-\|font-awesome' themes/portio/layouts
```

Expected: no output (the `icon.html` partial itself uses the string
`"fa-star"` etc. as dict *keys*, not as an HTML class named literally
`fa fa-star` — confirm the grep pattern above doesn't false-positive on
`icon.html`; if it does, inspect and confirm the only matches are the
dict key strings, not stray `<i class="fa ...">` markup).

- [ ] **Step 9: Build and visually spot-check**

```bash
hugo
```

Expected: exit code 0, no new warnings. Then start a local server and
confirm in a browser (or report back to the controller to do the visual
check):

```bash
hugo server -D
```

Visit the homepage and confirm the testimonial star ratings render (gold
filled stars / gray empty stars, same as before), and the footer social
icons (LinkedIn, Twitter) render correctly-sized and colored.

- [ ] **Step 10: Commit**

```bash
git add themes/portio/layouts/partials/icon.html \
  themes/portio/layouts/partials/testimonialSection.html \
  themes/portio/layouts/partials/footer.html \
  themes/portio/layouts/portfolio/single.html \
  themes/portio/layouts/partials/head.html \
  themes/portio/assets/scss/_common.scss \
  themes/portio/assets/scss/components/_testimonial-section.scss
git rm -r themes/portio/static/plugins/font-awesome
git commit -m "Replace Font Awesome webfont with inline SVG icons"
```

---

## Task 2: Trim Bootstrap SCSS to only the partials actually used

**Files:**

- Modify: `themes/portio/assets/scss/style.scss:9`

- [ ] **Step 1: Capture the baseline compiled CSS size**

```bash
hugo
ls -la public/scss/style.min.css
```

Note the byte size — you'll compare against it after the change.

- [ ] **Step 2: Replace the Bootstrap import**

In `themes/portio/assets/scss/style.scss`, replace:

```scss
@import "../bootstrap-4.5.2/scss/bootstrap";
```

With:

```scss
@import "../bootstrap-4.5.2/scss/functions";
@import "../bootstrap-4.5.2/scss/variables";
@import "../bootstrap-4.5.2/scss/mixins";
@import "../bootstrap-4.5.2/scss/root";
@import "../bootstrap-4.5.2/scss/reboot";
@import "../bootstrap-4.5.2/scss/type";
@import "../bootstrap-4.5.2/scss/grid";
@import "../bootstrap-4.5.2/scss/forms";
@import "../bootstrap-4.5.2/scss/buttons";
@import "../bootstrap-4.5.2/scss/transitions";
@import "../bootstrap-4.5.2/scss/nav";
@import "../bootstrap-4.5.2/scss/navbar";
@import "../bootstrap-4.5.2/scss/breadcrumb";
@import "../bootstrap-4.5.2/scss/pagination";
@import "../bootstrap-4.5.2/scss/utilities";
```

- [ ] **Step 3: Rebuild and check for Sass errors**

```bash
hugo
```

Expected: exit code 0. If Sass reports an undefined variable/mixin error,
it means a dropped partial was actually a dependency of a kept one or of
the theme's own component SCSS — read the error, identify which partial
defines the missing variable/mixin, and add it back to the import list
(common candidates if this happens: `_images.scss` for
`img-fluid`-adjacent mixins, or `_close.scss` if a kept component
references a close-button mixin). Do not guess — check
`themes/portio/assets/bootstrap-4.5.2/scss/<partial>.scss` for the
missing name before adding it back.

- [ ] **Step 4: Compare compiled CSS size**

```bash
ls -la public/scss/style.min.css
```

Report the before/after byte sizes.

- [ ] **Step 5: Visually spot-check**

```bash
hugo server -D
```

Confirm in a browser (or report back to the controller to do the visual
check) that the homepage (hero, about, resume, testimonials, blog
preview), blog list, a blog single post, and the contact page (including
the form and its `form-check`/`form-control`/`form-row` styling) all
render identically to before — grid columns, spacing utilities, button
styling, the navbar (including the mobile hamburger breakpoint — resize
the viewport or use device emulation to check), and breadcrumbs.

- [ ] **Step 6: Commit**

```bash
git add themes/portio/assets/scss/style.scss
git commit -m "Trim Bootstrap SCSS import to only the partials in use"
```

---

## Task 3: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no Font Awesome or dropped-Bootstrap-component references remain**

```bash
grep -rn 'font-awesome\|class="fa \|fa fa-' themes/portio/layouts
grep -rn 'class="[^"]*\b(modal|tooltip|popover|dropdown|carousel|card|alert|badge|progress|spinner|toast|list-group|jumbotron|input-group)\b' themes/portio/layouts
```

Expected: no output from either.

- [ ] **Step 2: Clean full-site build**

```bash
hugo
```

Expected: exit code 0, no new warnings (the pre-existing `languageCode`
deprecation warning is out of scope and expected).

- [ ] **Step 3: Report final payload comparison**

```bash
du -sh public/scss/style.min.css
du -sh themes/portio/static/plugins 2>/dev/null || echo "font-awesome removed"
```

Compare against the pre-Phase-1 baseline (168KB for `style.min.css`,
1.1MB for the font-awesome subtree that's now gone).

- [ ] **Step 4: Full visual pass**

Using the Chrome DevTools browsing skill, load each of these pages from
`hugo server -D` and visually confirm no regressions versus the live site
before this phase: homepage (all enabled sections — hero, about, resume,
testimonials, blog preview), `/blog/`, one blog post, `/contact/`. Pay
particular attention to: testimonial star ratings, footer social icons,
navbar (including mobile breakpoint), buttons, and the contact form.

- [ ] **Step 5: Confirm working tree is clean**

```bash
git status --short
```

Expected: no output for anything under `themes/portio`. Unrelated
pre-existing untracked files are expected and out of scope.
