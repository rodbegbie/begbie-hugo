---
paths:
  - "themes/portio/layouts/**/*.html"
---

# Hugo Template Gotchas

- **Clear the Hugo cache before testing image changes.** Run `rm -rf public resources/_gen
  .hugo_build.lock` before `hugo`/`hugo server` when iterating on `.Fill`/`.Resize` calls — Hugo
  caches processed image variants keyed by the processing-spec string, and stale cached files can
  mask whether an edit actually took effect.

- **Responsive images use width-descriptor srcset + `sizes`, not `1x`/`2x`.** Bootstrap 5's grid
  makes `.row > *` full-width by default below the column's breakpoint (e.g. `col-lg-4` is 100%
  wide below `lg`), so images/thumbnails often render *larger* on mobile/tablet than in a desktop
  multi-column layout — the opposite of the naive assumption. Compute real per-breakpoint CSS
  widths from the actual column math before picking `sizes` breakpoints for any new responsive
  image.

- **The exact `sizes` formula for this theme's grid:** container is capped at
  `$content-max-width` (1280px, border-box) with 40px padding each side, and Bootstrap's default
  24px gutter. For a column spanning `k` of 12 grid units, rendered image width =
  `(C + 24) * k/12 - 24`, where `C = min(vw, 1280) - 80`. This reduces to exactly `C` (i.e.
  `calc(100vw - 80px)` below the cap) for a full-width single column — the row's negative margin
  cancels the column's own gutter padding at the container edges, so do **not** additionally
  subtract 24px for a stacked/single-column case (an easy double-subtraction mistake). Verify
  against Lighthouse's mobile "oversized image" audit, which emulates a 412px-wide viewport:
  `sizes` should evaluate to `412 - 80 = 332px` for any single-column image at that width — if
  Lighthouse reports different "displayed dimensions", the formula is wrong. Also add a srcset
  candidate near the smallest expected display width (e.g. 332w) — coarse steps (500w/750w) make
  browsers overshoot to the next size up even with a correct `sizes` attribute.

- **`featureImageAnchor` front matter** (e.g. `Left`, `TopLeft`, `Center`) overrides Hugo's
  default `smart` crop anchor for a post's `featureImage`, applied via
  `.Params.featureImageAnchor | default "smart"` in both the thumbnail and banner `Fill` calls.

- **Hugo's `smart` crop anchor can clip a portrait's headroom.** For hero/about-style headshots,
  `Top`-anchored `.Fill` calls are a safer default than `smart` when the subject's hair/head must
  stay fully visible — `smart` optimizes for overall visual interest, not for "don't cut off the
  top of the frame."

- **Hugo template scoping inside nested `with`/`range`:** `.` becomes the resource (not the page)
  inside `{{ with resources.Get ... }}`, and `$` still refers to the template's original
  entrypoint context (not the loop item) inside `{{ range }}` — capture `{{ $post := . }}` before
  entering nested scopes if you need page fields inside them.

- **JSON-LD in `<script>` tags needs `| safeJS`** after `| jsonify` — otherwise Go's
  `html/template` autoescaper treats the bare text as a JS string literal and double-encodes the
  whole blob.

- **Passing a variable into `style="..."` in a Go template trips the CSS-context auto-escaper** —
  `style="stop-color: {{ $color }}"` silently renders literal `ZgotmplZ` instead of the value if
  `$color` isn't a compile-time string literal. Build the string with `printf` and pipe through
  `| safeCSS`: `style="{{ printf "stop-color: %s;" $color | safeCSS }}"`. Always grep the built
  `public/` output for `ZgotmplZ` after adding a partial with dynamic inline styles — it fails
  silently, no build error.

- **External links get `target="_blank"` via a render hook, not `unsafe = true`.**
  `themes/portio/layouts/_default/_markup/render-link.html` compares the link's host against
  `site.BaseURL` and adds `target="_blank" rel="noopener noreferrer"` only for external links.
  Don't re-enable `markup.goldmark.renderer.unsafe` in `config.toml` — it disables HTML
  sanitization for every markdown field on the site to solve a problem this hook already covers.
