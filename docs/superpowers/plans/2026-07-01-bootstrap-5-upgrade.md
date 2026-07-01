# Bootstrap 5.3 Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the vendored Bootstrap source from 4.5.2 to 5.3.8,
fixing every class/attribute this theme uses that Bootstrap 5 renamed or
removed, and bump the Cloudflare Pages Hugo version pin to match what's
been running locally all along.

**Architecture:** Three sequential tasks — a trivial standalone config
bump, then the Bootstrap source swap itself, then the template/JS fixes
the swap requires. The middle task is expected to leave the contact
form's spacing visibly broken for one commit (Bootstrap 5 simply
doesn't emit CSS for `.form-group`/`.form-row` at all, so those classes
become inert) — that's corrected by the very next task, not a defect in
the middle one.

**Tech Stack:** Hugo Pipes (`css.Sass`), vendored Bootstrap 5.3.8 SCSS
source, `gh api` for fetching the Bootstrap release tarball (`curl`/
`wget` are blocked in this environment's sandbox).

## Global Constraints

- No test suite exists (per `CLAUDE.md`) — verification is `hugo` build
  + browser checks, exactly as every prior phase.
- Every task must be verified on the actual Cloudflare Pages preview
  deploy for its branch, not only via local `hugo server` — this
  project has a documented history of a real bug (Phase 2's
  `Permalink`) and a report-accuracy issue (Phase 3) that only surfaced
  when checked against the deployed Hugo version rather than the local
  one. After this plan's Task 1, local and deployed Hugo versions are
  identical (both 0.163.3), which removes that specific risk going
  forward — but still verify against the live preview per this project's
  established practice.
- Bootstrap 5.3.8 is the exact version to vendor (confirmed via `gh api
  repos/twbs/bootstrap/releases` as the latest 5.3.x patch release, and
  its `scss/` directory structure independently confirmed by fetching
  and inspecting the actual tarball — not assumed from documentation
  alone).
- No visual redesign beyond what's strictly required to keep pages
  rendering the way they did on Bootstrap 4 — the one accepted exception
  is the `.form-row` → `.row.gx-3` gutter approximation, which Task 3
  verifies visually and adjusts if the gutter doesn't match closely
  enough.

---

### Task 1: Bump the Cloudflare Pages Hugo version

**Files:**

- Modify: `wrangler.jsonc`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: nothing later tasks depend on — fully standalone.

- [ ] **Step 1: Update the pinned Hugo version**

In `wrangler.jsonc`, replace:

```jsonc
  "vars": {
    "HUGO_VERSION": "0.157.0"
  }
```

with:

```jsonc
  "vars": {
    "HUGO_VERSION": "0.163.3"
  }
```

- [ ] **Step 2: Build and verify locally**

```bash
cd /Users/rod/build/begbie-hugo
hugo version
rm -rf public && hugo --quiet
```

Expected: `hugo version` reports `v0.163.3` (confirming the version
already installed matches what's now pinned for deployment); the build
succeeds with no errors (this task doesn't change any Hugo template
syntax, so a clean build here just confirms nothing else is broken
before moving on).

- [ ] **Step 3: Commit and push**

```bash
git add wrangler.jsonc
git commit -m "Bump Cloudflare Pages Hugo version to 0.163.3"
git push
```

- [ ] **Step 4: Browser verification against the live preview**

Wait ~60-90 seconds after pushing for Cloudflare Pages to rebuild, then
use the `superpowers-chrome:browsing` skill against this branch's
preview URL (check the PR's Cloudflare bot comment) to load the home
page and confirm it renders normally — this step exists to confirm the
new pinned Hugo version actually builds successfully on Cloudflare's
infrastructure, not just locally. You can also check the Cloudflare
build log directly if the PR/deploy dashboard is accessible, to confirm
the log reports building with `0.163.3`.

---

### Task 2: Vendor Bootstrap 5.3.8's SCSS source and update the import list

**Files:**

- Create: `themes/portio/assets/bootstrap-5.3.8/scss/` (vendored from
  Bootstrap's official v5.3.8 release tarball)
- Modify: `themes/portio/assets/scss/style.scss`
- Delete: `themes/portio/assets/bootstrap-4.5.2/` (entire directory)

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: the new `bootstrap-5.3.8/scss/` path that Task 3's
  `navbar.js` comment update references.

This task is expected to leave the contact form's spacing visibly wrong
(no gap between form fields, no space below each field) once complete —
Bootstrap 5 doesn't emit any CSS for `.form-group`/`.form-row` at all
(they're simply not defined classes anymore), and this task doesn't
touch the templates that use them. That's Task 3's job. Don't try to
fix template classes in this task — verify only that the build succeeds
and that pages *other than the contact form's field spacing* look right
(nav, hero, buttons, grid layout, breadcrumbs).

- [ ] **Step 1: Fetch Bootstrap 5.3.8's source and extract just `scss/`**

`curl`/`wget` are blocked in this environment — use `gh api` to fetch
the release tarball instead:

```bash
cd /Users/rod/build/begbie-hugo
mkdir -p /tmp/bootstrap-5.3.8-fetch
cd /tmp/bootstrap-5.3.8-fetch
gh api repos/twbs/bootstrap/tarball/v5.3.8 > bootstrap.tar.gz
tar -xzf bootstrap.tar.gz
ls
```

Expected: a single directory matching `twbs-bootstrap-<shortsha>/`.

- [ ] **Step 2: Copy just the `scss/` directory into the theme**

```bash
cd /Users/rod/build/begbie-hugo
EXTRACTED_DIR=$(find /tmp/bootstrap-5.3.8-fetch -maxdepth 1 -type d -name "twbs-bootstrap-*")
mkdir -p themes/portio/assets/bootstrap-5.3.8
cp -R "$EXTRACTED_DIR/scss" themes/portio/assets/bootstrap-5.3.8/scss
rm -rf /tmp/bootstrap-5.3.8-fetch
ls themes/portio/assets/bootstrap-5.3.8/scss/ | head -20
ls themes/portio/assets/bootstrap-5.3.8/scss/utilities/
```

Expected: `_variables.scss`, `_variables-dark.scss`, `_maps.scss`,
`_containers.scss` all present at the top level; `_api.scss` present
inside `utilities/`.

- [ ] **Step 3: Delete the old Bootstrap 4.5.2 vendor directory**

```bash
rm -rf themes/portio/assets/bootstrap-4.5.2
```

- [ ] **Step 4: Update the import list in `style.scss`**

In `themes/portio/assets/scss/style.scss`, replace:

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

with:

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

Note the last line moved from plain `utilities` to `utilities/api` —
Bootstrap 5 splits the utilities system into an early import (Sass
infrastructure, still needed in its original position) and this new one
that actually generates the utility CSS classes (`.d-flex`, `.text-*`,
`.mb-*`, etc.). Without it, none of those classes would exist in the
compiled output at all.

- [ ] **Step 5: Build and read every error carefully**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public && hugo --quiet
```

If this fails with a Sass error naming an undefined variable or mixin
(for example, if `$link-hover-decoration` no longer exists in Bootstrap
5.3, which the design doc flagged as unconfirmed), that error message
names the exact problem — resolve it by checking Bootstrap 5.3.8's
actual `themes/portio/assets/bootstrap-5.3.8/scss/_variables.scss` for
the correct current variable name, and updating
`themes/portio/assets/scss/_variables.scss`'s override to match. Do not
guess at a fix — grep the vendored `_variables.scss` for the closest
matching variable name and use exactly what's there.

If the build succeeds, continue to Step 6.

- [ ] **Step 6: Verify the compiled CSS actually has utility classes**

```bash
grep -c '\.d-flex' public/scss/style.min.*.css
grep -c '\.text-center' public/scss/style.min.*.css
```

Expected: both commands report at least 1 match. If either reports 0,
the `utilities/api` import (Step 4) isn't wired correctly — re-check
its placement (must be the very last Bootstrap import, after every
component partial).

- [ ] **Step 7: Push and check the Cloudflare Pages preview build log**

```bash
git add themes/portio/assets/bootstrap-5.3.8 themes/portio/assets/scss/style.scss
git add themes/portio/assets/bootstrap-4.5.2
git commit -m "Vendor Bootstrap 5.3.8 scss source, replacing 4.5.2"
git push
```

(`git add` on the already-`rm -rf`'d `bootstrap-4.5.2` path stages its
deletion — this is the standard idiom when a path was removed with a
plain `rm` rather than `git rm`.)

Check the Cloudflare Pages build log for this push succeeds (a Sass
compile failure would show there even if it somehow passed locally due
to a Hugo version difference — though Task 1 already closed that gap).

- [ ] **Step 8: Browser verification (excluding contact form field spacing)**

Wait ~60-90 seconds, then use the `superpowers-chrome:browsing` skill
against the live preview URL. Check the home page (hero, about, resume,
testimonials, blog preview), blog list, and a blog single post — confirm
grid layout, buttons, spacing, and the mobile nav toggle all look
correct. Do NOT flag the contact page's form field spacing as a
regression in this task — that's expected and addressed in Task 3.
Do check that the contact page's overall layout (not field-level
spacing) and breadcrumb still render.

---

### Task 3: Fix the classes and attributes Bootstrap 5 renames

**Files:**

- Modify: `themes/portio/layouts/contact/list.html`
- Modify: `themes/portio/layouts/partials/aboutSection.html`
- Modify: `themes/portio/layouts/portfolio/single.html`
- Modify: `themes/portio/layouts/partials/skillSection.html`
- Modify: `themes/portio/layouts/partials/navbar.html`
- Modify: `themes/portio/assets/js/navbar.js`

**Interfaces:**

- Consumes: the `bootstrap-5.3.8/scss/` path Task 2 created (this
  task's `navbar.js` comment update references it).
- Produces: nothing later — this is the last task.

- [ ] **Step 1: Fix the live contact form**

In `themes/portio/layouts/contact/list.html`, replace:

```html
            <div class="form-row">

              <div class="form-group col-md-6 pr-3">
                <input type="text" class="form-control" name="Name" placeholder="Name" required />
              </div>
              <div class="form-group col-md-6">
                <input type="email" class="form-control" name="email" placeholder="Email" required />
              </div>
            </div>

            <div class="form-group">
              <textarea class="form-control" id="message" rows="6" name="message" placeholder="Message"></textarea>
            </div>

            <div class="form-group">
              <div class="form-check small">
```

with:

```html
            <div class="row gx-3">

              <div class="col-md-6 pe-3 mb-3">
                <input type="text" class="form-control" name="Name" placeholder="Name" required />
              </div>
              <div class="col-md-6 mb-3">
                <input type="email" class="form-control" name="email" placeholder="Email" required />
              </div>
            </div>

            <div class="mb-3">
              <textarea class="form-control" id="message" rows="6" name="message" placeholder="Message"></textarea>
            </div>

            <div class="mb-3">
              <div class="form-check small">
```

(The commented-out example form further down in the same file, inside
`<!-- <form> ... </form> -->`, is dead markup and stays untouched — same
call Phase 2 made for the hidden résumé tab.)

- [ ] **Step 2: Fix `aboutSection.html`**

In `themes/portio/layouts/partials/aboutSection.html`, replace:

```html
                            <a class="btn btn-primary mr-3 btn-zoom"
```

with:

```html
                            <a class="btn btn-primary me-3 btn-zoom"
```

- [ ] **Step 3: Fix `portfolio/single.html` (unreachable, fixed anyway)**

In `themes/portio/layouts/portfolio/single.html`, replace:

```html
            <div class="icon mr-3">
```

with:

```html
            <div class="icon me-3">
```

Replace:

```html
            <div class=" content text-right">
```

with:

```html
            <div class="content text-end">
```

Replace:

```html
            <div class="icon ml-3">
```

with:

```html
            <div class="icon ms-3">
```

- [ ] **Step 4: Fix `skillSection.html` (unreachable, fixed anyway)**

In `themes/portio/layouts/partials/skillSection.html`, replace:

```html
                        <div class="progress-value float-right"><span>{{ .percent }}</span>%</div>
```

with:

```html
                        <div class="progress-value float-end"><span>{{ .percent }}</span>%</div>
```

- [ ] **Step 5: Rename the mobile nav's data attributes**

In `themes/portio/layouts/partials/navbar.html`, replace:

```html
    <button type="button" class="navbar-toggler collapsed" data-toggle="collapse" data-target="#navbarCollapse">
```

with:

```html
    <button type="button" class="navbar-toggler collapsed" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
```

In `themes/portio/assets/js/navbar.js`, replace:

```javascript
  var toggler = document.querySelector('[data-toggle="collapse"]');
  var navbar = document.querySelector(".navbar");

  if (toggler) {
    var targetSelector = toggler.getAttribute("data-target");
    var collapseEl = document.querySelector(targetSelector);
    // 350ms matches $transition-collapse in
    // themes/portio/assets/bootstrap-4.5.2/scss/_variables.scss
    var COLLAPSE_DURATION = 350;
```

with:

```javascript
  var toggler = document.querySelector('[data-bs-toggle="collapse"]');
  var navbar = document.querySelector(".navbar");

  if (toggler) {
    var targetSelector = toggler.getAttribute("data-bs-target");
    var collapseEl = document.querySelector(targetSelector);
    // 350ms matches $transition-collapse in
    // themes/portio/assets/bootstrap-5.3.8/scss/_variables.scss
    var COLLAPSE_DURATION = 350;
```

(The 350ms value itself is unchanged — confirmed identical in Bootstrap
5.3.8's `_variables.scss`: `$transition-collapse: height .35s ease;`,
same as Bootstrap 4. Only the comment's file path reference needed
updating.)

- [ ] **Step 6: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
rm -rf public && hugo --quiet
grep -o 'form-group\|form-row' public/index.html public/contact/index.html 2>/dev/null || echo "no form-group/form-row classes remain in output, as expected"
```

- [ ] **Step 7: Push and browser-verify against the live preview**

```bash
git add themes/portio/layouts/contact/list.html \
  themes/portio/layouts/partials/aboutSection.html \
  themes/portio/layouts/portfolio/single.html \
  themes/portio/layouts/partials/skillSection.html \
  themes/portio/layouts/partials/navbar.html \
  themes/portio/assets/js/navbar.js
git commit -m "Fix Bootstrap 5 class/attribute renames across templates"
git push
```

Wait ~60-90 seconds, then use the `superpowers-chrome:browsing` skill
against the live preview URL:

- **Contact page:** confirm the Name/Email fields sit side by side with
  visible spacing between them, and there's a visible gap below each
  field group (message textarea, checkbox row) — compare against how it
  looked before this whole upgrade (screenshot or your own memory of the
  site). If the gutter between Name/Email looks noticeably tighter or
  wider than it used to, try `.row.gx-2` or `.row.gx-4` in place of
  `.row.gx-3` from Step 1 and rebuild/re-check until it looks right.
- **Home page:** hero section's button (`mr-3`→`me-3` doesn't touch the
  home page directly, but confirm nothing regressed), mobile nav toggle
  opens/closes correctly with the renamed `data-bs-toggle`/
  `data-bs-target` attributes.
- **Console check:** zero JS errors (confirms `navbar.js`'s updated
  selector still finds the toggle button).
