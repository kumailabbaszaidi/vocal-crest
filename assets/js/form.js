/**
 * VOCAL CREST — Contact form
 *
 *  · Inline validation (required fields, email format, optional phone format)
 *  · Accessible errors: aria-invalid + aria-describedby + focus management
 *  · Loading, success and error states announced through a live region
 *  · Submits to VC_CONFIG.form.endpoint. A success message is shown ONLY when
 *    that endpoint returns a 2xx response. With no endpoint configured the
 *    visitor is told plainly that the message was not sent.
 */
(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var cfg = (window.VC_CONFIG && window.VC_CONFIG.form) || {};
  var status = form.querySelector("[data-form-status]");
  var submit = form.querySelector("[type=submit]");
  var submitLabel = submit.querySelector("[data-label]");
  var success = document.querySelector("[data-form-success]");
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE = /^[+()\-.\s\d]{7,20}$/;

  var rules = {
    name: function (v) { return v ? "" : "Please enter your full name."; },
    email: function (v) { return !v ? "Please enter your email address." : EMAIL.test(v) ? "" : "Please enter a valid email address, like name@business.ca."; },
    phone: function (v) { return !v || PHONE.test(v) ? "" : "Please enter a valid phone number, or leave this blank."; },
    business: function (v) { return v ? "" : "Please enter your business name."; },
    message: function (v) { return v.length >= 10 ? "" : v ? "Please add a little more detail (at least 10 characters)." : "Please tell us a bit about your business."; },
  };

  function validate(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var msg = rule(input.value.trim());
    var err = document.getElementById(input.getAttribute("aria-describedby").split(" ")[0]);
    err.textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function setStatus(type, html) {
    status.className = "form-status" + (type ? " form-status--" + type : "");
    status.innerHTML = html || "";
  }

  form.querySelectorAll(".field__input").forEach(function (input) {
    input.addEventListener("blur", function () { if (input.value.trim() || input.getAttribute("aria-invalid") === "true") validate(input); });
    input.addEventListener("input", function () { if (input.getAttribute("aria-invalid") === "true") validate(input); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("", "");

    var inputs = Array.prototype.slice.call(form.querySelectorAll(".field__input"));
    var invalid = inputs.filter(function (i) { return !validate(i); });
    if (invalid.length) {
      setStatus("error", "<strong>Please check " + (invalid.length === 1 ? "one field" : invalid.length + " fields") + ".</strong> The highlighted information is missing or incomplete.");
      invalid[0].focus();
      return;
    }
    if (form.querySelector("[name=company_website]").value) return; // honeypot: silently drop bots

    if (!cfg.endpoint) {
      setStatus("error", "<strong>Your message was not sent.</strong> Our online form isn’t connected yet. Please use the contact details on this page to reach us directly — sorry for the inconvenience.");
      return;
    }

    form.setAttribute("aria-busy", "true");
    submit.disabled = true;
    submit.classList.add("is-loading");
    submitLabel.textContent = "Sending…";

    fetch(cfg.endpoint, {
      method: cfg.method || "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.hidden = true;
        success.hidden = false;
        success.focus();
      })
      .catch(function () {
        setStatus("error", "<strong>Something went wrong and your message was not sent.</strong> Please try again in a moment, or use the contact details on this page.");
      })
      .finally(function () {
        form.removeAttribute("aria-busy");
        submit.disabled = false;
        submit.classList.remove("is-loading");
        submitLabel.textContent = "Send message";
      });
  });
})();
