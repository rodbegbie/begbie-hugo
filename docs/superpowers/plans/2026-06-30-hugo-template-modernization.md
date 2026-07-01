# Hugo Template Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `.Site.X` template access with the global `site` function,
and raw `.Site.BaseURL` string concatenation with `absURL`, across the
vendored `portio` theme — zero change to rendered output.

**Architecture:** Mechanical, file-by-file template edits in
`themes/portio/layouts`. Each task is verified the same way: build the site
with `hugo` before the edit, capture the specific generated page(s) that
template touches, make the edit, rebuild, and diff — expect byte-identical
output.

**Tech Stack:** Hugo 0.157.0 static site generator (Go templates). No test
framework — Hugo's own build output is the test oracle.

## Global Constraints

- No change to any rendered HTML/CSS/JS output (see spec's Non-goals).
- Scope is exactly these 8 files under `themes/portio/layouts`: `partials/
  navbar.html`, `partials/footer.html`, `partials/head.html`, `partials/
  blogSection.html`, `partials/portfolioSection.html`, `blog/list.html`,
  `blog/single.html`, `contact/list.html`. Do not touch SCSS, Bootstrap, JS,
  `themes/portio/exampleSite`, `data/*.yml`, or `content/*.md`.
- `hugo` must be run from the repo root (`/Users/rod/build/begbie-hugo`); it
  reads `config.toml` and writes to `public/` (gitignored, safe to
  overwrite).

---

## Task 1: Modernize global chrome partials (head, navbar, footer)

**Files:**

- Modify: `themes/portio/layouts/partials/head.html:8`
- Modify: `themes/portio/layouts/partials/navbar.html` (whole file)
- Modify: `themes/portio/layouts/partials/footer.html:40,48,55,65,81,87,99`

These three partials are included by `themes/portio/layouts/_default/
baseof.html` and render on every page, so verification diffs the entire
`public/` tree.

- [ ] **Step 1: Capture baseline output for the whole site**

```bash
hugo
BASELINE=$(mktemp -d)
cp -R public "$BASELINE/public-before"
echo "$BASELINE"
```

Keep the printed `$BASELINE` path — you'll need it in step 3.

- [ ] **Step 2: Edit `head.html`**

Replace:

```html
{{- with .Description | default .Params.subtitle | default .Site.Params.subtitle | default .Summary }}
```

With:

```html
{{- with .Description | default .Params.subtitle | default site.Params.subtitle | default .Summary }}
```

- [ ] **Step 3: Edit `navbar.html`**

Replace the whole file:

```html
<nav class="navbar navbar-expand-lg fixed-top">
  <div class="container">
    <a href="{{ .Site.BaseURL }}" class="navbar-brand">
      <!-- <img src="{{ .Site.Params.logo | absURL }}" alt="site-logo"> -->
      Rod Begbie
    </a>
    <button type="button" class="navbar-toggler collapsed" data-toggle="collapse" data-target="#navbarCollapse">
      <span class="navbar-toggler-icon"></span>
      <span class="navbar-toggler-icon"></span>
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-between" id="navbarCollapse">
      <ul class="nav navbar-nav main-navigation my-0 mx-auto">
        {{ $menu := .Site.Menus.main }}
        {{ range $index, $element := $menu }}
        <li class="nav-item">
          <a href="{{ $.Site.BaseURL }}{{ .URL }}"
            class="nav-link text-dark text-sm-center p-2 {{ if $.IsHome }}scroll{{ end }}">{{ .Name }}</a>
        </li>
        {{ end }}
      </ul>
      <div class="navbar-nav">
        <a href="{{ $.Site.BaseURL }}#contact" class="btn btn-primary btn-zoom hire_button">Work With Me</a>
      </div>
    </div>
  </div>
</nav>
```

With:

```html
<nav class="navbar navbar-expand-lg fixed-top">
  <div class="container">
    <a href="{{ "" | absURL }}" class="navbar-brand">
      <!-- <img src="{{ site.Params.logo | absURL }}" alt="site-logo"> -->
      Rod Begbie
    </a>
    <button type="button" class="navbar-toggler collapsed" data-toggle="collapse" data-target="#navbarCollapse">
      <span class="navbar-toggler-icon"></span>
      <span class="navbar-toggler-icon"></span>
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-between" id="navbarCollapse">
      <ul class="nav navbar-nav main-navigation my-0 mx-auto">
        {{ range $index, $element := site.Menus.main }}
        <li class="nav-item">
          <a href="{{ .URL | absURL }}"
            class="nav-link text-dark text-sm-center p-2 {{ if $.IsHome }}scroll{{ end }}">{{ .Name }}</a>
        </li>
        {{ end }}
      </ul>
      <div class="navbar-nav">
        <a href="{{ "#contact" | absURL }}" class="btn btn-primary btn-zoom hire_button">Work With Me</a>
      </div>
    </div>
  </div>
</nav>
```

- [ ] **Step 4: Edit `footer.html`**

Replace each of these seven lines individually (they're not contiguous —
three are inside the commented-out sitemap/address widget block, which is
still template-evaluated even though it renders as an HTML comment):

Line 40, replace:

```html
<a class="btn btn-light btn-zoom" href="{{ .Site.Params.contactLink | absURL }}">Email me</a>
```

With:

```html
<a class="btn btn-light btn-zoom" href="{{ site.Params.contactLink | absURL }}">Email me</a>
```

Line 48, replace:

```html
<img src="{{ .Site.Params.footerLogo | absURL }}" alt="widget-logo">
```

With:

```html
<img src="{{ site.Params.footerLogo | absURL }}" alt="widget-logo">
```

Line 55, replace:

```html
{{ $sitemap := .Site.Menus.sitemap }}
```

With:

```html
{{ $sitemap := site.Menus.sitemap }}
```

Line 65, replace:

```html
{{ $address := .Site.Params.address }}
```

With:

```html
{{ $address := site.Params.address }}
```

Line 81, replace:

```html
<p>{{ .Site.Params.copyright }}</p>
```

With:

```html
<p>{{ site.Params.copyright }}</p>
```

Line 87, replace:

```html
{{ $social := .Site.Params.social }}
```

With:

```html
{{ $social := site.Params.social }}
```

Line 99, replace:

```html
<!-- <script src="https://maps.googleapis.com/maps/api/js?key={{ .Site.Params.map.APIkey }}&libraries=geometry"></script> -->
```

With:

```html
<!-- <script src="https://maps.googleapis.com/maps/api/js?key={{ site.Params.map.APIkey }}&libraries=geometry"></script> -->
```

- [ ] **Step 5: Verify no `.Site` references remain in these three files**

```bash
grep -n '\.Site\b' themes/portio/layouts/partials/head.html \
  themes/portio/layouts/partials/navbar.html \
  themes/portio/layouts/partials/footer.html
```

Expected: no output (no matches).

- [ ] **Step 6: Rebuild and diff the whole site against the baseline**

```bash
hugo
diff -rq "$BASELINE/public-before" public
```

Expected: no output (identical trees). If there's a difference, stop and
investigate before continuing — do not proceed to Task 2 with an unexplained
diff.

- [ ] **Step 7: Clean up and commit**

```bash
rm -rf "$BASELINE"
git add themes/portio/layouts/partials/head.html \
  themes/portio/layouts/partials/navbar.html \
  themes/portio/layouts/partials/footer.html
git commit -m "Modernize global chrome partials to site/absURL"
```

---

## Task 2: Modernize homepage section partials (blogSection, portfolioSection)

**Files:**

- Modify: `themes/portio/layouts/partials/blogSection.html:23`
- Modify: `themes/portio/layouts/partials/portfolioSection.html:16`

Both partials are only rendered on the homepage
(`themes/portio/layouts/index.html`), so verification diffs `public/
index.html`. Note `portfolioSection` is currently disabled
(`data/portfolioSection.yml` has `enable: false`), so its body doesn't
render at all right now — the edit still matters for correctness the day it
gets re-enabled, and the diff should show zero change either way.

- [ ] **Step 1: Capture baseline output for the homepage**

```bash
hugo
BASELINE=$(mktemp -d)
cp public/index.html "$BASELINE/index.html.before"
echo "$BASELINE"
```

- [ ] **Step 2: Edit `blogSection.html`**

Replace:

```html
{{ range first 3 (where $.Site.RegularPages "Type" "!=" "portfolio") }}
```

With:

```html
{{ range first 3 (where site.RegularPages "Type" "!=" "portfolio") }}
```

- [ ] **Step 3: Edit `portfolioSection.html`**

Replace:

```html
{{ range (where $.Site.RegularPages "Type" "portfolio").Reverse }}
```

With:

```html
{{ range (where site.RegularPages "Type" "portfolio").Reverse }}
```

- [ ] **Step 4: Verify no `.Site` references remain in these two files**

```bash
grep -n '\.Site\b' themes/portio/layouts/partials/blogSection.html \
  themes/portio/layouts/partials/portfolioSection.html
```

Expected: no output.

- [ ] **Step 5: Rebuild and diff the homepage against the baseline**

```bash
hugo
diff "$BASELINE/index.html.before" public/index.html
```

Expected: no output. If there's a difference, stop and investigate.

- [ ] **Step 6: Clean up and commit**

```bash
rm -rf "$BASELINE"
git add themes/portio/layouts/partials/blogSection.html \
  themes/portio/layouts/partials/portfolioSection.html
git commit -m "Modernize homepage section partials to site.RegularPages"
```

---

## Task 3: Modernize blog templates (list, single)

**Files:**

- Modify: `themes/portio/layouts/blog/list.html:30`
- Modify: `themes/portio/layouts/blog/single.html:10-11`

Verification diffs the blog index page and one representative post page.

- [ ] **Step 1: Capture baseline output for the blog pages**

```bash
hugo
BASELINE=$(mktemp -d)
cp public/blog/index.html "$BASELINE/blog-index.html.before"
cp public/blog/job-success-profiles/index.html \
  "$BASELINE/blog-post.html.before"
echo "$BASELINE"
```

- [ ] **Step 2: Edit `blog/list.html`**

Replace:

```html
<li class="breadcrumb-item"><a href="{{ .Site.BaseURL }}">Home</a></li>
```

With:

```html
<li class="breadcrumb-item"><a href="{{ "" | absURL }}">Home</a></li>
```

- [ ] **Step 3: Edit `blog/single.html`**

Replace:

```html
<li class="breadcrumb-item"><a href={{ .Site.BaseURL }}>Home</a></li>
<li class="breadcrumb-item"><a href={{ .Site.Params.blogPageURL | absURL }}>All Posts</a></li>
```

With:

```html
<li class="breadcrumb-item"><a href={{ "" | absURL }}>Home</a></li>
<li class="breadcrumb-item"><a href={{ site.Params.blogPageURL | absURL }}>All Posts</a></li>
```

- [ ] **Step 4: Verify no `.Site` references remain in these two files**

```bash
grep -n '\.Site\b' themes/portio/layouts/blog/list.html \
  themes/portio/layouts/blog/single.html
```

Expected: no output.

- [ ] **Step 5: Rebuild and diff both pages against the baseline**

```bash
hugo
diff "$BASELINE/blog-index.html.before" public/blog/index.html
diff "$BASELINE/blog-post.html.before" \
  public/blog/job-success-profiles/index.html
```

Expected: no output from either diff. If there's a difference, stop and
investigate.

- [ ] **Step 6: Clean up and commit**

```bash
rm -rf "$BASELINE"
git add themes/portio/layouts/blog/list.html \
  themes/portio/layouts/blog/single.html
git commit -m "Modernize blog templates to site/absURL"
```

---

## Task 4: Modernize contact template

**Files:**

- Modify: `themes/portio/layouts/contact/list.html:30,39,116,182`

Verification diffs the contact page.

- [ ] **Step 1: Capture baseline output for the contact page**

```bash
hugo
BASELINE=$(mktemp -d)
cp public/contact/index.html "$BASELINE/contact.html.before"
echo "$BASELINE"
```

- [ ] **Step 2: Edit `contact/list.html`**

Line 30, replace:

```html
<li class="breadcrumb-item"><a href="{{ .Site.BaseURL }}">Home</a></li>
```

With:

```html
<li class="breadcrumb-item"><a href="{{ "" | absURL }}">Home</a></li>
```

Line 39, replace:

```html
{{ $address := .Site.Params.address }}
```

With:

```html
{{ $address := site.Params.address }}
```

Line 116, replace:

```html
<form id="contact-form" action="{{ .Site.Params.formspreeURL }}" method="POST">
```

With:

```html
<form id="contact-form" action="{{ site.Params.formspreeURL }}" method="POST">
```

Line 182, replace:

```html
{{ $map := .Site.Params.map }}
```

With:

```html
{{ $map := site.Params.map }}
```

- [ ] **Step 3: Verify no `.Site` references remain in this file**

```bash
grep -n '\.Site\b' themes/portio/layouts/contact/list.html
```

Expected: no output.

- [ ] **Step 4: Rebuild and diff the contact page against the baseline**

```bash
hugo
diff "$BASELINE/contact.html.before" public/contact/index.html
```

Expected: no output. If there's a difference, stop and investigate.

- [ ] **Step 5: Clean up and commit**

```bash
rm -rf "$BASELINE"
git add themes/portio/layouts/contact/list.html
git commit -m "Modernize contact template to site/absURL"
```

---

## Task 5: Final full-site verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm zero remaining `.Site` references in the 8 scoped files**

```bash
grep -rn '\.Site\b' \
  themes/portio/layouts/partials/head.html \
  themes/portio/layouts/partials/navbar.html \
  themes/portio/layouts/partials/footer.html \
  themes/portio/layouts/partials/blogSection.html \
  themes/portio/layouts/partials/portfolioSection.html \
  themes/portio/layouts/blog/list.html \
  themes/portio/layouts/blog/single.html \
  themes/portio/layouts/contact/list.html
```

Expected: no output.

- [ ] **Step 2: Clean build with no errors or warnings**

```bash
hugo
```

Expected: exit code 0, no `WARN`/`ERROR` lines in the output.

- [ ] **Step 3: Confirm the working tree is clean**

```bash
git status --short
```

Expected: no output for anything under `themes/portio/layouts` (all 8 files
committed across Tasks 1-4). Unrelated pre-existing untracked files
(`.agent-traces/`, `.claude/`, `.entire/`, `.hugo_build.lock`, `.wrangler/`,
`CLAUDE.md`, `wrangler.toml`) are expected and out of scope for this plan.
