# Homepage visual redesign

## Context

Claude Design produced a full visual refresh of the homepage at
`coaching.begbie.com`, delivered as a design handoff zip
(`design_handoff_coaching_landing_page/`) containing a high-fidelity
HTML prototype (`Coaching Landing Page.dc.html`), a detailed `README.md`
spec, and six full-page screenshots. The handoff's own instructions are
explicit: this is a design reference, not production code — recreate it
as Hugo templates/partials in this repo's existing theme (`portio`),
reusing the theme's build pipeline, not shipped as static HTML.

Goal per the handoff: modernize the dated look/typography, add visual
energy, and give testimonials/credibility more prominence. Colors,
typography, spacing, and copy in the prototype are marked **final** —
this spec treats those as fixed and focuses on how they map onto this
Hugo codebase, plus resolving what the handoff explicitly left
unfinished (responsive/mobile behavior, one broken design token, video
badge copy, article teaser copy).

Cross-checking the prototype against the current site turned up a
close structural match: the nav's menu items, anchors, and "Work With
Me" pill already exist in `config.toml`/`navbar.html`; the footer
(`footer.html`) already combines a two-column Coaching/Email CTA band
with the copyright/social row under `id="contact"`, matching the
prototype's Contact + Footer sections; `data/testimonialSection.yml`
already has exactly 3 real testimonials; `data/resumeSection.yml`'s
first four entries are already the four most recent roles the
prototype's Experience grid shows (Splice, Volley Games, Discord,
Dropbox); `data/hero.yml` already has the real video URL
(`https://www.youtube.com/watch?v=xnZAMk-xIGk`) the prototype's video
badge needs. This is a skin-and-reshape change, not a rebuild.

## Approach

One branch, one PR, in-place edits — no parallel/duplicate files. This
is a cohesive visual-identity change (new fonts, new accent color, new
component style); shipping it section-by-section would leave the live
site visually inconsistent between merges, so it's built incrementally
in commits on one branch and landed as a single PR.

Edits are token-first: a new `_tokens.scss` defines the design's CSS
custom properties once, and every component SCSS file is updated to
consume those tokens rather than hardcoding values per component.
Bootstrap's grid classes (`row`/`col-lg-*`) are kept for structure,
since the prototype's column proportions (hero 58/42, about 30/70,
4-up experience grid, 3-up testimonial/writing grids) map directly onto
Bootstrap's 12-column grid — no need to replace the layout system to
match this design.

## Design tokens & typography

`themes/portio/assets/scss/_tokens.scss` (new file) defines, as CSS
custom properties, the prototype's palette exactly as given:

- `--bg`, `--bgAlt`, `--ink`, `--inkSoft` — oklch neutrals
- `--accent` (`#0E8A8F`, teal — the chosen final accent), `--accentInk`
- `--accentSoft` — derived from `--accent` via
  `color-mix(in oklch, var(--accent) 12%, white)` rather than the
  hardcoded value in the prototype, which the handoff itself flags as
  stale (authored against an earlier violet accent, never re-derived
  when the accent changed to teal)
- `--line` — hairline border color

Every component's SCSS references these tokens instead of hardcoded
hex values, so future accent/palette changes are single-point edits.

Fonts: Bricolage Grotesque (display, 700/800) + Instrument Sans (body,
400–700), loaded via the Google Fonts CDN `<link>` in `head.html`
exactly as the prototype specifies, replacing whatever font the theme
currently loads.

Type scale, spacing (1280px max content width, 40px horizontal
padding, 60–80px section vertical padding), and radii (999px pills,
20–24px cards, 16px article images) are ported as given from the
handoff's README, expressed as SCSS variables so they're reused
consistently rather than copy-pasted per component.

## Section-by-section mapping

**Nav** (`navbar.html`) — structurally correct already (fixed-top,
same menu anchors, "Work With Me" pill already present). Restyle only:
padding, logo weight/type, link opacity, pill CTA styling. No markup
changes.

**Hero** (`hero.html`, `data/hero.yml`) — restyle to the 58/42
two-column split. Add a new `eyebrow` field to `hero.yml` for the pill
label ("SOFTWARE ENGINEERING LEADERSHIP COACH"). Highlight one
accent-colored word in the headline — requires either a small markup
change (wrap the word in a span) or splitting the headline into
prefix/accent/suffix fields in the data. Add the second "Watch intro"
outline CTA alongside the existing "Contact me" pill. Restyle the
existing video badge (already wired to `videoURL`/`videoThumb`) to the
new floating-pill treatment, with copy:

> ▶ Watch: Being Right is Only Half the Battle (30 min)

linking to the existing `https://www.youtube.com/watch?v=xnZAMk-xIGk`.
Swap the old background SVG/blob markup for the new CSS-only blob
technique (see Known Gaps below). Add the `fadeUp` load-in animation.

**About** (`aboutSection.html`, `data/aboutSection.yml`) — restyle to
the 30/70 split with the CSS blob. Content is already correct; add the
"ABOUT" eyebrow label and tighten the heading to the prototype's
shorter style, drafted from the existing bio content and reviewed by
Rod before merge.

**Experience — "Where I've led"** (`resumeSection.html`,
`data/resumeSection.yml`) — restyle to a 4-card grid pulling only the
first 4 `education` entries (already the 4 most recent roles). Each
card needs year/title/company/description as separate fields rather
than one markdown blob, so `resumeSection.yml`'s first four entries
gain structured fields alongside (not replacing) the existing markdown
content used elsewhere. Add a new `earlier` field/line below the grid:

> Earlier: VP Eng at Anova Culinary, Co-Founder/CTO at Sosh, EM at
> Slide.

with a "Full story on LinkedIn →" link to the existing LinkedIn URL.

**Testimonials** (`testimonialSection.html`,
`data/testimonialSection.yml`) — restyle to the 3-card grid (data
already has exactly 3 real testimonials). Preserve the alternating
inverted-middle-card treatment. Drop styling for the unused `star`
field — not part of the new design.

**Writing — "Recent for LeadDev"** (`blogSection.html`) — restyle the
existing 3-post pull to the new card style with a teaser line per
post. Teaser copy is pulled from each post's existing excerpt/dek
where available; posts without one get a one-line teaser drafted from
the article and flagged for Rod's review.

**Contact + Footer** (`footer.html`) — restyle the existing combined
Coaching/Email two-column CTA band to the dark full-bleed treatment
with pill CTAs; restyle the copyright/social row to match. No markup
restructuring needed — the sections already exist as one partial.

## Responsive / mobile design

The handoff explicitly left this undesigned (fixed 1280px desktop
layout only, called out under Known Gaps). This spec defines it,
following the theme's existing Bootstrap `lg`/`md`/`sm` breakpoint
conventions rather than introducing a new system:

- **Nav** — collapses via the existing hamburger/`navbar-toggler`
  pattern already wired up in `navbar.html` (JS untouched), restyled
  to match the new visual language.
- **Hero & About** — stack to a single column below `lg` (hero photo
  below content, matching the current theme's stacking order; about
  photo above content, as an introductory element). The headline's
  existing `min(6vw, 74px)` fluid clamp already handles scaling.
- **Experience grid** — 4-up → 2-up at `md` → 1-up at `sm`, Bootstrap's
  standard collapse pattern.
- **Testimonials / Writing grids** — 3-up → 1-up at `md` (stacking
  reads better than an uneven 2+1 split at tablet width for quote/
  article content).
- **Video badge** — currently absolutely positioned overlapping the
  photo's bottom-left corner. Below `md`, this risks clipping against
  stacked content, so it reflows to sit as a static element directly
  below the photo instead of overlapping.
- **Blobs** — scaled down or hidden below `sm` if they cause
  horizontal scroll or clutter at narrow widths. Purely decorative and
  `pointer-events`-free, so hiding them costs nothing functionally.

## Known gaps carried from the handoff

- **`--accentSoft` token bug** — fixed as described above, derived
  from `--accent` instead of hardcoded.
- **Video badge copy/link** — resolved: "Being Right is Only Half the
  Battle (30 min)", linking to the existing YouTube URL already in
  `data/hero.yml`.
- **Writing card teaser copy** — resolved per-post from existing
  excerpts where available, drafted and flagged for review otherwise.
- **No sticky nav / mobile menu / scroll animations were designed** —
  sticky nav and mobile menu already exist in the current theme and
  are preserved as-is (just restyled); no scroll-triggered animations
  are added, matching the handoff's statement that this pass has no
  other JS-driven interactions.

## Testing / verification plan

- `hugo server -D` locally throughout implementation, checking each
  section against the handoff's screenshots as visual reference (not
  pixel-diffing — the screenshots use placeholder imagery).
- Clear Hugo's image cache
  (`rm -rf public resources/_gen .hugo_build.lock`) before any final
  image-related checks, per this repo's known caching gotcha with
  `.Fill`/`.Resize` calls.
- Manually resize the browser through `lg`/`md`/`sm` breakpoints,
  checking nav collapse, hero/about stacking, grid reflow, and the
  video badge's mobile reflow.
- Verify all real links: nav anchors, video badge → YouTube URL,
  "Full story on LinkedIn →", "See more essays →" → `/blog`,
  Contact/Email → `mailto:rod@begbie.com`.
- Confirm the JSON-LD structured-data partial still renders correctly
  — untouched by this work, but verify no layout regression broke
  anything referencing DOM structure.
- No test suite exists in this repo; verification is build + dev
  server + manual browser check, consistent with this project's
  established pattern.
