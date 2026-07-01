# JS Vanilla Rewrite Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop jQuery, Bootstrap's JS bundle, Slick, Magnific Popup, and
TweenMax/GSAP from the vendored `portio` Hugo theme, replacing each live
behavior with a small vanilla JS module (or, for the blob animation, CSS),
and delete confirmed-dead code and plugin files.

**Architecture:** One small, single-purpose vanilla JS module per live
behavior (`navbar.js`, `testimonial-carousel.js`, `video-popup.js`),
each loaded via its own `<script>` tag processed through the existing
`resources.Get "js/<name>.js" | minify` Hugo Pipes pattern — no bundler
yet (that's Phase 3). Tasks are ordered so each plugin is fully retired
(script/link tags removed, files deleted) the moment nothing else needs
it, so at every commit the site has zero double-implemented behaviors and
zero dead `<script>` references.

**Tech Stack:** Hugo 0.157+ (project uses 0.163.3 locally), Sass via
`css.Sass`, vanilla ES5-style JS (no build step, no modules — classic
scripts to match the existing `form-handler.js` convention), Chrome
DevTools Protocol (`superpowers-chrome:browsing` skill) for verification
since this project has no test suite.

## Global Constraints

- No test suite exists (per `CLAUDE.md`) — verification is `hugo` build +
  manual/browser checks, exactly as Phase 1 (CSS modernization) did.
- New JS files live under `themes/portio/assets/js/` and load via the
  same `resources.Get "js/<name>.js" | minify` pattern already used for
  `form-handler.js` in `footer.html`.
- No ES modules (`type="module"`), no `import`/`export` — classic scripts,
  each self-contained, matching `form-handler.js`'s existing style.
- No visual redesign: carousel, popup, and nav must look and behave like
  today, except where Rod explicitly approved a difference (Google Maps
  removed entirely; blob animation becomes CSS `@keyframes` instead of a
  GSAP JS tween, with graceful static-shape degradation on browsers that
  don't support animating the SVG `d` property).
- Every task ends with `hugo` building cleanly and a Chrome DevTools
  Protocol pass (via the `superpowers-chrome:browsing` skill) confirming
  zero JavaScript console errors on every page touched by that task.
- Follow the SCSS breakpoint mixins already defined in
  `themes/portio/assets/scss/_mixins.scss` (`@include tablet` = max-width
  767px, `@include desktop` = max-width 991px) rather than introducing new
  breakpoint values.

---

### Task 1: Delete confirmed-dead code and plugin files

**Files:**

- Modify: `themes/portio/assets/js/script.js` (remove `PageLoad()`, the
  skill-count waypoint block, the portfolio-grid masonry/imagesLoaded
  block, and the entire Google Maps section)
- Modify: `themes/portio/layouts/partials/footer.html`
- Modify: `themes/portio/layouts/contact/list.html`
- Modify: `themes/portio/assets/scss/style.scss` (remove the `preloder`
  import)
- Modify: `config.toml` (remove `[params.map]`)
- Delete: `themes/portio/assets/scss/components/_preloder.scss`
- Delete: `themes/portio/static/plugins/headroom/` (entire directory)
- Delete: `themes/portio/static/plugins/bootstrap/bootstrap.min.css`
  (leave `bootstrap.min.js` — still needed until Task 2)
- Delete: `themes/portio/static/plugins/masonry/` (entire directory)
- Delete: `themes/portio/static/plugins/imagesloaded/` (entire directory)
- Delete: `themes/portio/static/plugins/waypoint/` (entire directory)

**Interfaces:**

- Consumes: nothing from other tasks (this is the first task).
- Produces: a `script.js` containing only the navbar jQuery code,
  service/testimonial Slick calls, the Magnific Popup call, and the blob
  TimelineMax code — everything Tasks 2-5 will remove piece by piece.

None of the code and files this task deletes are referenced by anything
that survives it; this task is pure subtraction, verified by grepping for
each removed reference and confirming zero matches, then building and
checking the browser console.

- [ ] **Step 1: Confirm nothing else references what's about to be deleted**

Run:

```bash
cd themes/portio
grep -rn "headroom\|masonry\|imagesLoaded\|imagesloaded\|waypoint\|preloader\|precent\|google\.maps" layouts/ assets/js/ assets/scss/ | grep -v "assets/js/script.js"
```

Expected: no output (every match should be inside `script.js`, which this
task also edits).

- [ ] **Step 2: Remove the dead JS from `script.js`**

Open `themes/portio/assets/js/script.js`. Delete the `PageLoad()`
function (lines 1-55 in the current file) and its call site
`PageLoad();` inside `$(document).ready`. Delete the skill-count
waypoint block:

```javascript
  // skill count
  $(".skill__progress").waypoint(
    function () {
      $(".progress-value span").each(function () {
        $(this)
          .prop("Counter", 0)
          .animate(
            {
              Counter: $(this).text(),
            },
            {
              duration: 3000,
              easing: "swing",
              step: function (now) {
                $(this).text(Math.ceil(now));
              },
            }
          );
      });
      $(".skill__progress_item").addClass("js-animation");
      this.destroy();
    },
    { offset: "80%" }
  );
```

Delete the portfolio-grid masonry/imagesLoaded block:

```javascript
  var portfolioGrid = $(".portfolio-item-grid").masonry({
    itemSelector: ".portfolio-item",
  });

  portfolioGrid.imagesLoaded().progress(function () {
    portfolioGrid.masonry("layout");
  });
```

Delete the entire Google Maps section (the `// G-Map` comment through the
end of the file, including `window.marker = null;`, the `initialize()`
function, and the trailing `if ($("#map").length > 0) { ... }` block).

After these deletions, `script.js` should contain only: the
`$(document).ready(function () { ... })` wrapper with the
change-navigation-color handler, the smooth-scrolling handler, the
`.navbar-nav>li>a` click handler, the `.service__slider` Slick call, the
`.testimonial__slider` Slick call, the `magnificPopup` call, and the blob
`TimelineMax` code — in that order, nothing else.

- [ ] **Step 3: Remove Google Maps markup, config, and script tags**

In `themes/portio/layouts/contact/list.html`, replace:

```html
      <div class="col-lg-6">
        <div class="contact-form-title">
          <h3>Contact Form</h3>
        </div>
```

with:

```html
      <div class="col-lg-12">
        <div class="contact-form-title">
          <h3>Contact Form</h3>
        </div>
```

And remove the map column entirely — delete:

```html
      <div class="col-lg-6">
        {{ $map := site.Params.map }}
        <div id="map" data-lat={{ $map.latitude }} data-long={{ $map.longitude }} data-pin={{ $map.pinImage | absURL }}>
        </div>
      </div>
```

(This widens the form to full width instead of leaving a blank half-width
gap where the map used to be — removing the map is Rod's decision from
the design phase; widening the form is this plan's follow-through so the
page doesn't end up with empty grid space.)

In `config.toml`, remove:

```toml
[params.map]
APIkey = "YOUR GOOGLE MAP API"
latitude = "23.7783741"
longitude = "90.3746808"
pinImage = "images/pin.png"

```

(including the blank line that follows it, so `# Social icons` stays
preceded by exactly one blank line, matching the file's existing style).

In `themes/portio/layouts/partials/footer.html`, remove the commented-out
Maps script loader line:

```html
<!-- <script src="https://maps.googleapis.com/maps/api/js?key={{ site.Params.map.APIkey }}&libraries=geometry"></script> -->
```

and remove these three `<script>` tags (masonry/imagesLoaded/waypoint are
only used by disabled sections):

```html
<script src="{{ "plugins/waypoint/jquery.waypoints.min.js" | absURL }}"></script>
```

```html
<script src="{{ "plugins/imagesloaded/imagesloaded.min.js" | absURL }}"></script>
```

```html
<script src="{{ "plugins/masonry/masonry.min.js" | absURL }}"></script>
```

`footer.html`'s script block should now read, in order: jQuery,
`bootstrap.min.js`, `slick.min.js`, `jquery.magnific-popup.min.js`,
`TweenMax.min.js`, then the `form-handler.js`/`script.js` Hugo Pipes
block — unchanged for now (Tasks 2-5 retire these one at a time).

- [ ] **Step 4: Remove the dead SCSS partial and its import**

Delete `themes/portio/assets/scss/components/_preloder.scss`.

In `themes/portio/assets/scss/style.scss`, remove:

```scss
@import "components/preloder";

```

- [ ] **Step 5: Delete the dead plugin directories and unused CSS**

```bash
cd themes/portio/static/plugins
rm -rf headroom masonry imagesloaded waypoint
rm bootstrap/bootstrap.min.css
```

- [ ] **Step 6: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
hugo --quiet
```

Expected: builds with no errors. Then confirm none of the deleted paths
made it into the build output:

```bash
find public/plugins -maxdepth 1 -type d
ls public/plugins/bootstrap/
```

Expected: `headroom`, `masonry`, `imagesloaded`, `waypoint` are absent
from `public/plugins/`; `public/plugins/bootstrap/` contains only
`bootstrap.min.js`, no `.css` file.

- [ ] **Step 7: Browser verification**

Using the `superpowers-chrome:browsing` skill: navigate to the home page
and the contact page. On each, run
`{action: "get_console_messages"}` (after `{action:
"enable_console_logging"}` before navigating) and confirm zero `error`-
level entries. On the contact page, take a full-page screenshot and
confirm the contact form now spans the full width with no empty box
where the map used to sit, and submitting the form still works (existing
`form-handler.js` behavior, untouched by this task).

- [ ] **Step 8: Commit**

```bash
git add themes/portio/assets/js/script.js \
  themes/portio/layouts/partials/footer.html \
  themes/portio/layouts/contact/list.html \
  themes/portio/assets/scss/style.scss \
  config.toml
git rm themes/portio/assets/scss/components/_preloder.scss
git add -u themes/portio/static/plugins
git commit -m "Delete dead JS/CSS: preloader, headroom, Masonry, imagesLoaded, Waypoint, unused Bootstrap CSS, and the never-functional Google Maps integration"
```

---

### Task 2: Vanilla mobile nav (retire Bootstrap's JS bundle)

**Files:**

- Create: `themes/portio/assets/js/navbar.js`
- Modify: `themes/portio/assets/js/script.js` (remove the
  change-navigation-color, smooth-scroll, and `.navbar-nav>li>a` blocks)
- Modify: `themes/portio/layouts/partials/footer.html`
- Delete: `themes/portio/static/plugins/bootstrap/bootstrap.min.js`

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: nothing later tasks depend on — `navbar.js` is fully
  self-contained.

Bootstrap's JS bundle was only ever used for the `data-toggle="collapse"`
mobile nav toggle (confirmed during the design-phase audit — the only
other `data-toggle` in the codebase, `resumeSection.html`'s
`data-toggle="tab"`, is inside an HTML comment and never renders). Once
this task's vanilla toggle replaces it, nothing needs `bootstrap.min.js`
at all.

- [ ] **Step 1: Confirm the collapse assumption**

```bash
grep -rn "data-toggle\|data-target" themes/portio/layouts/
```

Expected: only `themes/portio/layouts/partials/navbar.html`'s
`data-toggle="collapse"`/`data-target="#navbarCollapse"`, plus the
commented-out `data-toggle="tab"` pair in `resumeSection.html` (inside
`<!-- -->`).

- [ ] **Step 2: Create `navbar.js`**

Create `themes/portio/assets/js/navbar.js`:

```javascript
window.addEventListener("DOMContentLoaded", function () {
  var toggler = document.querySelector('[data-toggle="collapse"]');
  var navbar = document.querySelector(".navbar");

  if (toggler) {
    var targetSelector = toggler.getAttribute("data-target");
    var collapseEl = document.querySelector(targetSelector);
    // 350ms matches $transition-collapse in
    // themes/portio/assets/bootstrap-4.5.2/scss/_variables.scss
    var COLLAPSE_DURATION = 350;

    function isOpen() {
      return collapseEl.classList.contains("show");
    }

    function openCollapse() {
      collapseEl.classList.remove("collapse");
      collapseEl.classList.add("collapsing");
      collapseEl.style.height = "0px";
      collapseEl.offsetHeight; // force reflow before transitioning
      collapseEl.style.height = collapseEl.scrollHeight + "px";
      window.setTimeout(function () {
        collapseEl.classList.remove("collapsing");
        collapseEl.classList.add("collapse", "show");
        collapseEl.style.height = "";
      }, COLLAPSE_DURATION);
      toggler.classList.remove("collapsed");
      toggler.setAttribute("aria-expanded", "true");
    }

    function closeCollapse() {
      collapseEl.style.height = collapseEl.scrollHeight + "px";
      collapseEl.classList.remove("collapse", "show");
      collapseEl.classList.add("collapsing");
      collapseEl.offsetHeight; // force reflow before transitioning
      collapseEl.style.height = "0px";
      window.setTimeout(function () {
        collapseEl.classList.remove("collapsing");
        collapseEl.classList.add("collapse");
        collapseEl.style.height = "";
      }, COLLAPSE_DURATION);
      toggler.classList.add("collapsed");
      toggler.setAttribute("aria-expanded", "false");
    }

    toggler.addEventListener("click", function () {
      if (isOpen()) {
        closeCollapse();
      } else {
        openCollapse();
      }
    });

    var navLinks = collapseEl.querySelectorAll(".navbar-nav>li>a");
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener("click", function () {
        if (isOpen()) {
          closeCollapse();
        }
      });
    }
  }

  if (navbar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 200) {
        navbar.classList.add("nav__color__change");
      } else {
        navbar.classList.remove("nav__color__change");
      }
    });
  }

  var scrollLinks = document.querySelectorAll(".scroll");
  for (var j = 0; j < scrollLinks.length; j++) {
    scrollLinks[j].addEventListener("click", function (e) {
      // Use the anchor's .hash property, not getAttribute("href") --
      // absURL makes href a full URL (e.g. "https://.../#home"), and
      // only .hash reliably extracts just the "#home" fragment from that.
      var target = document.querySelector(this.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});
```

- [ ] **Step 3: Remove the now-superseded jQuery code from `script.js`**

In `themes/portio/assets/js/script.js`, delete the change-navigation-color
block:

```javascript
  // change-navigation-color
  $(window).scroll(function () {
    if ($(document).scrollTop() > 200) {
      $(".navbar").addClass("nav__color__change");
    } else {
      $(".navbar").removeClass("nav__color__change");
    }
  });
```

Delete the smooth-scrolling block:

```javascript
  // Smooth scrolling
  var scrollLink = $(".scroll");
  scrollLink.click(function (e) {
    let elem = $(this.hash);
    if (elem.length) {
      e.preventDefault();
      $("body,html").animate(
        {
          scrollTop: elem.offset().top,
        },
        1000
      );
    }
  });
```

Delete the nav-link click handler:

```javascript
  $(".navbar-nav>li>a").on("click", function () {
    $(".navbar-collapse").collapse("hide");
  });
```

- [ ] **Step 4: Wire up `navbar.js` and retire Bootstrap's JS bundle**

In `themes/portio/layouts/partials/footer.html`, remove:

```html
<script src="{{ "plugins/bootstrap/bootstrap.min.js" | absURL }}"></script>
```

Add, immediately before the `form-handler.js` Hugo Pipes block:

```html
{{ $navbarjs := resources.Get "js/navbar.js" | minify }}
<script src="{{ $navbarjs.Permalink }}"></script>
```

- [ ] **Step 5: Delete the now-unused Bootstrap JS bundle**

```bash
rm themes/portio/static/plugins/bootstrap/bootstrap.min.js
rmdir themes/portio/static/plugins/bootstrap
```

- [ ] **Step 6: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
hugo --quiet
ls public/plugins/ 2>/dev/null | grep bootstrap || echo "bootstrap dir absent, as expected"
```

- [ ] **Step 7: Browser verification**

Using the `superpowers-chrome:browsing` skill, on the home page: resize
the viewport to a mobile width (e.g. 375px), click the hamburger button,
confirm the nav menu slides open (same animation timing as before —
Bootstrap's `.collapse`/`.collapsing` CSS classes are unchanged, only the
JS driving them changed), click a nav link and confirm the menu closes.
Scroll past 200px and confirm the navbar background changes color, then
scroll back up and confirm it reverts. Click an in-page nav link (e.g.
"About") and confirm the page smooth-scrolls to that section. Check
`get_console_messages` for zero errors.

- [ ] **Step 8: Commit**

```bash
git add themes/portio/assets/js/navbar.js \
  themes/portio/assets/js/script.js \
  themes/portio/layouts/partials/footer.html
git add -u themes/portio/static/plugins
git commit -m "Replace Bootstrap's JS collapse plugin with vanilla navbar.js"
```

---

### Task 3: Vanilla testimonial carousel (retire Slick)

**Files:**

- Create: `themes/portio/assets/js/testimonial-carousel.js`
- Modify: `themes/portio/layouts/partials/testimonialSection.html`
- Modify: `themes/portio/assets/scss/components/_testimonial-section.scss`
- Modify: `themes/portio/assets/js/script.js` (remove both Slick calls)
- Modify: `themes/portio/layouts/partials/footer.html`
- Modify: `themes/portio/layouts/partials/head.html`
- Delete: `themes/portio/static/plugins/slick/` (entire directory)

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: nothing later tasks depend on.

Slick is used for two sliders: the active testimonial slider
(`testimonialSection.html`) and the service slider
(`serviceSection.html`, `enable: false` — its `$(".service__slider")
.slick(...)` call in `script.js` is dead code, removed alongside the
testimonial migration since this task is what retires Slick entirely).

- [ ] **Step 1: Add the track/dots markup to the template**

In `themes/portio/layouts/partials/testimonialSection.html`, replace:

```html
                <div class="testimonial__slider">
                    {{ $section := .testimonial }}
                    {{ range $section }}
                    <div class="testimonial__slider_item">
```

with:

```html
                <div class="testimonial__slider">
                    {{ $section := .testimonial }}
                    <div class="testimonial__slider_track">
                    {{ range $section }}
                    <div class="testimonial__slider_item">
```

And replace the closing of the range/section (currently):

```html
                    {{ end }}
                </div>
            </div>
        </div>
    </div>
</section>
```

with:

```html
                    {{ end }}
                    </div>
                    <div class="testimonial__slider_dots"></div>
                </div>
            </div>
        </div>
    </div>
</section>
```

(The dots container starts empty — `testimonial-carousel.js` populates it
at runtime, since the number of dots depends on the viewport width, which
isn't known at build time.)

- [ ] **Step 2: Update the SCSS for the new markup**

In `themes/portio/assets/scss/components/_testimonial-section.scss`,
replace the `&_item` margin line:

```scss
      margin: 30px 25px 60px;
```

with:

```scss
      margin: 30px 0 60px;
```

(The horizontal 25px-per-side gutter moves to the track's `gap` below, so
percentage-based flex-basis math isn't thrown off by fixed-width margins
stacking on top of it.)

Replace the entire `.slick-dots` and `.slick-slide` block (from
`.slick-dots {` through the closing of `.slick-slide { &:focus { outline:
0; } }`) with:

```scss
    &_track {
      display: flex;
      gap: 50px;
      transition: transform 0.5s ease;
      @include tablet {
        gap: 0;
      }
    }
    &_dots {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
      justify-content: center;
    }
    &_dot {
      cursor: pointer;
      height: 8px;
      width: 8px;
      background: #c2c8cc;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: block;
      padding: 0;
      border: 0;
      text-indent: -9999px;
      &:not(:last-child) {
        margin-right: 15px;
      }
      &:focus {
        outline: 0;
      }
      &:hover {
        background: $primary;
      }
      &.is-active {
        height: 10px;
        width: 10px;
        background-color: $primary;
      }
    }
```

- [ ] **Step 3: Create `testimonial-carousel.js`**

Create `themes/portio/assets/js/testimonial-carousel.js`:

```javascript
window.addEventListener("DOMContentLoaded", function () {
  var slider = document.querySelector(".testimonial__slider");
  if (!slider) {
    return;
  }

  var track = slider.querySelector(".testimonial__slider_track");
  var dotsContainer = slider.querySelector(".testimonial__slider_dots");
  var items = track.children;
  var itemCount = items.length;
  var desktopQuery = window.matchMedia("(min-width: 992px)");
  var currentIndex = 0;
  var maxIndex = 0;
  var autoplayTimer = null;

  function slidesPerView() {
    return desktopQuery.matches ? 2 : 1;
  }

  function render() {
    var perView = slidesPerView();
    maxIndex = Math.max(itemCount - perView, 0);
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var basis =
      "calc((100% - " + gap * (perView - 1) + "px) / " + perView + ")";
    for (var i = 0; i < itemCount; i++) {
      items[i].style.flexBasis = basis;
    }

    track.style.transform =
      "translateX(calc(-1 * " + currentIndex + " * (" + basis + " + " + gap + "px)))";

    renderDots();
  }

  function renderDots() {
    dotsContainer.innerHTML = "";
    for (var d = 0; d <= maxIndex; d++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className =
        "testimonial__slider_dot" + (d === currentIndex ? " is-active" : "");
      dot.setAttribute("aria-label", "Go to testimonial " + (d + 1));
      dot.addEventListener("click", makeDotHandler(d));
      dotsContainer.appendChild(dot);
    }
  }

  function makeDotHandler(index) {
    return function () {
      currentIndex = index;
      render();
      restartAutoplay();
    };
  }

  function advance() {
    currentIndex = (currentIndex + 1) % (maxIndex + 1);
    render();
  }

  function startAutoplay() {
    autoplayTimer = window.setInterval(advance, 2000);
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  desktopQuery.addEventListener("change", render);
  window.addEventListener("resize", render);

  render();
  startAutoplay();
});
```

- [ ] **Step 4: Remove the Slick calls from `script.js`**

In `themes/portio/assets/js/script.js`, delete the service slider block:

```javascript
  // service slider
  $(".service__slider").slick({
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    dots: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
    ],
  });
```

Delete the testimonial slider block:

```javascript
  // Testimonial slider
  $(".testimonial__slider").slick({
    infinite: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    dots: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
    ],
  });
```

- [ ] **Step 5: Wire up `testimonial-carousel.js` and retire Slick**

In `themes/portio/layouts/partials/head.html`, remove:

```html
  {{ "<!-- Slick Carousel -->" | safeHTML }}
  <link rel="stylesheet" href="{{ "plugins/slick/slick.css" | absURL }}" />
  <link rel="stylesheet" href="{{ "plugins/slick/slick-theme.css" | absURL }}" />

```

In `themes/portio/layouts/partials/footer.html`, remove:

```html
<script src="{{ "plugins/slick/slick.min.js" | absURL }}"></script>
```

Add, immediately after the `navbar.js` block added in Task 2:

```html
{{ $testimonialjs := resources.Get "js/testimonial-carousel.js" | minify }}
<script src="{{ $testimonialjs.Permalink }}"></script>
```

- [ ] **Step 6: Delete the Slick plugin directory**

```bash
rm -rf themes/portio/static/plugins/slick
```

- [ ] **Step 7: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
hugo --quiet
ls public/plugins/ 2>/dev/null | grep slick || echo "slick dir absent, as expected"
```

- [ ] **Step 8: Browser verification**

Using the `superpowers-chrome:browsing` skill, on the home page at
desktop width (e.g. 1280px): confirm the testimonial slider shows 2 items
side by side with visible spacing, dots reflect the current position, and
after ~2s it auto-advances; click a dot and confirm it jumps to that
position and autoplay restarts from there; hover over the slider and
confirm autoplay pauses, then move the mouse away and confirm it resumes.
Resize to a mobile width (e.g. 375px) and confirm exactly 1 item shows per
view with no horizontal gap artifacts. Check `get_console_messages` for
zero errors.

- [ ] **Step 9: Commit**

```bash
git add themes/portio/assets/js/testimonial-carousel.js \
  themes/portio/assets/js/script.js \
  themes/portio/layouts/partials/testimonialSection.html \
  themes/portio/assets/scss/components/_testimonial-section.scss \
  themes/portio/layouts/partials/footer.html \
  themes/portio/layouts/partials/head.html
git add -u themes/portio/static/plugins
git commit -m "Replace Slick with a vanilla testimonial carousel"
```

---

### Task 4: Vanilla video popup (retire Magnific Popup)

**Files:**

- Create: `themes/portio/assets/js/video-popup.js`
- Create: `themes/portio/assets/scss/components/_video-popup.scss`
- Modify: `themes/portio/assets/scss/style.scss` (add the import)
- Modify: `themes/portio/assets/js/script.js` (remove the
  `magnificPopup` call)
- Modify: `themes/portio/layouts/partials/footer.html`
- Modify: `themes/portio/layouts/partials/head.html`
- Delete: `themes/portio/static/plugins/magnafic-popup/` (entire
  directory)

**Interfaces:**

- Consumes: nothing from other tasks.
- Produces: nothing later tasks depend on.

Magnific Popup is used for exactly one thing: the hero video popup
(`.popup-button` in `hero.html`). No markup changes are needed in
`hero.html` — the vanilla script targets the existing `.popup-button`
anchor directly.

- [ ] **Step 1: Create the popup CSS**

Create `themes/portio/assets/scss/components/_video-popup.scss`:

```scss
.video-popup {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 3000;
  opacity: 0;
  transition: opacity 0.16s ease;
  &.is-visible {
    opacity: 1;
  }
  &_backdrop {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.8);
  }
  &_dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 900px;
    aspect-ratio: 16 / 9;
    iframe {
      height: 100%;
      width: 100%;
      border: 0;
    }
  }
  &_close {
    position: absolute;
    top: -40px;
    right: 0;
    background: transparent;
    border: 0;
    color: $white;
    font-size: 30px;
    line-height: 1;
    cursor: pointer;
  }
}
```

In `themes/portio/assets/scss/style.scss`, add, immediately after
`@import "components/hero-section";`:

```scss

@import "components/video-popup";
```

- [ ] **Step 2: Create `video-popup.js`**

Create `themes/portio/assets/js/video-popup.js`:

```javascript
window.addEventListener("DOMContentLoaded", function () {
  var trigger = document.querySelector(".popup-button");
  if (!trigger) {
    return;
  }

  // Matches Magnific Popup's previous disableOn: 700 -- below this
  // width the link behaves normally instead of opening a popup.
  var enabledQuery = window.matchMedia("(min-width: 700px)");
  var popupEl = null;

  function youTubeEmbedURL(watchURL) {
    var id = new URL(watchURL).searchParams.get("v");
    return "https://www.youtube.com/embed/" + id + "?autoplay=1";
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closePopup();
    }
  }

  function openPopup(videoURL) {
    popupEl = document.createElement("div");
    popupEl.className = "video-popup";
    popupEl.innerHTML =
      '<div class="video-popup_backdrop"></div>' +
      '<div class="video-popup_dialog">' +
      '<button type="button" class="video-popup_close" aria-label="Close video">&times;</button>' +
      '<iframe src="' +
      youTubeEmbedURL(videoURL) +
      '" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>' +
      "</div>";
    document.body.appendChild(popupEl);

    popupEl.offsetHeight; // force reflow so the opacity transition runs
    popupEl.classList.add("is-visible");

    popupEl
      .querySelector(".video-popup_backdrop")
      .addEventListener("click", closePopup);
    popupEl
      .querySelector(".video-popup_close")
      .addEventListener("click", closePopup);
    document.addEventListener("keydown", onKeydown);
  }

  function closePopup() {
    if (!popupEl) {
      return;
    }
    var el = popupEl;
    popupEl = null;
    el.classList.remove("is-visible");
    document.removeEventListener("keydown", onKeydown);
    // 160ms matches Magnific Popup's previous removalDelay: 160
    window.setTimeout(function () {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 160);
  }

  trigger.addEventListener("click", function (e) {
    if (!enabledQuery.matches) {
      return; // let the link navigate normally below 700px
    }
    e.preventDefault();
    openPopup(trigger.getAttribute("href"));
  });
});
```

- [ ] **Step 3: Remove the Magnific Popup call from `script.js`**

In `themes/portio/assets/js/script.js`, delete:

```javascript
  // Modal Popup
  $(".popup-button").magnificPopup({
    disableOn: 700,
    type: "iframe",
    mainClass: "mfp-fade",
    removalDelay: 160,
    preloader: false,

    fixedContentPos: false,
  });
```

- [ ] **Step 4: Wire up `video-popup.js` and retire Magnific Popup**

In `themes/portio/layouts/partials/head.html`, remove:

```html
  {{ "<!-- Magnific Popup -->" | safeHTML }}
  <link rel="stylesheet" href="{{"plugins/magnafic-popup/magnific-popup.css" | absURL }}" />

```

In `themes/portio/layouts/partials/footer.html`, remove:

```html
<script src="{{ "plugins/magnafic-popup/jquery.magnific-popup.min.js" | absURL }}"></script>
```

Add, immediately after the `testimonial-carousel.js` block added in
Task 3:

```html
{{ $videopopupjs := resources.Get "js/video-popup.js" | minify }}
<script src="{{ $videopopupjs.Permalink }}"></script>
```

- [ ] **Step 5: Delete the Magnific Popup plugin directory**

```bash
rm -rf themes/portio/static/plugins/magnafic-popup
```

- [ ] **Step 6: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
hugo --quiet
ls public/plugins/ 2>/dev/null | grep magnafic || echo "magnafic-popup dir absent, as expected"
```

- [ ] **Step 7: Browser verification**

Using the `superpowers-chrome:browsing` skill, on the home page at
desktop width: click the hero video play button, confirm a popup opens
with the YouTube video embedded and playing, close it via the close
button, reopen it and close via a backdrop click, reopen and close via
the Escape key. Resize to a narrow width (below 700px), click the play
button, and confirm it navigates to the YouTube URL directly instead of
opening a popup (no popup markup should appear in the DOM — check via
`{action: "eval", payload: "document.querySelector('.video-popup')"}`
returning `null` after the click). Check `get_console_messages` for zero
errors.

- [ ] **Step 8: Commit**

```bash
git add themes/portio/assets/js/video-popup.js \
  themes/portio/assets/js/script.js \
  themes/portio/assets/scss/components/_video-popup.scss \
  themes/portio/assets/scss/style.scss \
  themes/portio/layouts/partials/footer.html \
  themes/portio/layouts/partials/head.html
git add -u themes/portio/static/plugins
git commit -m "Replace Magnific Popup with a vanilla video lightbox"
```

---

### Task 5: CSS blob animation (retire jQuery and TweenMax)

**Files:**

- Create: `themes/portio/assets/scss/components/_blob.scss`
- Modify: `themes/portio/assets/scss/style.scss` (add the import)
- Modify: `themes/portio/layouts/partials/footer.html`
- Delete: `themes/portio/assets/js/script.js` (entire file)
- Delete: `themes/portio/static/plugins/jQuery/` (entire directory)
- Delete: `themes/portio/static/plugins/tweenmax/` (entire directory)

**Interfaces:**

- Consumes: nothing from other tasks (but is only safe to run last,
  since Tasks 1-4 must have already removed every other jQuery-dependent
  call from `script.js` — after Task 4, the only code left in `script.js`
  is the `$(document).ready` wrapper and the blob `TimelineMax` tween).
- Produces: nothing — this is the final task.

- [ ] **Step 1: Confirm `script.js` only contains the blob animation**

```bash
grep -n "\\$(" themes/portio/assets/js/script.js
```

Expected: only matches inside the blob animation block (the
`$(document).ready(function () {` wrapper and the `.to(".blob", ...)`
calls use `TimelineMax`/`.to`, not `$(...)` — if this grep turns up
anything else, stop and investigate before proceeding, since it means an
earlier task's cleanup was incomplete).

- [ ] **Step 2: Create the blob CSS animation**

Create `themes/portio/assets/scss/components/_blob.scss`:

```scss
@keyframes blob-morph {
  0%,
  100% {
    d: path(
      "M455.4 151.1c43.1 36.7 73.4 92.8 60.8 136.3-12.7 43.5-68.1 74.4-111.3 119.4-43.1 45-74 104.1-109.8 109-35.9 5-76.7-44.2-111.8-89.2-35.2-45-64.7-85.8-70.8-132.6-6-46.8 11.6-99.6 46.7-136.3 35.2-36.6 88-57.2 142.4-58.8 54.5-1.7 110.6 15.6 153.8 52.2z"
    );
  }
  25% {
    d: path(
      "M470.3 133c45.8 42.5 75.3 104.8 60.3 152-15 47.3-74.4 79.6-120.2 110.7-45.8 31.2-78.1 61.3-116.5 67.4-38.4 6.1-83-11.7-110.2-42.8-27.1-31.2-36.9-75.8-44.7-128.1-7.8-52.3-13.5-112.4 13.6-154.9 27.2-42.5 87.3-67.4 148.5-68.5 61.1-1 123.4 21.7 169.2 64.2z"
    );
  }
  50% {
    d: path(
      "M452.9 141.3c41.2 47 67.6 102.8 56.3 147.4-11.3 44.5-60.4 77.8-101.6 120.6-41.1 42.8-74.4 95.3-117.3 104.9-42.9 9.7-95.4-23.4-122.1-66.2-26.7-42.9-27.4-95.4-32.6-153.2-5.2-57.7-14.8-120.7 11.9-167.7 26.6-47 89.6-78 149-74.5 59.4 3.5 115.2 41.7 156.4 88.7z"
    );
  }
  75% {
    d: path(
      "M423.5 172.8c30.2 33.9 43.8 80.5 42.9 126.3-.9 45.7-16.5 90.5-46.7 113.1-30.1 22.7-74.9 23.3-124.8 28.3-49.8 5.1-104.7 14.7-146.6-8-41.8-22.7-70.6-77.6-57.8-119.8 12.7-42.2 66.9-71.6 108.7-105.5 41.9-33.8 71.3-72 109.4-80.6 38.1-8.6 84.7 12.4 114.9 46.2z"
    );
  }
}

.blob {
  animation: blob-morph 12s ease-in-out infinite alternate;
}
```

(The 4 keyframe shapes are the exact same `d` strings GSAP's
`TimelineMax` tweened to in `script.js`, applied to every `.blob` element
site-wide — matching the original behavior, since the GSAP timeline
already applied these same 4 shapes uniformly regardless of each blob's
own starting path. `0%`/`100%` uses the shape already baked into every
page's inline SVG markup, so there's no visible jump on load. `alternate`
replicates GSAP's `yoyo: true` — forward through all 4 shapes, then
backward, repeating indefinitely. Browsers that don't support animating
the SVG `d` property fall back to each page's static inline shape.)

In `themes/portio/assets/scss/style.scss`, add, immediately before
`@import "components/hero-section";`:

```scss
@import "components/blob";

```

- [ ] **Step 3: Remove jQuery and TweenMax script tags**

In `themes/portio/layouts/partials/footer.html`, remove:

```html
<script src="{{ "plugins/jQuery/jquery.min.js" | absURL }}"></script>
```

```html
<script src="{{ "plugins/tweenmax/TweenMax.min.js" | absURL }}"></script>
```

Remove the now-empty `script.js` Hugo Pipes block:

```html
{{ $script := resources.Get "js/script.js" | minify }}
<script src="{{ $script.Permalink }}"></script>
```

- [ ] **Step 4: Delete `script.js` and the jQuery/TweenMax plugin directories**

```bash
rm themes/portio/assets/js/script.js
rm -rf themes/portio/static/plugins/jQuery
rm -rf themes/portio/static/plugins/tweenmax
```

- [ ] **Step 5: Confirm `static/plugins/` is now empty**

```bash
ls themes/portio/static/plugins/
```

Expected: empty (every plugin directory has now been removed across
Tasks 1-5).

- [ ] **Step 6: Build and verify**

```bash
cd /Users/rod/build/begbie-hugo
hugo --quiet
find public/plugins -maxdepth 1 2>/dev/null || echo "public/plugins absent, as expected"
```

- [ ] **Step 7: Browser verification**

Using the `superpowers-chrome:browsing` skill: navigate to the home page,
about section, contact page, blog list page, and a blog single post. On
each, take a full-page screenshot and confirm the decorative blob shapes
render (as a static shape, or animating, depending on the browser Chrome
DevTools is running — either is correct per this task's design). Check
`get_console_messages` on every page for zero errors, and specifically
confirm no `$ is not defined` or `TweenMax is not defined` errors (which
would indicate a leftover reference this task missed). Re-verify the
Task 2/3/4 interactions one more time now that jQuery is fully gone (nav
toggle, testimonial carousel, video popup) to catch any accidental
hidden dependency on jQuery being present as a global.

- [ ] **Step 8: Commit**

```bash
git add themes/portio/assets/scss/components/_blob.scss \
  themes/portio/assets/scss/style.scss \
  themes/portio/layouts/partials/footer.html
git rm themes/portio/assets/js/script.js
git add -u themes/portio/static/plugins
git commit -m "Replace GSAP blob animation with CSS keyframes; remove jQuery and TweenMax"
```
