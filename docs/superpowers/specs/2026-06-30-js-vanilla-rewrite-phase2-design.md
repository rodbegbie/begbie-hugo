# JS vanilla rewrite Phase 2: drop jQuery and plugin dependencies

## Context

This is Phase 2 of the 3-phase performance initiative for the vendored
`portio` Hugo theme (`themes/portio`), following Phase 1 (CSS trim + Font
Awesome removal, merged as PR #4). The three phases:

1. **CSS trim** (done) — cut unused Bootstrap SCSS, replace Font Awesome's
   webfont with inline SVG icons.
2. **JS vanilla rewrite** (this spec) — drop jQuery, Slick, Magnific Popup,
   Bootstrap's JS bundle, and TweenMax/GSAP in favor of small vanilla
   modules; delete dead plugins and dead code found during the audit below.
3. **Asset pipeline** — Hugo Pipes bundling/minification/fingerprinting and
   defer/async loading for whatever JS/CSS remains after phases 1 and 2.

Phase 3 is a separate spec, out of scope here.

Rod chose the aggressive option for this phase in an earlier session: full
vanilla rewrite of live behaviors, not just trimming/optimizing jQuery
plugin delivery.

## Audit: what's actually live vs. dead

`themes/portio/assets/js/script.js` and `themes/portio/assets/js/
form-handler.js` are the only project-authored JS; everything else under
`themes/portio/static/plugins/` is a vendored library loaded via `<script>`/
`<link>` tags in `head.html`/`footer.html`. Cross-referencing every plugin
call in `script.js` against the actual rendered templates (not the
`exampleSite` reference, which isn't built) and each section's
`data/*.yml` `enable` flag turns up:

**Dead code and dead dependencies (delete outright, no replacement):**

- **Preloader** (`PageLoad()` in `script.js`, using TweenMax fades and a
  percentage counter) — targets `.preloader-text`, `#precent`,
  `.preloader-wrap`, `.percentage`, `.inner`, none of which exist in
  `baseof.html` or anywhere else. Leftover from the original Bootstrap
  theme demo; the `<body class="hidden">` markup it also expects was never
  carried over either.
- **`static/plugins/headroom/`** (8K) — never referenced by any `<script>`
  or `<link>` tag anywhere in `layouts/`.
- **`static/plugins/bootstrap/bootstrap.min.css`** (138K) — never linked;
  only `bootstrap.min.js` is used, and only for the mobile nav collapse.
- **Masonry, imagesLoaded, Waypoint** (`static/plugins/masonry`,
  `imagesloaded`, `waypoint`, 24K + 12K + 12K) — used only by the
  portfolio grid (`portfolioSection.html`) and skill-count waypoint
  (`skillSection.html`); both sections have `enable: false` in their data
  files.
- **Google Maps** (`initialize()` in `script.js`, the `#map` div and its
  `data-lat`/`data-long`/`data-pin` attributes in `contact/list.html`, and
  `[params.map]` in `config.toml`) — per Rod's decision, removed entirely.
  `config.toml`'s `APIkey` was always the placeholder value
  `"YOUR GOOGLE MAP API"`; the Google Maps `<script>` loader is already
  commented out in `footer.html`, so `initialize()` has never run
  successfully and `#map` renders as an empty 400px rounded box on the
  contact page today. Removing it fixes that visible defect as a
  side effect.
- **Bootstrap's `tab` component** — `resumeSection.html` has
  `data-toggle="tab"` markup, but it's inside an HTML comment; the tab
  buttons never render, so the second (`experience`) resume pane is
  already permanently hidden by Bootstrap's own `.tab-pane` CSS. This is a
  pre-existing, unrelated defect — noted here so it isn't mistaken for a
  Phase 2 regression, but left untouched (out of scope).

**Live behaviors needing a vanilla replacement:**

- Mobile nav collapse toggle (`navbar.html`'s `data-toggle="collapse"`
  hamburger button, currently handled by Bootstrap's jQuery-dependent
  `collapse.js`), the scroll-triggered `.nav__color__change` class toggle
  at 200px, and smooth-scroll for in-page `.scroll` anchor links.
- Testimonial carousel (`.testimonial__slider` in `testimonialSection.html`,
  3 items, currently Slick: 2-up desktop / 1-up ≤992px, dots, autoplay
  every 2000ms, infinite loop).
- Video popup (`.popup-button` in `hero.html`, currently Magnific Popup:
  YouTube iframe lightbox, fade transition, disabled below a 700px
  viewport — below that width the link behaves as a normal link instead).
- Blob background morph (`.blob` SVG paths in `hero.html`,
  `aboutSection.html`, `contact/list.html`, `blog/list.html`,
  `blog/single.html` — currently GSAP `TimelineMax`, an infinite
  yoyo loop tweening the SVG `d` attribute through 4 target shapes, ~3s
  each). Per Rod's decision, replaced with a CSS `@keyframes` animation on
  the `d` property instead of a JS tween.
- Contact form submission (`form-handler.js`) — already vanilla
  (`fetch`-free `XMLHttpRequest` + `FormData`), no change needed.

## Architecture

One small, single-purpose vanilla JS module per live behavior, replacing
the single do-everything `script.js`. No bundler yet (Phase 3's job) — each
module is a classic IIFE-wrapped script, loaded via its own `<script>` tag
in `footer.html`, run through the same `resources.Get "js/<name>.js" |
minify` pattern already used for `form-handler.js`:

- `assets/js/navbar.js` — collapse toggle, scroll-color class, smooth
  scroll.
- `assets/js/testimonial-carousel.js` — the testimonial slider.
- `assets/js/video-popup.js` — the hero video lightbox.
- `assets/js/form-handler.js` — unchanged.
- `assets/js/script.js` — deleted. Nothing left needs it once the above
  modules and the CSS blob animation absorb its live behaviors.

Removed from `footer.html`/`head.html` entirely: the `<script>` tags for
`plugins/jQuery/jquery.min.js`, `plugins/bootstrap/bootstrap.min.js`,
`plugins/slick/slick.min.js`, `plugins/waypoint/jquery.waypoints.min.js`,
`plugins/magnafic-popup/jquery.magnific-popup.min.js`,
`plugins/tweenmax/TweenMax.min.js`, `plugins/imagesloaded/
imagesloaded.min.js`, `plugins/masonry/masonry.min.js`, and the `<link>`
tags for `plugins/slick/slick.css`, `plugins/slick/slick-theme.css`,
`plugins/magnafic-popup/magnific-popup.css`. Removed from disk entirely:
`static/plugins/jQuery/`, `bootstrap/`, `headroom/`, `imagesloaded/`,
`magnafic-popup/`, `masonry/`, `slick/`, `tweenmax/`, `waypoint/` — all
nine plugin directories, 692K total.

### Mobile nav (`navbar.js`)

- Collapse toggle: add/remove a `show` class on `#navbarCollapse` and
  toggle the button's `collapsed` class and `aria-expanded` attribute on
  click, replacing Bootstrap's `collapse` plugin. The existing
  `.collapse`/`.collapsing` CSS transition classes stay (Phase 1 kept
  Bootstrap's `transitions` SCSS partial for exactly this), so the same
  slide animation continues to work with plain class toggling.
- Nav-link click closes the mobile menu (today: `.collapse("hide")` on
  `.navbar-nav>li>a` click) — same class removal, no plugin needed.
- Scroll-color class: a plain `window.addEventListener("scroll", ...)`
  checking `window.scrollY > 200`, replacing the jQuery `$(window).scroll`
  handler 1:1.
- Smooth scroll: `element.scrollIntoView({behavior: "smooth"})` on
  `.scroll` anchor click, replacing the jQuery `animate(scrollTop)` call.
  `scrollIntoView` is universally supported in the browsers this site
  targets.

### Testimonial carousel (`testimonial-carousel.js`)

Hand-rolled carousel, not a library — the requirement is narrow (3 static
items, one active breakpoint switch, dots, autoplay) and doesn't justify a
dependency:

- Render dots from the existing slide count; clicking a dot or letting the
  autoplay timer fire advances a single `currentIndex`, wrapping with
  modulo so it loops infinitely like Slick's `infinite: true`.
- Slides-per-view (2 above 992px, 1 at/below) read from a `matchMedia
  "(min-width: 992px)"` query, re-evaluated on `resize` and on carousel
  init — matching Slick's `responsive` breakpoint.
- Positioning via a CSS `transform: translateX(...)` on a track element
  sized to `slidesPerView`, recalculated on breakpoint change.
- Autoplay: a single `setInterval(..., 2000)`, cleared on the container's
  `mouseenter` and restarted on `mouseleave` (matches Slick's default
  pause-on-hover behavior, which the current config relies on implicitly).

### Video popup (`video-popup.js`)

Hand-rolled lightbox, same reasoning — a single fixed use case (one
YouTube iframe popup):

- On click, build the popup markup (backdrop + centered iframe + close
  button) and append it to `<body>`; parse the YouTube `watch?v=` URL into
  an embed URL (`https://www.youtube.com/embed/<id>`) since Magnific
  Popup's iframe provider did this URL rewriting automatically and a
  vanilla version needs to replicate it explicitly.
- Close on: close-button click, backdrop click, and `Escape` keydown —
  removing the injected markup (which also stops the video, since the
  iframe element is destroyed).
- Below a 700px viewport (checked via `matchMedia`), skip the popup
  handler entirely and let the `<a href>` navigate normally — replicating
  Magnific Popup's `disableOn: 700`.
- CSS for the popup (backdrop, centering, fade transition, close button)
  replaces `magnific-popup.css`, scoped under a new class namespace (e.g.
  `.video-popup`) rather than reusing Magnific Popup's `mfp-*` class names,
  to avoid dragging along unused Magnific Popup CSS rules.

### Blob morph (CSS, no JS)

A shared `@keyframes blob-morph` block (new partial,
`assets/scss/components/_blob.scss`, imported from `style.scss` alongside
the other component partials) targeting the `d` property on `.blob`:

- Keyframe stops reuse the same 4 target `d` path strings the GSAP
  timeline already tweens to, applied identically to every `.blob` element
  site-wide — matching current behavior, since the GSAP timeline already
  applied the same 4 shapes uniformly to all `.blob` elements regardless
  of each one's own starting path (it targets the `.blob` class globally,
  overwriting whatever `d` each page's inline SVG started with).
- `animation: blob-morph 12s ease-in-out infinite alternate;` — 4 stops ×
  ~3s each, `alternate` replicating GSAP's `yoyo: true` ping-pong instead
  of a hard cut back to the start.
- Animating the SVG `d` property via CSS has partial browser support
  (solid in current Chrome/Firefox/Edge; degrades to a static shape, the
  element's own inline `d`, in browsers without support). Rod accepted
  this tradeoff — it's decorative background flair, and a static blob is
  a fine fallback, not a broken page.

## Non-goals

- No change to the contact form (`form-handler.js`) — already vanilla.
- No bundling, concatenation, minification-strategy change, or
  defer/async loading beyond what already exists — that's Phase 3.
- No change to `config.toml`, `data/*.yml`, or `content/*.md` beyond
  removing `[params.map]` (dead per the Maps decision above).
- No fix for the pre-existing hidden resume "experience" tab — unrelated,
  noted above, left as-is.
- No visual redesign of the carousel, popup, or nav — behavior and
  appearance should match today's rendering (modulo the blob's CSS
  fallback on unsupported browsers, and the Maps box disappearing, both
  called out above as intentional).

## Testing/verification

Like Phase 1, this phase changes output (script tags change, plugin CSS is
removed, markup for the popup is JS-injected rather than static), so
byte-identical diffing doesn't apply. Verification:

1. **Build weight comparison:** confirm `static/plugins/` no longer ships
   in `public/`, and `public/js`/inline script sizes shrink accordingly.
2. **Visual and interaction verification via browser:** use the Chrome
   DevTools Protocol browsing skill to check, before and after:
   - Home page: mobile hamburger menu opens/closes and auto-closes on nav
     click; navbar background changes color after scrolling past 200px;
     in-page nav links smooth-scroll to their section; the blob shapes
     render (static or animated, browser-dependent) with no console
     errors; the testimonial carousel shows 2 items desktop / 1 mobile,
     autoplays, dots reflect position, and looping works past the last
     item; the hero video popup opens the YouTube embed, closes via the
     close button, backdrop click, and Escape, and (at a narrow viewport)
     behaves as a plain link instead.
   - Contact page: no `#map` box, no console errors, form submission still
     works.
   - Blog list/single pages: blob renders, no console errors.
   - Browser console has zero JS errors on every page checked (this both
     confirms the rewrite works and confirms the Google Maps
     `ReferenceError` is gone).
