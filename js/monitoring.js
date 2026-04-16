(function (window, document) {
  "use strict";

  var state = {
    initialized: false,
    enabled: false,
    page: "",
    measurementId: "",
    warnedMissingId: false,
    pageViewSent: false,
    queue: [],
    authResolved: false,
    authListenersBound: false,
    identityInitRequested: false,
    authUser: null,
    listenersBound: false,
    scrollMilestones: {
      50: false,
      90: false,
    },
  };

  function isDevEnvironment() {
    var host = window.location.hostname || "";
    return !host || host === "localhost" || host === "127.0.0.1" || host.indexOf(".local") !== -1;
  }

  function warnMissingIdOnce() {
    if (state.warnedMissingId || !isDevEnvironment()) return;
    state.warnedMissingId = true;
    console.warn("[IA_MONITOR] GA4_MEASUREMENT_ID is missing. Monitoring is disabled.");
  }

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  function loadGaScript(measurementId) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-ia-monitor="ga4"]');
      if (existing) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
      script.setAttribute("data-ia-monitor", "ga4");
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function trimString(value) {
    return String(value == null ? "" : value).trim();
  }

  function titleCaseFromSlug(value) {
    var slug = trimString(value).replace(/[_-]+/g, " ").trim();
    if (!slug) return "";
    return slug.replace(/\b\w/g, function (match) {
      return match.toUpperCase();
    });
  }

  function getBody() {
    return document.body || null;
  }

  function getPathname() {
    return window.location.pathname || "/";
  }

  function inferPageFamily(pathname) {
    var path = pathname || getPathname();

    if (path === "/" || path === "/index.html") return "home";
    if (/\/login(?:\.html)?\/?$/.test(path)) return "login";
    if (path.indexOf("/ia_explained/") === 0) return "ia_explained";
    if (path.indexOf("/signal_report/") === 0) return "signal_report";
    if (path.indexOf("/signal_monitor/") === 0) return "signal_monitor";
    if (path.indexOf("/historic_reports/") === 0) return "historic_reports";
    if (path.indexOf("/methodology/") === 0) return "methodology";
    if (path.indexOf("/investment-strategy/") === 0) return "investment_strategy";
    if (path.indexOf("/portfolio_characteristics/") === 0) return "portfolio";
    if (path.indexOf("/thesis/") === 0) return "thesis";
    if (/^\/Podcast_/i.test(path)) return "podcast";
    if (path === "/document_library.html") return "document_library";
    if (path === "/signal_catalogue.html") return "signal_catalogue";
    if (path === "/signal_map.html") return "signal_map";
    if (path === "/rss_feed.html") return "rss_feed";
    if (path === "/insights.html" || path === "/insights/") return "insights";
    if (path === "/insights_redirect.html") return "insights_redirect";
    if (path === "/feature_development.html") return "feature_development";

    return "page";
  }

  function inferGeneratorSource(pathname, pageFamily) {
    var family = pageFamily || inferPageFamily(pathname);
    var path = pathname || getPathname();

    if (
      family === "signal_report" ||
      family === "signal_monitor" ||
      family === "historic_reports" ||
      family === "podcast" ||
      family === "document_library" ||
      family === "signal_catalogue" ||
      family === "rss_feed" ||
      family === "feature_development"
    ) {
      return "investor_anatomy_code";
    }

    if (path.indexOf("/ia_explained/archive/") === 0) {
      return "website_archive";
    }

    return "website_authored";
  }

  function inferContentName(pathname) {
    var title = trimString(document.title);
    if (title) {
      title = title
        .replace(/\s+\|\s+Investor Anatomy$/i, "")
        .replace(/\s+-\s+Investor Anatomy$/i, "")
        .replace(/\s+Investor Anatomy$/i, "")
        .trim();
      if (title) return title;
    }

    var path = pathname || getPathname();
    var clean = path === "/" ? "index" : path.split("/").pop() || "index";
    clean = clean.replace(/\.html?$/i, "");
    return titleCaseFromSlug(clean);
  }

  function inferModelName(pathname) {
    var path = pathname || getPathname();
    var clean = path === "/" ? "index" : path.split("/").pop() || "index";
    clean = clean.replace(/\.html?$/i, "");
    return clean || "index";
  }

  function inferCommodity() {
    var source = [
      getPathname(),
      trimString(document.title),
      trimString(getBody() && getBody().getAttribute("data-ia-content-name")),
      trimString(getBody() && getBody().getAttribute("data-ia-model-name")),
    ]
      .join(" ")
      .toLowerCase();

    var commodityMap = [
      { key: "natural_gas", match: /natural[\s_-]?gas/ },
      { key: "crude_oil", match: /crude[\s_-]?oil|wti/ },
      { key: "palladium", match: /palladium/ },
      { key: "platinum", match: /platinum/ },
      { key: "lithium", match: /lithium/ },
      { key: "copper", match: /copper/ },
      { key: "silver", match: /silver/ },
      { key: "gold", match: /gold/ },
    ];

    for (var i = 0; i < commodityMap.length; i += 1) {
      if (commodityMap[i].match.test(source)) return commodityMap[i].key;
    }

    return "";
  }

  function getBodyMetadata(overrides) {
    var body = getBody();
    var path = getPathname();
    var data = (body && body.dataset) || {};
    var meta = {
      page_family: trimString((overrides && overrides.page_family) || data.iaPageFamily || ""),
      generator_source: trimString((overrides && overrides.generator_source) || data.iaGeneratorSource || ""),
      content_name: trimString((overrides && overrides.content_name) || data.iaContentName || ""),
      commodity: trimString((overrides && overrides.commodity) || data.iaCommodity || ""),
      model_name: trimString((overrides && overrides.model_name) || data.iaModelName || ""),
    };

    if (!meta.page_family) meta.page_family = inferPageFamily(path);
    if (!meta.generator_source) meta.generator_source = inferGeneratorSource(path, meta.page_family);
    if (!meta.content_name) meta.content_name = inferContentName(path);
    if (!meta.model_name) meta.model_name = inferModelName(path);
    if (!meta.commodity) meta.commodity = inferCommodity();

    return meta;
  }

  function applyBodyMetadata(meta) {
    var body = getBody();
    if (!body || !meta) return;

    if (meta.page_family) body.setAttribute("data-ia-page-family", meta.page_family);
    if (meta.generator_source) body.setAttribute("data-ia-generator-source", meta.generator_source);
    if (meta.content_name) body.setAttribute("data-ia-content-name", meta.content_name);
    if (meta.commodity) body.setAttribute("data-ia-commodity", meta.commodity);
    if (meta.model_name) body.setAttribute("data-ia-model-name", meta.model_name);
  }

  function getAccessCategory() {
    try {
      if (!window.AuthConfig || typeof window.AuthConfig.getCategoryForPath !== "function") {
        return "";
      }
      return trimString(window.AuthConfig.getCategoryForPath(getPathname()));
    } catch (_err) {
      return "";
    }
  }

  function getCurrentUser(identity) {
    try {
      var client = identity || window.netlifyIdentity;
      if (!client || typeof client.currentUser !== "function") return null;
      return client.currentUser() || null;
    } catch (_err) {
      return null;
    }
  }

  function getAuthState(user) {
    return user ? "logged_in" : "logged_out";
  }

  function getRoleBucket(user) {
    if (!user || !user.app_metadata || !Array.isArray(user.app_metadata.roles) || !user.app_metadata.roles.length) {
      return "";
    }

    return user.app_metadata.roles
      .map(function (item) {
        return trimString(item);
      })
      .filter(Boolean)
      .sort()
      .join("|");
  }

  function compactObject(obj) {
    var output = {};
    Object.keys(obj || {}).forEach(function (key) {
      var value = obj[key];
      if (value === undefined || value === null || value === "") return;
      output[key] = value;
    });
    return output;
  }

  function buildEventParams(params, user) {
    var meta = getBodyMetadata();
    applyBodyMetadata(meta);

    var merged = Object.assign({}, params || {});
    merged.page = state.page || getPathname() || "unknown";
    merged.page_path = getPathname();
    merged.page_location = window.location.href || "";
    merged.page_title = trimString(document.title) || "Investor Anatomy";
    merged.auth_state = getAuthState(user || state.authUser);
    merged.access_category = getAccessCategory();
    merged.page_family = meta.page_family;
    merged.generator_source = meta.generator_source;
    merged.content_name = meta.content_name;
    merged.commodity = meta.commodity;
    merged.model_name = meta.model_name;

    var roleBucket = getRoleBucket(user || state.authUser);
    if (roleBucket) merged.role_bucket = roleBucket;

    return compactObject(merged);
  }

  function setUserProperties(user) {
    if (!state.enabled) return;
    ensureDataLayer();

    var props = buildEventParams({}, user || null);
    delete props.page;
    delete props.page_path;
    delete props.page_location;
    delete props.page_title;
    delete props.content_name;
    delete props.model_name;
    delete props.commodity;

    window.gtag("set", "user_properties", compactObject(props));
  }

  function sendEvent(eventName, params, user) {
    if (!state.enabled || typeof eventName !== "string" || !eventName) return;
    ensureDataLayer();
    window.gtag(
      "event",
      eventName,
      Object.assign(
        {
          transport_type: "beacon",
        },
        buildEventParams(params, user || state.authUser)
      )
    );
  }

  function flushQueue() {
    if (!state.enabled || !state.pageViewSent || !state.queue.length) return;

    var queued = state.queue.slice();
    state.queue = [];
    queued.forEach(function (item) {
      sendEvent(item.name, item.params, item.user || state.authUser);
    });
  }

  function sendInitialPageView() {
    if (!state.enabled || state.pageViewSent || !state.authResolved) return;
    state.pageViewSent = true;
    setUserProperties(state.authUser);
    sendEvent("page_view", { event_origin: "initial_page_load" }, state.authUser);
    flushQueue();
  }

  function handleAuthState(eventType, user) {
    var firstResolution = !state.authResolved;
    state.authResolved = true;
    state.authUser = user || null;

    if (!state.enabled) return;

    if (firstResolution) {
      sendInitialPageView();
      return;
    }

    setUserProperties(state.authUser);

    if (eventType === "login") {
      sendEvent("login", { auth_provider: "netlify_identity" }, state.authUser);
      return;
    }

    if (eventType === "logout") {
      sendEvent("logout", { auth_provider: "netlify_identity" }, null);
    }
  }

  function requestIdentityInit(identity) {
    if (state.identityInitRequested || !identity || typeof identity.init !== "function") return;
    state.identityInitRequested = true;

    try {
      identity.init();
    } catch (_err) {
      // Ignore identity init errors and continue with fallback checks.
    }
  }

  function bindAuthLifecycle() {
    if (state.authListenersBound) return;
    state.authListenersBound = true;

    var attempts = 0;
    var maxAttempts = 25;
    var pollMs = 150;

    function finishWithLoggedOutFallback() {
      if (!state.authResolved) handleAuthState("init", null);
    }

    function attach(identity) {
      requestIdentityInit(identity);

      if (!identity || typeof identity.on !== "function") {
        handleAuthState("init", getCurrentUser(identity));
        return;
      }

      identity.on("init", function (user) {
        handleAuthState("init", user || getCurrentUser(identity));
      });

      identity.on("login", function (user) {
        handleAuthState("login", user || getCurrentUser(identity));
      });

      identity.on("logout", function () {
        handleAuthState("logout", null);
      });

      window.setTimeout(function () {
        if (!state.authResolved) {
          handleAuthState("init", getCurrentUser(identity));
        }
      }, 1200);
    }

    (function waitForIdentity() {
      var identity = window.netlifyIdentity;
      if (identity) {
        attach(identity);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        finishWithLoggedOutFallback();
        return;
      }

      window.setTimeout(waitForIdentity, pollMs);
    })();
  }

  function isExternalUrl(url) {
    try {
      return url.origin !== window.location.origin;
    } catch (_err) {
      return false;
    }
  }

  function getLinkFamily(pathname) {
    if (!pathname) return "";
    if (pathname.indexOf("/signal_report/") === 0) return "signal_report";
    if (pathname.indexOf("/signal_monitor/") === 0) return "signal_monitor";
    if (pathname.indexOf("/ia_explained/") === 0) return "ia_explained";
    if (pathname.indexOf("/historic_reports/") === 0) return "historic_reports";
    if (pathname.indexOf("/methodology/") === 0) return "methodology";
    if (pathname.indexOf("/investment-strategy/") === 0) return "investment_strategy";
    if (pathname.indexOf("/thesis/") === 0) return "thesis";
    if (pathname.indexOf("/portfolio_characteristics/") === 0) return "portfolio";
    if (/^\/Podcast_/i.test(pathname)) return "podcast";
    return "";
  }

  function isDownloadLink(anchor, url) {
    if (!anchor || !url) return false;
    if (anchor.hasAttribute("download")) return true;
    return /\.(pdf|csv|xlsx?|docx?|pptx?|zip|json|mp3|wav)$/i.test(url.pathname || "");
  }

  function bindClickTracking() {
    document.addEventListener(
      "click",
      function (evt) {
        var anchor = evt.target && evt.target.closest ? evt.target.closest("a[href]") : null;
        if (!anchor) return;

        var href = anchor.getAttribute("href") || "";
        if (!href || href.charAt(0) === "#") return;

        var url;
        try {
          url = new URL(href, window.location.href);
        } catch (_err) {
          return;
        }

        var path = url.pathname || "";
        var linkFamily = getLinkFamily(path);

        if (isDownloadLink(anchor, url)) {
          sendEvent("download", {
            target_href: url.href,
            target_path: path,
            target_label: trimString(anchor.textContent),
          });
          return;
        }

        if (anchor.closest("#ia-nav-panel, #nav-header, .nav-header")) {
          sendEvent("nav_click", {
            target_href: url.href,
            target_path: path,
            target_label: trimString(anchor.textContent),
            target_family: linkFamily,
          });
          return;
        }

        if (linkFamily) {
          sendEvent("report_link_click", {
            target_href: url.href,
            target_path: path,
            target_family: linkFamily,
            target_label: trimString(anchor.textContent),
          });
          return;
        }

        if (isExternalUrl(url)) {
          sendEvent("outbound_click", {
            target_href: url.href,
            target_host: url.hostname || "",
            target_label: trimString(anchor.textContent),
          });
        }
      },
      true
    );
  }

  function bindScrollTracking() {
    function maybeTrackScroll() {
      var docEl = document.documentElement;
      var body = getBody();
      var scrollTop = window.pageYOffset || docEl.scrollTop || (body && body.scrollTop) || 0;
      var viewport = window.innerHeight || docEl.clientHeight || 0;
      var docHeight = Math.max(
        docEl.scrollHeight || 0,
        body ? body.scrollHeight : 0,
        docEl.offsetHeight || 0,
        body ? body.offsetHeight : 0
      );

      if (!docHeight || docHeight <= viewport) return;

      var progress = ((scrollTop + viewport) / docHeight) * 100;

      if (!state.scrollMilestones[50] && progress >= 50) {
        state.scrollMilestones[50] = true;
        sendEvent("scroll_50", { scroll_percent: 50 });
      }

      if (!state.scrollMilestones[90] && progress >= 90) {
        state.scrollMilestones[90] = true;
        sendEvent("scroll_90", { scroll_percent: 90 });
      }
    }

    window.addEventListener("scroll", maybeTrackScroll, { passive: true });
    window.addEventListener("resize", maybeTrackScroll);
    maybeTrackScroll();
  }

  function bindAudioElement(audio) {
    if (!audio || audio.getAttribute("data-ia-audio-bound") === "true") return;
    audio.setAttribute("data-ia-audio-bound", "true");

    var milestones = {
      start: false,
      25: false,
      50: false,
      75: false,
      complete: false,
    };

    function getAudioLabel() {
      var label =
        audio.getAttribute("data-ia-audio-label") ||
        audio.getAttribute("title") ||
        audio.getAttribute("aria-label") ||
        "";
      return trimString(label);
    }

    audio.addEventListener("play", function () {
      if (milestones.start) return;
      milestones.start = true;
      sendEvent("audio_start", { audio_label: getAudioLabel() });
    });

    audio.addEventListener("timeupdate", function () {
      if (!audio.duration || !isFinite(audio.duration)) return;

      var progress = (audio.currentTime / audio.duration) * 100;

      if (!milestones[25] && progress >= 25) {
        milestones[25] = true;
        sendEvent("audio_25", { audio_label: getAudioLabel(), audio_progress: 25 });
      }

      if (!milestones[50] && progress >= 50) {
        milestones[50] = true;
        sendEvent("audio_50", { audio_label: getAudioLabel(), audio_progress: 50 });
      }

      if (!milestones[75] && progress >= 75) {
        milestones[75] = true;
        sendEvent("audio_75", { audio_label: getAudioLabel(), audio_progress: 75 });
      }
    });

    audio.addEventListener("ended", function () {
      if (milestones.complete) return;
      milestones.complete = true;
      sendEvent("audio_complete", { audio_label: getAudioLabel(), audio_progress: 100 });
    });
  }

  function bindAudioTracking() {
    function attachAllAudio() {
      var audioEls = document.querySelectorAll("audio");
      audioEls.forEach(bindAudioElement);
    }

    attachAllAudio();
    document.addEventListener("ia:layout-ready", attachAllAudio);
  }

  function isSearchField(el) {
    if (!el || el.tagName !== "INPUT") return false;
    var type = trimString(el.getAttribute("type") || "text").toLowerCase();
    if (type === "search") return true;

    var name = [
      el.id,
      el.name,
      el.getAttribute("placeholder"),
      el.getAttribute("aria-label"),
    ]
      .join(" ")
      .toLowerCase();

    return name.indexOf("search") !== -1;
  }

  function getFieldName(el) {
    return trimString(el.name || el.id || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "field");
  }

  function bindSearchAndFilterTracking() {
    document.addEventListener(
      "input",
      function (evt) {
        var el = evt.target;
        if (!isSearchField(el)) return;

        if (el._iaMonitorSearchTimer) {
          window.clearTimeout(el._iaMonitorSearchTimer);
        }

        el._iaMonitorSearchTimer = window.setTimeout(function () {
          sendEvent("search", {
            search_field: getFieldName(el),
            search_term_length: trimString(el.value).length,
          });
        }, 800);
      },
      true
    );

    document.addEventListener(
      "change",
      function (evt) {
        var el = evt.target;
        if (!el || !el.tagName) return;

        var tagName = el.tagName.toLowerCase();
        var type = trimString(el.getAttribute && el.getAttribute("type"));

        if (tagName === "select") {
          sendEvent("filter_change", {
            filter_name: getFieldName(el),
            filter_value: trimString(el.value),
            filter_type: "select",
          });
          return;
        }

        if (tagName === "input" && /^(checkbox|radio)$/i.test(type)) {
          sendEvent("filter_change", {
            filter_name: getFieldName(el),
            filter_value: trimString(el.value),
            filter_type: type.toLowerCase(),
            filter_checked: el.checked ? "true" : "false",
          });
        }
      },
      true
    );
  }

  function bindGlobalListeners() {
    if (state.listenersBound) return;
    state.listenersBound = true;
    bindClickTracking();
    bindScrollTracking();
    bindAudioTracking();
    bindSearchAndFilterTracking();
  }

  function autoInitWhenReady() {
    if (!window.IA_MONITOR || typeof window.IA_MONITOR.init !== "function") return;
    window.IA_MONITOR.init();
  }

  var api = {
    init: function (options) {
      if (state.initialized) return;
      state.initialized = true;

      var opts = options || {};
      state.page = trimString(opts.page) || getPathname() || "unknown";

      applyBodyMetadata(
        getBodyMetadata({
          page_family: opts.pageFamily || opts.page_family,
          generator_source: opts.generatorSource || opts.generator_source,
          content_name: opts.contentName || opts.content_name,
          commodity: opts.commodity,
          model_name: opts.modelName || opts.model_name,
        })
      );

      var configuredId =
        opts.ga4MeasurementId ||
        (window.IA_MONITORING_CONFIG && window.IA_MONITORING_CONFIG.ga4MeasurementId) ||
        "";
      var measurementId = trimString(configuredId);

      bindGlobalListeners();
      bindAuthLifecycle();

      if (!measurementId) {
        warnMissingIdOnce();
        state.enabled = false;
        state.queue = [];
        return;
      }

      state.enabled = true;
      state.measurementId = measurementId;

      ensureDataLayer();
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false });

      loadGaScript(measurementId).catch(function () {
        // The gtag queue still works with the stub, so do not hard fail here.
      });
    },

    track: function (eventName, params) {
      if (typeof eventName !== "string" || !eventName) return;

      if (!state.initialized || !state.enabled || !state.pageViewSent) {
        state.queue.push({ name: eventName, params: params || {}, user: state.authUser });
        return;
      }

      sendEvent(eventName, params || {}, state.authUser);
    },

    setPageMetadata: function (meta) {
      applyBodyMetadata(getBodyMetadata(meta || {}));
      if (state.enabled) {
        setUserProperties(state.authUser);
      }
    },

    getState: function () {
      return {
        initialized: state.initialized,
        enabled: state.enabled,
        page: state.page,
        measurementId: state.measurementId ? "configured" : "missing",
        authResolved: state.authResolved,
        pageViewSent: state.pageViewSent,
      };
    },
  };

  window.IA_MONITOR = api;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitWhenReady);
  } else {
    autoInitWhenReady();
  }
})(window, document);
