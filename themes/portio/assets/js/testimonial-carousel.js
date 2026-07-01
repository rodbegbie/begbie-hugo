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
