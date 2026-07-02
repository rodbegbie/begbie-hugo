window.addEventListener("DOMContentLoaded", function () {
  var trigger = document.querySelector(".popup-button");
  if (!trigger) {
    return;
  }

  // Matches Magnific Popup's previous disableOn: 700 -- below this
  // width the link behaves normally instead of opening a popup.
  var enabledQuery = window.matchMedia("(min-width: 700px)");
  var popupEl = null;
  var previouslyFocused = null;

  function youTubeEmbedURL(watchURL) {
    var id = new URL(watchURL).searchParams.get("v");
    return "https://www.youtube.com/embed/" + id + "?autoplay=1";
  }

  function getFocusableElements(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      closePopup();
      return;
    }
    if (e.key !== "Tab" || !popupEl) {
      return;
    }

    var focusable = getFocusableElements(popupEl);
    if (focusable.length === 0) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openPopup(videoURL, videoTitle) {
    previouslyFocused = document.activeElement;
    var title = videoTitle || "YouTube video";

    popupEl = document.createElement("div");
    popupEl.className = "video-popup";

    var backdrop = document.createElement("div");
    backdrop.className = "video-popup_backdrop";

    var dialog = document.createElement("div");
    dialog.className = "video-popup_dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", title);
    dialog.setAttribute("tabindex", "-1");

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "video-popup_close";
    closeBtn.setAttribute("aria-label", "Close video");
    closeBtn.textContent = "\u00d7";

    var iframe = document.createElement("iframe");
    iframe.src = youTubeEmbedURL(videoURL);
    iframe.title = title;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; encrypted-media");
    iframe.setAttribute("allowfullscreen", "");

    dialog.appendChild(closeBtn);
    dialog.appendChild(iframe);
    popupEl.appendChild(backdrop);
    popupEl.appendChild(dialog);
    document.body.appendChild(popupEl);
    document.body.style.overflow = "hidden";

    popupEl.offsetHeight; // force reflow so the opacity transition runs
    popupEl.classList.add("is-visible");

    backdrop.addEventListener("click", closePopup);
    closeBtn.addEventListener("click", closePopup);
    document.addEventListener("keydown", onKeydown);
    closeBtn.focus();
  }

  function closePopup() {
    if (!popupEl) {
      return;
    }
    var el = popupEl;
    var restoreFocus = previouslyFocused;
    popupEl = null;
    previouslyFocused = null;
    el.classList.remove("is-visible");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    // 160ms matches Magnific Popup's previous removalDelay: 160
    window.setTimeout(function () {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
      if (restoreFocus && restoreFocus.focus) {
        restoreFocus.focus();
      }
    }, 160);
  }

  trigger.addEventListener("click", function (e) {
    if (!enabledQuery.matches) {
      return; // let the link navigate normally below 700px
    }
    e.preventDefault();
    openPopup(
      trigger.getAttribute("href"),
      trigger.getAttribute("data-video-title")
    );
  });
});
