/* Abuja Metropolitan Golf Club — site interactions & motion */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Easing helpers ---------- */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  var ease = {
    outQuart: function (t) { return 1 - Math.pow(1 - t, 4); },
    outQuint: function (t) { return 1 - Math.pow(1 - t, 5); },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  };

  /* ---------- Split display headings into masked lines ---------- */
  document.querySelectorAll(".display, .hero__title").forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (html, i) {
      return '<span class="line"><span style="--li:' + i + '">' + html.trim() + "</span></span>";
    }).join("");
  });

  /* ---------- Stagger siblings inside grids ---------- */
  [".club__grid", ".stats", ".parts", ".pillars__grid", ".speakers", ".values", ".tiers", ".features", ".gallery__grid", ".timeline"]
    .forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (wrap) {
        var step = sel === ".timeline" ? 90 : 120;
        var items = wrap.querySelectorAll(":scope > .reveal");
        items.forEach(function (el, i) { el.style.setProperty("--d", i * step + "ms"); });
      });
    });

  /* =========================================================
     Golf ball: AMGC logo printed on a sphere.
     The logo is cut into vertical strips; each strip is placed
     at its projected longitude, so it wraps and compresses
     naturally as the ball turns. Dimples slide at the same
     surface speed, under fixed lighting.
     ========================================================= */
  var ball = (function () {
    var svg = document.getElementById("heroBall");
    if (!svg) return null;
    var NS = "http://www.w3.org/2000/svg";
    var R = 134, CX = 150, CY = 140;
    var IMG_W = 823, IMG_H = 343, SRC = "assets/img/logo-amgc-green.png";
    var HALF = 36 * Math.PI / 180;               // logo spans ±36° of longitude
    var N = 22;                                   // strips
    var STEP = (2 * HALF) / N;
    var logoH = 2 * R * Math.sin(HALF) * IMG_H / IMG_W;
    var logoY = CY - logoH / 2;
    var logoGroup = document.getElementById("ballLogo");
    var bodyGroup = document.getElementById("ballBody");
    var pattern = document.getElementById("dimples");
    var contact = svg.querySelector(".ball-contact");

    logoGroup.innerHTML = "";
    var strips = [];
    for (var i = 0; i < N; i++) {
      var s = document.createElementNS(NS, "svg");
      var sw = IMG_W / N;
      s.setAttribute("viewBox", (i * sw) + " 0 " + sw + " " + IMG_H);
      s.setAttribute("preserveAspectRatio", "none");
      s.setAttribute("y", logoY.toFixed(2));
      s.setAttribute("height", logoH.toFixed(2));
      var im = document.createElementNS(NS, "image");
      im.setAttribute("href", SRC);
      im.setAttribute("width", IMG_W);
      im.setAttribute("height", IMG_H);
      s.appendChild(im);
      logoGroup.appendChild(s);
      strips.push(s);
    }

    function wrap(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; }

    function setSpin(theta) {
      for (var i = 0; i < N; i++) {
        var mid = wrap(theta - HALF + (i + .5) * STEP);
        var c = Math.cos(mid);
        var st = strips[i];
        if (c <= 0.001) { st.setAttribute("display", "none"); continue; }
        var a = clamp(mid - STEP / 2, -Math.PI / 2, Math.PI / 2);
        var b = clamp(mid + STEP / 2, -Math.PI / 2, Math.PI / 2);
        var x1 = CX + R * Math.sin(a), x2 = CX + R * Math.sin(b);
        st.setAttribute("display", "inline");
        st.setAttribute("x", (x1 - .25).toFixed(2));
        st.setAttribute("width", Math.max(0, x2 - x1 + .5).toFixed(2));
        st.setAttribute("opacity", (Math.min(1, c * 5) * .92).toFixed(3));
      }
      var off = (R * theta) % 17;
      pattern.setAttribute("patternTransform", "translate(" + off.toFixed(2) + " 0)");
    }

    function setDrop(y, land) {
      bodyGroup.setAttribute("transform", "translate(0 " + y.toFixed(2) + ")");
      contact.setAttribute("opacity", land.toFixed(3));
    }

    var busy = false;

    /* Spin from `from` to rest (0) with a soft overshoot and settle back */
    function spin(from, dur, opts) {
      opts = opts || {};
      busy = true;
      svg.classList.remove("is-settled");
      var over = from < 0 ? 0.14 : -0.14;        // ~8° past centre, then back
      var settle = 750;
      var start = null;
      return new Promise(function (resolve) {
        function frame(t) {
          if (start === null) start = t;
          var el = t - start;
          var theta;
          if (el < dur) theta = from + (over - from) * ease.outQuart(el / dur);
          else theta = over * (1 - ease.inOutSine(clamp((el - dur) / settle, 0, 1)));
          setSpin(theta);
          if (opts.drop) {
            var p = clamp(el / opts.drop, 0, 1);
            setDrop(-opts.height * (1 - ease.outQuint(p)), ease.outQuint(p));
          }
          if (el < dur + settle) requestAnimationFrame(frame);
          else { setSpin(0); busy = false; svg.classList.add("is-settled"); resolve(); }
        }
        requestAnimationFrame(frame);
      });
    }

    function intro() {
      if (reduce) { setSpin(0); setDrop(0, 1); return; }
      setSpin(-5 * Math.PI);
      setDrop(-90, 0);
      setTimeout(function () {
        spin(-5 * Math.PI, 3000, { drop: 1700, height: 90 });
      }, 380);
    }

    /* Hover / tap: one more elegant revolution */
    var lastSpin = 0;
    function again() {
      if (reduce || busy || Date.now() - lastSpin < 400) return;
      lastSpin = Date.now();
      spin(-2 * Math.PI, 1700);
    }
    svg.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") again(); });
    svg.addEventListener("click", again);

    if (reduce) { setSpin(0); setDrop(0, 1); }
    else { setSpin(-5 * Math.PI); setDrop(-90, 0); }
    return { intro: intro };
  })();

  /* ---------- Page ready: start the hero sequence ---------- */
  function ready() {
    requestAnimationFrame(function () {
      body.classList.add("is-ready");
      if (ball) ball.intro();
    });
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
  /* Safety net: never leave the hero hidden if load is slow */
  setTimeout(function () { if (!body.classList.contains("is-ready")) ready(); }, 2500);

  /* ---------- Nav: background on scroll + mobile menu ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  function navState() { nav.classList.toggle("is-scrolled", window.scrollY > 40 || nav.classList.contains("is-open")); }
  navState();

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navState();
  });
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      navState();
    });
  });

  /* ---------- Scroll-linked motion (one rAF per frame) ---------- */
  var heroBg = document.querySelector(".hero__bg");
  var hero = document.querySelector(".hero");
  var dlg = document.querySelector(".dialogue");
  var dlgBg = document.querySelector(".dialogue__bg");
  var timeline = document.querySelector(".timeline");
  var ticking = false;

  function onFrame() {
    ticking = false;
    navState();
    var vh = window.innerHeight;
    if (!reduce) {
      var y = window.scrollY;
      if (y < hero.offsetHeight) heroBg.style.setProperty("--py", (y * 0.28).toFixed(1) + "px");
      var r = dlg.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        dlgBg.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * -0.12).toFixed(1) + "px");
      }
    }
    var tr = timeline.getBoundingClientRect();
    timeline.style.setProperty("--tp", reduce ? 1 : clamp((vh * 0.78 - tr.top) / tr.height, 0, 1).toFixed(3));
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  onFrame();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.dataset.count, t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1600, 1);
          el.textContent = Math.round(end * ease.outQuart(p));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Dialogue slider ---------- */
  var slides = document.querySelectorAll(".slide");
  var now = document.getElementById("slideNow");
  var idx = 0, timer;
  function show(i) {
    slides[idx].classList.remove("is-active");
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add("is-active");
    now.textContent = String(idx + 1).padStart(2, "0");
  }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(idx + 1); }, 7000); }
  document.querySelectorAll(".slider__btn").forEach(function (b) {
    b.addEventListener("click", function () { show(idx + Number(b.dataset.dir)); auto(); });
  });
  auto();

  /* ---------- Countdown to Gala: 16 Dec 2026, 18:00 WAT (UTC+1) ---------- */
  var target = Date.UTC(2026, 11, 16, 17, 0, 0);
  var cd = document.getElementById("countdown");
  var units = {
    d: cd.querySelector('[data-unit="d"]'), h: cd.querySelector('[data-unit="h"]'),
    m: cd.querySelector('[data-unit="m"]'), s: cd.querySelector('[data-unit="s"]')
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff / 1000);
    units.d.textContent = pad(Math.floor(s / 86400));
    units.h.textContent = pad(Math.floor((s % 86400) / 3600));
    units.m.textContent = pad(Math.floor((s % 3600) / 60));
    units.s.textContent = pad(s % 60);
    if (diff === 0) {
      cd.querySelector(".countdown__label").textContent = "The Gala & Dialogue is under way — thank you for joining us.";
      return;
    }
    setTimeout(tick, 1000);
  }
  tick();

  /* ---------- Tier "Reserve" buttons preselect enquiry interest ---------- */
  var interest = document.getElementById("interest");
  document.querySelectorAll("[data-interest]").forEach(function (b) {
    b.addEventListener("click", function () { interest.value = b.dataset.interest; });
  });

  /* ---------- Enquiry form -> pre-filled email ---------- */
  var form = document.getElementById("enquiry");
  var err = document.getElementById("formError");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var d = new FormData(form);
    var name = (d.get("name") || "").trim();
    var email = (d.get("email") || "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = "Please enter your full name and a valid email address.";
      return;
    }
    err.textContent = "";
    var subject = "AMGC Enquiry: " + d.get("interest") + " — " + name;
    var bodyText = [
      "Name: " + name,
      "Organisation: " + (d.get("org") || "-"),
      "Email: " + email,
      "Phone: " + (d.get("phone") || "-"),
      "Interest: " + d.get("interest"),
      "",
      d.get("message") || ""
    ].join("\n");
    window.location.href = "mailto:abujametropolitangolfclub@gmail.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyText);
  });
})();
