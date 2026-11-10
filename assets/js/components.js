/**
 * VOCAL CREST — Shared layout components
 * Renders the header, full-screen menu and footer on every page, and binds
 * config-driven content (phone CTAs, pricing, contact details).
 *
 *   <header class="site-header" data-component="header"></header>
 *   <footer class="site-footer" data-component="footer"></footer>
 */
(function () {
  "use strict";

  var cfg = window.VC_CONFIG || {};
  var nav = cfg.nav || [];
  var contact = cfg.contact || {};
  var phone = contact.phone || {};

  var ARROW = '<svg class="btn__arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';
  var ARROW_UR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 12L12 4M5 4h7v7"/></svg>';

  function norm(p) { return p.replace(/index\.html$/, "").replace(/\/?$/, "/"); }
  function current(href) { return norm(location.pathname) === norm(href) ? ' aria-current="page"' : ""; }
  function roll(text) { return '<span class="roll"><span class="roll__in" data-text="' + text + '">' + text + "</span></span>"; }
  function logo(h, lazy) {
    return '<img src="/assets/img/vocal-crest-logo-dark.png" alt="Vocal Crest" width="899" height="165" style="height:' + h + '" decoding="async"' + (lazy ? ' loading="lazy"' : "") + ">";
  }
  window.VC_ICONS = { arrow: ARROW, arrowUR: ARROW_UR };

  /* ---------- Header + menu ---------- */
  var header = document.querySelector('[data-component="header"]');
  if (header) {
    header.innerHTML =
      '<div class="container site-header__inner">' +
        '<a class="brand" href="/" aria-label="Vocal Crest — Home">' + logo("") + "</a>" +
        '<nav class="nav" aria-label="Primary">' +
          nav.map(function (i) { return '<a class="nav__link" href="' + i.href + '"' + current(i.href) + ">" + roll(i.label) + "</a>"; }).join("") +
        "</nav>" +
        '<a class="btn btn--primary btn--sm header-cta" href="/contact/" data-magnetic>' + roll("Get Started") + ARROW + "</a>" +
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu"><span class="menu-toggle__label">Menu</span><span class="menu-toggle__bars" aria-hidden="true"></span></button>' +
      "</div>";

    var menu = document.createElement("div");
    menu.className = "menu";
    menu.id = "site-menu";
    menu.setAttribute("aria-label", "Site menu");
    menu.innerHTML =
      '<nav aria-label="Mobile"><ul class="menu__list">' +
        nav.map(function (i, n) {
          return '<li><a class="menu__link" style="--i:' + n + '" href="' + i.href + '"' + current(i.href) + "><small>0" + (n + 1) + "</small>" + i.label + "</a></li>";
        }).join("") +
      "</ul></nav>" +
      '<div class="menu__foot"><a class="btn btn--primary" href="/contact/">Get Started' + ARROW + '</a><span class="label">' + (cfg.region || "") + "</span></div>";
    header.after(menu);

    var toggle = header.querySelector(".menu-toggle");
    var label = header.querySelector(".menu-toggle__label");
    var body = document.body;
    var setOpen = function (open) {
      body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Close" : "Menu";
      if (open) { menu.removeAttribute("inert"); } else { menu.setAttribute("inert", ""); }
    };
    setOpen(false);
    toggle.addEventListener("click", function () { setOpen(!body.classList.contains("menu-open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && body.classList.contains("menu-open")) { setOpen(false); toggle.focus(); }
    });
    matchMedia("(min-width: 961px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });

    /* Solid on scroll · hide when scrolling down · reveal when scrolling up */
    var lastY = scrollY;
    var onScroll = function () {
      var y = scrollY;
      header.classList.toggle("is-solid", y > 40);
      if (!body.classList.contains("menu-open")) {
        header.classList.toggle("is-hidden", y > 320 && y > lastY + 2);
        if (y < lastY - 2) header.classList.remove("is-hidden");
      }
      lastY = y;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });
  }

  /* ---------- Footer ---------- */
  var footer = document.querySelector('[data-component="footer"]');
  if (footer) {
    var contactLinks = "";
    if (phone.tel) {
      contactLinks += '<li><a href="tel:' + phone.tel + '">Call ' + phone.display + "</a></li>";
      contactLinks += '<li><a href="sms:' + phone.tel + '">Text ' + phone.display + "</a></li>";
    }
    if (contact.email) contactLinks += '<li><a href="mailto:' + contact.email + '">' + contact.email + "</a></li>";
    contactLinks += '<li><a href="/contact/">Contact form</a></li>';

    footer.innerHTML =
      '<div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-ask">' +
            '<p class="label"><span class="label__idx">VC</span>Have a question?</p>' +
            '<a class="t-d2" href="/contact/">Let\u2019s talk ' + ARROW_UR + "</a>" +
            '<p class="t-dim" style="max-width:380px">' + ((cfg.brand && cfg.brand.tagline) || "") + "</p>" +
          "</div>" +
          '<div class="footer-col"><h2 class="label">Pages</h2><ul>' +
            nav.map(function (i) { return '<li><a href="' + i.href + '">' + i.label + "</a></li>"; }).join("") +
          "</ul></div>" +
          '<div class="footer-col"><h2 class="label">Product</h2><ul>' +
            '<li><a href="/#how-it-works">How it works</a></li>' +
            '<li><a href="/#forwarding">Call forwarding</a></li>' +
            '<li><a href="/#features">Features</a></li>' +
            '<li><a href="/pricing/#faq">Pricing FAQ</a></li>' +
          "</ul></div>" +
          '<div class="footer-col"><h2 class="label">Contact</h2><ul>' + contactLinks + "</ul></div>" +
        "</div>" +
        '<div class="footer-bottom">' +
          '<a href="/" aria-label="Vocal Crest — Home">' + logo("28px", true) + "</a>" +
          "<span>" + (cfg.region || "") + "</span>" +
          "<span>&copy; " + new Date().getFullYear() + " Vocal Crest. All rights reserved.</span>" +
        "</div>" +
      "</div>";
  }

  /* ---------- Phone-aware CTAs ----------
     <a data-phone="call|text" data-fallback="/contact/"> uses the configured
     number when available, otherwise the fallback URL. */
  document.querySelectorAll("[data-phone]").forEach(function (a) {
    if (phone.tel) a.href = (a.dataset.phone === "text" ? "sms:" : "tel:") + phone.tel;
    else if (a.dataset.fallback) a.href = a.dataset.fallback;
  });

  /* ---------- Pricing bindings ---------- */
  var pr = cfg.pricing || {};
  document.querySelectorAll("[data-price]").forEach(function (n) {
    var v = pr[n.dataset.price];
    if (v != null) n.textContent = v;
  });
  document.querySelectorAll("[data-price-features]").forEach(function (ul) {
    if (!pr.features) return;
    var numbered = ul.hasAttribute("data-numbered");
    ul.innerHTML = pr.features.map(function (f, i) {
      return "<li>" + (numbered ? '<span class="k">' + String(i + 1).padStart(2, "0") + "</span>" : "") + "<span>" + f + "</span></li>";
    }).join("");
  });
  document.querySelectorAll("[data-pricing-status]").forEach(function (n) {
    n.hidden = !!pr.approved;
  });

  /* ---------- Contact details ----------
     <span data-contact="phone|email"> renders the configured value or an
     unmistakable placeholder. */
  document.querySelectorAll("[data-contact]").forEach(function (n) {
    var type = n.dataset.contact;
    if (type === "phone" && phone.tel) {
      n.innerHTML = '<a class="link" href="tel:' + phone.tel + '">' + phone.display + "</a>";
    } else if (type === "email" && contact.email) {
      n.innerHTML = '<a class="link" href="mailto:' + contact.email + '">' + contact.email + "</a>";
    } else {
      n.classList.add("is-placeholder");
      n.textContent = type === "phone" ? "[ Phone number — to be added ]" : "[ Email address — to be added ]";
    }
  });
})();
