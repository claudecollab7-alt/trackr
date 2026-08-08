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
}
function resumeAnimations(){
  if(!animationsPaused) return;
  animationsPaused = false;
  if(crtEl) crtEl.classList.remove('webline-anim-paused');
  if(!reduceAnimationsRequested()) startParticles();
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
  if(contentChanged) scheduleForwardPass();
  if(attrChanged) handleReducedMotionChange();
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
  unmountAtmosphere();
  // Reverts every element the forward pass ever touched, in one pass over
  // the DOM as it stands right now — every relabel target is a static,
  // always-present element (never conditionally created/destroyed), so a
  // single reverse pass at the moment of unmount reaches all of them
  // regardless of which sub-page happens to be visible.
  applyLabelPass('reverse');
  console.assert(getHandleCount() === 0, '[webline] teardown incomplete — tracked handles remaining:', getHandleCount());
}
