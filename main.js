// Main script: Three.js background + interactions + small UX helpers

// DOM helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Footer year
$('#year').textContent = new Date().getFullYear();

// Theme: init and toggle (persisted)
(function themeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem('theme');
  let theme = stored || (prefersDark ? 'dark' : 'light');

  const apply = () => {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.textContent = isDark ? '🌙' : '🌞';
  };
  apply();

  btn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    apply();
  });
})();

// Mobile nav toggle
(function navToggle() {
  const nav = $('.site-nav');
  const btn = $('.nav-toggle');
  if (!nav || !btn) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
    nav.setAttribute('aria-expanded', String(!expanded));
  });
  // Close menu when clicking a nav link (mobile UX)
  $$('#nav-list a[data-nav]').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-expanded', 'false');
  }));
})();

// Contact form -> mailto
(function contactForm() {
  const form = $('#contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:olebogengmoremi84@gmail.com?subject=${subject}&body=${body}`;
  });
})();

// THREE.js Background Scene
// Use ES module imports from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer, scene, camera, points, animationId;
const canvas = document.getElementById('bg');

function initThree() {
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 26);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles (gentle starfield)
  const starCount = 1600;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 200;
    positions[i3 + 1] = (Math.random() - 0.5) * 140;
    positions[i3 + 2] = (Math.random() - 0.5) * 200;

    // soft color mix from blue to mint
    const t = Math.random();
    const c1 = new THREE.Color(0xb9d1ff);
    const c2 = new THREE.Color(0xa8ffe0);
    const c = c1.lerp(c2, t);
    colors[i3 + 0] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.38,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  // Removed rotating centerpiece for a calmer, less distracting background

  window.addEventListener('resize', onResize);
  window.addEventListener('mousemove', onMouseMove);

  if (!prefersReducedMotion) animate();
  else render();
}

let mouseX = 0, mouseY = 0;
function onMouseMove(e) {
  // Parallax camera subtly based on cursor
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;
  mouseX = x; mouseY = y;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  const t = performance.now() * 0.00018;
  // Starfield slow drift
  points.rotation.y = t * 0.25;

  // Camera parallax
  camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  render();
}

function render() {
  renderer.render(scene, camera);
}

function disposeThree() {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('mousemove', onMouseMove);
  renderer?.dispose?.();
}

initThree();

// Accessibility: if user toggles reduced motion at runtime
const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
motionMedia.addEventListener?.('change', (e) => {
  if (e.matches) {
    disposeThree();
    render();
  } else {
    initThree();
  }
});

// Project videos: graceful fallback shown below the video
$$('.project-video').forEach((vid) => {
  const wrap = vid.closest('.video-wrap');
  if (!wrap) return;
  let fallback = wrap.querySelector('.video-fallback') || wrap.parentElement.querySelector('.video-fallback');
  if (!fallback) return;
  // Move fallback below the media if it's nested inside the video-wrap
  if (fallback.parentElement === wrap) {
    wrap.insertAdjacentElement('afterend', fallback);
  }
  // Hide by default; reveal only when video fails or doesn't load
  fallback.hidden = true;
  const showFallback = () => { fallback.hidden = false; };
  vid.addEventListener('error', showFallback);
  // If metadata doesn't load within 2s, show fallback
  let loaded = false;
  vid.addEventListener('loadedmetadata', () => { loaded = true; });
  setTimeout(() => { if (!loaded) showFallback(); }, 2000);
});

// Ensure project videos autoplay muted and manage play/pause in view
(function autoPlayVideos() {
  const vids = $$('.project-video');
  if (!vids.length) return;
  const ensureAttrs = (v) => {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('autoplay', '');
    v.setAttribute('loop', '');
    v.setAttribute('playsinline', '');
  };
  vids.forEach(v => ensureAttrs(v));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(async entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        try { await v.play(); } catch (_) { /* ignore */ }
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.5 });

  vids.forEach(v => io.observe(v));
})();

// Scroll progress bar
(function progressBar() {
  const bar = document.querySelector('.scroll-progress__bar');
  if (!bar) return;
  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.max(0, Math.min(1, docHeight > 0 ? scrollTop / docHeight : 0));
    bar.style.width = `${pct * 100}%`;
  };
  update();
  window.addEventListener('scroll', update);
  window.addEventListener('resize', update);
})();

// Reveal-on-scroll animations
(function revealOnScroll() {
  const items = [
    ...$$('.section'),
    ...$$('.card')
  ];
  items.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  items.forEach(el => io.observe(el));
})();

// Scrollspy: highlight current section in header
(function scrollSpy() {
  const header = $('.site-header');
  const links = $$('#nav-list a[data-nav]');
  const map = new Map(links.map(a => [a.getAttribute('href'), a]));
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(a => {
      if (a.getAttribute('href') === id) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      }
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(`#${entry.target.id}`);
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0.01 });

  sections.forEach(sec => io.observe(sec));

  // Header shadow on scroll
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll);
})();

// PDF Modal: preview certificates inline
(function pdfModal() {
  const modal = document.getElementById('pdf-modal');
  const frame = document.getElementById('pdf-frame');
  if (!modal || !frame) return;

  const open = (url) => {
    try {
      frame.src = url;
      modal.removeAttribute('hidden');
    } catch (_) {
      window.open(url, '_blank', 'noopener');
    }
  };
  const close = () => {
    frame.src = 'about:blank';
    modal.setAttribute('hidden', '');
  };

  // Open on any button with data-pdf
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.matches('button[data-pdf]')) {
      e.preventDefault();
      const url = t.getAttribute('data-pdf');
      if (url) open(url);
    }
    // If user clicks the certificate preview area, open the same PDF via sibling button
    const media = t && (t.closest('.cert-media') || (t.tagName === 'IFRAME' && t.parentElement?.classList.contains('cert-media') ? t.parentElement : null));
    if (media) {
      const card = media.closest('.cert-card');
      const btn = card?.querySelector('button[data-pdf]');
      const url = btn?.getAttribute('data-pdf');
      if (url) {
        e.preventDefault();
        open(url);
      }
    }
    if (t && (t.matches('[data-close]') || t.closest('[data-close]'))) {
      e.preventDefault();
      close();
    }
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

// Certifications pagination
(function certsPagination() {
  const grid = document.getElementById('certs-grid');
  const pager = document.getElementById('certs-pagination');
  if (!grid || !pager) return;

  const items = Array.from(grid.querySelectorAll('.cert-card'));
  const perPage = 8;
  let current = 1;
  const pages = Math.max(1, Math.ceil(items.length / perPage));

  const render = () => {
    items.forEach((el, i) => {
      const pageIndex = Math.floor(i / perPage) + 1;
      el.style.display = pageIndex === current ? '' : 'none';
    });
    renderPager();
  };

  const btn = (label, page, disabled = false, isActive = false) => {
    const b = document.createElement('button');
    b.className = 'page-btn' + (isActive ? ' active' : '');
    b.textContent = label;
    b.type = 'button';
    if (disabled) b.disabled = true;
    b.addEventListener('click', () => { current = page; render(); });
    return b;
  };

  const renderPager = () => {
    pager.innerHTML = '';
    pager.appendChild(btn('Prev', Math.max(1, current - 1), current === 1));
    for (let p = 1; p <= pages; p++) pager.appendChild(btn(String(p), p, false, p === current));
    pager.appendChild(btn('Next', Math.min(pages, current + 1), current === pages));
  };

  render();
})();

// Image Modal: preview highlight photos
(function imageModal() {
  const modal = document.getElementById('img-modal');
  const frame = document.getElementById('img-frame');
  if (!modal || !frame) return;

  const open = (src, alt = '') => {
    frame.src = src;
    frame.alt = alt;
    modal.removeAttribute('hidden');
  };
  const close = () => {
    frame.src = '';
    modal.setAttribute('hidden', '');
  };

  document.addEventListener('click', (e) => {
    const t = e.target;
    // Open when clicking any highlight image
    if (t && t.matches('.highlight-media img')) {
      e.preventDefault();
      open(t.getAttribute('src'), t.getAttribute('alt') || '');
      return;
    }
    if (t && (t.matches('[data-close]') || t.closest?.('[data-close]'))) {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();
