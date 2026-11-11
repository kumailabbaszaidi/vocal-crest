/**
 * Vocal Crest — Main Interactive Script
 * Handles sticky header, mobile drawer, accessible FAQ accordions,
 * URL query pre-selection, and contact form validation.
 */
(function () {
  'use strict';

  // 1. Sticky Header State
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 2. Mobile Navigation Drawer
  const menuBtn = document.querySelector('[data-menu-btn]');
  const mobileDrawer = document.querySelector('[data-mobile-drawer]');

  if (menuBtn && mobileDrawer) {
    const closeMenu = () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileDrawer.classList.remove('is-open');
      mobileDrawer.hidden = true;
    };

    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeMenu();
      } else {
        menuBtn.setAttribute('aria-expanded', 'true');
        mobileDrawer.hidden = false;
        mobileDrawer.classList.add('is-open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuBtn.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && menuBtn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  }

  // 3. Accessible FAQ Accordion
  const accButtons = document.querySelectorAll('[data-acc-btn]');
  accButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      const item = btn.closest('.acc');
      const group = btn.closest('[data-accordion]');

      // Close sibling items in the same accordion group
      if (group && !isExpanded) {
        group.querySelectorAll('[data-acc-btn]').forEach((otherBtn) => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherId = otherBtn.getAttribute('aria-controls');
            const otherPanel = otherId ? document.getElementById(otherId) : null;
            const otherItem = otherBtn.closest('.acc');
            if (otherPanel) otherPanel.hidden = true;
            if (otherItem) otherItem.classList.remove('is-open');
          }
        });
      }

      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (panel) panel.hidden = isExpanded;
      if (item) item.classList.toggle('is-open', !isExpanded);
    });
  });

  // 4. Contact Page Plan Pre-selection & Form Validation
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    const serviceParam = params.get('service');
    const intentParam = params.get('intent');

    const planSelect = contactForm.querySelector('#plan');
    const intentSelect = contactForm.querySelector('#enquiry-type');
    const planBanner = document.querySelector('[data-selected-plan-banner]');
    const planBannerText = document.querySelector('[data-selected-plan-name]');

    const planLabels = {
      'vocal-chat': 'Vocal Chat ($297/month)',
      'vocal-receptionist': 'Vocal Receptionist ($497/month)',
      'vocal-suite': 'Vocal Suite ($797/month)',
      'website': 'Websites for Local Businesses (Quoted Separately)'
    };

    if (planParam && planSelect) {
      const normalized = planParam.toLowerCase();
      if ([...planSelect.options].some((o) => o.value === normalized)) {
        planSelect.value = normalized;
        if (planBanner && planBannerText && planLabels[normalized]) {
          planBannerText.textContent = planLabels[normalized];
          planBanner.hidden = false;
        }
      }
    } else if (serviceParam === 'website' && planSelect) {
      planSelect.value = 'website';
      if (planBanner && planBannerText) {
        planBannerText.textContent = planLabels['website'];
        planBanner.hidden = false;
      }
    }

    if (intentParam && intentSelect) {
      const normalizedIntent = intentParam.toLowerCase();
      if ([...intentSelect.options].some((o) => o.value === normalizedIntent)) {
        intentSelect.value = normalizedIntent;
      }
    }

    const setFieldError = (input, message) => {
      const errorEl = document.getElementById(input.id + '-error');
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = message;
      } else {
        input.setAttribute('aria-invalid', 'false');
        if (errorEl) errorEl.textContent = '';
      }
    };

    const validateField = (input) => {
      const val = input.value.trim();
      if (input.hasAttribute('required') && !val) {
        setFieldError(input, 'Please complete this required field.');
        return false;
      }
      if (input.type === 'email' && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          setFieldError(input, 'Please enter a valid email address.');
          return false;
        }
      }
      setFieldError(input, '');
      return true;
    };

    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') {
          validateField(input);
        }
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      inputs.forEach((input) => {
        if (!validateField(input)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!isValid && firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const statusBox = document.getElementById('form-status');
      const nameVal = (contactForm.querySelector('#full-name')?.value || '').trim();
      const businessVal = (contactForm.querySelector('#business-name')?.value || '').trim();
      const selectedPlanText = planSelect && planSelect.value
        ? planSelect.options[planSelect.selectedIndex].text
        : 'General Enquiry';

      if (statusBox) {
        statusBox.innerHTML =
          '<strong>Enquiry received, ' +
          nameVal.replace(/[<>&"']/g, '') +
          '.</strong> Thank you for reaching out from <strong>' +
          businessVal.replace(/[<>&"']/g, '') +
          '</strong> regarding <strong>' +
          selectedPlanText.replace(/[<>&"']/g, '') +
          '</strong>. Our team will review your details and follow up to walk you through the next steps.';
        statusBox.hidden = false;
        statusBox.focus();
      }

      contactForm.reset();
    });
  }

  // 5. Interactive Missed Opportunity Calculator (Homepage)
  const calcRoot = document.querySelector('[data-missed-calculator]');
  if (calcRoot) {
    const defaults = {
      jobValue: 500,
      missedPerWeek: 10,
      recoverablePct: 30,
      conversionPct: 30
    };

    const inputs = {
      jobValue: calcRoot.querySelector('[data-calc-input="jobValue"]'),
      missedPerWeek: calcRoot.querySelector('[data-calc-input="missedPerWeek"]'),
      recoverablePct: calcRoot.querySelector('[data-calc-input="recoverablePct"]'),
      conversionPct: calcRoot.querySelector('[data-calc-input="conversionPct"]')
    };

    const sliders = {
      jobValue: calcRoot.querySelector('[data-calc-slider="jobValue"]'),
      missedPerWeek: calcRoot.querySelector('[data-calc-slider="missedPerWeek"]'),
      recoverablePct: calcRoot.querySelector('[data-calc-slider="recoverablePct"]'),
      conversionPct: calcRoot.querySelector('[data-calc-slider="conversionPct"]')
    };

    const outputs = {
      missedPerMonth: calcRoot.querySelector('[data-calc-out="missedPerMonth"]'),
      recoveredInquiries: calcRoot.querySelector('[data-calc-out="recoveredInquiries"]'),
      recoveredJobs: calcRoot.querySelector('[data-calc-out="recoveredJobs"]'),
      netMissedCalls: calcRoot.querySelector('[data-calc-out="netMissedCalls"]'),
      missedRevenueMonth: calcRoot.querySelector('[data-calc-out="missedRevenueMonth"]'),
      missedRevenueYear: calcRoot.querySelector('[data-calc-out="missedRevenueYear"]')
    };

    const resetBtn = calcRoot.querySelector('[data-calc-reset]');

    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const formatNumber = (num) => {
      const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
      return rounded.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
    };

    const parseNonNegative = (el, fallback = 0) => {
      if (!el) return fallback;
      const parsed = parseFloat(el.value);
      if (Number.isNaN(parsed) || parsed < 0) return 0;
      return parsed;
    };

    const clampPercentage = (val) => Math.min(Math.max(val, 0), 100);

    const recalculate = () => {
      const jobValue = parseNonNegative(inputs.jobValue, defaults.jobValue);
      const missedPerWeek = parseNonNegative(inputs.missedPerWeek, defaults.missedPerWeek);
      const recoverablePct = clampPercentage(parseNonNegative(inputs.recoverablePct, defaults.recoverablePct));
      const conversionPct = clampPercentage(parseNonNegative(inputs.conversionPct, defaults.conversionPct));

      // 1. Missed calls per month = Missed calls per week * 4
      const missedPerMonth = missedPerWeek * 4;

      // 2. New Recovered Inquiries Total = Missed calls per month * (New recoverable inquiries % / 100)
      const recoveredInquiries = missedPerMonth * (recoverablePct / 100);

      // 3. Recovered Inquiry Job Total = New Recovered Inquiries Total * (Recovered inquiries becoming jobs % / 100)
      const recoveredJobs = recoveredInquiries * (conversionPct / 100);

      // 4. Total Missed Calls - Recovered Inquiries = Missed calls per month - Recovered Inquiry Job Total
      const netMissedCalls = Math.max(0, missedPerMonth - recoveredJobs);

      // 5. Missed Revenue Per Month = (Total Missed Calls - Recovered Inquiries) * Average job value
      const missedRevenueMonth = netMissedCalls * jobValue;

      // 6. Missed Revenue Per Year = Missed Revenue Per Month * 12
      const missedRevenueYear = missedRevenueMonth * 12;

      if (outputs.missedPerMonth) {
        outputs.missedPerMonth.textContent = formatNumber(missedPerMonth);
      }
      if (outputs.recoveredInquiries) {
        outputs.recoveredInquiries.textContent = formatNumber(recoveredInquiries);
      }
      if (outputs.recoveredJobs) {
        outputs.recoveredJobs.textContent = formatNumber(recoveredJobs);
      }
      if (outputs.netMissedCalls) {
        outputs.netMissedCalls.textContent = formatNumber(netMissedCalls);
      }
      if (outputs.missedRevenueMonth) {
        outputs.missedRevenueMonth.textContent = currencyFormatter.format(missedRevenueMonth);
      }
      if (outputs.missedRevenueYear) {
        outputs.missedRevenueYear.textContent = currencyFormatter.format(missedRevenueYear);
      }
    };

    Object.keys(inputs).forEach((key) => {
      const inputEl = inputs[key];
      const sliderEl = sliders[key];

      if (inputEl) {
        inputEl.addEventListener('input', () => {
          if (sliderEl && inputEl.value !== '') {
            const numericVal = parseFloat(inputEl.value);
            if (!Number.isNaN(numericVal)) {
              sliderEl.value = String(
                Math.min(Math.max(numericVal, parseFloat(sliderEl.min) || 0), parseFloat(sliderEl.max) || 100)
              );
            }
          }
          recalculate();
        });

        inputEl.addEventListener('blur', () => {
          if (inputEl.value.trim() === '' || parseFloat(inputEl.value) < 0) {
            inputEl.value = '0';
          } else if ((key === 'recoverablePct' || key === 'conversionPct') && parseFloat(inputEl.value) > 100) {
            inputEl.value = '100';
          }
          recalculate();
        });
      }

      if (sliderEl) {
        sliderEl.addEventListener('input', () => {
          if (inputEl) {
            inputEl.value = sliderEl.value;
          }
          recalculate();
        });
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Object.keys(defaults).forEach((key) => {
          if (inputs[key]) inputs[key].value = String(defaults[key]);
          if (sliders[key]) sliders[key].value = String(defaults[key]);
        });
        recalculate();
      });
    }

    recalculate();
  }
})();
