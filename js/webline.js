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
const LABEL_MAP = {
  'History': 'ACTIVITY LOG',
  'Insights': 'WEB WATCH',
  'Reminders': 'RADAR',
  'Wallets': 'THE WEB',
  'More': 'CONSOLE',
  'All Wallets': 'All The Web'
};
const REVERSE_LABEL_MAP = Object.keys(LABEL_MAP).reduce((acc,k)=>{ acc[LABEL_MAP[k]] = k; return acc; }, {});

// Bottom tab bar / desktop spine tab labels use a separate map: the tab
// bar is the one place real-device width is tightest (see section 7b of
// the brief), so it gets whatever form measurement confirms fits — see the
// PR report for the actual measured strings used here.
const TAB_LABEL_MAP = {
  'Insights': 'WEB WATCH',
  'More': 'CONSOLE'
};
const REVERSE_TAB_LABEL_MAP = Object.keys(TAB_LABEL_MAP).reduce((acc,k)=>{ acc[TAB_LABEL_MAP[k]] = k; return acc; }, {});

const MORE_ROW_TARGETS = ['history', 'reminders', 'accounts'];
const MORE_SUB_HEADER_IDS = ['more-sub-history', 'more-sub-reminders', 'more-sub-accounts'];

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
  setTextIfMapped(document.querySelector('#history-filter-account option[value="all"]'), map);
  document.querySelectorAll('.activity-group-label').forEach((el) => setTextIfMapped(el, map));
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

export function mount(){
  applyLabelPass('forward');
  observer = track(new MutationObserver(scheduleForwardPass));
  if(document.body){
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
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
  // Reverts every element the forward pass ever touched, in one pass over
  // the DOM as it stands right now — every relabel target is a static,
  // always-present element (never conditionally created/destroyed), so a
  // single reverse pass at the moment of unmount reaches all of them
  // regardless of which sub-page happens to be visible.
  applyLabelPass('reverse');
  console.assert(getHandleCount() === 0, '[webline] teardown incomplete — tracked handles remaining:', getHandleCount());
}
