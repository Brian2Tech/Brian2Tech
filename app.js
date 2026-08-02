/* ============================================================
   BRIAN2TECH — SHARED SCRIPT
   Loaded on every page: nav, reveal-on-scroll, ambient parallax,
   stat count-up. Page-specific logic (work filter, project loader)
   lives inline at the bottom of index.html / project.html.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- footer year ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- mobile nav toggle ----
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- scroll-triggered reveal, staggered by DOM order within each group ----
  var revealEls = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    // simple per-element stagger based on position among siblings
    var siblingCounters = new WeakMap();
    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      var count = siblingCounters.get(parent) || 0;
      el.style.transitionDelay = Math.min(count * 70, 280) + 'ms';
      siblingCounters.set(parent, count + 1);
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---- ambient orb parallax on mouse move (subtle, desktop only) ----
  if (!reduceMotion && window.matchMedia('(min-width: 900px)').matches) {
    var orbs = document.querySelectorAll('.orb');
    var ticking = false;
    window.addEventListener('mousemove', function (e) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var xRatio = (e.clientX / window.innerWidth) - 0.5;
        var yRatio = (e.clientY / window.innerHeight) - 0.5;
        orbs.forEach(function (orb, i) {
          var strength = (i + 1) * 14;
          orb.style.transform = 'translate(' + (xRatio * strength) + 'px, ' + (yRatio * strength) + 'px)';
        });
        ticking = false;
      });
    });
  }

  // ---- spotlight cursor glow on .spotlight cards ----
  if (!reduceMotion) {
    document.querySelectorAll('.spotlight').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }

  // ---- stat count-up, triggered when stat cards enter view ----
  var statEls = document.querySelectorAll('.stat-num[data-count]');
  if (statEls.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      var start = 0;
      var duration = 1200;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(start + (target - start) * eased);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statEls.forEach(function (el) { statObserver.observe(el); });
    } else {
      statEls.forEach(animateCount);
    }
  }
})();
