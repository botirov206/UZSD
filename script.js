/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

/* ===== SCROLL REVEAL ===== */
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), (i % 4) * 100);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
reveals.forEach(el => revealObs.observe(el));

/* ===== COUNTER ANIMATION ===== */
const counters = document.querySelectorAll('.counter-num');
let countersStarted = false;
const counterObs = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    counters.forEach(counter => {
      const target = +counter.dataset.target;
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        counter.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
      }, 16);
    });
  }
}, { threshold: 0.4 });
if (counters[0]) counterObs.observe(counters[0].closest('.why-counters'));

/* ===== CAROUSEL ===== */
const track = document.getElementById('carouselTrack');
const slides = track.querySelectorAll('.testimonial-slide');
const dotsContainer = document.getElementById('carouselDots');
let current = 0;

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goTo(i));
  dotsContainer.appendChild(dot);
});

function goTo(n) {
  current = (n + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
}

document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));
setInterval(() => goTo(current + 1), 5500);

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ===== FORM VALIDATION & SUBMISSION ===== */
const form = document.getElementById('applyForm');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('formFeedback');
const toastContainer = document.getElementById('toastContainer');

function showToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon">✓</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" type="button" aria-label="Dismiss">&times;</button>
  `;

  const dismiss = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  toastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(dismiss, 6000);
}

function validateField(input) {
  const id = input.id;
  const errEl = document.getElementById(id + '-err');
  let valid = true;
  if (input.required && !input.value.trim()) valid = false;
  if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) valid = false;
  input.classList.toggle('invalid', !valid);
  if (errEl) errEl.style.display = valid ? 'none' : 'block';
  return valid;
}

['fullName','phone','email','driverType','equipmentType','experience','location'].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener('blur', () => validateField(el));
  el.addEventListener('input', () => { if(el.classList.contains('invalid')) validateField(el); });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fields = ['fullName','phone','email','driverType','equipmentType','experience','location'];
  let isValid = true;
  fields.forEach(id => { if(!validateField(document.getElementById(id))) isValid = false; });
  if (!isValid) return;

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';
  feedback.className = 'form-feedback';
  feedback.style.display = 'none';

  const payload = {
    fullName: document.getElementById('fullName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim(),
    driverType: document.getElementById('driverType').value,
    equipment: document.getElementById('equipmentType').value,
    experience: document.getElementById('experience').value,
    location: document.getElementById('location').value.trim(),
    grossIncome: document.getElementById('grossIncome').value || 'Not specified',
    message: document.getElementById('message').value.trim() || 'None'
  };

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.ok) {
      showToast(
        'Application Submitted',
        'Our team will contact you within 24 hours. Thank you for applying!'
      );
      form.reset();
    } else {
      const phone = json.contactPhone || '+1 (708) 575-7006';
      const email = json.contactEmail || 'dispatch@uzsdinc.com';
      feedback.textContent = `⚠️ Submission failed. Please call us directly at ${phone} or email ${email}.`;
      feedback.className = 'form-feedback error';
    }
  } catch {
    feedback.textContent = '⚠️ Submission failed. Please call us directly at +1 (708) 575-7006 or email dispatch@uzsdinc.com.';
    feedback.className = 'form-feedback error';
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Submit Application';
});

/* ===== SMOOTH SCROLL OFFSET ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});
