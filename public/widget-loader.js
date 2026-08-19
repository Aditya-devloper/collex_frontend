(function () {
  if (window.__collexWidgetLoaded) {
    return;
  }
  window.__collexWidgetLoaded = true;

  var scriptTag = document.currentScript;
  var businessId = scriptTag.getAttribute("data-business-id");

  if (!businessId) {
    console.error(
      "Collex widget: data-business-id attribute missing on script tag",
    );
    return;
  }

  var WIDGET_BASE_URL = scriptTag.getAttribute("data-base-url");
  var BACKEND_URL = "http://localhost:5000";

  var ICONS = {
    chat:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>' +
      "</svg>",
    sparkles:
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"></path>' +
      "</svg>",
    headset:
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 14v-3a9 9 0 0 1 18 0v3"></path><path d="M21 15a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h3zM3 15a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H3z"></path>' +
      "</svg>",
    bot:
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M12 8V4M9 4h6"></path><circle cx="9" cy="14" r="1"></circle><circle cx="15" cy="14" r="1"></circle>' +
      "</svg>",
  };
  var DEFAULT_COLOR = "#7c3aed";
  var DEFAULT_ICON_KEY = "chat";
  var CLOSE_ICON_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' +
    "</svg>";

  var HEX_RE = /^#[0-9a-fA-F]{6}$/;

  var config = {
    primaryColor: DEFAULT_COLOR,
    iconSvg: ICONS[DEFAULT_ICON_KEY],
  };

  function hexToRgba(hex, alpha) {
    var h = hex.replace("#", "");
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  var root = document.createElement("div");
  root.style.cssText =
    "position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;" +
    "align-items:flex-end;gap:16px;z-index:999999;";

  var defaultContainerCss =
    "width:380px;height:560px;max-height:75vh;border-radius:16px;overflow:hidden;" +
    "box-shadow:0 8px 30px rgba(0,0,0,0.2);display:none;background:white;";

  var container = document.createElement("div");
  container.style.cssText = defaultContainerCss;

  var iframe = document.createElement("iframe");
  iframe.src = WIDGET_BASE_URL + "/widget/" + businessId;
  iframe.style.cssText = "width:100%;height:100%;border:none;display:block;";
  container.appendChild(iframe);

  var bubble = document.createElement("div");
  bubble.style.cssText =
    "width:56px;height:56px;border-radius:50%;color:white;" +
    "display:flex;align-items:center;justify-content:center;" +
    "cursor:pointer;transition:transform 0.2s, background 0.2s;flex-shrink:0;";

  function applyBubbleStyle() {
    bubble.style.background = config.primaryColor;
    bubble.style.boxShadow =
      "0 4px 14px " + hexToRgba(config.primaryColor, 0.35);
    bubble.innerHTML = isOpen ? CLOSE_ICON_SVG : config.iconSvg;
  }

  bubble.onmouseenter = function () {
    bubble.style.transform = "scale(1.08)";
  };
  bubble.onmouseleave = function () {
    bubble.style.transform = "scale(1)";
  };

  var isOpen = false;
  var isMobile = function () {
    return window.innerWidth < 480;
  };

  function openWidget() {
    isOpen = true;
    container.style.display = "block";
    if (isMobile()) {
      bubble.style.display = "none";
      container.style.cssText =
        "position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100dvh;" +
        "border-radius:0;display:block;background:white;z-index:999999;";
    } else {
      bubble.innerHTML = CLOSE_ICON_SVG;
    }
  }

  function closeWidget() {
    isOpen = false;
    container.style.display = "none";
    bubble.style.display = "flex";
    bubble.innerHTML = config.iconSvg;
    if (isMobile()) {
      container.style.cssText = defaultContainerCss;
    }
  }

  bubble.onclick = function () {
    if (isOpen) closeWidget();
    else openWidget();
  };

  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "collex-widget-close") {
      closeWidget();
    }
  });

  root.appendChild(container);
  root.appendChild(bubble);
  document.body.appendChild(root);

  applyBubbleStyle();

  fetch(BACKEND_URL + "/api/business/getWidgetConfig/" + businessId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then(function (res) {
      if (!res.ok) throw new Error("config fetch failed");
      return res.json();
    })
    .then(function (data) {
      var cfg = (data && data.response.widget_config) || data || {};
      if (cfg.primaryColor && HEX_RE.test(cfg.primaryColor)) {
        config.primaryColor = cfg.primaryColor;
      }
      if (cfg.icon && ICONS.hasOwnProperty(cfg.icon)) {
        config.iconSvg = ICONS[cfg.icon];
      }
      applyBubbleStyle();
    })
    .catch(function () {
      // Silent fail — defaults already applied, widget stays fully usable.
    });
})();
