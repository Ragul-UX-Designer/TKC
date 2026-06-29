/* ===== The King's Court — interactions ===== */
(function () {
  "use strict";

  /* Year */
  var yEl = document.getElementById("year");
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* Mobile nav */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  var navBackdrop = document.getElementById("navBackdrop");

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("open", open);
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-lock", open);
    if (navBackdrop) {
      navBackdrop.classList.toggle("open", open);
      if (open) navBackdrop.removeAttribute("hidden");
      else navBackdrop.setAttribute("hidden", "");
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    if (navBackdrop) navBackdrop.addEventListener("click", function () { setNav(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) setNav(false);
    });
  }

  /* Floor-plan tabs */
  var tabs = document.querySelectorAll(".fp__tab");
  var panels = document.querySelectorAll(".fp__panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var t = tab.getAttribute("data-tab");
      tabs.forEach(function (x) { x.classList.remove("is-active"); });
      panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === t); });
      tab.classList.add("is-active");
    });
  });

  /* Walkthrough — replace poster with embedded video on play.
     Set WALK_VIDEO_URL to a YouTube/Vimeo embed URL when available. */
  var WALK_VIDEO_URL = ""; // e.g. "https://www.youtube.com/embed/XXXXXXXXXXX"
  var walkPlay = document.getElementById("walkPlay");
  var walkVideo = document.getElementById("walkVideo");
  if (walkPlay && walkVideo) {
    walkPlay.addEventListener("click", function () {
      if (WALK_VIDEO_URL) {
        walkVideo.innerHTML =
          '<iframe src="' + WALK_VIDEO_URL + '?autoplay=1" title="Walkthrough" ' +
          'allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>';
      } else {
        var hint = walkVideo.querySelector(".walk__hint");
        if (hint) hint.textContent = "Walkthrough video coming soon — call 044 4000 5000 for a guided tour.";
        walkPlay.style.display = "none";
      }
    });
  }

  /* Lightbox gallery */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item[data-src]"));
  var current = 0;

  function openLb(i) {
    current = i;
    lbImg.setAttribute("src", items[current].getAttribute("data-src"));
    lbImg.setAttribute("alt", items[current].querySelector("img") ? items[current].querySelector("img").alt : "");
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }
  function closeLb() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }
  function step(d) { current = (current + d + items.length) % items.length; openLb(current); }

  items.forEach(function (it, i) { it.addEventListener("click", function () { openLb(i); }); });
  if (lb) {
    document.getElementById("lbClose").addEventListener("click", closeLb);
    document.getElementById("lbNext").addEventListener("click", function () { step(1); });
    document.getElementById("lbPrev").addEventListener("click", function () { step(-1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* Modals (Terms / Privacy) */
  document.querySelectorAll("[data-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var m = document.getElementById("modal-" + trigger.getAttribute("data-modal"));
      if (m) { m.classList.add("open"); m.setAttribute("aria-hidden", "false"); }
    });
  });
  document.querySelectorAll(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target === m || e.target.hasAttribute("data-close")) {
        m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
      }
    });
  });

  /* ===== Enquire form validation + submission ===== */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/marketing@thekings-court.net";

  var form = document.getElementById("enquireForm");
  var statusEl = document.getElementById("formStatus");

  function setErr(id, msg) {
    var input = document.getElementById(id);
    var slot = document.querySelector('.err[data-for="' + id + '"]');
    if (slot) slot.textContent = msg || "";
    if (input) input.classList.toggle("invalid", !!msg);
    return !msg;
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }
  function validPhone(v) {
    var digits = v.replace(/[^0-9]/g, "");
    // accept 10-digit Indian mobile, or with 91/0 prefix
    return /^(?:91|0)?[6-9]\d{9}$/.test(digits);
  }

  function validate() {
    var ok = true;
    var name = document.getElementById("f_name").value.trim();
    var phone = document.getElementById("f_phone").value.trim();
    var email = document.getElementById("f_email").value.trim();

    if (!name) ok = setErr("f_name", "Please enter your name.") && ok;
    else if (name.length < 2) ok = setErr("f_name", "Name looks too short.") && ok;
    else setErr("f_name", "");

    if (!phone) ok = setErr("f_phone", "Phone number is required.") && ok;
    else if (!validPhone(phone)) ok = setErr("f_phone", "Enter a valid 10-digit mobile number.") && ok;
    else setErr("f_phone", "");

    // Email optional, but validate if provided
    if (email && !validEmail(email)) ok = setErr("f_email", "Please enter a valid email address.") && ok;
    else setErr("f_email", "");

    return ok;
  }

  if (form) {
    // live-clear errors
    ["f_name", "f_phone", "f_email"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", function () { setErr(id, ""); statusEl.textContent = ""; statusEl.className = "eform__status"; });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = "";
      statusEl.className = "eform__status";
      if (!validate()) {
        statusEl.textContent = "Please correct the highlighted fields.";
        statusEl.className = "eform__status bad";
        return;
      }
      // honeypot
      if (form._honey && form._honey.value) return;

      var btn = document.getElementById("formSubmit");
      btn.disabled = true;
      var prev = btn.textContent;
      btn.textContent = "Sending…";

      var data = new FormData(form);
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            statusEl.textContent = "Thank you! Your enquiry has been sent. Our team will call you shortly.";
            statusEl.className = "eform__status ok";
          } else {
            throw new Error("send failed");
          }
        })
        .catch(function () {
          // Fallback: open mail client with prefilled details
          var n = encodeURIComponent(document.getElementById("f_name").value.trim());
          var p = encodeURIComponent(document.getElementById("f_phone").value.trim());
          var em = encodeURIComponent(document.getElementById("f_email").value.trim());
          var msg = encodeURIComponent(document.getElementById("f_message").value.trim());
          var body = "Name: " + n + "%0D%0APhone: " + p + "%0D%0AEmail: " + em + "%0D%0AMessage: " + msg;
          statusEl.innerHTML = 'We could not send automatically. ' +
            '<a href="mailto:marketing@thekings-court.net?subject=Enquiry%20-%20The%20Kings%20Court&body=' + body + '">Click here to email us</a> ' +
            'or call 044 4000 5000.';
          statusEl.className = "eform__status bad";
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = prev;
        });
    });
  }
})();
