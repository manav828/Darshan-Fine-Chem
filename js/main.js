/* Darshan Fine Chem — site interactions (corporate theme v2) */
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- FAQ: close others when one opens ---- */
  document.querySelectorAll("[data-faq]").forEach(function (wrap) {
    var items = wrap.querySelectorAll("details");
    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) {
          items.forEach(function (other) {
            if (other !== d) other.open = false;
          });
        }
      });
    });
  });

  /* ---- Contact form: assemble mailto enquiry ---- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || "").toString().trim(); };

      var subject = "Enquiry — " + (get("product") || "General") + (get("company") ? " — " + get("company") : "");
      var lines = [
        "Name: " + get("name"),
        "Company: " + get("company"),
        "Email: " + get("email"),
        "Phone: " + get("phone"),
        "Product of interest: " + get("product"),
        "Estimated quantity: " + get("quantity"),
        "",
        "Requirement details:",
        get("message")
      ];
      window.location.href = "mailto:" + form.getAttribute("data-contact-form") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      var note = form.querySelector(".form-status");
      if (note) {
        note.textContent = "Your email client should now open with the enquiry pre-filled. If it does not, write to us directly at " + form.getAttribute("data-contact-form") + ".";
      }
    });
  }
})();
