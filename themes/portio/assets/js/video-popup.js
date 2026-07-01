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
