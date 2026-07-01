# CSS modernization Phase 1: Bootstrap trim + Font Awesome removal

## Context

This is Phase 1 of a 3-phase performance initiative for the vendored
`portio` Hugo theme (`themes/portio`), following the earlier Hugo template
modernization (`.Site` → `site`, `absURL`). The three phases:

1. **CSS trim** (this spec) — cut unused Bootstrap SCSS, replace Font
   Awesome's webfont with inline SVG icons.
2. **JS vanilla rewrite** — drop jQuery, Slick, Magnific Popup, and
   TweenMax/GSAP in favor of vanilla JS/CSS; remove dead plugins (Masonry,
   imagesLoaded, Waypoint — only used by the disabled portfolio/skill
   sections); fix a latent bug where `script.js` calls `google.maps.*`
   unconditionally even though the Google Maps `<script>` loader is
   commented out in `footer.html`.
3. **Asset pipeline** — Hugo Pipes bundling/minification/fingerprinting and
   defer/async loading for whatever JS/CSS remains after phases 1 and 2.

Phases 2 and 3 are separate specs, out of scope here.

## Findings that motivate this phase

- `themes/portio/assets/scss/style.scss` imports the entire Bootstrap 4.5.2
  framework (`@import "../bootstrap-4.5.2/scss/bootstrap"`, ~35 component
  partials), compiling to 168KB of minified CSS
  (`public/scss/style.min.css`). A survey of every class used across
  `themes/portio/layouts` (see below) shows only a small subset of
  Bootstrap is actually exercised.
- Font Awesome's full icon webfont + CSS (`static/plugins/font-awesome`,
  1.1MB) is loaded for exactly 6 distinct icons: `fa-star` (testimonial
  rating, active/inactive), `fa-phone`, `fa-envelope`, `fa-map-marker`
  (footer's commented-out address widget — still template-evaluated, see
  below), `fa-linkedin-square`, `fa-twitter-square` (footer social links,
  config-driven), and `fa-facebook-official`/`fa-linkedin-square`/
  `fa-twitter-square` again in `portfolio/single.html` (currently
  unreachable — no content of type `portfolio` exists — but still dead
  code that would render broken icons once the font is removed).

## Bootstrap SCSS: exact partial list

Grepping every `class="..."` attribute across `themes/portio/layouts`
for Bootstrap-owned classes turns up exactly:

```text
align-items-center breadcrumb btn col-* container d-flex d-inline-block
form-check form-control form-group form-row justify-content-*
mb-* mt-* mx-* my-* nav navbar offset-* p-* pagination pr-* row small
text-center text-dark text-light text-primary text-right text-sm-center
```

No modal, tooltip, popover, dropdown, carousel, card, alert, badge,
progress, spinner, table, toast, list-group, media, jumbotron, or
input-group classes appear anywhere. `style.scss`'s Bootstrap import
changes from:

```scss
@import "../bootstrap-4.5.2/scss/bootstrap";
```

to:

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

`functions`/`variables`/`mixins`/`root` are required foundation partials
that every other partial depends on (variable/mixin definitions), even
though they don't emit CSS directly. `reboot` is Bootstrap's normalize/base
element reset — dropping it would change default element styling
(margins, font inheritance, box-sizing) across the whole site, so it stays.
`transitions` provides the `.collapse`/`.collapsing` animation the mobile
nav relies on.

Everything else present in `themes/portio/assets/bootstrap-4.5.2/scss/`
(`_alert.scss`, `_badge.scss`, `_card.scss`, `_carousel.scss`, `_close.scss`,
`_code.scss`, `_custom-forms.scss`, `_dropdown.scss`, `_images.scss`,
`_input-group.scss`, `_jumbotron.scss`, `_list-group.scss`, `_media.scss`,
`_modal.scss`, `_pagination.scss` [kept], `_popover.scss`, `_print.scss`,
`_progress.scss`, `_spinners.scss`, `_tables.scss`, `_toasts.scss`,
`_tooltip.scss`) is dropped.

## Font Awesome → inline SVG icons

Replace the icon webfont with a Hugo partial, `themes/portio/layouts/
partials/icon.html`, that renders one of the 6 needed icons as inline SVG
based on a name parameter:

```go-html-template
{{- $icons := dict
  "fa-star" "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 576 512\" width=\"1em\" height=\"1em\" fill=\"currentColor\"><path d=\"...\"/></svg>"
  "fa-phone" "..."
  "fa-envelope" "..."
  "fa-map-marker" "..."
  "fa-linkedin-square" "..."
  "fa-twitter-square" "..."
  "fa-facebook-official" "..."
-}}
{{- $class := .class | default "" -}}
<span class="icon icon--{{ .name }} {{ $class }}">{{ index $icons .name | safeHTML }}</span>
```

Each SVG path is copied verbatim from Font Awesome's own free icon set
(same visual glyphs the site already uses, MIT/CC-BY licensed, no
licensing blocker for embedding). `width`/`height: 1em` and
`fill="currentColor"` mean each icon inherits its size from the
surrounding font-size and its color from the existing CSS `color` rules —
no SCSS changes needed for icon coloring/sizing (e.g.
`_testimonial-section.scss`'s `i { color: #ffc219; &.inactive { color:
#c2c8cc; } }` rule currently targets the `<i>` tag directly; this becomes
a rule targeting `.icon` instead, same colors, same effect).

Call sites change from `<i class="fa fa-star"></i>` to
`{{ partial "icon.html" (dict "name" "fa-star") }}`, preserving the
existing `fa-*` naming so `config.toml`'s `[[params.social]]` blocks
(`icon = "fa-linkedin-square"`) keep working unchanged — the partial reads
`.icon` straight from the data file entry.

Files touched: `partials/testimonialSection.html` (rating stars),
`partials/footer.html` (phone/envelope/map-marker in the commented
address widget, and the social icon loop), `portfolio/single.html`
(facebook/linkedin/twitter — unreachable today, fixed for correctness).

Removed entirely: the `font-awesome` `<link>` tag in `head.html`, and
`static/plugins/font-awesome/` (webfont files + CSS, 1.1MB).

## Testing/verification

This phase intentionally changes output (CSS shrinks, icon markup changes
from `<i>` to `<svg>`), so byte-identical diffing (used in the earlier
template pass) doesn't apply. Verification instead:

1. **Build weight comparison:** `hugo` build before/after, compare
   `public/scss/style.min.css` size and confirm
   `static/plugins/font-awesome/` no longer ships in the output.
2. **Visual verification via browser:** use the Chrome DevTools Protocol
   browsing skill to load each page that changed (home — hero, about,
   resume, testimonials, blog preview sections; blog list; a blog single
   post; contact) before and after, and visually confirm: grid layout,
   spacing, buttons, nav (including the mobile hamburger breakpoint),
   breadcrumbs, the contact form, and all 6 icons (rating stars in both
   active/inactive states, footer social icons) render identically to
   before.

## Non-goals

- No change to JS behavior, dead-plugin removal, or the Google Maps bug —
  that's Phase 2.
- No bundling, minification-strategy change, fingerprinting, or
  defer/async changes to script/link tags — that's Phase 3 (the SCSS
  pipeline already runs through `css.Sass | minify`, which is unchanged).
- No change to `config.toml`, `data/*.yml`, or `content/*.md`.
- No visual redesign — icons should look the same, just delivered
  differently.
