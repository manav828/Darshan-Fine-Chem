/* Darshan Fine Chem — site interactions */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Header scroll state ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Hero dossier rotation ---- */
  var dossier = document.querySelector("[data-dossier]");
  if (dossier) {
    var products = [
      { formula: "PCl\u2083", name: "Phosphorus Trichloride", cas: "7719-12-2", un: "UN 1809", assay: "\u2265 99.5%", form: "Fuming liquid" },
      { formula: "POCl\u2083", name: "Phosphorus Oxychloride", cas: "10025-87-3", un: "UN 1810", assay: "\u2265 99.5%", form: "Fuming liquid" },
      { formula: "PCl\u2085", name: "Phosphorus Pentachloride", cas: "10026-13-8", un: "UN 1806", assay: "\u2265 99.0%", form: "Crystalline solid" },
      { formula: "P\u2082O\u2085", name: "Phosphorus Pentoxide", cas: "1314-56-3", un: "UN 1807", assay: "\u2265 98.5%", form: "Deliquescent powder" },
      { formula: "P(C\u2086H\u2085)\u2083", name: "Triphenyl Phosphine", cas: "603-35-0", un: "Non-hazardous", assay: "\u2265 99.5%", form: "Crystalline flakes" },
      { formula: "H\u2099\u208A\u2082P\u2099O\u2083\u2099\u208A\u2081", name: "Polyphosphoric Acid", cas: "8017-16-1", un: "UN 3264", assay: "115\u2013117% eq.", form: "Viscous liquid" }
    ];

    var fadeEl = dossier.querySelector(".dossier-fade");
    var formulaEl = dossier.querySelector(".dossier-formula");
    var nameEl = dossier.querySelector(".dossier-name");
    var casEl = dossier.querySelector("[data-spec='cas']");
    var unEl = dossier.querySelector("[data-spec='un']");
    var assayEl = dossier.querySelector("[data-spec='assay']");
    var formEl = dossier.querySelector("[data-spec='form']");
    var countEl = dossier.querySelector(".dossier-count");
    var dotsWrap = dossier.querySelector(".dossier-dots");
    var current = 0;
    var timer = null;

    products.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show product " + (i + 1));
      if (i === 0) b.classList.add("is-active");
      b.addEventListener("click", function () {
        show(i);
        restart();
      });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll("button");

    function render(i) {
      var p = products[i];
      formulaEl.textContent = p.formula;
      nameEl.textContent = p.name;
      casEl.textContent = p.cas;
      unEl.textContent = p.un;
      assayEl.textContent = p.assay;
      formEl.textContent = p.form;
      countEl.textContent = "0" + (i + 1) + " / 06";
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === i); });
    }

    function show(i) {
      if (i === current) { render(i); return; }
      current = i;
      if (prefersReducedMotion) { render(i); return; }
      fadeEl.classList.add("is-out");
      window.setTimeout(function () {
        render(i);
        fadeEl.classList.remove("is-out");
      }, 320);
    }

    function next() { show((current + 1) % products.length); }
    function restart() {
      if (timer) window.clearInterval(timer);
      if (!prefersReducedMotion) timer = window.setInterval(next, 4200);
    }
    render(0);
    restart();
  }

  /* ---- FAQ: close others when one opens ---- */
  var faqWrap = document.querySelector(".faq");
  if (faqWrap) {
    var details = faqWrap.querySelectorAll("details");
    details.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) {
          details.forEach(function (other) {
            if (other !== d) other.open = false;
          });
        }
      });
    });
  }

  /* ---- Contact form: assemble mailto enquiry ---- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var company = (data.get("company") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var product = (data.get("product") || "").toString().trim();
      var qty = (data.get("quantity") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var subject = "Enquiry — " + (product || "General") + (company ? " — " + company : "");
      var lines = [
        "Name: " + name,
        "Company: " + company,
        "Email: " + email,
        "Phone: " + phone,
        "Product of interest: " + product,
        "Estimated quantity: " + qty,
        "",
        "Requirement details:",
        message
      ];
      var href = "mailto:" + form.getAttribute("data-contact-form") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = href;

      var note = form.querySelector(".form-status");
      if (note) {
        note.textContent = "Your email client should now open with the enquiry pre-filled. If it does not, write to us directly at " + form.getAttribute("data-contact-form") + ".";
      }
    });
  }
})();
