// Webline theme module — Phase 1 (structure/fonts/colour/chrome only).
//
// Loaded via dynamic import() only when the Webline theme is actually
// activated — see activateWebline()/deactivateWebline() in js/app.js. Every
// other theme never fetches this file at all.
//
// Contract (must hold for every future phase, not just this one):
//   - mount()/unmount() are the ONLY two exports later phases may add to.
//   - This module may only read application state and add/remove DOM. It
//     must never write to Supabase, and must never touch sync,
//     reconciliation, the retry queue, tombstones, rejection markers, or
//     any storage path — nothing below reads or writes anything but the
//     rendered DOM.
//   - Everything mount() creates or starts (elements, listeners, timers,
//     rAF handles, observers — AudioContexts and animation loops in later
//     phases) must be fully removed/cancelled by unmount(), with zero
//     accumulation across repeated Webline -> other theme -> Webline
//     cycles. The `handles` registry below exists to make that provable —
//     see getHandleCount().
//
// Phase 1 itself adds no persistent DOM (no mascot/overlay/canvas — those
// are phases 2-4), so there is nothing here for unmount() to remove on that
// front. What it DOES do is a live section-name relabeling layer (section
// 7 of the brief: History -> ACTIVITY LOG, Insights -> WEB WATCH,
// Reminders -> RADAR, Wallets -> THE WEB, More -> CONSOLE), implemented as
// a MutationObserver that corrects known section-name text wherever the
// base app renders it — never by editing index.html/app.js's own markup,
// so every other theme's DOM is completely untouched by this file even
// existing.

const handles = new Set();
function track(handle){ handles.add(handle); return handle; }
function untrack(handle){ handles.delete(handle); }
export function getHandleCount(){ return handles.size; }

// ---------- Section-name relabel map ----------
// Chrome/structural occurrences only — the More menu rows, each sub-page's
// own <h2>, the dynamic page-title, the Home "Wallets" card, the History
// "All Wallets" filter option, and the Notifications panel's "Reminders"
// group header. Prose sentences that merely use these words in passing
// (the Insights hint starting "Reminders, recurring items due...", or the
// debt/transaction mismatch guidance saying "Head to History to review...")
// are deliberately left alone, so an all-caps chrome label never lands
// mid-sentence and garbles the grammar around it — see the PR report for
// the full list of what was and wasn't touched.
// Phase 2 (A5) folds in casing-only fixes alongside Phase 1's semantic
// renames: with the renamed sections shouting (ACTIVITY LOG, RADAR, THE
// WEB, CONSOLE, WEB WATCH) while everything else stayed sentence case
// (Budgets, Savings Goals, Categories, Profile & Backup, Debts & EMIs),
// the picker read as half-finished. Handled through this SAME exact-text
// map/observer mechanism rather than a blanket text-transform:uppercase
// specifically because CSS uppercasing can't preserve "EMIs" (it turns
// every letter into a capital, producing "EMIS" and losing the
// acronym-plural distinction) — a literal text replacement can.
const LABEL_MAP = {
  'History': 'ACTIVITY LOG',
  'Insights': 'WEB WATCH',
  'Reminders': 'RADAR',
  'Wallets': 'THE WEB',
  'More': 'CONSOLE',
  'All Wallets': 'All The Web',
  'Home': 'HOME',
  'Reports': 'REPORTS',
  'Add Entry': 'ADD ENTRY',
  'Budgets': 'BUDGETS',
  'Savings Goals': 'SAVINGS GOALS',
  'Categories': 'CATEGORIES',
  'Profile & Backup': 'PROFILE & BACKUP',
  'Debts & EMIs': 'DEBTS & EMIs',
  'Receivables': 'RECEIVABLES',
  'Settings': 'SETTINGS',
  'Trackr': 'TRACKR',
  'Transaction Details': 'TRANSACTION DETAILS',
  'Install Diagnostics': 'INSTALL DIAGNOSTICS',
  'Notifications': 'NOTIFICATIONS',
  // A2e: confirmed (not assumed) that A1's type-scale fix alone does NOT
  // stop this one from wrapping - measured at 354px, the label still
  // wraps to 2 lines in its flex row next to the amount (scrollHeight/
  // clientHeight both grew to fit 2 lines rather than clipping, so the
  // earlier "no truncation found" sweep - which only checks for clipped
  // overflow - missed it entirely; this needed a manual height check).
  // Shortened per the brief's own fallback instruction.
  'Net Worth (after debt)': 'NET WORTH'
};
const REVERSE_LABEL_MAP = Object.keys(LABEL_MAP).reduce((acc,k)=>{ acc[LABEL_MAP[k]] = k; return acc; }, {});

// Bottom tab bar / desktop spine tab labels use a separate map: the tab
// bar is the one place real-device width is tightest (see section 7b of
// the brief), so it gets whatever form measurement confirms fits — see the
// PR report for the actual measured strings used here.
const TAB_LABEL_MAP = {
  'Insights': 'WEB WATCH',
  'More': 'CONSOLE',
  'Home': 'HOME',
  'Reports': 'REPORTS',
  'Add Entry': 'ADD ENTRY'
};
const REVERSE_TAB_LABEL_MAP = Object.keys(TAB_LABEL_MAP).reduce((acc,k)=>{ acc[TAB_LABEL_MAP[k]] = k; return acc; }, {});

// All 9 More-menu rows/sub-pages, not just the 3 that got semantic renames
// in Phase 1 — the other 6 still need the casing-only pass from A5.
const MORE_ROW_TARGETS = ['history', 'budgets', 'debts', 'reminders', 'goals', 'accounts', 'categories', 'account', 'settings'];
const MORE_SUB_HEADER_IDS = ['more-sub-history', 'more-sub-budgets', 'more-sub-debts', 'more-sub-reminders', 'more-sub-goals', 'more-sub-accounts', 'more-sub-categories', 'more-sub-account', 'more-sub-settings'];

function setTextIfMapped(el, map){
  if(!el) return;
  const current = (el.textContent || '').trim();
  if(Object.prototype.hasOwnProperty.call(map, current)) el.textContent = map[current];
}

// .more-row-left's markup is `<span icon-badge></span> Label` — an icon
// span followed by a trailing text node. Rewriting .textContent would wipe
// the icon; this only ever touches that trailing text node's value.
function relabelTrailingTextNode(container, map){
  if(!container) return;
  for(let i = container.childNodes.length - 1; i >= 0; i--){
    const node = container.childNodes[i];
    if(node.nodeType === Node.TEXT_NODE){
      const trimmed = node.nodeValue.trim();
      if(Object.prototype.hasOwnProperty.call(map, trimmed)){
        node.nodeValue = node.nodeValue.replace(trimmed, map[trimmed]);
      }
      return;
    }
  }
}

function applyLabelPass(direction){
  const map = direction === 'forward' ? LABEL_MAP : REVERSE_LABEL_MAP;
  const tabMap = direction === 'forward' ? TAB_LABEL_MAP : REVERSE_TAB_LABEL_MAP;

  document.querySelectorAll('.tab-label').forEach((el) => setTextIfMapped(el, tabMap));
  setTextIfMapped(document.getElementById('page-title'), map);
  MORE_ROW_TARGETS.forEach((sub) => {
    relabelTrailingTextNode(document.querySelector('.more-row[data-sub="' + sub + '"] .more-row-left'), map);
  });
  MORE_SUB_HEADER_IDS.forEach((id) => {
    setTextIfMapped(document.querySelector('#' + id + ' h2'), map);
  });
  setTextIfMapped(document.querySelector('#accounts-home-card .card-label'), map);
  setTextIfMapped(document.querySelector('#networth-row .card-label'), map);
  setTextIfMapped(document.querySelector('#history-filter-account option[value="all"]'), map);
  document.querySelectorAll('.activity-group-label').forEach((el) => setTextIfMapped(el, map));
  // A6b: casing for the "Trackr" wordmark next to the pixel spider mark
  // (see webline.css's .brand-mark::after for the mark itself). Two
  // instances in the DOM (desktop spine + auth screen), same class.
  document.querySelectorAll('.brand-name').forEach((el) => setTextIfMapped(el, map));
  // Overlay titles: only the 3 whose title is a fixed string, addressed by
  // their own overlay's id - every other overlay's title is dynamic user
  // data (a category/debt/goal NAME), which must never be silently
  // uppercased just because it happens to match a map key.
  setTextIfMapped(document.querySelector('#txdetail-overlay .search-overlay-header strong'), map);
  setTextIfMapped(document.querySelector('#diaglog-overlay .search-overlay-header strong'), map);
  setTextIfMapped(document.querySelector('#notifications-overlay .search-overlay-header strong'), map);
}

let observer = null;
let rafHandle = null;

// Debounced via rAF rather than reacting to every individual mutation
// record — a single tab switch or panel re-render can produce dozens of
// child-list mutations in one tick, and the pass only needs to run once
// after they've all landed. Self-terminating, not just debounced: each
// pass only ever rewrites nodes whose CURRENT text is still the English
// form, so the mutations the pass itself produces don't re-trigger further
// rewrites — the second observer callback after any pass finds nothing
// left to do and performs no DOM writes.
function scheduleForwardPass(){
  if(rafHandle != null) return;
  rafHandle = track(requestAnimationFrame(() => {
    untrack(rafHandle);
    rafHandle = null;
    applyLabelPass('forward');
  }));
}

// ---------- Atmosphere (Phase 2, Part B) ----------
// CRT overlay (scanlines/vignette/chromatic edge - see the CSS for those,
// this only creates/removes the element and drives its CSS animation's
// play state) plus a single <canvas> of drifting pixel particles. Both are
// pure decoration: pointer-events:none throughout, so neither can ever
// intercept a tap regardless of z-index or DOM order.
const CRT_CLASS = 'webline-crt-overlay';
const PARTICLE_CANVAS_CLASS = 'webline-particle-canvas';
// 24, chosen as enough to read as ambient drift across a typical 350-430px
// mobile viewport without visually competing with foreground content or
// costing more than 24 fillRect calls a frame - trivial even on the
// throttled mid-range profile measured for the PR report.
const PARTICLE_COUNT = 24;
const PARTICLE_COLORS = ['#9FDBF5', '#F0A030', '#7FB8D6'];

let crtEl = null;
let particleCanvas = null;
let particleCtx = null;
let particles = [];
let particleRafHandle = null;
let visibilityHandler = null;
let resizeHandler = null;
let reducedMotionMql = null;
let reducedMotionHandler = null;
let animationsPaused = false;

// Reads document.body's own dataset attribute for the in-theme toggle -
// never the closure-scoped `settings` object in js/app.js, which this
// module has no access to and must never touch per the hard rule (read
// state and add DOM only). js/app.js mirrors the persisted setting onto
// this attribute whenever it changes - see syncWeblineReduceAnimToggleUI().
function reduceAnimationsRequested(){
  const osReduced = reducedMotionMql ? reducedMotionMql.matches : false;
  const inThemeReduced = document.body && document.body.dataset.weblineReduceAnim === '1';
  return osReduced || inThemeReduced;
}

function seedParticles(width, height){
  particles = [];
  for(let i = 0; i < PARTICLE_COUNT; i++){
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      speed: 0.15 + Math.random() * 0.35,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      alpha: 0.25 + Math.random() * 0.35
    });
  }
}

function resizeParticleCanvas(){
  if(!particleCanvas || !particleCtx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth, h = window.innerHeight;
  particleCanvas.width = w * dpr;
  particleCanvas.height = h * dpr;
  particleCanvas.style.width = w + 'px';
  particleCanvas.style.height = h + 'px';
  particleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seedParticles(w, h);
}

function drawParticlesFrame(){
  // untrack THIS frame's own id before requesting the next one - a fresh
  // requestAnimationFrame id is returned every single frame, and without
  // this the handle registry would grow by one entry per frame forever
  // (confirmed the hard way: a 2-cycle teardown test came back with 107
  // leftover handles, not 0, before this line existed - track() was being
  // called ~60 times a second with nothing ever removing the PREVIOUS
  // frame's id, only the very last one via stopParticles()'s own
  // untrack()). Keeps the registry's view of "the particle loop" as one
  // live handle at a time, matching what it actually is conceptually.
  if(particleRafHandle != null) untrack(particleRafHandle);
  if(!particleCtx || !particleCanvas){ particleRafHandle = null; return; }
  const w = window.innerWidth, h = window.innerHeight;
  particleCtx.clearRect(0, 0, w, h);
  particles.forEach((p) => {
    p.y -= p.speed;
    if(p.y < -p.size){ p.y = h + p.size; p.x = Math.random() * w; }
    particleCtx.globalAlpha = p.alpha;
    particleCtx.fillStyle = p.color;
    particleCtx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  });
  particleCtx.globalAlpha = 1;
  particleRafHandle = track(requestAnimationFrame(drawParticlesFrame));
}

function startParticles(){
  if(particleRafHandle != null) return;
  particleRafHandle = track(requestAnimationFrame(drawParticlesFrame));
}

function stopParticles(){
  if(particleRafHandle != null){
    cancelAnimationFrame(particleRafHandle);
    untrack(particleRafHandle);
    particleRafHandle = null;
  }
}

// B3a: both halves of the animation system (CSS scanline drift, JS
// particle loop) pause together on visibilitychange and resume together -
// a single paused/resumed concept covering an animation implemented two
// different ways, rather than two independent pause mechanisms that could
// drift out of sync with each other.
function pauseAnimations(){
  if(animationsPaused) return;
  animationsPaused = true;
  if(crtEl) crtEl.classList.add('webline-anim-paused');
  stopParticles();
  pauseMascotTimers();
}
function resumeAnimations(){
  if(!animationsPaused) return;
  animationsPaused = false;
  if(crtEl) crtEl.classList.remove('webline-anim-paused');
  if(!reduceAnimationsRequested()) startParticles();
  if(!reduceAnimationsRequested()) resumeMascotTimers();
}
function handleVisibilityChange(){
  if(document.hidden) pauseAnimations();
  else if(!reduceAnimationsRequested()) resumeAnimations();
}
function handleReducedMotionChange(){
  if(reduceAnimationsRequested()) pauseAnimations();
  else if(!document.hidden) resumeAnimations();
}

function mountAtmosphere(){
  crtEl = track(document.createElement('div'));
  crtEl.className = CRT_CLASS;
  crtEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(crtEl);

  particleCanvas = track(document.createElement('canvas'));
  particleCanvas.className = PARTICLE_CANVAS_CLASS;
  particleCanvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(particleCanvas);
  particleCtx = particleCanvas.getContext('2d');
  resizeParticleCanvas();

  resizeHandler = track(() => resizeParticleCanvas());
  window.addEventListener('resize', resizeHandler);

  reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotionHandler = track(handleReducedMotionChange);
  reducedMotionMql.addEventListener('change', reducedMotionHandler);

  visibilityHandler = track(handleVisibilityChange);
  document.addEventListener('visibilitychange', visibilityHandler);

  if(document.hidden || reduceAnimationsRequested()){
    animationsPaused = true;
    if(crtEl) crtEl.classList.add('webline-anim-paused');
  } else {
    startParticles();
  }
}

function unmountAtmosphere(){
  stopParticles();
  if(resizeHandler){ window.removeEventListener('resize', resizeHandler); untrack(resizeHandler); resizeHandler = null; }
  if(reducedMotionMql && reducedMotionHandler){
    reducedMotionMql.removeEventListener('change', reducedMotionHandler);
    untrack(reducedMotionHandler); reducedMotionHandler = null; reducedMotionMql = null;
  }
  if(visibilityHandler){ document.removeEventListener('visibilitychange', visibilityHandler); untrack(visibilityHandler); visibilityHandler = null; }
  if(crtEl){ crtEl.remove(); untrack(crtEl); crtEl = null; }
  if(particleCanvas){ particleCanvas.remove(); untrack(particleCanvas); particleCanvas = null; particleCtx = null; }
  particles = [];
  animationsPaused = false;
}

// The in-theme "Reduce Animations" toggle lives in js/app.js (settings/
// storage access is off-limits here per the hard rule) and communicates
// with this module purely by writing document.body.dataset.
// weblineReduceAnim - a plain DOM attribute, not a function call or event,
// so this module needs its own way to notice when that attribute changes
// after mount. Reusing the SAME MutationObserver already watching body for
// the label pass (rather than standing up a second observer) - attribute
// mutations on body are irrelevant to the label pass and vice versa, so
// the callback below just branches on mutation type.
function handleBodyMutations(mutations){
  let attrChanged = false;
  let contentChanged = false;
  mutations.forEach((m) => {
    if(m.type === 'attributes') attrChanged = true;
    else contentChanged = true;
  });
  if(contentChanged){ scheduleForwardPass(); detectCelebration(); }
  if(attrChanged) handleReducedMotionChange();
}

// ---------- Mascot (Phase 3, Part B) ----------
// A companion pixel spider. State lives entirely in this module - the only
// application state it ever reads is the existing DOM (bottom-nav position
// for placement, .goal-reached-tag/.paidoff-tag for celebration), never a
// closure variable or storage call, per the hard rule. Every timer/
// listener/rAF handle created below goes through the same track()/untrack()
// registry as the atmosphere code above, and reuses the SAME pause/resume
// choke point (pauseAnimations()/resumeAnimations(), extended above) rather
// than standing up its own visibilitychange/reduced-motion listeners.
let mascotEl = null;
let hitEl = null;
let threadEl = null;
let pupilL = null;
let pupilR = null;
let mascotResizeHandler = null;
let mascotTapHandler = null;
let scrollContainer = null;
let mascotScrollHandler = null;
let scrollEndHandle = null;
let interactionHandler = null;
let sleepTimeoutHandle = null;
let isSleeping = false;
let blinkHandle = null;
let idleHandle = null;
let transientTimeoutHandle = null;
let transientLock = false;
let celebrationTimeoutHandle = null;
let dropInTimeoutHandles = [];
let mousemoveHandler = null;
let eyeTrackRafHandle = null;
let mouseX = null;
let mouseY = null;
let desktopMql = null;
let desktopMqlHandler = null;
let initialMountRafHandle = null;
const celebratedIds = new Set();
const IDLE_VARIANTS = ['webline-mascot-idle-stretch', 'webline-mascot-idle-hop', 'webline-mascot-idle-tilt'];
const IDLE_DURATIONS = { 'webline-mascot-idle-stretch': 1200, 'webline-mascot-idle-hop': 600, 'webline-mascot-idle-tilt': 800 };

// bottom is computed from .bottom-nav's own measured rect (a DOM read, not
// a duplicated safe-area formula) so the mascot inherits correctness from
// the nav's already-correct position instead of re-deriving it - see the
// CSS comment above .webline-mascot. On desktop the media query's
// `bottom:20px !important` overrides this inline value entirely.
function repositionMascot(){
  if(!mascotEl || !hitEl) return;
  const nav = document.querySelector('.bottom-nav');
  let bottomOffset = 8;
  if(nav){
    const rect = nav.getBoundingClientRect();
    if(rect.height > 0) bottomOffset = Math.max(0, window.innerHeight - rect.top);
  }
  mascotEl.style.bottom = bottomOffset + 'px';
  hitEl.style.bottom = bottomOffset + 'px';
  positionThread();
}

function positionThread(){
  if(!threadEl || !mascotEl) return;
  const rect = mascotEl.getBoundingClientRect();
  threadEl.style.left = (rect.left + rect.width / 2 - 1) + 'px';
  threadEl.style.height = Math.max(0, rect.top) + 'px';
}

function clearDropInTimeouts(){
  dropInTimeoutHandles.forEach((h) => { clearTimeout(h); untrack(h); });
  dropInTimeoutHandles = [];
}

// B3 priority 1, the signature moment. Once per activation (called once
// from mount(), never from a re-render), reduced-motion aware: with
// animations off the sprite still needs to exist and sit in its resting
// spot, it just doesn't get the fall/bounce/thread treatment.
function triggerDropIn(){
  if(!mascotEl || !threadEl) return;
  clearDropInTimeouts();
  repositionMascot();
  if(reduceAnimationsRequested()){
    return;
  }
  transientLock = true;
  threadEl.style.opacity = '1';
  threadEl.classList.remove('webline-mascot-thread-retracting');
  mascotEl.classList.add('webline-mascot-dropping');
  const h1 = track(setTimeout(() => {
    dropInTimeoutHandles = dropInTimeoutHandles.filter((h) => h !== h1);
    untrack(h1);
    if(threadEl) threadEl.classList.add('webline-mascot-thread-retracting');
  }, 50));
  const h2 = track(setTimeout(() => {
    dropInTimeoutHandles = dropInTimeoutHandles.filter((h) => h !== h2);
    untrack(h2);
    if(mascotEl) mascotEl.classList.remove('webline-mascot-dropping');
    transientLock = false;
  }, 1150));
  const h3 = track(setTimeout(() => {
    dropInTimeoutHandles = dropInTimeoutHandles.filter((h) => h !== h3);
    untrack(h3);
    if(threadEl) threadEl.style.opacity = '0';
  }, 1300));
  dropInTimeoutHandles = [h1, h2, h3];
}

// Shared one-shot animation player for blink/surprised/random-idle - every
// caller just names a state class and a duration, so there is exactly one
// place that owns the "add class, hold, remove class" timer instead of one
// per animation. transientLock keeps two of these from stomping each
// other's background-position mid-animation (e.g. a blink firing while a
// celebration wave is still playing).
function playTransient(className, duration){
  if(!mascotEl) return;
  transientLock = true;
  mascotEl.classList.add(className);
  if(transientTimeoutHandle != null){ clearTimeout(transientTimeoutHandle); untrack(transientTimeoutHandle); }
  transientTimeoutHandle = track(setTimeout(() => {
    untrack(transientTimeoutHandle);
    transientTimeoutHandle = null;
    if(mascotEl) mascotEl.classList.remove(className);
    transientLock = false;
  }, duration));
}

// Recursive setTimeout scheduling, following the same rule the Phase 2 rAF
// particle loop had to learn the hard way: untrack a handle the moment it
// fires (first line of the callback), before tracking the next one - never
// let two generations of the same recurring handle exist in the registry
// at once.
function scheduleBlink(){
  blinkHandle = track(setTimeout(runBlink, 3000 + Math.random() * 4000));
}
function runBlink(){
  untrack(blinkHandle);
  blinkHandle = null;
  if(mascotEl && !isSleeping && !transientLock && !document.hidden && !reduceAnimationsRequested()){
    playTransient('webline-mascot-blinking', 900);
  }
  scheduleBlink();
}

function scheduleIdle(){
  idleHandle = track(setTimeout(runIdle, 15000 + Math.random() * 15000));
}
function runIdle(){
  untrack(idleHandle);
  idleHandle = null;
  if(mascotEl && !isSleeping && !transientLock && !document.hidden && !reduceAnimationsRequested()){
    const variant = IDLE_VARIANTS[Math.floor(Math.random() * IDLE_VARIANTS.length)];
    playTransient(variant, IDLE_DURATIONS[variant]);
  }
  scheduleIdle();
}

function pauseMascotTimers(){
  if(blinkHandle != null){ clearTimeout(blinkHandle); untrack(blinkHandle); blinkHandle = null; }
  if(idleHandle != null){ clearTimeout(idleHandle); untrack(idleHandle); idleHandle = null; }
}
function resumeMascotTimers(){
  if(!mascotEl) return;
  if(blinkHandle == null) scheduleBlink();
  if(idleHandle == null) scheduleIdle();
}

// B3 priority 8: after 2 minutes with no interaction anywhere in the app
// (not just on the mascot itself), curl legs in and close eyes to slits.
// Any interaction resets the clock and wakes him if he was asleep.
function enterSleep(){
  isSleeping = true;
  if(mascotEl) mascotEl.classList.add('webline-mascot-sleeping');
}
function wakeMascot(){
  if(!isSleeping) return;
  isSleeping = false;
  if(mascotEl) mascotEl.classList.remove('webline-mascot-sleeping');
}
function resetSleepTimer(){
  if(sleepTimeoutHandle != null){ clearTimeout(sleepTimeoutHandle); untrack(sleepTimeoutHandle); sleepTimeoutHandle = null; }
  wakeMascot();
  sleepTimeoutHandle = track(setTimeout(() => {
    untrack(sleepTimeoutHandle);
    sleepTimeoutHandle = null;
    enterSleep();
  }, 120000));
}

// B2: fades toward 25% opacity while the app's one real scroll container is
// actively moving, restored ~200ms after it settles, so the mascot never
// sits on top of a transaction being read.
function attachScrollFade(){
  scrollContainer = document.querySelector('.views') || window;
  mascotScrollHandler = track(() => {
    if(mascotEl) mascotEl.classList.add('webline-mascot-scrolling');
    resetSleepTimer();
    if(scrollEndHandle != null){ clearTimeout(scrollEndHandle); untrack(scrollEndHandle); }
    scrollEndHandle = track(setTimeout(() => {
      untrack(scrollEndHandle);
      scrollEndHandle = null;
      if(mascotEl) mascotEl.classList.remove('webline-mascot-scrolling');
    }, 200));
  });
  scrollContainer.addEventListener('scroll', mascotScrollHandler, { passive: true });
}

function handleMascotTap(){
  resetSleepTimer();
  if(reduceAnimationsRequested()) return;
  playTransient('webline-mascot-surprised', 500);
}

// B3 priority 4, desktop only. Throttled to at most one pending rAF at a
// time (scheduleEyeTrackFrame only requests a new frame if none is already
// queued) rather than requesting a fresh frame per mousemove event, which
// keeps this from ever accumulating more than one live handle - the exact
// shape of bug the particle loop had before its fix.
function runEyeTrackFrame(){
  untrack(eyeTrackRafHandle);
  eyeTrackRafHandle = null;
  if(!mascotEl || !pupilL || !pupilR || mouseX == null) return;
  const rect = mascotEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height * 0.3;
  const dx = mouseX - cx, dy = mouseY - cy;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const maxShift = 1.6;
  const shiftX = (dx / dist) * Math.min(maxShift, dist / 40);
  const shiftY = (dy / dist) * Math.min(maxShift, dist / 40);
  const t = 'translate(' + shiftX.toFixed(2) + 'px,' + shiftY.toFixed(2) + 'px)';
  pupilL.style.transform = t;
  pupilR.style.transform = t;
}
function handleMouseMove(e){
  mouseX = e.clientX;
  mouseY = e.clientY;
  if(eyeTrackRafHandle == null) eyeTrackRafHandle = track(requestAnimationFrame(runEyeTrackFrame));
}
function updateEyeTrackingListener(){
  const desktop = desktopMql ? desktopMql.matches : false;
  if(desktop && !mousemoveHandler){
    mousemoveHandler = track(handleMouseMove);
    window.addEventListener('mousemove', mousemoveHandler);
  } else if(!desktop && mousemoveHandler){
    window.removeEventListener('mousemove', mousemoveHandler);
    untrack(mousemoveHandler);
    mousemoveHandler = null;
    if(eyeTrackRafHandle != null){ cancelAnimationFrame(eyeTrackRafHandle); untrack(eyeTrackRafHandle); eyeTrackRafHandle = null; }
    if(pupilL) pupilL.style.transform = '';
    if(pupilR) pupilR.style.transform = '';
  }
}

// B3 priority 7. Reads existing rendered state only - the debt/goal card's
// own .paidoff-tag/.goal-reached-tag markup (js/app.js) - never a hook into
// logDebtPayment()/goal contribution code. Dedupes on the card's own
// data-id (already present on its edit button) rather than the tag element
// itself, since re-renders create fresh tag elements every time the list
// redraws, not just when a debt/goal newly completes.
function detectCelebration(){
  if(!mascotEl) return;
  const tags = document.querySelectorAll('.goal-reached-tag, .paidoff-tag');
  for(const tag of tags){
    const card = tag.closest('.goal-card, .debt-card');
    const idEl = card && card.querySelector('[data-id]');
    if(!idEl) continue;
    const key = (card.classList.contains('goal-card') ? 'goal:' : 'debt:') + idEl.dataset.id;
    if(celebratedIds.has(key)) continue;
    celebratedIds.add(key);
    if(!reduceAnimationsRequested()) triggerCelebration();
    return;
  }
}
function triggerCelebration(){
  if(!mascotEl) return;
  if(celebrationTimeoutHandle != null){ clearTimeout(celebrationTimeoutHandle); untrack(celebrationTimeoutHandle); }
  mascotEl.classList.remove('webline-mascot-blinking', 'webline-mascot-surprised', 'webline-mascot-idle-stretch', 'webline-mascot-idle-hop', 'webline-mascot-idle-tilt');
  transientLock = true;
  mascotEl.classList.add('webline-mascot-celebrating');
  celebrationTimeoutHandle = track(setTimeout(() => {
    untrack(celebrationTimeoutHandle);
    celebrationTimeoutHandle = null;
    if(mascotEl) mascotEl.classList.remove('webline-mascot-celebrating');
    transientLock = false;
  }, 1650));
}

function mountMascot(){
  threadEl = track(document.createElement('div'));
  threadEl.className = 'webline-mascot-thread';
  threadEl.setAttribute('aria-hidden', 'true');
  threadEl.style.opacity = '0';
  document.body.appendChild(threadEl);

  mascotEl = track(document.createElement('div'));
  mascotEl.className = 'webline-mascot';
  mascotEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(mascotEl);

  pupilL = track(document.createElement('div'));
  pupilL.className = 'webline-mascot-pupil webline-mascot-pupil-l';
  mascotEl.appendChild(pupilL);
  pupilR = track(document.createElement('div'));
  pupilR.className = 'webline-mascot-pupil webline-mascot-pupil-r';
  mascotEl.appendChild(pupilR);

  hitEl = track(document.createElement('div'));
  hitEl.className = 'webline-mascot-hit';
  hitEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(hitEl);

  mascotResizeHandler = track(() => repositionMascot());
  window.addEventListener('resize', mascotResizeHandler);

  mascotTapHandler = track(handleMascotTap);
  hitEl.addEventListener('click', mascotTapHandler);

  attachScrollFade();

  interactionHandler = track(() => resetSleepTimer());
  document.addEventListener('pointerdown', interactionHandler);
  document.addEventListener('keydown', interactionHandler);

  desktopMql = window.matchMedia('(min-width:781px)');
  desktopMqlHandler = track(updateEyeTrackingListener);
  desktopMql.addEventListener('change', desktopMqlHandler);
  updateEyeTrackingListener();

  resetSleepTimer();
  if(!document.hidden && !reduceAnimationsRequested()){
    scheduleBlink();
    scheduleIdle();
  }

  // Measuring .bottom-nav's rect right on mount (a remount, not the first
  // one this page load) sometimes raced a layout that hadn't settled yet -
  // confirmed the hard way, a real device-independent repro: switch theme
  // away and back, and the very next getBoundingClientRect() on the nav
  // could still reflect a stale/mid-reflow position, throwing the mascot
  // off-screen (bottom:900px, i.e. nav.top read as 0). Hiding the sprite
  // and deferring the first repositionMascot()/triggerDropIn() past two
  // animation frames guarantees layout has been flushed and stable before
  // anything measures it or starts animating from that measurement.
  mascotEl.style.visibility = 'hidden';
  threadEl.style.visibility = 'hidden';
  const raf1 = track(requestAnimationFrame(() => {
    untrack(raf1);
    const raf2 = track(requestAnimationFrame(() => {
      untrack(raf2);
      initialMountRafHandle = null;
      if(mascotEl) mascotEl.style.visibility = '';
      if(threadEl) threadEl.style.visibility = '';
      triggerDropIn();
    }));
    initialMountRafHandle = raf2;
  }));
  initialMountRafHandle = raf1;
}

function unmountMascot(){
  if(mascotResizeHandler){ window.removeEventListener('resize', mascotResizeHandler); untrack(mascotResizeHandler); mascotResizeHandler = null; }
  if(mascotTapHandler && hitEl){ hitEl.removeEventListener('click', mascotTapHandler); untrack(mascotTapHandler); mascotTapHandler = null; }
  if(mascotScrollHandler && scrollContainer){ scrollContainer.removeEventListener('scroll', mascotScrollHandler); untrack(mascotScrollHandler); mascotScrollHandler = null; }
  scrollContainer = null;
  if(scrollEndHandle != null){ clearTimeout(scrollEndHandle); untrack(scrollEndHandle); scrollEndHandle = null; }
  if(interactionHandler){
    document.removeEventListener('pointerdown', interactionHandler);
    document.removeEventListener('keydown', interactionHandler);
    untrack(interactionHandler);
    interactionHandler = null;
  }
  if(sleepTimeoutHandle != null){ clearTimeout(sleepTimeoutHandle); untrack(sleepTimeoutHandle); sleepTimeoutHandle = null; }
  if(blinkHandle != null){ clearTimeout(blinkHandle); untrack(blinkHandle); blinkHandle = null; }
  if(idleHandle != null){ clearTimeout(idleHandle); untrack(idleHandle); idleHandle = null; }
  if(transientTimeoutHandle != null){ clearTimeout(transientTimeoutHandle); untrack(transientTimeoutHandle); transientTimeoutHandle = null; }
  if(celebrationTimeoutHandle != null){ clearTimeout(celebrationTimeoutHandle); untrack(celebrationTimeoutHandle); celebrationTimeoutHandle = null; }
  if(initialMountRafHandle != null){ cancelAnimationFrame(initialMountRafHandle); untrack(initialMountRafHandle); initialMountRafHandle = null; }
  clearDropInTimeouts();
  if(mousemoveHandler){ window.removeEventListener('mousemove', mousemoveHandler); untrack(mousemoveHandler); mousemoveHandler = null; }
  if(eyeTrackRafHandle != null){ cancelAnimationFrame(eyeTrackRafHandle); untrack(eyeTrackRafHandle); eyeTrackRafHandle = null; }
  if(desktopMql && desktopMqlHandler){ desktopMql.removeEventListener('change', desktopMqlHandler); untrack(desktopMqlHandler); desktopMqlHandler = null; desktopMql = null; }
  if(hitEl){ hitEl.remove(); untrack(hitEl); hitEl = null; }
  if(pupilL){ untrack(pupilL); pupilL = null; }
  if(pupilR){ untrack(pupilR); pupilR = null; }
  if(mascotEl){ mascotEl.remove(); untrack(mascotEl); mascotEl = null; }
  if(threadEl){ threadEl.remove(); untrack(threadEl); threadEl = null; }
  celebratedIds.clear();
  isSleeping = false;
  transientLock = false;
  mouseX = null;
  mouseY = null;
}

export function mount(){
  applyLabelPass('forward');
  observer = track(new MutationObserver(handleBodyMutations));
  if(document.body){
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['data-webline-reduce-anim']
    });
  }
  mountAtmosphere();
  mountMascot();
}

export function unmount(){
  if(observer){
    observer.disconnect();
    untrack(observer);
    observer = null;
  }
  if(rafHandle != null){
    cancelAnimationFrame(rafHandle);
    untrack(rafHandle);
    rafHandle = null;
  }
  unmountMascot();
  unmountAtmosphere();
  // Reverts every element the forward pass ever touched, in one pass over
  // the DOM as it stands right now — every relabel target is a static,
  // always-present element (never conditionally created/destroyed), so a
  // single reverse pass at the moment of unmount reaches all of them
  // regardless of which sub-page happens to be visible.
  applyLabelPass('reverse');
  console.assert(getHandleCount() === 0, '[webline] teardown incomplete — tracked handles remaining:', getHandleCount());
}
