(function (window, document) {
  "use strict";

  var state = {
    initialized: false,
    enabled: false,
    page: "",
    measurementId: "",
    warnedMissingId: false,
    queue: [],
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

  function getIsAuthed() {
    try {
      if (typeof window.netlifyIdentity === "undefined") return false;
      if (!window.netlifyIdentity || typeof window.netlifyIdentity.currentUser !== "function") return false;
      return Boolean(window.netlifyIdentity.currentUser());
    } catch (_err) {
      return false;
    }
  }

  function buildEventParams(params) {
    var merged = Object.assign({}, params || {});

    if (typeof merged.page === "undefined") {
      merged.page = state.page || window.location.pathname || "unknown";
    }

    if (typeof merged.is_authed === "undefined") {
      merged.is_authed = getIsAuthed();
    }

    return merged;
  }

  function sendEvent(eventName, params) {
    if (!state.enabled || typeof eventName !== "string" || !eventName) return;
    ensureDataLayer();
    window.gtag(
      "event",
      eventName,
      Object.assign(
        {
          transport_type: "beacon",
        },
        buildEventParams(params)
      )
    );
  }

  function flushQueue() {
    if (!state.enabled || !state.queue.length) {
      state.queue = [];
      return;
    }

    var queued = state.queue.slice();
    state.queue = [];
    queued.forEach(function (item) {
      sendEvent(item.name, item.params);
    });
  }

  var api = {
    init: function (options) {
      if (state.initialized) return;
      state.initialized = true;

      var opts = options || {};
      state.page = opts.page || window.location.pathname || "unknown";

      var configuredId =
        opts.ga4MeasurementId ||
        (window.IA_MONITORING_CONFIG && window.IA_MONITORING_CONFIG.ga4MeasurementId) ||
        "";
      var measurementId = String(configuredId || "").trim();

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
      window.gtag("config", measurementId, { send_page_view: true });

      loadGaScript(measurementId)
        .then(function () {
          flushQueue();
        })
        .catch(function () {
          flushQueue();
        });
    },

    track: function (eventName, params) {
      if (typeof eventName !== "string" || !eventName) return;

      if (!state.initialized) {
        state.queue.push({ name: eventName, params: params || {} });
        return;
      }

      if (!state.enabled) return;
      sendEvent(eventName, params || {});
    },

    getState: function () {
      return {
        initialized: state.initialized,
        enabled: state.enabled,
        page: state.page,
        measurementId: state.measurementId ? "configured" : "missing",
      };
    },
  };

  window.IA_MONITOR = api;
})(window, document);
