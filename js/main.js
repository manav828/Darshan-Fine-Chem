/* Darshan Fine Chem — Site Interactions & Smooth Navigation */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pageLoadedAt = Date.now();
  var COOLDOWN_SECONDS = 30;
  var MAX_SUBMISSIONS_PER_HOUR = 5;
  var pageCache = {};

  /* ============================================================
     COMPONENT INITIALIZATION
     ============================================================ */
  function initPageComponents(scope) {
    scope = scope || document;

    /* ---- Footer year ---- */
    scope.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---- Reveal on scroll ---- */
    var revealEls = scope.querySelectorAll(".reveal:not(.is-visible)");
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
        { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---- Interactive Industry Showcase (Dynamic Hover & Tap) ---- */
    scope.querySelectorAll("[data-industry-showcase]").forEach(function (showcase) {
      var pills = showcase.querySelectorAll("[data-industry-target]");
      var slides = showcase.querySelectorAll("[data-industry-slide]");

      function activateIndustry(targetKey) {
        pills.forEach(function (pill) {
          var isMatch = pill.getAttribute("data-industry-target") === targetKey;
          pill.classList.toggle("is-active", isMatch);
          pill.setAttribute("aria-selected", isMatch ? "true" : "false");
        });
        slides.forEach(function (slide) {
          var isMatch = slide.getAttribute("data-industry-slide") === targetKey;
          slide.classList.toggle("is-active", isMatch);
        });
      }

      pills.forEach(function (pill) {
        var targetKey = pill.getAttribute("data-industry-target");
        pill.addEventListener("mouseenter", function () {
          activateIndustry(targetKey);
        });
        pill.addEventListener("click", function (e) {
          e.preventDefault();
          activateIndustry(targetKey);
        });
        pill.addEventListener("focus", function () {
          activateIndustry(targetKey);
        });
      });
    });

    /* ---- FAQ: details-based ---- */
    scope.querySelectorAll("[data-faq]").forEach(function (wrap) {
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

    /* ---- FAQ: button accordion ---- */
    scope.querySelectorAll(".faq-question").forEach(function (btn) {
      btn.onclick = function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var answer = document.getElementById(btn.getAttribute("aria-controls"));

        var list = btn.closest(".faq-list");
        if (list) {
          list.querySelectorAll(".faq-question").forEach(function (other) {
            if (other !== btn) {
              other.setAttribute("aria-expanded", "false");
              var otherItem = other.closest(".faq-item");
              if (otherItem) otherItem.classList.remove("is-open");
              var otherAnswer = document.getElementById(other.getAttribute("aria-controls"));
              if (otherAnswer) otherAnswer.classList.remove("is-open");
            }
          });
        }

        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        var parentItem = btn.closest(".faq-item");
        if (parentItem) parentItem.classList.toggle("is-open", !expanded);
        if (answer) answer.classList.toggle("is-open", !expanded);
      };
    });

    /* ---- Product Slider Controls ---- */
    scope.querySelectorAll(".product-slider-wrapper").forEach(function (wrapper) {
      var slider = wrapper.querySelector(".product-slider");
      var section = wrapper.closest("section");
      if (!slider || !section) return;

      var prevBtn = section.querySelector(".slider-btn--prev, .slider-arrow--prev");
      var nextBtn = section.querySelector(".slider-btn--next, .slider-arrow--next");

      if (prevBtn) {
        prevBtn.onclick = function () {
          var card = slider.querySelector(".product-slider-card");
          var scrollAmount = card ? card.offsetWidth + 20 : 300;
          slider.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        };
      }
      if (nextBtn) {
        nextBtn.onclick = function () {
          var card = slider.querySelector(".product-slider-card");
          var scrollAmount = card ? card.offsetWidth + 20 : 300;
          slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
        };
      }
    });

    /* ---- Forms: AJAX submission via Web3Forms with Rate Limiting ---- */
    scope.querySelectorAll("[data-contact-form], [data-career-form]").forEach(function (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var isCareer = form.hasAttribute("data-career-form");
        var formType = isCareer ? "career" : "contact";
        var note = form.querySelector(".form-status");
        var submitBtn = form.querySelector("button[type='submit']");
        var originalBtnHtml = submitBtn ? submitBtn.innerHTML : (isCareer ? "SUBMIT APPLICATION" : "Send Enquiry");

        // 1. Anti-Bot: Check Honeypot
        var botField = form.querySelector("input[name='botcheck']");
        if (botField && botField.checked) {
          if (note) {
            note.textContent = "Spam detected. Submission rejected.";
            note.style.color = "#dc2626";
            note.style.display = "block";
          }
          return;
        }

        // 2. Anti-Bot: Fast submit check (< 1.5s)
        if (Date.now() - pageLoadedAt < 1500) {
          if (note) {
            note.textContent = "Submission was too fast. Please review your details and submit again.";
            note.style.color = "#dc2626";
            note.style.display = "block";
          }
          return;
        }

        // 3. Rate Limit Check
        var rateCheck = checkRateLimit(formType);
        if (!rateCheck.allowed) {
          if (note) {
            note.textContent = rateCheck.reason;
            note.style.color = "#dc2626";
            note.style.display = "block";
          }
          return;
        }

        // 4. File Size & Type Check
        var fileInput = form.querySelector("input[type='file']");
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          var file = fileInput.files[0];
          var maxBytes = 5 * 1024 * 1024; // 5 MB
          if (file.size > maxBytes) {
            if (note) {
              note.textContent = "Resume file size exceeds the 5 MB limit. Please select a smaller file.";
              note.style.color = "#dc2626";
              note.style.display = "block";
            }
            return;
          }
        }

        // 5. Submit with Lock
        if (note) {
          note.textContent = isCareer ? "Submitting application..." : "Sending enquiry...";
          note.style.color = "var(--navy)";
          note.style.display = "block";
        }
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = "0.75";
          submitBtn.innerHTML = "Submitting...";
        }

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: new FormData(form)
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            recordSubmission(formType);
            if (note) {
              note.textContent = isCareer
                ? "Thank you! Your application has been submitted successfully. Our HR team will review your profile and contact you."
                : "Thank you! Your enquiry has been received. Our sales team will get back to you shortly.";
              note.style.color = "#15803d";
              note.style.fontWeight = "600";
              note.style.marginTop = "14px";
            }
            form.reset();
          } else {
            if (note) {
              note.textContent = data.message || (isCareer 
                ? "Submission error. Please verify the fields or email your resume directly to info@dfcpl.in." 
                : "Something went wrong. Please try again or write directly to info@dfcpl.in.");
              note.style.color = "#dc2626";
              note.style.marginTop = "14px";
            }
          }
        })
        .catch(function () {
          if (note) {
            note.textContent = isCareer 
              ? "Network error. Please try again or email your CV directly to info@dfcpl.in."
              : "Network error. Please try again or email us directly at info@dfcpl.in.";
            note.style.color = "#dc2626";
            note.style.marginTop = "14px";
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.innerHTML = originalBtnHtml;
          }
        });
      };
    });
  }

  function checkRateLimit(formType) {
    var storageKey = "dfcpl_form_limiter_" + formType;
    var now = Date.now();
    var history = [];
    try {
      var raw = localStorage.getItem(storageKey);
      if (raw) history = JSON.parse(raw);
    } catch (err) {
      history = [];
    }
    history = history.filter(function (ts) { return now - ts < 60 * 60 * 1000; });
    if (history.length > 0) {
      var lastSubmit = history[history.length - 1];
      var secondsSinceLast = Math.floor((now - lastSubmit) / 1000);
      if (secondsSinceLast < COOLDOWN_SECONDS) {
        return {
          allowed: false,
          reason: "Please wait " + (COOLDOWN_SECONDS - secondsSinceLast) + " seconds before submitting another request."
        };
      }
    }
    if (history.length >= MAX_SUBMISSIONS_PER_HOUR) {
      return {
        allowed: false,
        reason: "Submission limit reached (maximum " + MAX_SUBMISSIONS_PER_HOUR + " per hour). Please contact us directly via email if urgent."
      };
    }
    return { allowed: true };
  }

  function recordSubmission(formType) {
    var storageKey = "dfcpl_form_limiter_" + formType;
    var now = Date.now();
    var history = [];
    try {
      var raw = localStorage.getItem(storageKey);
      if (raw) history = JSON.parse(raw);
    } catch (err) {
      history = [];
    }
    history.push(now);
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (err) {}
  }

  /* ============================================================
     HEADER & GLOBAL EVENTS
     ============================================================ */
  function initHeaderEvents() {
    var header = document.querySelector(".site-header");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      onScroll();
      window.removeEventListener("scroll", onScroll);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var navToggle = document.querySelector(".nav-toggle");
    var mainNav = document.querySelector(".main-nav");
    if (navToggle && mainNav) {
      navToggle.onclick = function (e) {
        e.stopPropagation();
        var open = mainNav.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      };

      var dropdown = mainNav.querySelector(".nav-dropdown");
      if (dropdown) {
        var dropLink = dropdown.querySelector(":scope > a");
        if (dropLink) {
          dropLink.onclick = function (e) {
            if (window.innerWidth <= 991) {
              e.preventDefault();
              e.stopPropagation();
              dropdown.classList.toggle("is-open");
            }
          };
        }
      }

      mainNav.querySelectorAll("a").forEach(function (a) {
        if (a.closest(".nav-dropdown") && a === a.closest(".nav-dropdown").querySelector(":scope > a")) {
          return;
        }
        a.onclick = function () {
          mainNav.classList.remove("is-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        };
      });
    }
  }

  /* ============================================================
     SMOOTH SEAMLESS PAGE TRANSITIONS (ZERO FLASH)
     ============================================================ */
  function updateActiveNav(targetUrl) {
    var path = targetUrl.split("/").pop().split("?")[0].split("#")[0] || "index.html";
    if (!path.endsWith(".html") && !path.includes(".")) path = "index.html";

    var header = document.querySelector(".site-header");
    if (header) {
      if (path === "index.html" || path === "") {
        header.classList.add("site-header--home");
      } else {
        header.classList.remove("site-header--home");
      }
    }

    document.querySelectorAll(".main-nav a, .nav-dropdown .dropdown-menu a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var linkPath = href.split("?")[0].split("#")[0];
      var isCurrent = (linkPath === path) || (path === "index.html" && linkPath === "/");

      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function fetchPage(url) {
    if (pageCache[url]) {
      return Promise.resolve(pageCache[url]);
    }
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        pageCache[url] = html;
        return html;
      });
  }

  function navigateTo(url, pushHistory) {
    var cleanUrl = url.split("#")[0];
    var hash = url.includes("#") ? url.substring(url.indexOf("#")) : "";

    var mainEl = document.querySelector("main#main") || document.body;

    fetchPage(cleanUrl)
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var newMain = doc.querySelector("main#main");
        if (!newMain) {
          window.location.href = url;
          return;
        }

        var applySwap = function () {
          document.title = doc.title;
          mainEl.innerHTML = newMain.innerHTML;

          // Copy main class or attributes if any
          mainEl.className = newMain.className;

          updateActiveNav(cleanUrl);

          if (hash) {
            var target = document.querySelector(hash);
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollTo(0, 0);
            }
          } else {
            window.scrollTo(0, 0);
          }

          if (pushHistory) {
            window.history.pushState({ url: url }, "", url);
          }

          pageLoadedAt = Date.now();
          initPageComponents(mainEl);
          initHeaderEvents();
        };

        if (document.startViewTransition && !prefersReducedMotion) {
          document.startViewTransition(applySwap);
        } else {
          mainEl.classList.add("is-transitioning");
          setTimeout(function () {
            applySwap();
            mainEl.classList.remove("is-transitioning");
          }, 120);
        }
      })
      .catch(function () {
        // Fallback to standard browser navigation
        window.location.href = url;
      });
  }

  function setupInstantNavigation() {
    // Intercept clicks on internal links
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      var link = e.target.closest("a");
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href) return;

      // Ignore hash-only, mailto, tel, javascript, external links
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        return;
      }
      if (link.target && link.target !== "_self") return;

      var currentHost = window.location.host;
      var linkUrl;
      try {
        linkUrl = new URL(link.href, window.location.href);
      } catch (err) {
        return;
      }

      // Check same origin
      if (linkUrl.host !== currentHost && window.location.protocol !== "file:") {
        return;
      }

      // Don't intercept downloadable media files
      if (/\.(pdf|zip|mp4|png|jpg|jpeg|svg)$/i.test(linkUrl.pathname)) {
        return;
      }

      // If on file: protocol, only intercept relative .html files
      if (window.location.protocol === "file:") {
        if (!href.endsWith(".html") && !href.includes(".html#")) {
          return;
        }
      }

      // If clicking same page link with just hash
      var targetPath = linkUrl.pathname.split("/").pop();
      var currentPath = window.location.pathname.split("/").pop() || "index.html";
      if (targetPath === currentPath && linkUrl.hash) {
        return; // Allow native hash scroll
      }

      e.preventDefault();
      navigateTo(href, true);
    });

    // Prefetch on hover/touch for instantaneous 0ms response
    document.addEventListener("mouseover", function (e) {
      var link = e.target.closest("a");
      if (!link) return;
      var href = link.getAttribute("href");
      if (href && (href.endsWith(".html") || href.includes(".html#")) && !href.startsWith("http")) {
        fetchPage(href.split("#")[0]).catch(function () {});
      }
    }, { passive: true });

    document.addEventListener("touchstart", function (e) {
      var link = e.target.closest("a");
      if (!link) return;
      var href = link.getAttribute("href");
      if (href && (href.endsWith(".html") || href.includes(".html#")) && !href.startsWith("http")) {
        fetchPage(href.split("#")[0]).catch(function () {});
      }
    }, { passive: true });

    // Handle browser Back / Forward buttons
    window.addEventListener("popstate", function () {
      navigateTo(window.location.href, false);
    });
  }

  /* ============================================================
     INITIAL LOAD
     ============================================================ */
  initPageComponents(document);
  initHeaderEvents();
  setupInstantNavigation();

})();
