window.addEventListener("DOMContentLoaded", function () {
  var toggler = document.querySelector('[data-bs-toggle="collapse"]');
  var navbar = document.querySelector(".navbar");

  if (toggler) {
    var targetSelector = toggler.getAttribute("data-bs-target");
    var collapseEl = document.querySelector(targetSelector);
    // 350ms matches $transition-collapse in
    // themes/portio/assets/bootstrap-5.3.8/scss/_variables.scss
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
