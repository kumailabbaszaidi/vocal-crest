/**
 * VOCAL CREST — Motion engine (vanilla, no dependencies, ~6 KB)
 *
 *  Loader / page transitions   html.is-loading · is-arriving · is-leaving
 *  [data-split]                headline split into masked words
 *  [data-reveal]               fade-up on enter        (data-reveal="fade")
 *  [data-draw]                 hairline draws on enter
 *  [data-scrub]                words light up as you scroll through
 *  [data-speed="0.1"]          selective parallax
 *  canvas[data-wave]           live signal line that follows the cursor
 *  [data-ticker]               call transcript that plays line by line
 *  [data-counter]+[data-step]  sticky step counter
 *  [data-magnetic]             element leans toward the pointer
 *  custom cursor               fine pointers only
 *
 * Everything degrades to fully visible, static content when the visitor
 * prefers reduced motion or JS is unavailable.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Intro timing ---------- */
  var startDelay = root.classList.contains("is-loading") ? 1350 : root.classList.contains("is-arriving") ? 380 : 60;
  setTimeout(function () { root.classList.remove("is-loading", "is-arriving"); }, reduce ? 0 : 2300);
  try { sessionStorage.setItem("vc-visited", "1"); sessionStorage.removeItem("vc-arrive"); } catch (e) {}

  /* ---------- Page transitions ---------- */
  if (!reduce) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
      if (url.pathname === location.pathname && (url.hash || url.search === location.search)) return; // same-page anchors scroll natively
      e.preventDefault();
      try { sessionStorage.setItem("vc-arrive", "1"); } catch (err) {}
      root.classList.add("is-leaving");
      setTimeout(function () { location.href = url.href; }, 520);
    });
    addEventListener("pageshow", function (e) { if (e.persisted) root.classList.remove("is-leaving"); });
  }

  /* ---------- Word splitting ---------- */
  function splitWords(el) {
    var idx = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span");
            w.className = "w";
            var wi = document.createElement("span");
            wi.className = "wi";
            wi.style.setProperty("--wi", idx++);
            wi.textContent = p;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    })(el);
    return idx;
  }

  if (!reduce) {
    root.classList.add("motion");
    document.querySelectorAll("[data-split]").forEach(function (el) { el.classList.add("split"); splitWords(el); });
  }

  /* ---------- Reveal on enter ---------- */
  var revealables = document.querySelectorAll("[data-reveal], [data-split], [data-draw]");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var wait = el.getBoundingClientRect().top < innerHeight && performance.now() < startDelay + 400 ? startDelay : 0;
        setTimeout(function () { el.classList.add("in"); }, wait);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Scroll-linked work, batched in one rAF ---------- */
  var scrubs = [];
  document.querySelectorAll("[data-scrub]").forEach(function (el) {
    if (reduce) return;
    var n = splitWords(el);
    el.classList.add("scrub");
    scrubs.push({ el: el, words: el.querySelectorAll(".wi"), n: n, lit: -1 });
  });
  var parallax = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll("[data-speed]"));

  var ticking = false;
  function onFrame() {
    ticking = false;
    var vh = innerHeight;
    scrubs.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var lit = Math.round(Math.max(0, Math.min(1, p)) * s.n);
      if (lit === s.lit) return;
      for (var i = 0; i < s.n; i++) s.words[i].classList.toggle("lit", i < lit);
      s.lit = lit;
    });
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  if (scrubs.length || parallax.length) {
    addEventListener("scroll", requestFrame, { passive: true });
    addEventListener("resize", requestFrame);
    onFrame();
  }

  /* ---------- Signal line canvas ---------- */
  var pointer = { x: 0.5, y: 0.5, active: false };
  addEventListener("pointermove", function (e) { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; pointer.active = true; }, { passive: true });

  document.querySelectorAll("canvas[data-wave]").forEach(function (cv) {
    var ctx = cv.getContext("2d");
    if (!ctx) return;
    var lines = parseInt(cv.dataset.lines || "6", 10);
    var ampK = parseFloat(cv.dataset.amp || "1");
    var w = 0, h = 0, dpr = 1, t = Math.random() * 100, focus = 0.62, visible = true, raf = 0;

    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var target = pointer.active ? pointer.x : 0.62;
      focus += (target - focus) * 0.045;
      var fx = focus * w, spread = Math.max(w * 0.16, 140), mid = h / 2;
      for (var k = 0; k < lines; k++) {
        var kk = k / Math.max(1, lines - 1);
        ctx.beginPath();
        for (var x = 0; x <= w; x += 3) {
          var d = (x - fx) / spread;
          var env = Math.exp(-d * d) * 0.85 + 0.08;
          var y = mid +
            Math.sin(x * (0.012 + kk * 0.006) + t * (1.1 + kk * 0.6) + k) * h * 0.26 * env * ampK +
            Math.sin(x * 0.031 - t * 1.7 + k * 2.1) * h * 0.06 * env * ampK;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = k === 0 ? "rgba(22,220,235,0.95)" : "rgba(22,220,235," + (0.08 + (1 - kk) * 0.22).toFixed(3) + ")";
        ctx.lineWidth = k === 0 ? 1.4 : 1;
        ctx.stroke();
      }
      t += 0.012;
    }
    function loop() { draw(); raf = visible ? requestAnimationFrame(loop) : 0; }
    size();
    addEventListener("resize", function () { size(); if (reduce) draw(); });
    if (reduce) { draw(); return; }
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible && !raf) loop();
    }).observe(cv);
  });

  /* ---------- Transcript ticker ---------- */
  document.querySelectorAll("[data-ticker]").forEach(function (list) {
    if (reduce) return;
    var rows = list.querySelectorAll("li");
    var i = 0;
    list.classList.add("is-playing");
    function step() {
      if (i === 0) rows.forEach(function (r) { r.classList.remove("on"); });
      rows[i].classList.add("on");
      i = (i + 1) % rows.length;
      setTimeout(step, i === 0 ? 4200 : 1300);
    }
    setTimeout(step, startDelay + 500);
  });

  /* ---------- Sticky step counter ---------- */
  document.querySelectorAll("[data-counter]").forEach(function (counter) {
    var scope = counter.closest("[data-counter-scope]") || document;
    var steps = scope.querySelectorAll("[data-step]");
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = parseInt(en.target.dataset.step, 10);
        counter.style.setProperty("--step", n);
        steps.forEach(function (s) { s.classList.toggle("is-active", s === en.target); });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io2.observe(s); });
  });

  /* ---------- Cursor & magnetic elements ---------- */
  if (finePointer && !reduce) {
    var cursor = document.createElement("div");
    cursor.className = "cursor is-hidden";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML = '<div class="cursor__ring"></div>';
    document.body.appendChild(cursor);
    var cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", function () { cursor.classList.add("is-hidden"); });
    addEventListener("pointerdown", function () { cursor.classList.add("is-down"); });
    addEventListener("pointerup", function () { cursor.classList.remove("is-down"); });
    document.addEventListener("pointerover", function (e) {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, [data-cursor], summary, label, input, textarea"));
    });
    (function follow() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(follow);
    })();

    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.22;
        var my = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = "translate3d(" + mx + "px," + my + "px,0)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
      el.style.transition = "transform .6s cubic-bezier(.19,1,.22,1), color .5s, border-color .5s";
    });
  }
})();
