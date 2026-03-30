(function() {
  async function includeHtml(selector, paths) {
    const mount = document.querySelector(selector);
    if (!mount) return;
    const candidates = Array.isArray(paths) ? paths : [paths];
    for (const path of candidates) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        mount.innerHTML = await res.text();
        return;
      } catch (_err) {
        // Try next path candidate.
      }
    }
    console.error("Failed to load component:", candidates.join(", "));
  }

  function initNav() {
    const toggle = document.getElementById("nav-menu-btn");
    const overlay = document.getElementById("ia-nav-overlay");
    const panel = document.getElementById("ia-nav-panel");
    const header = document.getElementById("nav-header");

    function openNav() {
      if (!toggle || !overlay || !panel) return;
      toggle.classList.add("is-open");
      overlay.classList.add("open");
      panel.classList.add("open");
    }

    function closeNav() {
      if (!toggle || !overlay || !panel) return;
      toggle.classList.remove("is-open");
      overlay.classList.remove("open");
      panel.classList.remove("open");
    }

    window.IA_toggleNav = function() {
      if (panel && panel.classList.contains("open")) closeNav();
      else openNav();
    };

    window.IA_closeNav = closeNav;

    window.toggleNavSection = function(sectionId) {
      const content = document.getElementById(sectionId + "-content");
      const arrow = document.getElementById(sectionId + "-arrow");
      if (content && arrow) {
        content.classList.toggle("open");
        arrow.classList.toggle("open");
      }
    };

    function handleScroll() {
      if (!header) return;
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }

  function initFooterYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  async function initLayout() {
    await includeHtml("[data-include-nav]", [
      "/components/nav.html",
      "/components/nav/index.html",
      "components/nav.html",
      "components/nav/index.html"
    ]);
    await includeHtml("[data-include-footer]", [
      "/components/footer.html",
      "/components/footer/index.html",
      "components/footer.html",
      "components/footer/index.html"
    ]);
    initNav();
    initFooterYear();
    document.dispatchEvent(new CustomEvent("ia:layout-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLayout);
  } else {
    initLayout();
  }
})();
