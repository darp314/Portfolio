// ===================== MOBILE / TABLET NAV (BURGER MENU) =====================

const headerBurger = document.getElementById("headerBurger");
const headerUl = document.getElementById("headerUl");
const headerBackdrop = document.getElementById("headerBackdrop");

function navToggle() {
  headerBurger.classList.toggle("_active");
  headerUl.classList.toggle("_active");
  headerBackdrop.classList.toggle("_active");
  document.body.classList.toggle("nav-open");
}


// ===================== HEADER HIDE ON SCROLL DOWN / SHOW ON SCROLL UP (DESKTOP) =====================

const siteHeader = document.getElementById("siteHeader");
let lastScrollY = window.scrollY;
const DESKTOP_BREAKPOINT = 1024;

function handleHeaderScroll() {
  if (window.innerWidth <= DESKTOP_BREAKPOINT) {
    siteHeader.classList.remove("hidden");
    lastScrollY = window.scrollY;
    return;
  }

  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    // гортаємо вниз — ховаємо хедер
    siteHeader.classList.add("hidden");
  } else if (currentScrollY < lastScrollY) {
    // гортаємо вверх — показуємо хедер
    siteHeader.classList.remove("hidden");
  }

  lastScrollY = currentScrollY;
}

window.addEventListener("scroll", handleHeaderScroll);
window.addEventListener("resize", handleHeaderScroll);


// ===================== LOGO SLIDER =====================

function buildInfiniteTrack() {
  const slider = document.querySelector('.experience-slider');
  const track = document.getElementById('expTrack');
  const original = document.getElementById('expLogosOriginal');

  if (!slider || !track || !original) return;

  // Remove previously created clones
  track.querySelectorAll('.experience-logos.is-clone').forEach((clone) => {
    clone.remove();
  });

  // Get the exact width of ONE complete logo set
  const setWidth = original.getBoundingClientRect().width;
  const viewportWidth = slider.getBoundingClientRect().width;

  // We need enough copies so there is always another set
  // filling the visible area after one full set has moved away.
  let totalWidth = setWidth;

  while (totalWidth < viewportWidth + setWidth) {
    const clone = original.cloneNode(true);

    clone.removeAttribute('id');
    clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true');

    track.appendChild(clone);

    totalWidth += setWidth;
  }

  // Set the exact animation distance
  track.style.setProperty('--marquee-distance', `${setWidth}px`);

  // Speed in pixels per second
  const speed = 110;
  const duration = setWidth / speed;

  track.style.setProperty('--marquee-duration', `${duration}s`);
}

window.addEventListener('load', buildInfiniteTrack);

let resizeTimer;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    buildInfiniteTrack();
  }, 150);
});

// ===================== COPYRIGHT =====================
document.getElementById('copyright-year').textContent = new Date().getFullYear();

// ===================== CV DOWNLOAD =====================
const SCRIPT_BASE = document.currentScript.src; // captured at load time

function downloadCV() {
  const cvUrl = new URL("cv/Pavlenko_Daryna_CV.pdf", SCRIPT_BASE).href;
  const link = document.createElement("a");
  link.href = cvUrl;
  link.download = "Pavlenko_Daryna_CV.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===================== LOAD MORE BTN =====================
(function () {
  const btn = document.getElementById('portfolioLoadMore');
  const grid = document.getElementById('portfolioGrid');
  if (!btn || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.portfolio-container'));
  const STAGGER_MS = 80;

  
  const MOBILE_BREAKPOINT = 680;   // max-width for mobile
  const TABLET_BREAKPOINT = 1200;  // max-width for tablet 

  // step sequence per device
  const STEPS = {
    mobile: [3, 6, cards.length],
    tablet: [4, 8, cards.length],
  };

  let state = 0;

  function getDevice() {
    const w = window.innerWidth;
    if (w <= MOBILE_BREAKPOINT) return 'mobile';
    if (w <= TABLET_BREAKPOINT) return 'tablet';
    return 'desktop';
  }

  function render(isUserClick = false) {
    const device = getDevice();

    if (device === 'desktop') {
      cards.forEach((card) => {
        card.style.display = '';
        card.classList.remove('is-animating', 'is-visible');
        card.dataset.wasVisible = '1';
      });
      btn.style.display = 'none';
      return;
    }

    const steps = STEPS[device];
 
    if (state >= steps.length) state = 0;

    btn.style.display = 'inline-block';
    const visibleCount = steps[state];
    const previouslyVisibleCount = isUserClick
      ? cards.filter((c) => c.dataset.wasVisible === '1').length
      : 0;

    cards.forEach((card, i) => {
      const shouldShow = i < visibleCount;

      if (!shouldShow) {
        card.style.display = 'none';
        card.classList.remove('is-animating', 'is-visible');
        card.dataset.wasVisible = '';
        return;
      }

      const wasAlreadyVisible = card.dataset.wasVisible === '1';
      card.dataset.wasVisible = '1';

      if (!wasAlreadyVisible && isUserClick) {
        card.style.display = '';
        card.classList.add('is-animating');
        card.classList.remove('is-visible');

        const delay = (i - previouslyVisibleCount) * STAGGER_MS;
        requestAnimationFrame(() => {
          setTimeout(() => card.classList.add('is-visible'), Math.max(delay, 0));
        });
      } else {
        card.style.display = '';
        card.classList.remove('is-animating', 'is-visible');
      }
    });

    btn.textContent = state === steps.length - 1 ? 'Hide' : 'Load More';
  }

  btn.addEventListener('click', () => {
    const device = getDevice();
    const steps = STEPS[device] || [cards.length];

    state = state === steps.length - 1 ? 0 : state + 1;
    render(true);

    if (state === 0) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  window.addEventListener('resize', () => render(false));
  render(false);
})();

// ===================== PARALLAX =====================
// PARALLAX (first section)
(() => {
  const intro = document.getElementById('intro');
  const preview = intro?.querySelector('.primary');
  const hero = intro?.querySelector('.secondary');
  if (!preview || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  intro.classList.add('intro-active');

  // ---- tuning ----
  const DISTANCE = 600;      // wheel px needed to finish the transition (bigger = slower)
  const SMOOTH = 140;        // ms of easing (bigger = floatier)
  const SHIFT = 50;          // px of vertical movement
  const MAX_DELTA = 120;     // cap per wheel event, so one fast flick can't jump the whole thing
  const UNLOCK_AT = 0.98;    // unlock once the animation is visually finished
  const GESTURE_GAP = 90;    // ms of silence that separates one gesture from the next
  const INERTIA_MAX = 700;   // never swallow leftover inertia longer than this
  const MIN_DURATION = 700;  // ms: the transition can never play faster than this, however hard you scroll

  // ---- state ----
  let target = 0;            // where input wants us (0..1)
  let current = 0;           // what is displayed (0..1)
  let locked = true;         // true while the intro is "capturing" scroll
  let raf = 0;
  let last = 0;

  let lastEvent = -Infinity; // time of the previous input event
  let gestureAtTop = true;   // did the current gesture start at the very top?
  let swallowing = false;    // eating trackpad inertia right after unlocking
  let swallowStart = 0;

  const clamp = (v, min = 0, max = 1) => Math.min(Math.max(v, min), max);

  // Once the transition is finished, the full-screen preview is removed from layout
  // (class "intro-done") so the intro shrinks to the hero's height and the next
  // section follows right after it. The height change is animated so nothing pops.
  // While locked the page itself cannot scroll natively (CSS: html.intro-locked),
  // so a fast flick or touch swipe can never slip past the intro.
  const setLockClass = (on) => document.documentElement.classList.toggle('intro-locked', on);

  let collapsed = false;
  const setCollapsed = (on, animate = true) => {
    if (on === collapsed) return;
    collapsed = on;

    const from = intro.getBoundingClientRect().height;
    intro.style.transition = 'none';
    intro.style.height = '';
    intro.classList.toggle('intro-done', on);
    const to = intro.offsetHeight;

    if (!animate || from === to) return;

    intro.style.height = `${from}px`;
    void intro.offsetHeight; // force reflow so the transition has a start value
    intro.style.transition = 'height 500ms ease';
    intro.style.height = `${to}px`;
    intro.addEventListener('transitionend', () => {
      intro.style.transition = '';
      intro.style.height = '';
    }, { once: true });
  };

  const render = () => {
    const p = current;
    // crossfade with only a tiny overlap so text never looks muddy
    const outOpacity = clamp(1 - p * 1.6);
    const inOpacity = clamp((p - 0.4) * 1.67);

    preview.style.opacity = outOpacity;
    preview.style.transform = `translate3d(0, ${-p * SHIFT}px, 0)`;
    hero.style.opacity = inOpacity;
    hero.style.transform = `translate3d(0, ${(1 - p) * SHIFT}px, 0)`;

    preview.classList.toggle('is-hidden', outOpacity === 0);
    hero.style.pointerEvents = p > 0.95 ? 'auto' : 'none';
  };

  const unlock = (now) => {
    locked = false;
    swallowing = true;       // keep eating inertia until the wheel goes quiet
    swallowStart = now;
    setLockClass(false);
    setCollapsed(true);
  };

  const tick = (now) => {
    const dt = Math.min(now - last, 50);
    last = now;

    // frame-rate independent easing
    let step = (target - current) * (1 - Math.exp(-dt / SMOOTH));
    const maxStep = dt / MIN_DURATION;          // speed limit, so a fast flick still plays the whole transition
    current += clamp(step, -maxStep, maxStep);
    if (Math.abs(target - current) < 0.0005) current = target;
    render();

    // unlock as soon as it LOOKS finished (not after the easing tail crawls to 1.0)
    if (locked && target >= 1 && current >= UNLOCK_AT) unlock(now);

    raf = current !== target ? requestAnimationFrame(tick) : 0;
  };

  const start = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  // Returns true if the intro consumed the event (caller should preventDefault).
  // `discrete` = keyboard/touch-start style input that is always a fresh gesture.
  const push = (delta, discrete = false) => {
    const now = performance.now();
    const gap = discrete ? Infinity : now - lastEvent;
    lastEvent = now;
    const newGesture = gap > GESTURE_GAP;

    if (newGesture) {
      swallowing = false;
      gestureAtTop = window.scrollY <= 0;
    }

    if (!locked) {
      // Leftover inertia from the scroll that just unlocked us: eat it
      if (swallowing && delta > 0) {
        if (now - swallowStart < INERTIA_MAX) return true;
        swallowing = false;
      }
      // Replay in reverse only for a gesture that STARTED at the top
      // (so upward inertia reaching the top doesn't trigger it by accident)
      if (delta < 0 && window.scrollY <= 0 && gestureAtTop) {
        locked = true;
        swallowing = false;
        setLockClass(true);
        setCollapsed(false);
      } else {
        return false;
      }
    }

    target = clamp(target + delta / DISTANCE);
    start();
    return true;
  };

  // Wheel / trackpad
  window.addEventListener('wheel', (e) => {
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;
    if (e.deltaMode === 2) d *= window.innerHeight;
    d = clamp(d, -MAX_DELTA, MAX_DELTA);
    if (push(d)) e.preventDefault();
  }, { passive: false });

  // Touch
  let touchY = 0;
  window.addEventListener('touchstart', (e) => {
    touchY = e.touches[0].clientY;
    lastEvent = -Infinity;   // new finger = new gesture
    swallowing = false;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const y = e.touches[0].clientY;
    const delta = clamp((touchY - y) * 1.5, -MAX_DELTA * 2, MAX_DELTA * 2);
    touchY = y;
    // touch has no inertia events while we preventDefault, so treat as one continuous gesture
    if (push(delta)) e.preventDefault();
  }, { passive: false });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(tag || '')) return; // don't hijack space on the CV button
    const map = { ArrowDown: 150, PageDown: 400, ' ': 400, ArrowUp: -150, PageUp: -400 };
    if (e.key in map && push(map[e.key], true)) e.preventDefault();
  });

  // Page scrolled some other way (anchor link, scrollbar drag, refresh) -> skip the intro
  const skipIfScrolled = () => {
    if (window.scrollY > 0 && locked) {
      target = current = 1;
      locked = false;
      swallowing = false;
      setLockClass(false);
      setCollapsed(true, false);
      render();
    }
  };
  window.addEventListener('scroll', skipIfScrolled, { passive: true });
  window.addEventListener('load', skipIfScrolled);

  render();
  skipIfScrolled();
  if (locked) setLockClass(true);
})();

// HEADER HEIGHT -> CSS variable
const header = document.getElementById('siteHeader');

const setHeaderHeight = () => {
  if (!header) return;
  document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
};

setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('load', setHeaderHeight); // after fonts/images settle

// ===================== SMOOTH SCROLL =====================

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      e.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// AOS

AOS.init({
    duration: 1000, 
    once: false,    
    mirror: true,   
  });