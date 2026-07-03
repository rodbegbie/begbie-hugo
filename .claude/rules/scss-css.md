---
paths:
  - "themes/portio/assets/scss/**/*.scss"
---

# SCSS/CSS Gotchas

- **SVG `<stop>` elements need `style="stop-color: var(--x)"`, not `stop-color="var(--x)"`.** The
  bare presentation attribute doesn't resolve CSS custom properties — only the `style` attribute
  goes through the CSS cascade. Applies to any gradient referencing a design token.

- **Bootstrap's `$utilities` map is trimmed to only what's currently used** (see
  `themes/portio/assets/scss/_utilities-trim.scss`) — down from Bootstrap's ~50 default utility
  categories to the 11 this site actually uses (`display`, `justify-content`, `align-items`,
  `margin-top`/`-end`/`-bottom`/`-x`/`-y`, `padding`, `text-align`, `color`), each restricted to
  only its in-use values. `$grid-breakpoints`/`$container-max-widths` are similarly trimmed to
  `xs`/`sm`/`md`/`lg` (`xl`/`xxl` unused). If a template needs a stock Bootstrap utility class not
  already covered (e.g. `mt-3`, `bg-primary`, `rounded-pill`), it silently resolves to no CSS —
  not a build error. Add the missing key/value to `_utilities-trim.scss` rather than assuming any
  Bootstrap utility class will work out of the box. The `forms` and `pagination` Bootstrap SCSS
  modules are no longer imported either (zero/near-zero usage) — re-add the import in
  `style.scss` if a future page actually needs form controls or paginated listings.

- **`position: relative` alone does NOT create a stacking context.** A child with `z-index: -1`
  needs its positioned ancestor to also declare `z-index` (even `z-index: 0`), or the negative
  z-index escapes to a page-wide shared layer *below every section's own background* — including
  sections with an opaque background that then paint over it, making the child invisible with no
  error. Every section that wraps a decorative blob (`.hero`, `.about_content-thumb`,
  `.blog-preview`, `.breadCrumb`, `.singleBlog__feature`, `.footer`) sets `position: relative;
  z-index: 0;` together for this reason — keep them paired in any new section.
