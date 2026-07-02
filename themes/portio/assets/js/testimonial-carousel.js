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
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pauseToggle = slider.querySelector(".testimonial__slider_pause");
  var currentIndex = 0;
  var maxIndex = 0;
  var autoplayTimer = null;
  // True once the user has explicitly paused via the toggle button; hover
  // and focus pausing must not resume autoplay while this is set.
  var userPaused = false;
  // Track hover and focus independently so autoplay only resumes once both
  // have cleared -- otherwise leaving with the mouse while focus is still
  // inside (or vice versa) would resume autoplay under the still-active
  // interaction, violating the WCAG 2.2.2 pause guarantee.
  var isHovered = false;
  var hasFocus = false;

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

  // Starts autoplay unless the user has explicitly paused it via the toggle
  // button, or the browser prefers reduced motion (in which case autoplay
  // must never start). Used by hover/focus resume and dot navigation so
  // neither can override an explicit user pause.
  function maybeStartAutoplay() {
    if (userPaused || reducedMotionQuery.matches || isHovered || hasFocus) {
      return;
    }
    startAutoplay();
  }

  function restartAutoplay() {
    stopAutoplay();
    maybeStartAutoplay();
  }

  function updatePauseToggle() {
    if (!pauseToggle) {
      return;
    }
    pauseToggle.setAttribute("aria-pressed", userPaused ? "true" : "false");
    pauseToggle.setAttribute(
      "aria-label",
      userPaused ? "Play testimonials" : "Pause testimonials",
    );
    pauseToggle.textContent = userPaused ? "Play" : "Pause";
  }

  if (pauseToggle) {
    pauseToggle.addEventListener("click", function () {
      userPaused = !userPaused;
      if (userPaused) {
        stopAutoplay();
      } else {
        maybeStartAutoplay();
      }
      updatePauseToggle();
    });
  }

  slider.addEventListener("mouseenter", function () {
    isHovered = true;
    stopAutoplay();
  });
  slider.addEventListener("mouseleave", function () {
    isHovered = false;
    maybeStartAutoplay();
  });
  slider.addEventListener("focusin", function () {
    hasFocus = true;
    stopAutoplay();
  });
  slider.addEventListener("focusout", function () {
    hasFocus = false;
    maybeStartAutoplay();
  });
  desktopQuery.addEventListener("change", render);
  window.addEventListener("resize", render);

  render();
  updatePauseToggle();
  maybeStartAutoplay();
});
