# Asset pipeline Phase 3: bundling, fingerprinting, font loading

## Context

This is Phase 3 of the 3-phase performance initiative for the vendored
`portio` Hugo theme (`themes/portio`), following:

1. **CSS trim** (done, merged) — cut unused Bootstrap SCSS, replaced Font
   Awesome's webfont with inline SVG icons.
2. **JS vanilla rewrite** (done, merged as `58b80fa`) — dropped jQuery,
   Bootstrap's JS bundle, Slick, Magnific Popup, and TweenMax/GSAP in
   favor of four small vanilla modules: `navbar.js`,
   `testimonial-carousel.js`, `video-popup.js`, `form-handler.js`.
3. **Asset pipeline** (this spec) — Hugo Pipes bundling/minification/
   fingerprinting for whatever CSS/JS remains, plus a font-loading fix.

## Current state

- **CSS:** one file, `assets/scss/style.scss`, compiled via
  `resources.Get "scss/style.scss" | css.Sass | minify`, loaded as a
  single blocking `<link rel="stylesheet">` in `head.html`.
- **JS:** four independent files under `assets/js/`, each piped through
  `resources.Get "js/<name>.js" | minify` and loaded as its own blocking
  `<script src="...">` tag at the end of `<body>` in `footer.html` — four
  separate HTTP requests, no fingerprinting, no `defer`.
- **Fonts:** Google Fonts (Poppins + Yeseva One) loaded via a plain CSS
  `@import url(...)` inside `assets/scss/_variables.scss`, compiled
  straight through into the final `style.min.css`. Because it's a CSS
  `@import`, the browser can't discover or start fetching it until it has
  already fetched and parsed the entire main stylesheet — a full extra
  round trip before the font request even starts, on top of Google's own
  DNS/TLS/redirect overhead. Combined with `display=swap` (already
  present in the URL), this produces a visible flash of the fallback
  font before swapping to Poppins/Yeseva One once it finally arrives.
- Cloudflare Pages pins **Hugo 0.157.0** (`wrangler.jsonc`'s
  `HUGO_VERSION`); local dev uses 0.163.3. All Hugo Pipes functions used
  below (`resources.Concat`, `fingerprint`, `.Data.Integrity`) are long-
  stable APIs present well before 0.157, confirmed via Hugo's own docs.

## Changes

### 1. JS: bundle, fingerprint, defer

Concatenate the four existing JS files into one bundle, in their current
load order, then minify and fingerprint it:

```go-html-template
{{ $navbarjs := resources.Get "js/navbar.js" }}
{{ $testimonialjs := resources.Get "js/testimonial-carousel.js" }}
{{ $videopopupjs := resources.Get "js/video-popup.js" }}
{{ $formhandler := resources.Get "js/form-handler.js" }}
{{ $bundle := slice $navbarjs $testimonialjs $videopopupjs $formhandler
    | resources.Concat "js/bundle.js" | minify | fingerprint }}
<script defer src="{{ $bundle.RelPermalink }}"
  integrity="{{ $bundle.Data.Integrity }}" crossorigin="anonymous"></script>
```

This replaces the four separate `<script>` tags in `footer.html` with
one. `defer` is safe here: every module already gates its own logic
behind its own `DOMContentLoaded` listener, so deferring execution until
just before that event fires changes nothing about run order or timing
relative to what each module already does — it only lets the browser
fetch the bundle without blocking parsing (moot at this exact position,
since it's the last thing in `<body>`, but harmless and correct
practice). `resources.Concat` requires all inputs share a media type,
which four plain `.js` files already do.

### 2. CSS: fingerprint only, keep blocking

Per your call to avoid FOUC risk, the stylesheet's *loading behavior*
doesn't change — still a normal blocking `<link>` in `<head>`, still the
same `css.Sass | minify` chain. Only fingerprinting is added:

```go-html-template
{{ $style := resources.Get "scss/style.scss" | css.Sass | minify | fingerprint }}
<link href="{{ $style.RelPermalink }}" rel="stylesheet"
  integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous" />
```

Fingerprinting means the filename changes whenever the content does
(`style.<hash>.min.css`), which is what makes it safe to serve this file
with far-future cache headers — a browser that already has last month's
`style.min.css` cached will still fetch this month's the moment the hash
changes, with no manual cache-busting needed.

### 3. Fonts: preconnect + hoist out of the Sass `@import`

Remove the `@import url("https://fonts.googleapis.com/css?family=...")`
line from `assets/scss/_variables.scss` entirely. Add to `head.html`,
before the main stylesheet `<link>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css?family=Poppins:400,500,600,700,800,900|Yeseva+One&display=swap">
```

The `preconnect` hints let the browser start the DNS lookup and TLS
handshake for both Google Fonts domains (`fonts.googleapis.com` serves
the CSS; the actual `.woff2` files come from `fonts.gstatic.com`) as soon
as the HTML parser sees them, in parallel with everything else. Moving
the font stylesheet `<link>` itself into `<head>` means the browser's
preload scanner discovers and starts fetching it immediately on HTML
parse, instead of only after the entire ~116KB main stylesheet has been
fetched and parsed. Net effect: the font-loading waterfall
(HTML → font CSS → font files) starts in parallel with the main
stylesheet fetch instead of strictly after it, shortening the time to
the font swap. `$font-family-base`/`$headings-font-family` in
`_variables.scss` (the actual font-family declarations used throughout
the theme's SCSS) are untouched — only the `@import` line that fetched
the font *files* moves out.

## Non-goals

- No self-hosting of the font files — per your call, staying on Google's
  CDN with `preconnect` rather than vendoring `.woff2` files.
- No CSS code-splitting, critical-CSS extraction, or deferred/
  non-blocking stylesheet loading — per your call, the main stylesheet
  stays a normal blocking `<link>`.
- No JS code-splitting or per-page bundles — all four modules are small
  and every page loads all of them today; splitting would add
  complexity (which pages need which bundle) for a negligible payload
  difference at this site's scale.
- No change to the actual behavior of any of the four JS modules or the
  CSS's visual output — this phase only changes how these assets are
  packaged and delivered, not what they contain.
- No change to `config.toml`, `data/*.yml`, or `content/*.md`.

## Testing/verification

No test suite exists in this repo (per `CLAUDE.md`) — verification is a
`hugo` build plus manual/browser checks, consistent with Phases 1 and 2:

1. **Build weight/request-count comparison:** confirm the build emits one
   fingerprinted JS bundle (not four separate files) and one
   fingerprinted CSS file; confirm the filenames change if the
   underlying content changes (rebuild after a trivial JS edit and
   confirm the hash in the filename changes).
2. **Browser network-panel verification:** load the home page and
   confirmed the JS bundle loads as a single request with a `defer`
   attribute, the CSS loads as before (blocking, in `<head>`), and the
   Google Fonts stylesheet request starts essentially in parallel with
   the main stylesheet request rather than after it finishes (visible in
   the request waterfall/timing).
3. **Functional re-verification:** re-check every behavior Phase 2 built
   (mobile nav toggle, testimonial carousel, video popup, contact form)
   still works correctly now that they're all loaded from one bundled,
   fingerprinted, deferred file — bundling changes delivery, not
   execution, but this is the cheapest place to catch an ordering
   mistake if one exists.
4. **Visual check:** home page, blog list/single, and contact page all
   still render with correct fonts, styling, and no console errors
   (particularly no SRI `integrity` mismatch errors, which would show as
   a blocked resource load in the console).
5. **Cloudflare Pages preview check:** given Phase 2's `RelPermalink`
   lesson, verify this on the actual Cloudflare Pages preview deploy for
   this branch, not only via local `hugo server` — confirm the
   fingerprinted asset URLs and SRI hashes work correctly there too.
