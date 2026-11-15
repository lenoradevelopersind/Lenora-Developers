/**
 * LUMEN STUDIO — INTERACTION & APP NAVIGATION ENGINE
 * Clean Warm Beige Aesthetic, 3D Perspective Tilt Physics,
 * Direct App Navigation (Email & Instagram App), Lead Capture, and Hidden Admin Portal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGlassScrollEngine();
  init3dCardTiltPhysics();
  initStudioLiveClock();
  initMobileDrawer();
  initMobileBottomDock();
  initReviewsBannerMarquee();
  initAppNavigationTriggers();
  initContactInquiryForm();
  initSecretAdminShortcut();
  hydrateAdminContent();
});

/* ==========================================================================
   1. APP NAVIGATION TRIGGERS (EMAIL & INSTAGRAM APP LAUNCHER)
   ========================================================================== */
function initAppNavigationTriggers() {
  // Instagram App Deep Linking
  const igTriggers = document.querySelectorAll('.instagram-app-trigger');
  igTriggers.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const handle = el.getAttribute('data-ig-handle') || 'lenoradevelopers';
      const cleanHandle = handle.replace(/^@/, '');
      const rawHref = el.getAttribute('href');
      const appUrl = `instagram://user?username=${cleanHandle}`;
      const webUrl = (rawHref && rawHref.startsWith('http')) ? rawHref : `https://www.instagram.com/${cleanHandle}/`;

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Attempt native mobile Instagram app URI scheme
        const startTime = Date.now();
        window.location.href = appUrl;

        // Fallback to web browser if app is not installed
        setTimeout(() => {
          if (Date.now() - startTime < 1600) {
            window.location.href = webUrl;
          }
        }, 800);
      } else {
        // On desktop/laptop: try desktop Instagram app URI via hidden iframe, then web tab
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);

        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          window.open(webUrl, '_blank', 'noopener,noreferrer');
        }, 300);
      }
    });
  });

  // Direct Email App Navigation
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // Normal mailto protocol directly opens the system email client (Apple Mail, Outlook, Thunderbird)
      // We ensure the target and location are clean
      window.location.href = link.getAttribute('href');
    });
  });
}

/* ==========================================================================
   2. SCROLL PROGRESS & NATIVE SCROLL REVEALS
   ========================================================================== */
/* ==========================================================================
   2. SCROLL PROGRESS & TACTILE SCROLL TRIGGERS ENGINE
   - Sticky Glass Nav Elevation on Scroll
   - Image Frame Optical Parallax Drift
   - Staggered Section Reveals
   - Active Roadmap Phase Tracker
   - Interactive Number Counter Triggers
   ========================================================================== */
function initGlassScrollEngine() {
  const progressBar = document.getElementById('scrollProgress');
  const navPill = document.querySelector('.glass-nav-pill');
  const projectImages = document.querySelectorAll('.project-viewport-frame .project-img');

  function onWindowScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // 1. Progress Bar Update
    if (progressBar && maxScroll > 0) {
      const pct = (scrollY / maxScroll) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // 2. Adaptive Floating Nav Island Elevation
    if (navPill) {
      if (scrollY > 40) {
        navPill.classList.add('scrolled');
      } else {
        navPill.classList.remove('scrolled');
      }
    }

    // 3. Project Cards Image Parallax Drift
    if (projectImages.length > 0) {
      const winH = window.innerHeight;
      projectImages.forEach((img) => {
        const parent = img.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.top < winH && rect.bottom > 0) {
          const midOffset = (rect.top + rect.height / 2) - winH / 2;
          const drift = Math.max(-18, Math.min(18, midOffset * 0.08));
          img.style.transform = `translateY(${drift.toFixed(1)}px)`;
        }
      });
    }
  }

  window.addEventListener('scroll', onWindowScroll, { passive: true });
  onWindowScroll();

  // 4. Staggered Entrance Observer for Cards & Sections
  const revealElements = document.querySelectorAll(
    '.glass-capability-card, .glass-project-card, .roadmap-step-card, .honor-glass-unit, .section-title-lockup, .showcase-header-split, .manifesto-glass-quote-card, .contact-left-col, .glass-inquiry-form'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    revealElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 4) * 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index % 4) * 0.08}s`;
      observer.observe(el);
    });

    // 5. Active Roadmap Step Trigger on Scroll
    initRoadmapStepScrollTracker();

    // 6. Interactive Metric Number Counter Triggers
    initNumberCounterTriggers();
  }
}

function initRoadmapStepScrollTracker() {
  const steps = document.querySelectorAll('.roadmap-step-card');
  if (!steps.length || !('IntersectionObserver' in window)) return;

  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        steps.forEach(s => s.classList.remove('active-step'));
        entry.target.classList.add('active-step');
      }
    });
  }, { rootMargin: '-25% 0px -35% 0px', threshold: 0.3 });

  steps.forEach(s => stepObserver.observe(s));
}

function initNumberCounterTriggers() {
  const numberElements = [];
  const statSpeed = document.getElementById('statSpeed');
  if (statSpeed) numberElements.push({ el: statSpeed, target: 99.8, suffix: '%', decimals: 1 });
  const statLatency = document.getElementById('statLatency');
  if (statLatency) numberElements.push({ el: statLatency, target: 280, prefix: '<', suffix: 'ms', decimals: 0 });
  const statLift = document.getElementById('statLift');
  if (statLift) numberElements.push({ el: statLift, target: 280, prefix: '+', suffix: '%', decimals: 0 });

  const honors = document.querySelectorAll('.honor-val');
  if (honors.length >= 4) {
    numberElements.push({ el: honors[0], target: 99.8, suffix: '%', decimals: 1 });
    numberElements.push({ el: honors[2], target: 280, prefix: '<', suffix: 'ms', decimals: 0 });
    numberElements.push({ el: honors[3], target: 100, suffix: '%', decimals: 0 });
  }

  const numObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const item = numberElements.find(n => n.el === entry.target);
        if (item && !item.animated) {
          item.animated = true;
          animateCount(item);
          numObserver.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.3 });

  numberElements.forEach(item => {
    if (item.el) numObserver.observe(item.el);
  });

  function animateCount(item) {
    const duration = 1400;
    const start = performance.now();
    const target = item.target;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      const formatted = item.decimals > 0 ? current.toFixed(item.decimals) : Math.round(current);
      item.el.textContent = `${item.prefix || ''}${formatted}${item.suffix || ''}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        item.el.textContent = `${item.prefix || ''}${target}${item.suffix || ''}`;
      }
    }
    requestAnimationFrame(step);
  }
}

/* ==========================================================================
   3. 3D CARD PERSPECTIVE TILT & SCROLL PITCH PHYSICS (HERO SHOWCASE)
   ========================================================================== */
function init3dCardTiltPhysics() {
  const card = document.getElementById('hero3dCard');
  if (!card) return;

  let mouseRotateX = 0;
  let mouseRotateY = 0;
  let isHovered = false;

  function updateHeroCardTransform() {
    const scrollY = window.scrollY;
    // Initial 3D pitch that flattens out to 0deg as user scrolls into the card
    const scrollPitch = Math.max(0, 3.5 - (scrollY / 180) * 3.5);
    const scrollScale = Math.min(1, 0.985 + (scrollY / 350) * 0.015);

    const finalRotateX = isHovered ? mouseRotateX : scrollPitch;
    const finalRotateY = isHovered ? mouseRotateY : 0;
    const finalScale = isHovered ? 1.01 : scrollScale;

    card.style.transform = `perspective(1200px) rotateX(${finalRotateX.toFixed(2)}deg) rotateY(${finalRotateY.toFixed(2)}deg) scale3d(${finalScale}, ${finalScale}, 1)`;

    // Subtle optical parallax on floating glass badges inside the hero banner
    const chipTR = card.querySelector('.chip-top-right');
    const chipBL = card.querySelector('.chip-bottom-left');
    if (chipTR) chipTR.style.transform = `translateY(${-scrollY * 0.04}px)`;
    if (chipBL) chipBL.style.transform = `translateY(${scrollY * 0.03}px)`;
  }

  window.addEventListener('scroll', updateHeroCardTransform, { passive: true });
  updateHeroCardTransform();

  card.addEventListener('mousemove', (e) => {
    isHovered = true;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    mouseRotateX = ((y - centerY) / centerY) * -5;
    mouseRotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1200px) rotateX(${mouseRotateX.toFixed(2)}deg) rotateY(${mouseRotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
  });

  card.addEventListener('mouseleave', () => {
    isHovered = false;
    updateHeroCardTransform();
  });
}

/* ==========================================================================
   3B. STUDIO LIVE CLOCK ENGINE
   ========================================================================== */
function initStudioLiveClock() {
  const clockEl = document.getElementById('studioLiveClock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}:${seconds} LOCAL`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   4. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const btn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const close = document.getElementById('drawerClose');
  const links = document.querySelectorAll('.drawer-link, .drawer-footer-card a');

  if (!btn || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openDrawer);
  if (close) close.addEventListener('click', closeDrawer);

  links.forEach(l => l.addEventListener('click', closeDrawer));
}

/* ==========================================================================
   4B. MOBILE BOTTOM CONVERSION DOCK (AUTO-HIDE ON CONTACT / FOOTER)
   ========================================================================== */
function initMobileBottomDock() {
  const dock = document.getElementById('mobileBottomDock');
  const contact = document.getElementById('contact');
  const footer = document.querySelector('.glass-footer');
  if (!dock) return;

  // Auto-hide when contact form or footer is in view so buttons/inputs are never obscured
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      // Check if any observed element is intersecting
      const anyIntersecting = entries.some(entry => entry.isIntersecting);
      if (anyIntersecting) {
        dock.classList.add('dock-hidden');
      } else {
        dock.classList.remove('dock-hidden');
      }
    }, { threshold: 0.1 });

    if (contact) observer.observe(contact);
    if (footer) observer.observe(footer);
  } else {
    window.addEventListener('scroll', () => {
      if (!contact) return;
      const rect = contact.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        dock.classList.add('dock-hidden');
      } else {
        dock.classList.remove('dock-hidden');
      }
    }, { passive: true });
  }

  // Smooth scroll and focus on tap of Inquire button
  const inquireBtn = dock.querySelector('.dock-btn-inquire');
  if (inquireBtn) {
    inquireBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (contact) {
        contact.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nameInput = document.getElementById('contactName');
          if (nameInput) nameInput.focus();
        }, 600);
      }
    });
  }
}

/* ==========================================================================
   4C. MOVING REVIEWS MINI BANNER (TOUCH / HOVER INTERACTION)
   ========================================================================== */
function initReviewsBannerMarquee() {
  const viewport = document.getElementById('reviewsBannerViewport');
  const track = document.getElementById('reviewsBannerTrack');
  if (!viewport || !track) return;

  // On touchstart, pause; on touchend, resume smoothly
  viewport.addEventListener('touchstart', () => {
    track.classList.add('is-paused');
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    track.classList.remove('is-paused');
  }, { passive: true });

  viewport.addEventListener('touchcancel', () => {
    track.classList.remove('is-paused');
  }, { passive: true });
}

/* ==========================================================================
   5. PREFILL ACTIONS & CONTACT FORM
   ========================================================================== */
window.prefillServiceInput = function (serviceName) {
  const select = document.getElementById('contactService');
  const messageBox = document.getElementById('contactMessage');

  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value.toLowerCase().includes(serviceName.toLowerCase().slice(0, 5))) {
        select.selectedIndex = i;
        break;
      }
    }
  }

  if (messageBox) {
    messageBox.value = `Hi, we'd like to talk with you about "${serviceName}". Here is a quick summary of what we're looking to build: `;
  }

  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      if (messageBox) messageBox.focus();
    }, 600);
  }
};

window.prefillProjectInquiry = function (projectName) {
  const messageBox = document.getElementById('contactMessage');
  if (messageBox) {
    messageBox.value = `Hi, we love what you did on the "${projectName}" project. We are looking for something similar for our business: `;
  }

  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      if (messageBox) messageBox.focus();
    }, 600);
  }
};

function initContactInquiryForm() {
  const form = document.getElementById('consultationForm');
  const notice = document.getElementById('formStatusNotice');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Anti-Bot Honeypot Trap Check
    if (form._hp_security_check && form._hp_security_check.value.trim() !== '') {
      console.warn('Security check failed: automated agent detected.');
      return; // Silently drop bot submission
    }

    // 2. Client-Side Rate-Limiting Protection (Prevent Flood Attacks)
    const lastSubmitTime = parseInt(sessionStorage.getItem('lumen_last_submission') || '0', 10);
    const now = Date.now();
    if (now - lastSubmitTime < 45000) {
      if (notice) {
        notice.className = 'form-status-box error';
        notice.textContent = 'Please wait a moment before sending another inquiry.';
      }
      return;
    }

    // 3. Strict Input Sanitization & Bounds Checking (Zero XSS/Injection)
    const rawName = form.name.value.trim();
    const rawEmail = form.email.value.trim();
    const rawService = form.service.value;
    const rawMessage = form.message.value.trim();

    if (!rawName || !rawEmail || !rawMessage) {
      if (notice) {
        notice.className = 'form-status-box error';
        notice.textContent = 'Please fill out all required fields marked with *.';
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      if (notice) {
        notice.className = 'form-status-box error';
        notice.textContent = 'Please provide a valid email address.';
      }
      return;
    }

    const sanitizeString = (str) => {
      return str
        .replace(/<[^>]*>?/gm, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    };

    const cleanName = sanitizeString(rawName).slice(0, 80);
    const cleanEmail = sanitizeString(rawEmail).slice(0, 100);
    const cleanService = sanitizeString(rawService).slice(0, 80);
    const cleanMessage = sanitizeString(rawMessage).slice(0, 3000);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting securely...</span>';
    }

    const newInquiry = {
      id: 'INQ-' + Date.now().toString(36).toUpperCase(),
      name: cleanName,
      email: cleanEmail,
      service: cleanService,
      message: cleanMessage,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'New'
    };

    // 4. Secure Transmission Protocol (Zero Public Data Leaks)
    let cloudSynced = false;
    try {
      const cloudConfig = JSON.parse(localStorage.getItem('lumen_cloud_config') || '{}');

      // If Supabase is connected: INSERT ONLY (Protected by Postgres Row Level Security)
      if (cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey && typeof supabase !== 'undefined' && supabase.createClient) {
        const client = supabase.createClient(cloudConfig.supabaseUrl, cloudConfig.supabaseAnonKey);
        const { error } = await client.from('inquiries').insert([{
          name: cleanName,
          email: cleanEmail,
          service: cleanService,
          message: cleanMessage,
          status: 'New'
        }]);
        if (!error) cloudSynced = true;
      }
    } catch (cloudErr) {
      console.warn('Cloud sync note:', cloudErr);
    }

    // Never expose other customer inquiries in visitor's localStorage!
    // Only write locally if the device has an active authenticated admin session
    const hasAdminSession = !!sessionStorage.getItem('lumen_admin_session');
    if (hasAdminSession) {
      try {
        const existing = JSON.parse(localStorage.getItem('lumen_inquiries') || '[]');
        existing.unshift(newInquiry);
        localStorage.setItem('lumen_inquiries', JSON.stringify(existing));
      } catch (e) { }
    }

    sessionStorage.setItem('lumen_last_submission', now.toString());

    setTimeout(() => {
      if (notice) {
        notice.className = 'form-status-box success';
        notice.innerHTML = `✓ Thank you, ${cleanName}! Your project brief has been securely transmitted. We will reply within 24 hours.`;
      }

      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send project brief</span><span class="btn-arrow">↗</span>';
      }

      // Direct mail client backup
      const mailSubject = encodeURIComponent(`Project Inquiry: ${cleanService} — ${cleanName}`);
      const mailBody = encodeURIComponent(`Name: ${cleanName}\nEmail: ${cleanEmail}\nService: ${cleanService}\n\nProject Brief:\n${cleanMessage}`);
      window.location.href = `mailto:lenoradevelopersind@gmail.com?subject=${mailSubject}&body=${mailBody}`;
    }, 600);
  });
}

/* ==========================================================================
   6. SECRET ADMIN PORTAL ACCESS TRIGGER
   (NO visible buttons on page — accessed via Ctrl+Shift+A or Triple-Click)
   ========================================================================== */
function initSecretAdminShortcut() {
  // 1. Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

  // 2. Secret Triple-Click on footer copyright
  const trigger = document.getElementById('secretAdminTrigger');
  if (trigger) {
    let clickCount = 0;
    let timer = null;

    trigger.addEventListener('click', () => {
      clickCount++;
      clearTimeout(timer);

      if (clickCount >= 3) {
        clickCount = 0;
        window.location.href = 'admin.html';
      } else {
        timer = setTimeout(() => {
          clickCount = 0;
        }, 600);
      }
    });
  }
}

/* ==========================================================================
   7. LIVE CONTENT HYDRATION FROM ADMIN PORTAL
   ========================================================================== */
function hydrateAdminContent() {
  try {
    const savedContent = JSON.parse(localStorage.getItem('lumen_site_content') || '{}');
    if (savedContent.brandName) {
      if (/lumen/i.test(savedContent.brandName)) {
        savedContent.brandName = 'LENORA <span>DEVELOPERS</span>';
        try { localStorage.setItem('lumen_site_content', JSON.stringify(savedContent)); } catch (e) { }
      }
      const bEl = document.getElementById('heroBrandName');
      if (bEl) bEl.innerHTML = savedContent.brandName;
    }
    if (savedContent.eyebrow) {
      const ebEl = document.getElementById('heroEyebrow');
      if (ebEl) ebEl.textContent = savedContent.eyebrow;
    }
    if (savedContent.headline) {
      const hEl = document.getElementById('heroMainHeadline');
      if (hEl) hEl.innerHTML = savedContent.headline;
    }
    if (savedContent.subcopy) {
      const sEl = document.getElementById('heroSubcopy');
      if (sEl) sEl.textContent = savedContent.subcopy;
    }
    if (savedContent.ctaText) {
      const ctaEl = document.getElementById('heroCtaText');
      if (ctaEl) ctaEl.textContent = savedContent.ctaText;
    }
    const heroBg = savedContent.heroBgImage || savedContent.heroImage;
    if (heroBg) {
      const backdrop = document.getElementById('heroPhotoBackdrop');
      if (backdrop) backdrop.style.backgroundImage = `url("${heroBg}")`;
      const heroImg = document.getElementById('heroFeaturedImage');
      if (heroImg) heroImg.src = heroBg;
    }
    if (savedContent.statSpeed) {
      const spEl = document.getElementById('statSpeed');
      if (spEl) spEl.textContent = savedContent.statSpeed;
    }
    if (savedContent.statLatency) {
      const latEl = document.getElementById('statLatency');
      if (latEl) latEl.textContent = savedContent.statLatency;
    }
    if (savedContent.statLift) {
      const liftEl = document.getElementById('statLift');
      if (liftEl) liftEl.textContent = savedContent.statLift;
    }
    if (savedContent.email) {
      const emEl = document.getElementById('contactEmailLink');
      if (emEl) {
        emEl.textContent = savedContent.email;
        emEl.href = `mailto:${savedContent.email}`;
      }
      const dockEm = document.getElementById('dockEmailLink');
      if (dockEm) dockEm.href = `mailto:${savedContent.email}`;
    }
    if (savedContent.location) {
      const locEl = document.getElementById('contactLocationText');
      if (locEl) locEl.textContent = savedContent.location;
    }
    if (savedContent.igHandle) {
      const igEl = document.getElementById('igHandleText');
      if (igEl) {
        igEl.textContent = savedContent.igHandle;
        igEl.setAttribute('data-ig-handle', savedContent.igHandle);
      }
      const directIg = document.getElementById('contactIgLink');
      if (directIg) {
        directIg.textContent = `${savedContent.igHandle} ↗`;
        directIg.setAttribute('data-ig-handle', savedContent.igHandle);
      }
    }
    if (savedContent.igUrl) {
      const igBtn = document.getElementById('igDirectBtn');
      if (igBtn) igBtn.href = savedContent.igUrl;
    }

    // Hydrate project showcases if customized via admin
    const savedProjects = JSON.parse(localStorage.getItem('lumen_projects') || '{}');
    ['01', '02', '03', '04'].forEach((num) => {
      const pKey = `project${num}`;
      if (savedProjects[pKey]) {
        const p = savedProjects[pKey];
        if (p.img) {
          const imgEl = document.getElementById(`imgProject${num}`);
          if (imgEl) imgEl.src = p.img;
        }
        if (p.title) {
          const titleEl = document.getElementById(`titleProject${num}`);
          if (titleEl) titleEl.textContent = p.title;
        }
        if (p.desc) {
          const descEl = document.getElementById(`descProject${num}`);
          if (descEl) descEl.textContent = p.desc;
        }
      }
    });
  } catch (err) {
    console.warn('Hydration notice:', err);
  }
}
