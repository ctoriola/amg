/* Abuja Metropolitan Golf Club — site interactions */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---- Nav: background on scroll + mobile menu ---- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) nav.classList.add("is-scrolled");
    else onScroll();
  });
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Stat counters ---- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counters = document.querySelectorAll("[data-count]");
  if (!reduce && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.dataset.count, t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---- Dialogue slider ---- */
  var slides = document.querySelectorAll(".slide");
  var now = document.getElementById("slideNow");
  var idx = 0, timer;
  function show(i) {
    slides[idx].classList.remove("is-active");
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add("is-active");
    now.textContent = String(idx + 1).padStart(2, "0");
  }
  function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { show(idx + 1); }, 6500); }
  document.querySelectorAll(".slider__btn").forEach(function (b) {
    b.addEventListener("click", function () { show(idx + Number(b.dataset.dir)); auto(); });
  });
  auto();

  /* ---- Countdown to Gala: 16 Dec 2026, 18:00 WAT (UTC+1) ---- */
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

  /* ---- Tier "Reserve" buttons preselect enquiry interest ---- */
  var interest = document.getElementById("interest");
  document.querySelectorAll("[data-interest]").forEach(function (b) {
    b.addEventListener("click", function () { interest.value = b.dataset.interest; });
  });

  /* ---- Enquiry form -> pre-filled email ---- */
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
    var body = [
      "Name: " + name,
      "Organisation: " + (d.get("org") || "-"),
      "Email: " + email,
      "Phone: " + (d.get("phone") || "-"),
      "Interest: " + d.get("interest"),
      "",
      d.get("message") || ""
    ].join("\n");
    window.location.href = "mailto:abujametropolitangolfclub@gmail.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
})();
