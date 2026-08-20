(function(){
  "use strict";

  /* ---------- Disable pinch/double-tap zoom everywhere ----------
     The viewport meta tag + CSS touch-action cover most browsers, but older
     iOS Safari (and standalone/installed PWA mode) still needs the classic
     gesturestart/touchend belt-and-suspenders fix. */
  document.addEventListener('gesturestart', (e)=> e.preventDefault());
  document.addEventListener('gesturechange', (e)=> e.preventDefault());
  document.addEventListener('gestureend', (e)=> e.preventDefault());
  let lastTouchEnd = 0;
  let lastTouchTarget = null;
  document.addEventListener('touchend', (e)=>{
    const now = Date.now();
    if(now - lastTouchEnd <= 350 && e.target === lastTouchTarget) e.preventDefault();
    lastTouchEnd = now;
    lastTouchTarget = e.target;
  }, { passive:false });

  const ICON_PATHS = {
    home: '<path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9"/>',
    insights: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    arrowUp: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/>',
    arrowDown: '<line x1="7" y1="7" x2="17" y2="17"/><polyline points="16 7 17 16 8 16"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/>',
    edit: '<path d="M12 20h8"/><path d="M16 4 4 16v4h4L20 8z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    download: '<path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 19h14"/>',
    upload: '<path d="M12 21V9"/><polyline points="7 13 12 8 17 13"/><path d="M5 19h14"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    tag: '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="3"/>',
    wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="17" cy="14" r="1.5"/>',
    creditCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3.2"/>',
    eyeOff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.4 21.4 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.4 21.4 0 0 1-3.22 4.36M14.12 14.12a3.2 3.2 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    check: '<polyline points="4 12 9 17 20 6"/>',
    grip: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>'
  };
  function icon(name, size){
    size = size || 18;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]||''}</svg>`;
  }
  function injectIcons(){
    document.querySelectorAll('[data-icon]').forEach(el=>{
      el.innerHTML = icon(el.dataset.icon, el.dataset.iconSize ? parseInt(el.dataset.iconSize,10) : 18);
    });
  }

  // Every transaction/debt/receivable/goal id must be a real UUID — the Supabase
  // schema declares id as uuid, and upserting a non-UUID string fails outright.
  function uuid(){
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c=>{
      const r = Math.random()*16|0, v = c==='x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  let transactions = [];
  let categories = defaultCategories();
  // Per-category position/colour, round "category ordering + colour". FIX (post-review): this
  // must be scoped per account, the same way duplicateDismissals already is (see
  // duplicateDismissalScopeKey below) - categories itself resets to defaultCategories() on logout
  // (hardClearAllLocalDataNoSync), which is what stops a previous account's customized category
  // NAMES leaking into whoever logs in next on the same device, but categoryMeta was never added
  // to that reset, and this round's constraints explicitly rule out touching
  // hardClearAllLocalDataNoSync() to fix that a second way. Scoping the data itself instead means
  // a device that goes user A -> logout -> user B (first login ever on this device) genuinely
  // cannot read user A's leftover positions/colours: user B's own reconcile only ever looks at
  // categoryMeta['__local__'] (this device's own pre-login/guest edits, if any) and
  // categoryMeta[userB.id] (initially empty), never categoryMeta[userA.id] - a completely
  // different top-level key it has no reason to touch. Shape is now
  // `{ [accountIdOrLocal]: { 'name|type': {position?, color?} } }` - the in-memory variable holds
  // EVERY scope at once (mirrors duplicateDismissals precisely), and every read/write site below
  // goes through categoryMetaBucket()/ensureCategoryMetaBucket() for the CURRENT scope only, never
  // touching the object directly.
  let categoryMeta = {};
  // Mirrors duplicateDismissalScopeKey's own reasoning exactly (see that function) - '__local__'
  // for guest/offline use, the signed-in account's id otherwise.
  function categoryMetaScopeKey(){ return currentUser ? currentUser.id : '__local__'; }
  // Read-only - returns the current scope's bucket, or {} if it doesn't exist yet, WITHOUT
  // creating it (so a read in a hot render path can never leave behind a stray empty bucket).
  function categoryMetaBucket(){ return categoryMeta[categoryMetaScopeKey()] || {}; }
  // For writes only - creates the current scope's bucket on first use, same as duplicateDismissals'
  // own write sites do (`if(!duplicateDismissals[scope]) duplicateDismissals[scope] = {};`).
  function ensureCategoryMetaBucket(){
    const scope = categoryMetaScopeKey();
    if(!categoryMeta[scope]) categoryMeta[scope] = {};
    return categoryMeta[scope];
  }
  let settings = { currency: '₹' };
  let budgets = {};
  // Kept OUTSIDE settings deliberately, and OUTSIDE the permanently-rejected-records marker store
  // (js/supabase.js) too - this is a real user decision ("I looked at this, it's not a duplicate"),
  // not a sync-error marker, so it must survive exactly what markers must NOT: logout, app restart,
  // re-login. Scoped per-account (keyed by user id, or '__local__' for a device never logged in) so
  // a genuinely different person logging into this same device still starts with nothing dismissed -
  // the same cross-account-leak concern that used to justify wiping this on logout, solved without
  // having to actually wipe anything. Still device-local (not synced to Supabase) for now - see
  // dismissDuplicateGroup's own comment for what syncing this would actually take.
  let duplicateDismissals = {};
  // Per-account, exactly like duplicateDismissals above - keyed by user id so a genuinely
  // different person logging into this same device still gets their own first-contact
  // reconciliation (see reconcileAccountsOnFirstContact), without the SAME account re-triggering
  // it on every ordinary logout/login. This used to be a single flag reset to 'false' on every
  // logout specifically so a second user got their own pass (see PR #39's own reasoning) - but
  // that reset also re-ran the name-based merge for the SAME returning user, against local wallets
  // that hardClearAllLocalDataNoSync had just reseeded back to defaultAccounts() - producing an id
  // collision every single time (this is the actual, confirmed cause of the wallet re-seed
  // duplicate-id bug). Scoping by user id gets the original intent right without that side effect:
  // this is never reset on logout at all now, it just naturally starts unset for any user id that
  // has never reconciled on this device before.
  let accountsReconciledOnce = {};
  // Same shape and reasoning as accountsReconciledOnce directly above, for the categories table -
  // see reconcileCategoriesOnFirstContact for the merge itself. Scoped by user id, never reset on
  // logout (hardClearAllLocalDataNoSync reseeds local `categories` back to defaultCategories() on
  // every logout regardless - see that function's own comment - but that's harmless now: the next
  // login for the SAME account skips straight to "already reconciled, pull the real list from the
  // cloud" instead of re-running the merge against a set of local defaults that were never this
  // account's actual data to begin with).
  let categoriesReconciledOnce = {};
  // Set by dedupeAccountsById() (called from loadData(), before a user is ever attached) when it
  // finds and repairs an existing id collision in local storage - consumed once by
  // startAppForUserImpl right after attachUserAndSync, to push the corrected accounts (and any
  // transactions renamed along with them) up to Supabase and drop any stale queued accounts op
  // that might still be carrying the pre-repair, duplicate-id snapshot.
  let accountsRepairedThisLoad = false;
  // Scoped by user id, same reasoning as accountsReconciledOnce above (never reset on logout, so
  // it naturally starts unset for any user id that hasn't been checked on this device before).
  // Set by reconcileBudgetsTruncationOnce() the first time a device checks in against the cloud
  // on a build that has the syncedRowKeyOf fix - see that function's own comment for what it's
  // recovering from.
  let budgetsTruncationCheckedOnce = {};
  let debts = [];
  let receivables = [];
  let recurring = [];
  let reminders = [];
  let goals = [];
  let accounts = defaultAccounts();
  let charts = { weekTrend:null };
  let currentReport = null;
  let editingId = null;
  let editingDebtId = null;
  let editingGoalId = null;
  let editingReminderId = null;
  let notifiedReminderIds = new Set();
  function clearNotifiedFor(id){
    Array.from(notifiedReminderIds).forEach(key=>{ if(key===id || key.indexOf(id+'_')===0) notifiedReminderIds.delete(key); });
  }
  let trendRange = '7d';
  let ringRange = 'month';
  let activeDebtKind = 'debt'; // 'debt' (I Owe) or 'receivable' (Owed to Me) — which list the Debts & EMIs page currently shows
  const desktopMql = window.matchMedia('(min-width: 781px)'); // matches the .spine/.bottom-nav breakpoint in styles.css
  let isDesktop = desktopMql.matches;
  // Cross-tab data safety: if this tab deletes a record, remember its id so a later
  // merge-on-save (which reconciles against whatever another tab may have written)
  // never silently resurrects something this tab intentionally removed.
  let recentlyDeletedTxIds = new Set();
  let recentlyDeletedDebtIds = new Set();
  let recentlyDeletedReceivableIds = new Set();

  // Unified category colour system (round "category ordering + colour"). Previously there were
  // THREE separate palettes: CAT_PALETTE (hex, Light+Dark), CAT_PALETTE_CRIMSON (hex, Crimson),
  // and a 24-slot OKLCH hue-major ramp (Black only - see the preserved round 3-5 history below for
  // how that one was built up). This round adds a manual per-category colour picker, and a
  // manually-picked colour has to look the same no matter which theme is active - switching theme
  // must never silently change a colour the user chose - which only holds if there's one shared
  // palette instead of three theme-scoped ones. So this round retires CAT_PALETTE/
  // CAT_PALETTE_CRIMSON and promotes the OKLCH approach (already proven across rounds 3-5) to run
  // under every theme, expanded from 24 to 36 swatches: 18 hues at 20 degrees apart, each at two
  // lightness tiers, oklch(0.72 0.13 H) and oklch(0.65 0.13 H) - the exact swatch set the colour
  // picker's grid shows (see renderColorPickerGrid). Every existing Light/Dark/Crimson category
  // will visibly get a new colour as a result - expected and accepted, not a bug; only a
  // MANUALLY-picked colour is required to never shift (see assignAutoCategorySlots below).
  //
  // REVISED (round "budgets + picker polish"): the 36-swatch set above paired each hue with BOTH
  // lightness tiers at adjacent grid positions (index 2*i/2*i+1 = same hue, different tier) - two
  // swatches right next to each other in the picker that differed only by 0.07 of lightness, which
  // read as visually identical. Worst-case adjacent pair measured (see the round's own calc script)
  // at deltaE76 = 8.12, hue delta = 0deg. Replaced with 30 swatches, each at a DISTINCT hue (360/30
  // = 12deg apart) with lightness alternating 0.72/0.65 by index - so every adjacent pair now
  // differs in BOTH hue and lightness, never just one. Verified worst-case adjacent deltaE76 ~10.1-
  // 10.5 (checked against real 2D grid adjacency - horizontal AND vertical - at column counts
  // 5/6/8/10, not just array order) - both lightness values are unchanged from above, so the
  // existing WCAG contrast verification against the near-black avatar letter (5.68:1 / 7.46:1+)
  // still holds with no new gamut/contrast risk. 30 still comfortably exceeds the 18-category
  // default set (12 free swatches) even after the picker's lock-check was tightened to cover
  // auto-assigned colours too (see categoryColorTakenMap).
  //
  // Preserved history (round 3-5 reasoning for OKLCH-over-HSL, hue-major slot ordering, and the
  // single shared credit+debit pool, all of which still apply unchanged to the 30-swatch version
  // below):
  // - HSL is not perceptually uniform (round 3): hues 15/25/45 all read "orange" at this
  //   saturation/lightness, hues 210/255/280 all read "blue-purple" - equal-L OKLCH actually looks
  //   equally light across hues, which is why this whole system is OKLCH-based rather than HSL.
  // - Round 5 fixed two real collisions found on a real device: (1) ordering slots as two
  //   contiguous lightness blocks let an even stride land on both copies of the same hue - fixed by
  //   interleaving lightness by slot instead, so no two slots ever share a hue; (2) assigning
  //   credit and debit categories through separate passes let e.g. "Rent" (expense) and "Rental
  //   Income" (income) collide, which matters because History mixes both in one list - fixed by
  //   assigning from one shared, alphabetically-sorted pool spanning both lists.
  // Verified real canvas fillStyle AND real SVG fill-attribute both accept raw oklch() strings in
  // sandbox Chromium (a pixel read back after assignment matched this conversion function exactly)
  // AND, as of round 5, a real donut chart rendering in colour on a real Android device's Chrome -
  // still converted to sRGB hex in JS at generation time below rather than trusting oklch() strings
  // to reach every renderer.
  const CAT_SWATCH_CHROMA = 0.13;
  const CAT_SWATCH_TIER_HIGH = 0.72;
  // FIX (post-review): the brief originally specified 0.60 here, which Round 3 had already tried
  // and moved away from for the same 36/24-swatch-set reason - 0.60 recomputes to 4.64:1 worst-case
  // contrast against the fixed near-black avatar letter (#0B0B0B), clearing WCAG AA's 4.5:1 floor
  // by under 3%. Restored to 0.65, the exact value Round 3 settled on, which recomputes to 5.68:1
  // against this round's 18-hue/36-swatch set - real margin, not a hair above the floor. Sampled
  // 0.68/0.70 too: both push the number higher still (6.39:1 / 6.93:1) but shrink the SAME-HUE
  // high/low tier's own visual gap - minimum relative-luminance delta between a hue's two tiers
  // drops from 0.093 at 0.65 to 0.056 at 0.68 and 0.028 at 0.70, i.e. the two tiers at the same hue
  // start reading as one colour rather than two. 0.65 was picked specifically to avoid trading the
  // contrast problem for a tier-distinguishability one.
  const CAT_SWATCH_TIER_LOW = 0.65;
  // Standard OKLCH -> OKLab -> linear sRGB -> sRGB conversion (Björn Ottosson's reference
  // matrices, the same ones the CSS Color 4 spec and every browser's native oklch() parser use -
  // confirmed to match this browser's own conversion pixel-for-pixel, see above).
  function oklchToHex(L, C, hDeg){
    const hRad = hDeg * Math.PI / 180;
    const a = C * Math.cos(hRad), b = C * Math.sin(hRad);
    const l_ = L + 0.3963377774*a + 0.2158037573*b;
    const m_ = L - 0.1055613458*a - 0.0638541728*b;
    const s_ = L - 0.0894841775*a - 1.2914855480*b;
    const l = l_**3, m = m_**3, s = s_**3;
    const r = 4.0767416621*l - 3.3077115913*m + 0.2309699292*s;
    const g = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s;
    const bl = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s;
    const gam = (c)=>{ c = Math.max(0, Math.min(1, c)); return c<=0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055; };
    const toHex = (c)=> Math.round(Math.max(0,Math.min(1,gam(c)))*255).toString(16).padStart(2,'0');
    return '#'+toHex(r)+toHex(g)+toHex(bl);
  }
  // 30 swatches, each at its own distinct hue (360/30 = 12deg apart) with lightness alternating
  // high/low tier by index - no two swatches ever share a hue, so no two grid-adjacent swatches
  // (see renderColorPickerGrid) can differ by lightness alone the way the old paired-tier layout
  // did. Computed once at load rather than per-render.
  const CAT_SWATCH_COUNT = 30;
  const CAT_SWATCHES = [];
  for(let catSwatchI=0; catSwatchI<CAT_SWATCH_COUNT; catSwatchI++){
    const hue = catSwatchI*(360/CAT_SWATCH_COUNT);
    const tier = catSwatchI%2===0 ? 'high' : 'low';
    const L = tier==='high' ? CAT_SWATCH_TIER_HIGH : CAT_SWATCH_TIER_LOW;
    CAT_SWATCHES.push({ hex: oklchToHex(L, CAT_SWATCH_CHROMA, hue), hue, tier });
  }
  function hashString(name){
    let hash = 0; const s = name || '?';
    for(let i=0;i<s.length;i++){ hash = s.charCodeAt(i) + ((hash<<5)-hash); }
    return Math.abs(hash);
  }
  // Every category anywhere (income+expense) that currently has a manually-picked colour (see
  // categoryMeta above) - used both to grey out taken swatches in the picker grid and to exclude
  // those swatches from the auto-assignment pool below, so an auto colour can never land on one a
  // user deliberately chose.
  function manuallyClaimedSwatchHexes(){
    const set = new Set();
    Object.values(categoryMetaBucket()).forEach(m=>{ if(m && m.color) set.add(m.color); });
    return set;
  }
  // Looks up name's own manual colour, if it has one. A name can only appear in categoryMeta under
  // the type it actually belongs to (income -> 'credit', expense -> 'debit') - a name present in
  // BOTH lists (the same rare edge case the shared-pool logic below already tolerates) resolves to
  // whichever the income side says, arbitrarily but consistently.
  function manualCategoryColor(name){
    const inIncome = (categories && Array.isArray(categories.income)) ? categories.income.includes(name) : false;
    const inExpense = (categories && Array.isArray(categories.expense)) ? categories.expense.includes(name) : false;
    const dbType = inIncome ? 'credit' : (inExpense ? 'debit' : null);
    if(!dbType) return null;
    const meta = categoryMetaBucket()[name+'|'+dbType];
    return (meta && meta.color) ? meta.color : null;
  }
  // Assigns from a SINGLE shared pool spanning credit+debit (see the round 5 history above),
  // restricted to names that DON'T already have a manual colour, and restricted to swatches that
  // aren't already manually claimed by someone else (2e: "auto-assignment must skip any swatch
  // already claimed manually"). Sorts alphabetically, then spreads across whatever swatches remain
  // at slot = round(i*available/n) - the same even-spread formula rounds 4-5 used against the full
  // 24/36-slot ring, just against a possibly-smaller "available" set. Recomputed on every call
  // rather than cached, since `categories`/categoryMeta are mutable app state - trivial cost at
  // these list sizes.
  //
  // TRADE-OFF, accepted deliberately (per the brief, same as round 4-5): adding, removing, or
  // manually recolouring ANY category can reassign AUTO colours across both lists, not just the one
  // that changed. Colour here is otherwise pure decoration, so this is fine - a MANUAL pick is a
  // direct lookup (manualCategoryColor above), never touched by this recompute, so it can never
  // shift.
  function assignAutoCategorySlots(names){
    const claimed = manuallyClaimedSwatchHexes();
    const availableSlots = CAT_SWATCHES.map((s,i)=>i).filter(i=> !claimed.has(CAT_SWATCHES[i].hex));
    const sorted = [...names].sort((a,b)=> a.localeCompare(b));
    const n = sorted.length;
    const pool = availableSlots.length ? availableSlots : CAT_SWATCHES.map((s,i)=>i);
    const assignment = new Map();
    sorted.forEach((name,i)=>{
      const slot = pool[n>0 ? Math.round(i*pool.length/n) % pool.length : 0];
      assignment.set(name, CAT_SWATCHES[slot].hex);
    });
    return assignment;
  }
  // Income avatars used to bypass categoryColor() entirely in Light/Dark/Crimson (a hardcoded
  // green) - a deliberate, pre-existing design from round 5 unrelated to this round's brief, left
  // untouched: a manually-picked colour on an income category still has no visible effect here,
  // same as its auto colour never did. Under Black, income rows already got the category-derived
  // colour (the ↑ glyph still marks it as income); every theme's Categories-page avatar for an
  // income row already used categoryColor() directly regardless (see renderCatList), so this
  // asymmetry is exactly as wide as it was before this round, not wider.
  function incomeAvatarColor(name){
    return document.body.getAttribute('data-theme')==='black' ? categoryColor(name) : '#16A34A';
  }
  // Centralizes the "background + legible text colour" inline style for every lettered avatar
  // badge (.cat-badge/.chip-badge) in one place, rather than duplicating this at each of the ~10
  // call sites that render one. bg defaults to categoryColor(name) but can be overridden (the
  // three income-avatar call sites pass incomeAvatarColor(name) instead). The letter colour
  // itself is written as the literal string "var(--avatar-letter)", not a resolved hex - this is
  // an inline HTML style attribute, so the browser's own cascade resolves the custom property at
  // render time; no JS-held copy of #0B0B0B exists anywhere. Previously Black-only (every other
  // theme's badge fell back to the CSS default, white) - now every swatch in CAT_SWATCHES sits at
  // chroma 0.13 and lightness >=0.65, sampled and confirmed legible at its worst case (see
  // CAT_SWATCH_TIER_LOW's own comment) against the same fixed near-black glyph colour, so
  // --avatar-letter is promoted to a global token (css/styles.css's :root block) and used
  // unconditionally here, for every theme.
  function catBadgeStyle(name, bgOverride){
    const bg = bgOverride || categoryColor(name);
    return 'background:' + bg + '; color:var(--avatar-letter);';
  }

  function defaultCategories(){
    return {
      income: ['Salary','Business','Freelance','Investment Returns','Rental Income','Gift / Bonus','Other Income'],
      expense: ['Food & Groceries','Transport','Rent','Utilities & Bills','Shopping','Entertainment','Healthcare','Education','Investments','Insurance','Other Expense']
    };
  }
  // These two categories are only ever meant to be applied automatically by logDebtPayment() -
  // manually picking them on a plain transaction produces a row that looks debt-linked (same
  // category text) but has no debt_id, which is indistinguishable from a real linked payment
  // anywhere else in the app. logDebtPayment() still pushes them into categories.income/expense
  // so they exist as valid category values on the transaction itself; this only hides them from
  // the manual entry-form picker.
  const NON_MANUAL_CATEGORIES = ['EMI / Loan', 'Loan Repayment Received'];
  function defaultAccounts(){
    return [
      { id:'acc_cash', name:'Cash' },
      { id:'acc_bank', name:'Bank' },
      { id:'acc_card', name:'Card' }
    ];
  }
  // A collision can only ever happen between a genuine record and a re-seeded DEFAULT (see
  // reconcileAccountsOnFirstContact and accountsReconciledOnce's own comments for how) -
  // defaultAccounts()'s own hardcoded name for that id is therefore the one signal that reliably
  // tells the two apart: whichever of the pair does NOT match the literal default name is the one
  // the user actually customized (renamed, or genuinely created), so it wins. Falls back to the
  // later array entry if neither/both match the default (shouldn't happen in practice).
  // Local-only heuristic, used when no cloud data is available yet (loadData() runs before any
  // pull) - whichever name does NOT match defaultAccounts()'s literal hardcoded name for that id
  // is the one signal that reliably identifies the user's real customization over a re-seeded
  // default. Falls back to the last array entry if neither/both match (shouldn't happen).
  function pickAccountDedupeWinner(candidates){
    const defaults = defaultAccounts();
    const nonDefault = candidates.filter(a=>{
      const def = defaults.find(d=>d.id===a.id);
      return !def || def.name.trim().toLowerCase() !== (a.name||'').trim().toLowerCase();
    });
    if(nonDefault.length===1) return nonDefault[0];
    return candidates[candidates.length-1];
  }
  // Repairs a local `accounts` array that ended up with more than one record sharing the same id.
  // Called from TWO places, deliberately, not just one: inside loadData() (before anything else
  // reads `accounts`, so a device already stuck in this state self-heals on a genuine fresh page
  // load, regardless of login state or network) AND again inside attachUserAndSync, immediately
  // after a cloud pull completes (see its own call site). The second call matters because
  // attachUserAndSync can also run via startAppForUserImpl's "already running" reauth branch
  // (e.g. logging in from within an already-open guest/offline session), which never calls
  // loadData() at all - confirmed in production as the actual gap: a collision that first
  // appeared on that path skipped this repair entirely, leaving dedupeRowsById's blunt,
  // winner-agnostic "keep whichever is last in array order" as the only thing standing between it
  // and Postgres, with no knowledge of which name was the user's real one.
  //
  // cloudAccounts, when provided (the second call site only), is the strongest possible signal:
  // if the cloud already has an authoritative row for a colliding id, that row's NAME is what
  // every local record for that id gets collapsed onto - a correct cloud value can never lose to
  // a locally reseeded default this way, regardless of which local candidate the name-only
  // heuristic below would otherwise have picked. Reassigns any transaction referencing a losing
  // name over to the winning name first, exactly like a rename (see handleRenameAccount) - so a
  // merge here can never orphan a transaction the way a naive "just delete one" would.
  function dedupeAccountsById(cloudAccounts){
    const byId = new Map();
    accounts.forEach(a=>{ if(!byId.has(a.id)) byId.set(a.id, []); byId.get(a.id).push(a); });
    const dupIds = [...byId.keys()].filter(id=> byId.get(id).length>1);
    if(!dupIds.length) return false;
    const cloudById = new Map((cloudAccounts||[]).map(c=>[c.id, c]));
    const winnerNameById = new Map();
    dupIds.forEach(id=>{
      const group = byId.get(id);
      const cloudRow = cloudById.get(id);
      const winnerName = cloudRow ? cloudRow.name : pickAccountDedupeWinner(group).name;
      winnerNameById.set(id, winnerName);
      const loserNames = [];
      let reassignedCount = 0;
      group.forEach(loser=>{
        if((loser.name||'').trim().toLowerCase() === winnerName.trim().toLowerCase()) return;
        loserNames.push(loser.name);
        transactions.forEach(t=>{ if(t.account===loser.name){ t.account = winnerName; reassignedCount++; } });
      });
      // Distinct from sync-dedupe-collision (js/supabase.js) - that one fires at upsert time for
      // ANY duplicate key on ANY table and only ever knows "N rows collapsed to M", with no idea
      // which record was semantically correct. This is the one place that actually names the
      // winner, the loser(s), and how many transactions moved, so a report like this round's
      // ("the wrong wallet survived, ~16,020 in transactions was orphaned") is diagnosable
      // directly from View Log next time instead of inferred after the fact.
      diagLogPage('page:accounts-duplicate-repaired', {
        id, winnerName, loserNames: [...new Set(loserNames)], transactionsReassigned: reassignedCount,
        resolvedAgainstCloud: !!cloudRow
      });
    });
    const seenIds = new Set();
    accounts = accounts.filter(a=>{
      if(!winnerNameById.has(a.id)) return true;
      if(seenIds.has(a.id)) return false;
      seenIds.add(a.id);
      a.name = winnerNameById.get(a.id);
      return true;
    });
    return true;
  }
  // One-time-per-device repair for the v37 budgets keyOf bug (see syncedRowKeyOf in
  // js/supabase.js): any batch upsert of 2+ budget categories made while running v37 silently
  // collapsed to just the last category server-side, while the LOCAL copy that made that push
  // stayed fully intact (the bug was only ever in what got sent to Postgres, never in what got
  // written to disk). Left alone, the very next ordinary pull would take that truncated cloud
  // set and overwrite this device's still-complete local copy with it via the unconditional
  // `budgets = cloud.budgets` in attachUserAndSync - turning a cloud-only loss into a permanent,
  // cross-device one. Runs exactly once per (user, device): compares local against the freshly
  // pulled cloud budgets, and if local has a category cloud is missing, treats local as the
  // recovery source, re-pushes the union to the cloud, and folds it into the working budgets
  // object before the caller's cloud-replaces-local step ever runs.
  //
  // BOUNDED against a real gap: comparing local-vs-cloud by data shape alone can't tell "this
  // category was truncated by the v37 bug" apart from "this device's local copy is just stale,
  // and the category was genuinely deleted on a different device that hasn't been pulled here
  // yet." Both look identical (local has it, cloud doesn't) - the earlier claim that "a
  // deleted-elsewhere category simply isn't present in this device's local copy either" only
  // holds if THIS device already pulled the deletion before this check runs, which isn't
  // guaranteed. Gated instead by deviceEverRanV37(): the underlying dedupeRowsById bug this
  // recovers from did not exist before v37 (confirmed via git history), so a device with no
  // recorded evidence of ever having run v37 could not have produced this specific truncation,
  // and recovery is skipped entirely rather than guessed at. This doesn't fully close the gap -
  // a device that DID run v37 at some point still can't distinguish its own truncation from a
  // since-arrived, not-yet-pulled deletion from elsewhere - but it eliminates the largest class
  // of false positives (any device whose whole history is v38+) outright. The evidence is only
  // as durable as the diagnostic log itself (IndexedDB, can in principle be evicted under
  // storage pressure like any other origin data) - a device that genuinely ran v37 but lost
  // that log entry simply misses out on recovery, never risks a wrong one.
  //
  // Gated to run once per device, not on every sync: a repeat local-has-extra reading after
  // this first pass is presumed to mean "deleted on another device, since pulled" and is
  // honored as a normal pull, not re-litigated as more truncation.
  async function deviceEverRanV37(){
    try{
      const entries = await readDiagLog();
      return entries.some(e=> e.buildVersion==='v37' || e.swVersion==='v37');
    }catch(e){ return false; }
  }
  async function reconcileBudgetsTruncationOnce(userId, localBudgetsBeforeOverwrite, cloudBudgets){
    if(budgetsTruncationCheckedOnce[userId]) return cloudBudgets;
    budgetsTruncationCheckedOnce[userId] = true;
    try{ await window.storage.set('budgetsTruncationCheckedOnce', JSON.stringify(budgetsTruncationCheckedOnce)); }catch(e){}
    if(!(await deviceEverRanV37())) return cloudBudgets;
    const local = localBudgetsBeforeOverwrite || {};
    const missing = Object.keys(local).filter(cat=> !(cat in (cloudBudgets||{})));
    if(!missing.length) return cloudBudgets;
    const repaired = { ...(cloudBudgets||{}) };
    missing.forEach(cat=> repaired[cat] = local[cat]);
    diagLogPage('page:budgets-truncation-repaired', { recoveredCategories: missing, recoveredCount: missing.length });
    if(window.trackrSync.syncBudgets) window.trackrSync.syncBudgets(userId, repaired);
    return repaired;
  }
  // Theme-independent now (see the unified-palette comment above CAT_SWATCH_CHROMA) - a manual
  // pick is a direct lookup, unaffected by which theme is active or by anyone else's colour. An
  // auto colour still comes from the shared credit+debit pool, same as Black's already did.
  function categoryColor(name){
    const manual = manualCategoryColor(name);
    if(manual) return manual;
    const incomeList = (categories && Array.isArray(categories.income)) ? categories.income : [];
    const expenseList = (categories && Array.isArray(categories.expense)) ? categories.expense : [];
    const combined = [...new Set([...incomeList, ...expenseList])];
    // Only names that still need an auto colour compete for the shared pool - a manually-coloured
    // sibling doesn't consume a slot in the even-spread calculation, matching
    // assignAutoCategorySlots' own comment.
    const autoNames = combined.filter(n=> !manualCategoryColor(n));
    if(autoNames.includes(name)) return assignAutoCategorySlots(autoNames).get(name);
    // Name isn't in either list at all (an account name, or a category since removed from
    // categories.income/.expense but still referenced by an old transaction) - no pool to
    // guarantee uniqueness against, so it falls back to a plain per-name hash pick.
    return CAT_SWATCHES[hashString(name) % CAT_SWATCHES.length].hex;
  }
  function categoryInitial(name){ const s=(name||'?').trim(); return (s.charAt(0)||'?').toUpperCase(); }
  // Display order for a category list (round "category ordering + colour"). Categories carrying an
  // explicit position (see categoryMeta above) sort by it; anything without one - which today means
  // EVERY existing row, since position was unused before this round - falls back to alphabetical
  // rather than raw array/insertion order, so a table SELECT with no ORDER BY (or a device that
  // simply hasn't dragged anything yet) never surfaces as "random database order". Positioned rows
  // always sort before unpositioned ones: the only way a list ends up with a MIX of the two is a
  // genuinely stale device (one that reordered on another device, hasn't pulled since, and then
  // adds a new category locally - see toCategoryRow's own comment on why that device's upload
  // can't safely assign a position for names it has no opinion on) - putting the stragglers at the
  // end keeps them visible and immediately draggable, rather than lost or jumbled mid-list.
  function orderedCategoryNames(type){
    const dbType = type==='income' ? 'credit' : 'debit';
    const names = (categories && Array.isArray(categories[type])) ? categories[type] : [];
    const bucket = categoryMetaBucket();
    const positioned = [], unpositioned = [];
    names.forEach(name=>{
      const meta = bucket[name+'|'+dbType];
      if(meta && typeof meta.position==='number') positioned.push(name); else unpositioned.push(name);
    });
    positioned.sort((a,b)=>{
      const pa = bucket[a+'|'+dbType].position, pb = bucket[b+'|'+dbType].position;
      return (pa-pb) || a.localeCompare(b);
    });
    unpositioned.sort((a,b)=> a.localeCompare(b));
    return [...positioned, ...unpositioned];
  }

  // toLocalDateStr lives in money-math.js, loaded before this file.
  function formatHuman(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }
  function formatShort(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
  }
  // Mobile History rows only ever have room for one of {full type/particulars, full date} at
  // once (confirmed on a real 360px device) - rather than keep fighting for space, the date drops
  // its year when the transaction is already unambiguous without one (this calendar year), and
  // keeps it otherwise so an old entry doesn't read as if it happened this year. formatHuman is
  // already exactly "day short-month year", so an older entry's short form IS formatHuman - no
  // separate abbreviation needed for that branch.
  function formatRowDateShort(dateStr){
    const y = Number(dateStr.slice(0,4));
    return y === new Date().getFullYear() ? formatShort(dateStr) : formatHuman(dateStr);
  }
  function monthLabelFromDate(dateStr){
    const [y,m] = dateStr.split('-').map(Number);
    return new Date(y, m-1, 1).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
  }
  function fmt(amount){
    const sign = amount < 0 ? '-' : ''; const abs = Math.abs(amount);
    return `${sign}${settings.currency}${abs.toLocaleString('en-IN',{minimumFractionDigits:2, maximumFractionDigits:2})}`;
  }
  function fmtPdf(amount){
    // jsPDF's built-in fonts (Helvetica/Times/Courier) only support the legacy WinAnsi
    // character set, which has no glyph for ₹ (U+20B9) — it silently substitutes a
    // different character instead. "Rs." reads cleanly in every PDF viewer.
    const sign = amount < 0 ? '-' : ''; const abs = Math.abs(amount);
    const symbol = settings.currency === '₹' ? 'Rs. ' : settings.currency;
    return `${sign}${symbol}${abs.toLocaleString('en-IN',{minimumFractionDigits:2, maximumFractionDigits:2})}`;
  }
  function setText(id, text){ const el = document.getElementById(id); if(el) el.textContent = text; }
  function escapeHtml(str){ const div = document.createElement('div'); div.textContent = String(str==null?'':str); return div.innerHTML; }
  // sumByType lives in money-math.js, loaded before this file.
  function truncate(str,n){ str = String(str==null?'—':str); return str.length>n ? str.slice(0,n-1)+'…' : str; }

  function weekRangeFromDate(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number); const dt = new Date(y,m-1,d);
    const dow = (dt.getDay()+6)%7; const monday = new Date(dt); monday.setDate(dt.getDate()-dow);
    const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
    return { start: toLocalDateStr(monday), end: toLocalDateStr(sunday) };
  }
  function monthRangeFromDate(dateStr){
    const [y,m] = dateStr.split('-').map(Number);
    const start = `${y}-${String(m).padStart(2,'0')}-01`;
    const lastDay = new Date(y,m,0).getDate();
    const end = `${y}-${String(m).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
    return { start, end };
  }
  function triggerDownload(content, filename, mime){
    const blob = new Blob([content], { type: mime }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  async function loadData(){
    try{ const t = await window.storage.get('transactions'); transactions = t ? JSON.parse(t.value) : []; } catch(e){ transactions = []; }
    try{ const c = await window.storage.get('categories'); categories = c ? JSON.parse(c.value) : defaultCategories(); } catch(e){ categories = defaultCategories(); }
    try{ const cm = await window.storage.get('categoryMeta'); categoryMeta = cm ? JSON.parse(cm.value) : {}; } catch(e){ categoryMeta = {}; }
    if(!categoryMeta || typeof categoryMeta !== 'object' || Array.isArray(categoryMeta)) categoryMeta = {};
    try{ const s = await window.storage.get('settings'); settings = s ? JSON.parse(s.value) : { currency:'₹' }; } catch(e){ settings = { currency:'₹' }; }
    try{ const b = await window.storage.get('budgets'); budgets = b ? JSON.parse(b.value) : {}; } catch(e){ budgets = {}; }
    try{ const dbt = await window.storage.get('debts'); debts = dbt ? JSON.parse(dbt.value) : []; } catch(e){ debts = []; }
    try{ const rcv = await window.storage.get('receivables'); receivables = rcv ? JSON.parse(rcv.value) : []; } catch(e){ receivables = []; }
    try{ const r = await window.storage.get('recurring'); recurring = r ? JSON.parse(r.value) : []; } catch(e){ recurring = []; }
    try{ const rm = await window.storage.get('reminders'); reminders = rm ? JSON.parse(rm.value) : []; } catch(e){ reminders = []; }
    try{ const g = await window.storage.get('goals'); goals = g ? JSON.parse(g.value) : []; } catch(e){ goals = []; }
    try{ const a = await window.storage.get('accounts'); accounts = a ? JSON.parse(a.value) : defaultAccounts(); } catch(e){ accounts = defaultAccounts(); }
    try{ const dd = await window.storage.get('duplicateDismissals'); duplicateDismissals = dd ? JSON.parse(dd.value) : {}; } catch(e){ duplicateDismissals = {}; }
    if(!duplicateDismissals || typeof duplicateDismissals !== 'object' || Array.isArray(duplicateDismissals)) duplicateDismissals = {};
    try{ const aro = await window.storage.get('accountsReconciledOnce'); accountsReconciledOnce = aro ? JSON.parse(aro.value) : {}; } catch(e){ accountsReconciledOnce = {}; }
    // Older installs stored this as the bare string 'true'/'false' (a single flag reset on every
    // logout - see accountsReconciledOnce's own declaration for why that was the bug). JSON.parse
    // of that legacy value yields a boolean, not an object, so the shape guard below resets it to
    // {} and every already-migrated account transparently re-runs reconcileAccountsOnFirstContact
    // exactly once more - now safe by construction (see that function's id-first rewrite), so this
    // one-time extra pass is a harmless, self-correcting side effect of the upgrade, not a bug.
    if(!accountsReconciledOnce || typeof accountsReconciledOnce !== 'object' || Array.isArray(accountsReconciledOnce)) accountsReconciledOnce = {};
    try{ const cro = await window.storage.get('categoriesReconciledOnce'); categoriesReconciledOnce = cro ? JSON.parse(cro.value) : {}; } catch(e){ categoriesReconciledOnce = {}; }
    if(!categoriesReconciledOnce || typeof categoriesReconciledOnce !== 'object' || Array.isArray(categoriesReconciledOnce)) categoriesReconciledOnce = {};
    try{ const btc = await window.storage.get('budgetsTruncationCheckedOnce'); budgetsTruncationCheckedOnce = btc ? JSON.parse(btc.value) : {}; } catch(e){ budgetsTruncationCheckedOnce = {}; }
    if(!budgetsTruncationCheckedOnce || typeof budgetsTruncationCheckedOnce !== 'object' || Array.isArray(budgetsTruncationCheckedOnce)) budgetsTruncationCheckedOnce = {};
    // Defensive shape checks — guards against corrupted/legacy storage causing crashes downstream
    if(!Array.isArray(transactions)) transactions = [];
    if(!categories || !Array.isArray(categories.income) || !Array.isArray(categories.expense)) categories = defaultCategories();
    if(!settings || typeof settings !== 'object') settings = { currency:'₹' };
    if(!settings.currency) settings.currency = '₹';
    if(!settings.theme) settings.theme = 'light';
    // Purply was retired and replaced by Webline in the same picker slot. applyTheme() also
    // redirects a live "purply" value to "light" in memory (belt-and-braces for any call site that
    // still hands it a stale value, e.g. restoring an old backup file), but that redirect alone
    // never touches what's on disk - every future load would silently re-derive "light" from
    // "purply" forever without this ever being visible as a real, inspectable settings value. Runs
    // right here, synchronously, before applyTheme() is ever called for the first time this load
    // (see startAppForUser()/init() below) - as early as this app's architecture ever applies a
    // theme, i.e. before the very first Webline/Purply-relevant paint, not merely "eventually".
    // saveSettings() is local-storage-only (no cloud sync - theme is explicitly per-device), so
    // this is safe to persist unconditionally, signed in or not.
    if(settings.theme==='purply'){ settings.theme = 'light'; await saveSettings(); }
    // Webline (the pixel-console theme) was retired in turn and replaced by Black in the same
    // picker slot - same one-time-redirect mechanism as the purply migration directly above, run
    // right here for the same reason: before applyTheme() is ever called for the first time this
    // load, so a device with "webline" already saved never renders unstyled or flashes stale
    // Webline chrome before landing on Black, and the persisted value is corrected on disk (not
    // just redirected in memory) so this redirect only ever needs to run once per device.
    if(settings.theme==='webline'){ settings.theme = 'black'; await saveSettings(); }
    // Dismissal state for notification items the user has already reviewed - device-local, same
    // as every other entry in settings (theme, hideBalances, etc.), not synced to the cloud.
    // That's a deliberate call, not an oversight: these are purely "have I already looked at this
    // on THIS device" markers, not financial data, so a second device seeing a dismissed alert
    // again isn't data loss - unlike every other synced collection here. Duplicate-group
    // dismissals used to live here too, but that made them a "device preference" that logout wipes
    // along with everything else - wrong for a deliberate "keep both, this is intentional" review
    // decision, which needs to survive the SAME account's own logout/login. See
    // duplicateDismissals' own declaration above for where that moved to instead.
    if(!settings.dismissedBudgetAlerts || typeof settings.dismissedBudgetAlerts !== 'object' || Array.isArray(settings.dismissedBudgetAlerts)) settings.dismissedBudgetAlerts = {};
    if(!budgets || typeof budgets !== 'object' || Array.isArray(budgets)) budgets = {};
    if(!Array.isArray(debts)) debts = [];
    debts.forEach(d=>{ if(!Array.isArray(d.payments)) d.payments = []; });
    if(!Array.isArray(receivables)) receivables = [];
    receivables.forEach(d=>{ if(!Array.isArray(d.payments)) d.payments = []; });
    if(!Array.isArray(recurring)) recurring = [];
    if(!Array.isArray(reminders)) reminders = [];
    if(!Array.isArray(goals)) goals = [];
    goals.forEach(g=>{ if(!Array.isArray(g.contributions)) g.contributions = []; });
    if(!Array.isArray(accounts) || accounts.length===0) accounts = defaultAccounts();
    // Auto-repair for a device already stuck with a duplicate-id accounts array (see
    // dedupeAccountsById's own comment) - runs on every launch, before anything else reads
    // `accounts`, regardless of login state. currentUser doesn't exist yet at this point in the
    // app's startup sequence (loadData() always runs before attachUserAndSync sets it), so the
    // actual re-sync to Supabase happens later, once startAppForUserImpl has a user attached -
    // this only fixes local storage and flags that a re-sync is owed.
    accountsRepairedThisLoad = dedupeAccountsById();
    if(accountsRepairedThisLoad){
      try{ await window.storage.set('accounts', JSON.stringify(accounts)); }catch(e){}
      try{ await window.storage.set('transactions', JSON.stringify(transactions)); }catch(e){}
      // A previously-queued accounts upsert may still be carrying the stale, duplicate-id
      // snapshot from the moment this corruption first happened (queued before this repair ever
      // ran) - same reasoning as the legacy-id-remap migration just below: left in place, it would
      // keep resending the bad rows and getting rejected on every retry, blocking every other
      // queued account write behind it forever. The corrected state gets pushed fresh once a user
      // is attached (see startAppForUserImpl), so dropping the stale op here can't lose anything.
      if(window.trackrSync.purgeQueuedTables) await window.trackrSync.purgeQueuedTables(['accounts']);
    }
    // Migration: 'EMI / Loan' is no longer a default manual-entry category — it's auto-added only
    // when a real debt payment is logged. Strip it from installs that still have the old default
    // saved, but only if it was never actually used (so real history is never touched).
    if(categories.expense.includes('EMI / Loan') && !transactions.some(t=> t.category==='EMI / Loan')){
      categories.expense = categories.expense.filter(c=> c!=='EMI / Loan');
      await saveCategories();
    }
    // Migration: ids used to be generated as 'tx_<timestamp>_<rand>' etc, but the
    // Supabase schema declares id as uuid — those strings fail every sync upsert
    // outright. Reassign a real uuid to any record still carrying an old-format id,
    // rewriting every cross-reference (a transaction's debtId, a payment's txId) to match.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const txIdMap = {}, debtIdMap = {};
    let legacyIdsRemapped = false;
    transactions.forEach(t=>{
      if(t && t.id && !UUID_RE.test(t.id)){ const fresh = uuid(); txIdMap[t.id] = fresh; t.id = fresh; legacyIdsRemapped = true; }
    });
    debts.concat(receivables).forEach(d=>{
      if(d && d.id && !UUID_RE.test(d.id)){ const fresh = uuid(); debtIdMap[d.id] = fresh; d.id = fresh; legacyIdsRemapped = true; }
    });
    goals.forEach(g=>{ if(g && g.id && !UUID_RE.test(g.id)) { g.id = uuid(); legacyIdsRemapped = true; } });
    if(legacyIdsRemapped){
      transactions.forEach(t=>{ if(t.debtId && debtIdMap[t.debtId]) t.debtId = debtIdMap[t.debtId]; });
      debts.concat(receivables).forEach(d=>{
        (d.payments||[]).forEach(p=>{ if(p.txId && txIdMap[p.txId]) p.txId = txIdMap[p.txId]; });
      });
      // Written directly rather than via saveTransactions()/saveDebts()/etc — those merge
      // by id against whatever's still on disk (for cross-tab safety during live use), which
      // would treat a renamed record as a brand-new one alongside the stale old-id copy
      // instead of replacing it. loadData() just read this data fresh, so a plain overwrite
      // here is safe and is what actually makes the rename stick.
      try{ await window.storage.set('transactions', JSON.stringify(transactions)); }catch(e){}
      try{ await window.storage.set('debts', JSON.stringify(debts)); }catch(e){}
      try{ await window.storage.set('receivables', JSON.stringify(receivables)); }catch(e){}
      try{ await window.storage.set('goals', JSON.stringify(goals)); }catch(e){}
      // Any previously-queued sync write for these tables was built from the old,
      // permanently-invalid ids — drop it, since the app will resend the corrected
      // full state on the next save anyway. Left in place, a dead op like this blocks
      // every later queued write behind it (the queue retries strictly in order).
      if(window.trackrSync.purgeQueuedTables) await window.trackrSync.purgeQueuedTables(['transactions','debts','goals']);
    }
  }
  async function saveTransactions(){
    try{
      const disk = await window.storage.get('transactions');
      const diskArr = disk ? JSON.parse(disk.value) : [];
      if(Array.isArray(diskArr)){
        const byId = {};
        diskArr.forEach(t=>{ if(t && t.id && !recentlyDeletedTxIds.has(t.id)) byId[t.id] = t; });
        transactions.forEach(t=>{ if(t && t.id) byId[t.id] = t; });
        transactions = Object.values(byId);
      }
      await window.storage.set('transactions', JSON.stringify(transactions));
    } catch(e){ console.error(e); alert('Could not save your entry. Please check your connection and try again.'); }
    if(currentUser) window.trackrSync.syncUpsertTransactions(currentUser.id, transactions);
  }
  async function saveCategories(){
    try{ await window.storage.set('categories', JSON.stringify(categories)); } catch(e){ console.error(e); }
    // Persists every scope's bucket (harmless - a scope this device isn't currently signed in as
    // just sits there inert, exactly like duplicateDismissals already does), but only ever
    // SYNCS the current scope's own bucket below - never another account's.
    try{ await window.storage.set('categoryMeta', JSON.stringify(categoryMeta)); } catch(e){ console.error(e); }
    // Same machinery as every other categories write (add/delete) - reorder and colour-pick both
    // just mutate categoryMeta then call this same function, so they inherit the offline queue/
    // retry behaviour for free rather than needing a second sync path.
    if(currentUser) window.trackrSync.syncUpsertCategories(currentUser.id, categories, categoryMetaBucket());
  }
  async function saveSettings(){ try{ await window.storage.set('settings', JSON.stringify(settings)); } catch(e){ console.error(e); } }
  async function saveRecurring(){ try{ await window.storage.set('recurring', JSON.stringify(recurring)); } catch(e){ console.error(e); } }
  async function saveReminders(){ try{ await window.storage.set('reminders', JSON.stringify(reminders)); } catch(e){ console.error(e); } }
  async function saveGoals(){
    try{ await window.storage.set('goals', JSON.stringify(goals)); } catch(e){ console.error(e); }
    if(currentUser) window.trackrSync.syncUpsertGoals(currentUser.id, goals);
  }
  async function saveAccounts(){
    try{ await window.storage.set('accounts', JSON.stringify(accounts)); } catch(e){ console.error(e); }
    if(currentUser) window.trackrSync.syncUpsertAccounts(currentUser.id, accounts);
  }
  async function saveBudgets(){
    try{ await window.storage.set('budgets', JSON.stringify(budgets)); } catch(e){ console.error(e); }
    if(currentUser) window.trackrSync.syncBudgets(currentUser.id, budgets);
  }
  async function saveDebts(){
    try{
      const disk = await window.storage.get('debts');
      const diskArr = disk ? JSON.parse(disk.value) : [];
      if(Array.isArray(diskArr)){
        const byId = {};
        diskArr.forEach(d=>{ if(d && d.id && !recentlyDeletedDebtIds.has(d.id)) byId[d.id] = d; });
        debts.forEach(d=>{ if(d && d.id) byId[d.id] = d; });
        debts = Object.values(byId);
      }
      await window.storage.set('debts', JSON.stringify(debts));
    } catch(e){ console.error(e); }
    if(currentUser) window.trackrSync.syncUpsertDebts(currentUser.id, debts);
  }
  async function saveReceivables(){
    try{
      const disk = await window.storage.get('receivables');
      const diskArr = disk ? JSON.parse(disk.value) : [];
      if(Array.isArray(diskArr)){
        const byId = {};
        diskArr.forEach(d=>{ if(d && d.id && !recentlyDeletedReceivableIds.has(d.id)) byId[d.id] = d; });
        receivables.forEach(d=>{ if(d && d.id) byId[d.id] = d; });
        receivables = Object.values(byId);
      }
      await window.storage.set('receivables', JSON.stringify(receivables));
    } catch(e){ console.error(e); }
    if(currentUser) window.trackrSync.syncUpsertReceivables(currentUser.id, receivables);
  }
  // saveTransactions/saveDebts/saveReceivables merge against whatever's currently on disk (by
  // id) rather than overwriting outright - that's deliberate for ordinary edits (protects a
  // concurrent write from a different tab), but it means simply setting an array to [] and
  // calling the normal save function does NOT actually clear it: the merge reads the still-full
  // disk copy back in and resurrects every row. Anywhere that means "wipe this collection for
  // real" (Reset Everything; declining to add pre-login local data to a cloud account) needs to
  // mark every existing id as deleted first so the merge doesn't undo the clear.
  async function markAllKnownIdsDeletedForHardClear(){
    try{
      const diskTx = await window.storage.get('transactions');
      (diskTx ? JSON.parse(diskTx.value) : []).forEach(t=>{ if(t && t.id) recentlyDeletedTxIds.add(t.id); });
    }catch(e){}
    transactions.forEach(t=>{ if(t && t.id) recentlyDeletedTxIds.add(t.id); });
    try{
      const diskDebts = await window.storage.get('debts');
      (diskDebts ? JSON.parse(diskDebts.value) : []).forEach(d=>{ if(d && d.id) recentlyDeletedDebtIds.add(d.id); });
    }catch(e){}
    debts.forEach(d=>{ if(d && d.id) recentlyDeletedDebtIds.add(d.id); });
    try{
      const diskRcv = await window.storage.get('receivables');
      (diskRcv ? JSON.parse(diskRcv.value) : []).forEach(d=>{ if(d && d.id) recentlyDeletedReceivableIds.add(d.id); });
    }catch(e){}
    receivables.forEach(d=>{ if(d && d.id) recentlyDeletedReceivableIds.add(d.id); });
  }
  // Clears every local collection to its empty/default state and persists that directly to
  // storage, deliberately WITHOUT going through saveTransactions/saveDebts/.../saveBudgets -
  // those have currentUser-conditional cloud side effects (upserts, and for budgets
  // specifically a reconcile-by-diff that deletes any cloud category not present locally),
  // which would silently push this "just wipe the device" action out to the cloud too. Used by
  // both logout (never intended to touch cloud data at all) and Reset Everything's local-clear
  // step (cloud deletion, if the user opts into it, is a separate, explicit, direct call).
  async function persistLocalKeys(pairs){
    for(const [key, value] of pairs){
      try{ await window.storage.set(key, JSON.stringify(value)); }catch(e){}
    }
  }
  // Just the financial-history collections - used when declining to merge pre-login local
  // data into a freshly-logged-in account, where categories/accounts/recurring/reminders
  // aren't in scope.
  async function clearFinancialDataNoSync(){
    await markAllKnownIdsDeletedForHardClear();
    transactions = []; debts = []; receivables = []; goals = []; budgets = {};
    await persistLocalKeys([
      ['transactions', transactions], ['debts', debts], ['receivables', receivables],
      ['goals', goals], ['budgets', budgets]
    ]);
    // Unlike theme/currency, this settings field references the data just wiped above (category
    // names) - carrying it over on logout would risk a different account's genuinely new alert
    // staying wrongly suppressed by a previous account's dismissal of what was, coincidentally,
    // the same category shape. duplicateDismissals is NOT cleared here on purpose - it's scoped
    // per-account already (see its own declaration), so it doesn't have this problem, and clearing
    // it here is exactly the bug this round fixed: a deliberate "keep both" review decision must
    // survive this account's own logout/login, not reset every time.
    if(settings.dismissedBudgetAlerts){
      settings.dismissedBudgetAlerts = {};
      await saveSettings();
    }
  }
  // Everything Reset Everything/logout consider "this account's data" on this device.
  // Deliberately leaves most of settings (theme/currency/etc) alone - those are a device
  // preference, not account data, and logout (the other caller of this) has no reason to touch
  // them. The two dismissal maps are the one exception (cleared inside clearFinancialDataNoSync
  // above, since they reference the data just wiped there).
  async function hardClearAllLocalDataNoSync(){
    await clearFinancialDataNoSync();
    categories = defaultCategories(); recurring = []; reminders = []; accounts = defaultAccounts();
    await persistLocalKeys([
      ['categories', categories], ['recurring', recurring], ['reminders', reminders], ['accounts', accounts]
    ]);
    // Stored under its own key, separate from the arrays above, so it wasn't being touched by any
    // of this - a marker recorded against one account's records was surviving logout intact, then
    // getting re-matched against whatever the next login's cloud pull re-fetched under the same
    // ids and flagged all over again, even after the server-side cause was long fixed.
    if(window.trackrSync.clearAllPermanentlyRejectedRecords) await window.trackrSync.clearAllPermanentlyRejectedRecords();
    if(window.trackrSync.clearAllPermanentlyRejectedDeletes) await window.trackrSync.clearAllPermanentlyRejectedDeletes();
  }
  // Every table Reset Everything's cloud-delete step targets - kept as one list so
  // performCloudResetDelete's purge-before-delete step can never drift out of sync with what it's
  // about to delete (a previous version of this purge only covered 4 of these 7 tables, which let
  // a queued write for categories/accounts/dismissed_duplicates survive and replay afterward).
  const RESET_CLOUD_TABLES = ['transactions','debts','goals','budgets','accounts','categories','dismissed_duplicates'];
  // Performs the cloud-delete half of Reset Everything, and is also how resumeInterruptedResetIfAny
  // finishes one that got interrupted. Writes a durable "resetInProgress" marker (window.storage,
  // not an in-memory variable - it must survive the tab being killed) before starting, so an
  // interruption mid-delete is detectable the next time this account is opened, then purges any
  // stale queued write for every table about to be deleted before actually deleting them. Only
  // clears the marker once the delete attempt has resolved one way or the other - if this function
  // never gets to that line, the marker is exactly the "did this actually finish?" signal
  // resumeInterruptedResetIfAny needs. Returns true only once every table is CONFIRMED clear;
  // callers must not treat the reset as done, or touch local data, until this resolves true.
  async function performCloudResetDelete(userId, opts){
    const silent = !!(opts && opts.silent);
    try{ await window.storage.set('resetInProgress', JSON.stringify({ userId, startedAt: Date.now() })); }catch(e){}
    if(window.trackrSync.purgeQueuedTables) await window.trackrSync.purgeQueuedTables(RESET_CLOUD_TABLES);
    const results = await window.trackrSync.deleteAllCloudDataForUser(userId);
    try{ await window.storage.delete('resetInProgress'); }catch(e){}
    const failed = Object.keys(results).filter(t=> !results[t]);
    if(failed.length>0){
      if(!silent) showAppToast(`Couldn't delete cloud ${failed.join(', ')} — check your connection and try Reset Everything again`);
      return false;
    }
    return true;
  }
  // Shared by both the reset-data-btn click handler and resumeInterruptedResetIfAny - the two
  // places that ever learn, first-hand, that performCloudResetDelete just confirmed every table
  // (including accounts and categories) genuinely empty for this account. Only called from those
  // two call sites, both gated behind that CONFIRMED-success return - never from attachUserAndSync
  // merely observing an empty pull, which is the exact failure mode that caused the earlier
  // silent-reseed bug this fix must not reopen.
  //
  // Wipes local data to defaults (as before), then re-seeds this account as if it were a brand
  // new signup: accountsReconciledOnce/categoriesReconciledOnce are never explicitly cleared here
  // (nothing in the codebase clears them - see the report this fix was designed from) - instead,
  // reconcileAccountsOnFirstContact/reconcileCategoriesOnFirstContact are called directly, the
  // exact functions a genuine first-ever login already calls, with an empty cloud state (accurate,
  // since performCloudResetDelete just confirmed it). They read the just-reset local
  // categories/accounts (now defaultCategories()/defaultAccounts(), courtesy of
  // hardClearAllLocalDataNoSync above), upload that as this account's fresh baseline, and set the
  // reconciled flags back to true themselves once that upload is actually confirmed - so there's
  // no window where the flag is false while the cloud still looks empty to a later, unrelated
  // contact. Called synchronously here (not left for some future contact to discover) because nothing
  // in this app currently re-triggers a cloud pull on simply foregrounding a backgrounded tab -
  // deferring this would leave the app blank until the next full reload/login rather than fixing
  // it for the reset that's happening right now.
  async function finishConfirmedReset(userId){
    // No-sync clear - saveBudgets() in particular reconciles cloud budgets by diffing against
    // local state, which would delete every cloud budget category the instant local budgets
    // becomes {}, redundant with (and racing) the delete this function's caller already confirmed.
    await hardClearAllLocalDataNoSync();
    settings = { currency:'₹', theme:'light', dismissedBudgetAlerts:{} };
    try{ await window.storage.set('settings', JSON.stringify(settings)); }catch(e){}
    delete duplicateDismissals[duplicateDismissalScopeKey()];
    try{ await window.storage.set('duplicateDismissals', JSON.stringify(duplicateDismissals)); }catch(e){}
    await reconcileAccountsOnFirstContact(userId, []);
    await reconcileCategoriesOnFirstContact(userId, { income:[], expense:[] }, {});
  }
  // Detects a Reset Everything whose cloud delete never got to finish - the tab was backgrounded/
  // killed/reloaded between performCloudResetDelete writing its marker and clearing it - and
  // finishes it. Safe to auto-resume without asking again: the user already gave both confirm()
  // answers before the interruption, local data was never touched (the click handler only wipes it
  // AFTER the cloud delete is confirmed), and deleteAllCloudDataForUser is idempotent (deleting
  // rows that are already gone is a no-op). Told explicitly either way, though - silently finishing
  // or silently failing again would leave someone who already knows something went wrong even more
  // in the dark about whether their data is actually safe now.
  async function resumeInterruptedResetIfAny(userId){
    let marker = null;
    try{ const raw = await window.storage.get('resetInProgress'); marker = raw ? JSON.parse(raw.value) : null; }catch(e){ marker = null; }
    if(!marker || marker.userId !== userId) return;
    showAppToast('Your previous Reset Everything was interrupted — finishing it now');
    const ok = await performCloudResetDelete(userId, { silent:true });
    if(!ok){
      showAppToast("Your previous reset didn't finish and still hasn't completed — try again when you have a connection");
      return;
    }
    // A resumed reset is functionally identical to an uninterrupted one at this point - the same
    // two confirmations were already given before the interruption, and the cloud is now equally
    // confirmed empty - so it finishes (and re-seeds) exactly the same way.
    await finishConfirmedReset(userId);
  }

  function renderTabUI(tabName){
    document.querySelectorAll('.tab-btn').forEach(b=> b.classList.toggle('active', b.dataset.tab===tabName));
    document.querySelectorAll('.view').forEach(v=> v.classList.remove('active'));
    document.getElementById('view-'+tabName).classList.add('active');
    const titles = { home:'Home', insights:'Insights', add:'Add Entry', reports:'Reports', more:'More' };
    setText('page-title', titles[tabName] || '');
  }
  function pushNavState(tabName, sub){
    const newState = { tab: tabName, sub: sub || null };
    const cur = history.state;
    if(cur && cur.tab===newState.tab && cur.sub===newState.sub) return; // avoid redundant duplicate entries
    history.pushState(newState, '', '');
  }
  function switchTab(tabName){
    renderTabUI(tabName);
    if(tabName==='more') renderMoreMenuState();
    pushNavState(tabName, null);
  }
  function goToMoreSub(tabName, subName){
    renderTabUI(tabName);
    if(tabName==='more'){
      if(subName) renderMoreSubState(subName); else renderMoreMenuState();
    }
    pushNavState(tabName, tabName==='more' ? (subName||null) : null);
  }

  function getRingRangeDates(range){
    const today = new Date();
    if(range==='week'){
      const start = new Date(today); start.setDate(start.getDate()-6);
      return { start: toLocalDateStr(start), end: toLocalDateStr(today), label:'Week' };
    } else if(range==='year'){
      const start = new Date(today.getFullYear(),0,1);
      return { start: toLocalDateStr(start), end: toLocalDateStr(today), label:'Year' };
    } else {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: toLocalDateStr(start), end: toLocalDateStr(today), label:'Month' };
    }
  }
  function buildRingSegments(expenseTx){
    const map={};
    expenseTx.forEach(t=> map[t.category]=(map[t.category]||0)+t.amount);
    const total = Object.values(map).reduce((a,b)=>a+b,0);
    if(total<=0) return { segments:[], total:0 };
    let entries = Object.entries(map).map(([cat,amt])=>({cat,amt})).sort((a,b)=>b.amt-a.amt);
    const top = entries.slice(0,5); const rest = entries.slice(5);
    const segments = top.map(e=>({ name:e.cat, amt:e.amt, pct: e.amt/total*100, color: categoryColor(e.cat) }));
    if(rest.length>0){
      const restAmt = rest.reduce((s,e)=>s+e.amt,0);
      segments.push({ name:'Other', amt:restAmt, pct: restAmt/total*100, color:'#94A3B8' });
    }
    return { segments, total };
  }
  function renderRing(containerId, segments, centerLabel, centerAmount, onSliceClick){
    const container = document.getElementById(containerId);
    if(!container) return;
    const ringD = 200, pad = 34, size = ringD + pad*2, cx = size/2, cy = size/2, r = ringD*0.34, strokeW = ringD*0.085;
    const gapDeg = segments.length>1 ? 6 : 0;
    const totalGap = gapDeg*segments.length;
    const availableDeg = 360-totalGap;
    function toRad(deg){ return (deg-90)*Math.PI/180; }
    function pt(angleDeg, radius){ return [cx+radius*Math.cos(toRad(angleDeg)), cy+radius*Math.sin(toRad(angleDeg))]; }

    let svg = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
    const themeNow = document.body.getAttribute('data-theme');
    const trackColor = themeNow==='dark' ? '#232C42' : (themeNow==='crimson' ? '#17151B' : (themeNow==='black' ? '#1C1C1C' : '#E2E8F0'));
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="${strokeW}"/>`;
    let cursor = 0; const labels = []; let hitAreas = '';
    segments.forEach((seg,i)=>{
      const sweep = (seg.pct/100)*availableDeg;
      const start = cursor, end = cursor+sweep;
      const [x1,y1] = pt(start, r), [x2,y2] = pt(end, r);
      const largeArc = (end-start)>180 ? 1 : 0;
      const clickable = !!onSliceClick;
      svg += `<path class="ring-slice" data-slice-index="${i}" d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="${seg.color}" stroke-width="${strokeW}" stroke-linecap="round" ${clickable?'style="cursor:pointer;"':''}/>`;
      if(clickable){
        hitAreas += `<path class="ring-slice-hit" data-slice-index="${i}" d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}" fill="none" stroke="transparent" stroke-width="${strokeW+22}" stroke-linecap="round" style="cursor:pointer;"/>`;
      }
      const mid = (start+end)/2;
      const [lx,ly] = pt(mid, r+strokeW*1.65);
      labels.push({ x:lx, y:ly, pct:seg.pct, color:seg.color, index:i });
      cursor = end+gapDeg;
    });
    svg += hitAreas;
    labels.forEach(l=>{
      const w=34,h=20;
      const clickable = !!onSliceClick;
      svg += `<g class="ring-slice-label" data-slice-index="${l.index}" ${clickable?'style="cursor:pointer;"':''}><rect x="${l.x-w/2}" y="${l.y-h/2}" width="${w}" height="${h}" rx="${h/2}" fill="${l.color}1A" stroke="${l.color}" stroke-width="1"/><text x="${l.x}" y="${l.y+4}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${l.color}" font-family="Inter, sans-serif">${Math.round(l.pct)}%</text></g>`;
    });
    svg += `</svg>`;

    container.innerHTML = `<div class="ring-svg-holder">${svg}</div><div class="ring-center"><div class="ring-center-label">${escapeHtml(centerLabel)}</div><div class="ring-center-amount mono-num">${centerAmount}</div></div>${onSliceClick ? '<div class="ring-tap-hint">Tap a slice to see its transactions</div>' : ''}`;
    if(onSliceClick){
      container.querySelectorAll('.ring-slice-hit, .ring-slice-label').forEach(el=>{
        el.addEventListener('click', ()=> onSliceClick(segments[parseInt(el.dataset.sliceIndex,10)]));
      });
    }
  }
  function renderAllRings(){
    const { start, end, label } = getRingRangeDates(ringRange);
    const expenseTx = transactions.filter(t=>t.type==='expense' && t.date>=start && t.date<=end);
    const { segments, total } = buildRingSegments(expenseTx);
    const onSliceClick = (seg)=>{
      const matchingTx = seg.name==='Other'
        ? expenseTx.filter(t=> !segments.slice(0,-1).some(s=>s.name===t.category))
        : expenseTx.filter(t=> t.category===seg.name);
      openCategoryDetail(seg.name, `${fmt(seg.amt)} this ${label.toLowerCase()}`, matchingTx);
    };
    renderRing('ring-wrap', segments, `Spent this ${label}`, fmt(total), segments.length ? onSliceClick : null);
    renderRing('insights-ring-wrap', segments, `Spent this ${label}`, fmt(total), segments.length ? onSliceClick : null);
    // Desktop-only side panel next to Home's own ring (see .ring-with-breakdown in styles.css) -
    // harmless to always populate even though it's hidden on mobile via CSS, same as how
    // renderRing above already renders into both ring-wraps unconditionally.
    renderBreakdownList('insights-breakdown-list', expenseTx, total);
    renderBreakdownList('home-breakdown-list', expenseTx, total);
    document.querySelectorAll('.ring-period-btn[data-range]').forEach(b=> b.classList.toggle('active', b.dataset.range===ringRange));
  }
  function renderBreakdownList(containerId, expenseTx, total){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML='';
    if(expenseTx.length===0){ container.innerHTML = '<p class="empty-note">No spending in this period.</p>'; return; }
    const map={}; expenseTx.forEach(t=> map[t.category]=(map[t.category]||0)+t.amount);
    const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]);
    entries.forEach(([cat,amt])=>{
      const pct = total ? (amt/total*100) : 0;
      const color = categoryColor(cat);
      const row = document.createElement('div'); row.className='breakdown-row';
      row.innerHTML = `<span class="dot" style="background:${color};"></span><span class="breakdown-name">${escapeHtml(cat)}</span><span class="breakdown-track"><span class="breakdown-fill" style="width:${pct}%; background:${color};"></span></span><span class="breakdown-amt mono-num">${fmt(amt)}</span>`;
      container.appendChild(row);
    });
  }

  // historyMode is scoped ONLY to the main History list call site (renderHistoryList) - every
  // other caller (Home's Recent Activity, Add Entry's Today list, category detail, global
  // search) omits it and gets exactly the same markup/behavior as before this round, unaffected.
  function buildActivityRow(t, withActions, showDate, historyMode){
    const row = document.createElement('div'); row.className='activity-row clickable-row' + (historyMode ? ' history-row' : '');
    const color = t.type==='income' ? incomeAvatarColor(t.category) : categoryColor(t.category);
    const badgeChar = t.type==='income' ? '↑' : categoryInitial(t.category);
    const typeLabel = t.type==='income' ? 'Credit' : 'Debit';
    // Note and date are separate flex children (not one combined truncating string) so a long
    // particulars note can only ever eat into ITS OWN ellipsis, never push the date - a date is
    // short and load-bearing (confirmed reported as truncating mid-string, e.g. "19 Jul 2...")
    // and should never be the part that gets cut off.
    const noteText = t.note || typeLabel;
    // Two dates, CSS picks one (see .activity-sub-date-short/-full) - mobile's real 360px width
    // only has room for a shortened date next to the note; desktop always shows the full one.
    const sub = showDate
      ? `<span class="activity-sub-note">${escapeHtml(noteText)}</span><span class="activity-sub-date activity-sub-date-short">${formatRowDateShort(t.date)}</span><span class="activity-sub-date activity-sub-date-full">${formatHuman(t.date)}</span>`
      : `<span class="activity-sub-note">${escapeHtml(noteText)}</span>`;
    // Rendered ALONGSIDE `sub` above, not instead of it - CSS toggles which is visible per
    // breakpoint (see .history-row rules in styles.css), so History's desktop row - not reported
    // as having any problem - keeps the exact markup/behavior every other row already uses.
    // Real device evidence: History's per-row edit/delete icons crush the category name into
    // truncating where Home's equivalent row (no icons) doesn't, on the same device/data. Tapping
    // a row already opens the detail overlay, which has its own Edit/Delete - the icons here were
    // redundant on mobile, where the room they eat into is scarcest. Three always-stacked lines
    // (category on its own from .activity-name above, then type+particulars, then date) replace
    // the old flex-wrap single line so nothing is fighting another element for shared horizontal
    // space; each line gets ellipsis-safe overflow handling of its own if it's ever genuinely
    // too long, but real category names now have the full row width to themselves.
    const historySubMobile = historyMode
      ? `<div class="history-sub-mobile"><div class="history-sub-note">${escapeHtml(t.note ? `${typeLabel} · ${t.note}` : typeLabel)}</div><div class="history-sub-date">${formatRowDateShort(t.date)}</div></div>`
      : '';
    let actionsHtml = '';
    if(withActions){
      actionsHtml = `<div class="activity-actions"><button class="icon-btn-sm edit-btn" data-id="${t.id}" aria-label="Edit entry">${icon('edit',14)}</button><button class="icon-btn-sm del-btn" data-id="${t.id}" aria-label="Delete entry">${icon('trash',14)}</button></div>`;
    }
    // Trailing chevron - a persistent, always-visible cue that the row itself (not just the
    // edit/delete buttons, when present) opens something, rather than relying on a user to
    // discover that by guessing or by an active-state background flash that only ever shows up
    // mid-tap, after the fact.
    row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="${catBadgeStyle(t.category, color)}">${badgeChar}</span><div><div class="activity-name">${escapeHtml(t.category)}</div><div class="activity-sub">${sub}</div>${historySubMobile}</div></div><div class="activity-right"><span class="activity-amt ${t.type} mono-num">${t.type==='income'?'+':'-'}${fmt(t.amount)}</span>${actionsHtml}<span class="activity-chevron" aria-hidden="true">${icon('chevronRight',15)}</span></div>`;
    row.dataset.category = t.category; row.dataset.txType = t.type;
    row.addEventListener('click', (e)=>{
      if(e.target.closest('.activity-actions')) return;
      openTransactionDetail(t.id);
    });
    return row;
  }
  const OVERLAY_STATE_FLAGS = ['catDetailOpen','txDetailOpen','goalDetailOpen','searchOpen','notificationsOpen','scheduleOpen','debtDetailOpen','diagLogOpen','colorPickerOpen'];
  function closeAllOverlaysThenRun(action, stepsLeft){
    stepsLeft = stepsLeft===undefined ? OVERLAY_STATE_FLAGS.length : stepsLeft;
    const state = history.state;
    const hasOpenOverlay = state && OVERLAY_STATE_FLAGS.some(flag=> state[flag]);
    if(hasOpenOverlay && stepsLeft>0){
      history.back();
      setTimeout(()=> closeAllOverlaysThenRun(action, stepsLeft-1), 60);
    } else {
      action();
    }
  }
  function wireActivityActions(container){
    container.querySelectorAll('.del-btn').forEach(btn => btn.addEventListener('click', (e)=>{ e.stopPropagation(); deleteTransaction(btn.dataset.id); }));
    container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e)=>{ e.stopPropagation(); closeAllOverlaysThenRun(()=> startEditTransaction(btn.dataset.id)); }));
  }
  const OVERLAY_ANIM_MS = 260; // must match --anim-duration in css/styles.css
  function showOverlay(id){
    const el = document.getElementById(id); if(!el) return;
    el.style.display = 'flex';
    el.classList.remove('open');
    void el.offsetWidth; // force reflow so the browser registers the pre-animation state before we trigger the transition
    requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add('open')));
  }
  function hideOverlay(id){
    const el = document.getElementById(id); if(!el) return;
    el.classList.remove('open');
    setTimeout(()=>{ if(!el.classList.contains('open')) el.style.display='none'; }, OVERLAY_ANIM_MS);
  }
  // Same fade-transition pattern as showOverlay/hideOverlay above (same .open class, same
  // OVERLAY_ANIM_MS timing), generalized for elements that were previously just raw
  // style.display toggles with no transition at all (auth/PIN-lock overlays, banners, the
  // initial loading screen). Idempotent - safe to call from a render loop (e.g. renderBackupNag,
  // or showPinOverlay across mode changes while the overlay stays open) without re-triggering
  // the animation if the element is already in its target state.
  function animateIn(el, displayValue){
    if(!el) return;
    if(el.style.display === displayValue && el.classList.contains('open')) return;
    el.style.display = displayValue;
    el.classList.remove('open');
    void el.offsetWidth;
    requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add('open')));
  }
  function animateOut(el){
    if(!el) return;
    if(el.style.display === 'none' && !el.classList.contains('open')) return;
    el.classList.remove('open');
    setTimeout(()=>{ if(!el.classList.contains('open')) el.style.display = 'none'; }, OVERLAY_ANIM_MS);
  }
  // The loading screen only ever shows once at startup and is dismissed once init finishes -
  // no need for the reusable open/close pair above, just a plain fade-out.
  function fadeOutLoadingOverlay(){
    const el = document.getElementById('loading-overlay');
    if(!el || el.style.display==='none') return;
    el.style.opacity = '0';
    setTimeout(()=>{ el.style.display = 'none'; }, OVERLAY_ANIM_MS);
  }
  // Re-plays the shared viewFadeIn animation on an element whose CONTENT just changed in place
  // (no separate view/overlay to open/close around it) - used for the PIN-lock screen's
  // title/subtitle, which change per mode (unlock/recover/setup) without the overlay itself
  // closing and reopening.
  function reTriggerFade(el){
    if(!el) return;
    el.classList.remove('view-fade-retrigger');
    void el.offsetWidth;
    el.classList.add('view-fade-retrigger');
  }

  function openCategoryDetail(category, subtitle, txList){
    setText('catdetail-title', category);
    setText('catdetail-subtitle', subtitle);
    const container = document.getElementById('catdetail-list'); container.innerHTML='';
    if(txList.length===0){
      container.innerHTML = '<p class="empty-note">No transactions to show.</p>';
    } else {
      const sorted = [...txList].sort((a,b)=> b.date.localeCompare(a.date));
      sorted.forEach(t=> container.appendChild(buildActivityRow(t, true, true)));
      wireActivityActions(container);
    }
    showOverlay('category-detail-overlay');
    if(!(history.state && history.state.catDetailOpen)) history.pushState({ catDetailOpen:true }, '', '');
  }
  function closeCategoryDetail(){ hideOverlay('category-detail-overlay'); }

  let txDetailCurrentId = null;
  function formatTime12h(isoString){
    const d = new Date(isoString);
    if(isNaN(d.getTime())) return null;
    let h = d.getHours(); const m = d.getMinutes();
    const ampm = h>=12 ? 'PM' : 'AM';
    h = h%12; if(h===0) h=12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }
  // The strongest single signal for telling an accidental double-submit apart from two real,
  // separate events - a duplicate created 16 seconds apart is almost certainly a double-tap; one
  // created 36 minutes apart is much more likely two genuine entries that happen to match. Always
  // rounds to a single, coarsest-reasonable unit (never "1 minute 4 seconds") since the goal here
  // is a fast read, not a precise duration.
  function formatTimeGap(ms){
    const sec = Math.max(0, Math.round(ms/1000));
    if(sec < 60) return `${sec} second${sec===1?'':'s'}`;
    const min = Math.round(sec/60);
    if(min < 60) return `${min} minute${min===1?'':'s'}`;
    const hr = Math.round(min/60);
    if(hr < 24) return `${hr} hour${hr===1?'':'s'}`;
    const day = Math.round(hr/24);
    return `${day} day${day===1?'':'s'}`;
  }
  function openTransactionDetail(id){
    const t = transactions.find(x=>x.id===id); if(!t) return;
    txDetailCurrentId = id;
    const badge = document.getElementById('txdetail-badge');
    // .txdetail-badge's colored-pill CSS is keyed off "credit"/"debit" (see styles.css), not
    // t.type's own "income"/"expense" values - using t.type directly here left the badge with no
    // matching class and no background color at all (confirmed via computed style: fully
    // transparent), silently broken since this overlay was first built.
    badge.className = 'txdetail-badge '+(t.type==='income' ? 'credit' : 'debit');
    document.getElementById('txdetail-badge-icon').innerHTML = icon(t.type==='income'?'arrowUp':'arrowDown', 12);
    setText('txdetail-badge-label', t.type==='income' ? 'Credit' : 'Debit');
    setText('txdetail-amount', (t.type==='income'?'+':'-')+fmt(t.amount));
    document.getElementById('txdetail-amount').style.color = t.type==='income' ? 'var(--credit)' : 'var(--debit)';
    setText('txdetail-category', t.category);
    const fields = document.getElementById('txdetail-fields'); fields.innerHTML='';
    const timeStr = t.createdAt ? formatTime12h(t.createdAt) : null;
    const rows = [
      ['Date', formatHuman(t.date)],
      ['Time logged', timeStr || 'Not recorded (older entry)'],
      ['Category', t.category],
      ['Account', getTxAccount(t)],
      ['Type', t.type==='income' ? 'Credit' : 'Debit'],
      ['Particulars', t.note ? t.note : '—']
    ];
    // A transaction with a debtId is one half of a linked debt/receivable payment (see
    // logDebtPayment/deleteTransaction's own linkedDebt lookup) - previously invisible from this
    // view entirely, so there was no way to tell a payment entry apart from an ordinary one
    // without leaving here and cross-checking Debts/Receivables by amount and date.
    if(t.debtId){
      let linkedDebt = debts.find(d=>d.id===t.debtId);
      let linkedLabel = 'Debt';
      if(!linkedDebt){ linkedDebt = receivables.find(d=>d.id===t.debtId); linkedLabel = 'Receivable'; }
      rows.push(['Linked '+linkedLabel, linkedDebt ? linkedDebt.name : 'No longer exists']);
    }
    rows.forEach(([label,value])=>{
      const row = document.createElement('div'); row.className='txdetail-field';
      row.innerHTML = `<span class="txdetail-field-label">${escapeHtml(label)}</span><span class="txdetail-field-value">${escapeHtml(String(value))}</span>`;
      fields.appendChild(row);
    });
    showOverlay('txdetail-overlay');
    history.pushState({ txDetailOpen:true }, '', '');
  }
  function closeTransactionDetail(){ hideOverlay('txdetail-overlay'); txDetailCurrentId=null; }

  function showStamp(type){
    const overlay = document.getElementById('stamp-overlay');
    const stamp = overlay.querySelector('.stamp');
    const color = type==='income' ? 'var(--credit)' : 'var(--debit)';
    stamp.style.color = color; stamp.style.borderColor = color;
    stamp.textContent = type==='income' ? 'CREDITED ✓' : 'DEBITED ✓';
    overlay.classList.add('show');
    setTimeout(()=> overlay.classList.remove('show'), 1100);
    playSfx(type==='income' ? 'credit' : 'debit');
  }

  /* ---------- Sound effects ---------- */
  const SFX_FILES = {
    credit: 'sfx/sfx-credit-chime.mp3',
    debit: 'sfx/sfx-debit-tap.mp3',
    reminder: 'sfx/sfx-reminder-done.wav',
    goal: 'sfx/sfx-goal-complete.wav',
    toggle: 'sfx/sfx-toggle-click.wav'
  };
  const sfxCache = {};
  let sfxAudioCtx = null;
  const sfxBuffers = {};
  // Construct + load every clip once up front so the very first play of each sound doesn't
  // pay a fetch/decode delay — a fresh `new Audio(src)` per play call is what caused the lag.
  function preloadSfx(){
    Object.keys(SFX_FILES).forEach(name=>{
      const audio = new Audio(SFX_FILES[name]);
      audio.preload = 'auto';
      audio.volume = 0.55;
      try{ audio.load(); }catch(e){}
      sfxCache[name] = audio;
    });
    // The HTMLAudioElement path above starts playback instantly, but a couple of the source
    // clips (the mp3s) have ~150-200ms of near-silence baked into the start of the file itself
    // — that's the actual "delay before playing" being reported, not a preload/caching problem.
    // Decoding into an AudioBuffer lets playback start partway in, skipping that dead air.
    // Falls back to the plain <audio> path above (harmless double-declaration of source) if
    // Web Audio is unavailable or a decode fails.
    try{
      sfxAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      Object.keys(SFX_FILES).forEach(async name=>{
        try{
          const resp = await fetch(SFX_FILES[name]);
          const arr = await resp.arrayBuffer();
          const buffer = await sfxAudioCtx.decodeAudioData(arr);
          sfxBuffers[name] = { buffer, offset: findLeadingSilenceOffsetSec(buffer) };
        }catch(e){}
      });
    }catch(e){ sfxAudioCtx = null; }
  }
  // Scans for the first sample past a small amplitude threshold and trims just before it
  // (10ms of headroom so the onset doesn't sound clipped) - silence below this level reads
  // as inaudible dead air, not part of the actual sound.
  function findLeadingSilenceOffsetSec(buffer){
    const data = buffer.getChannelData(0);
    const threshold = 0.02;
    for(let i=0;i<data.length;i++){
      if(Math.abs(data[i]) > threshold) return Math.max(0, i/buffer.sampleRate - 0.01);
    }
    return 0;
  }
  function playSfx(name){
    if(settings.sfxEnabled===false) return;
    const src = SFX_FILES[name]; if(!src) return;
    const entry = sfxBuffers[name];
    if(entry && sfxAudioCtx){
      try{
        if(sfxAudioCtx.state==='suspended') sfxAudioCtx.resume();
        const source = sfxAudioCtx.createBufferSource();
        source.buffer = entry.buffer;
        const gain = sfxAudioCtx.createGain();
        gain.gain.value = 0.55;
        source.connect(gain).connect(sfxAudioCtx.destination);
        source.start(0, entry.offset);
        return;
      }catch(e){} // fall through to the <audio> path below
    }
    try{
      let audio = sfxCache[name];
      if(!audio){ audio = new Audio(src); audio.volume = 0.55; sfxCache[name] = audio; }
      audio.currentTime = 0;
      audio.play().catch(()=>{}); // browsers may block autoplay before any user gesture — safe to ignore
    }catch(e){}
  }
  function syncSfxToggleUI(){
    const toggle = document.getElementById('sfx-toggle');
    if(!toggle) return;
    const on = settings.sfxEnabled!==false;
    toggle.classList.toggle('on', on);
    toggle.setAttribute('aria-checked', on);
  }

  function renderHomeBalance(){
    const netBalance = sumByType(transactions,'income') - sumByType(transactions,'expense');
    const masked = !!(settings.hideBalances && !balancesRevealed);
    setText('home-balance', masked ? maskAmount(fmt(netBalance)) : fmt(netBalance));
    // Every call here is a confirmed-ready render (this only ever runs once real local/cloud data
    // is in memory) - clearing the skeleton placeholder is safe and idempotent every time.
    document.getElementById('home-balance').classList.remove('skeleton');
    document.getElementById('home-balance').classList.toggle('negative', netBalance<0);
    document.getElementById('home-balance').classList.toggle('masked-amount', masked);

    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthTx = transactions.filter(t=>t.date.startsWith(monthPrefix));
    const monthIncome = sumByType(monthTx,'income'); const monthExpense = sumByType(monthTx,'expense');
    const creditedLabel = monthIncome>0 ? `${fmt(monthIncome)} credited` : 'Nothing credited yet';
    const creditedEl = document.getElementById('home-month-income-label');
    setText('home-month-income-label', (masked && monthIncome>0) ? `${maskAmount(fmt(monthIncome))} credited` : creditedLabel);
    creditedEl.classList.toggle('masked-amount', masked && monthIncome>0);
    const pct = monthIncome>0 ? Math.min(100, monthExpense/monthIncome*100) : (monthExpense>0?100:0);
    const fill = document.getElementById('home-progress-fill');
    fill.style.width = pct+'%';
    fill.style.background = pct>=100 ? 'var(--debit)' : (pct>=80 ? 'var(--gold)' : 'var(--binder)');
    setText('home-progress-spent', `Spent ${fmt(monthExpense)}`);
  }
  function renderNetWorth(){
    const row = document.getElementById('networth-row'); if(!row) return;
    if(settings.showNetWorth===false){ row.style.display='none'; return; }
    const totalDebt = debts.reduce((s,d)=> s + debtRemaining(d), 0);
    const totalReceivable = receivables.reduce((s,d)=> s + debtRemaining(d), 0);
    if(totalDebt <= 0.004 && totalReceivable <= 0.004){ row.style.display='none'; return; }
    row.style.display='flex';
    const netBalance = sumByType(transactions,'income') - sumByType(transactions,'expense');
    const netWorth = netBalance - totalDebt + totalReceivable;
    const el = document.getElementById('networth-amount');
    const masked = !!(settings.hideBalances && !balancesRevealed);
    setText('networth-amount', masked ? maskAmount(fmt(netWorth)) : fmt(netWorth));
    el.classList.toggle('negative', netWorth<0);
    el.classList.toggle('masked-amount', masked);
  }
  function renderHomeActivity(){
    const container = document.getElementById('home-activity-list'); container.innerHTML='';
    const list = [...transactions].sort((a,b)=> b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0,8);
    if(list.length===0){ container.innerHTML = '<p class="empty-note">No entries yet. Add your first one.</p>'; return; }
    const today = toLocalDateStr(new Date());
    const yest = toLocalDateStr(new Date(Date.now()-86400000));
    let lastGroup = null;
    list.forEach(t=>{
      const group = t.date===today ? 'Today' : (t.date===yest ? 'Yesterday' : formatHuman(t.date));
      if(group!==lastGroup){
        const h = document.createElement('div'); h.className='activity-group-label'; h.textContent=group; container.appendChild(h);
        lastGroup = group;
      }
      container.appendChild(buildActivityRow(t, false, false));
    });
  }
  function renderHomeCatGrid(){
    const container = document.getElementById('home-cat-grid'); container.innerHTML='';
    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthExpense = transactions.filter(t=>t.type==='expense' && t.date.startsWith(monthPrefix));
    const map={}; monthExpense.forEach(t=> map[t.category]=(map[t.category]||0)+t.amount);
    const total = Object.values(map).reduce((a,b)=>a+b,0);
    const top = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,4);
    if(top.length===0){ container.innerHTML = '<p class="empty-note">No spending logged this month yet.</p>'; return; }
    top.forEach(([cat,amt])=>{
      const pct = total ? Math.round(amt/total*100) : 0;
      const color = categoryColor(cat);
      const cell = document.createElement('div'); cell.className='cat-grid-cell clickable-row';
      cell.innerHTML = `<div class="cat-grid-top"><span class="cat-amt mono-num">${fmt(amt)}</span><span class="cat-pct" style="background:${color}1a; color:${color};">${pct}%</span></div><div class="cat-grid-name">${escapeHtml(cat)}</div><span class="cat-badge sm" style="${catBadgeStyle(cat, color)}">${categoryInitial(cat)}</span>`;
      cell.addEventListener('click', ()=>{
        const catTx = monthExpense.filter(t=>t.category===cat);
        openCategoryDetail(cat, `${fmt(amt)} this month`, catTx);
      });
      container.appendChild(cell);
    });
  }

  let appToastTimer = null;
  // Docks a fixed toast/banner just above whatever's pinned to the very bottom of the viewport
  // (the bottom-nav on mobile), or a flat margin from the viewport bottom where there's no
  // bottom-nav (desktop, which uses the .spine sidebar instead). This replaced an earlier
  // top-anchored-plus-reserved-space approach: pushing the scrollable content down only ever
  // affects whatever's at the very TOP of that content, so if the page was scrolled elsewhere,
  // the toast still sat directly over whatever was currently there - confirmed directly by
  // reproducing it (overlapped the Restore Backup/Reset Everything buttons on a scrolled More
  // page). The zone just above the bottom-nav never has scrollable page content in it regardless
  // of scroll position, so anchoring here removes the whole class of bug instead of re-tuning the
  // same broken model. Re-measured every time something is shown, so a mobile<->desktop resize or
  // the bottom-nav's own height changing in between is picked up automatically.
  function positionAboveBottomNav(el, margin){
    const nav = document.querySelector('.bottom-nav');
    const navVisible = nav && getComputedStyle(nav).display !== 'none';
    // window.innerHeight is the layout viewport, which on iOS Safari can be taller than what's
    // actually on screen while the address bar is showing (the same gap min-height:100vh used to
    // fall into - see the html,body/body rules in styles.css). visualViewport.height tracks the
    // ACTUALLY-visible area live as the toolbar shows/hides/the keyboard opens, so anchoring
    // against it (falling back to innerHeight where visualViewport isn't available) keeps this
    // glued to the real screen edge instead of a sometimes-larger layout viewport's edge.
    const viewportBottom = window.visualViewport
      ? window.visualViewport.height + window.visualViewport.offsetTop
      : window.innerHeight;
    const bottomOffset = navVisible ? (viewportBottom - nav.getBoundingClientRect().top + margin) : margin;
    el.style.bottom = Math.round(bottomOffset) + 'px';
  }
  // Bottom-anchoring alone isn't quite enough either, at one specific edge: if the page is
  // scrolled all the way to its own true end, the LAST bit of real content can already sit close
  // enough to the bottom-nav that a newly-docked toast still overlaps it (confirmed directly on
  // the Account & Backup page's final buttons). Unlike a top-anchored reservation - which only
  // ever helps if the user happens to be scrolled to the top - a BOTTOM reservation helps
  // regardless of current scroll position: it pushes back exactly where "the true end" is, so
  // reaching it (however the user got there) always leaves the dock zone clear. Keyed per-source
  // so the toast and the update banner don't clobber each other's reservation.
  const bottomSpaceReservations = {};
  // Bookkeeping only, read by gatherLayoutDiagnostics() - does not change what this function
  // does or what padding gets applied, just records the last call for the diagnostics dump.
  let lastBottomSpaceReservationCall = null;
  function setBottomSpaceReservation(key, px){
    if(px > 0) bottomSpaceReservations[key] = px; else delete bottomSpaceReservations[key];
    const views = document.querySelector('.views');
    if(!views) return;
    const max = Math.max(0, ...Object.values(bottomSpaceReservations));
    if(max > 0){
      const base = getComputedStyle(views).getPropertyValue('--views-base-pb').trim() || '50px';
      views.style.paddingBottom = `calc(${base} + ${Math.round(max)}px)`;
    } else {
      views.style.paddingBottom = '';
    }
    lastBottomSpaceReservationCall = { key, px, max, at: new Date().toISOString() };
  }
  // Distinguishes a genuine connectivity/server failure from a transient JWT clock-skew rejection
  // ("JWT issued at future" et al - Supabase/PostgREST rejecting a token because the device's
  // clock was briefly ahead or behind the server's when it was issued, e.g. around a reboot or an
  // OS clock update). The device's date & time can be perfectly correct in general and this can
  // still happen once - it's a momentary skew, not a real network problem, and it always
  // self-resolves on the next token refresh/page load. Telling the user to check their clock
  // settings here would be presumptuous (their settings may already be correct) and unhelpful
  // (there's nothing for them to actually fix), so this gets its own honest, low-alarm message
  // instead of the generic connectivity-failure toast.
  function isClockSkewError(err){
    const msg = err && err.message ? String(err.message) : '';
    return /jwt issued at future|issued in the future/i.test(msg);
  }
  function cloudPullFailureMessage(err){
    return isClockSkewError(err)
      ? 'A temporary sync issue occurred — this usually resolves on its own. Try again in a moment.'
      : "Couldn't reach the cloud — showing this device's saved data";
  }
  function showAppToast(message, type){
    const el = document.getElementById('app-toast');
    document.getElementById('app-toast-msg').textContent = message;
    positionAboveBottomNav(el, 14);
    el.classList.toggle('info', type==='info');
    el.classList.add('show');
    // Measured after the message text is set, since a longer message can wrap to a second line
    // and needs more reserved room than a short one.
    setBottomSpaceReservation('toast', el.getBoundingClientRect().height + 14);
    if(appToastTimer) clearTimeout(appToastTimer);
    appToastTimer = setTimeout(()=> { el.classList.remove('show'); setBottomSpaceReservation('toast', 0); }, 6000);
  }
  function hideAppToast(){
    if(appToastTimer){ clearTimeout(appToastTimer); appToastTimer = null; }
    document.getElementById('app-toast').classList.remove('show');
    setBottomSpaceReservation('toast', 0);
  }
  function checkBudgetCrossing(category, date, addedAmount){
    const limit = budgets[category];
    if(!limit || limit<=0) return;
    const monthPrefix = toLocalDateStr(new Date()).slice(0,7);
    if(!date.startsWith(monthPrefix)) return; // budgets only ever track the current month
    const spendNow = sumByType(transactions.filter(t=>t.category===category && t.date.startsWith(monthPrefix)), 'expense');
    const spendBefore = spendNow - addedAmount;
    if(spendBefore <= limit && spendNow > limit){
      showAppToast(`Over budget on ${category} by ${fmt(spendNow-limit)}`);
    }
  }

  function renderInsightBanner(){
    const el = document.getElementById('insight-banner');
    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthExpense = transactions.filter(t=>t.type==='expense' && t.date.startsWith(monthPrefix));
    if(monthExpense.length===0){ el.style.display='none'; return; }
    const map={}; monthExpense.forEach(t=> map[t.category]=(map[t.category]||0)+t.amount);
    const total = Object.values(map).reduce((a,b)=>a+b,0);
    const top = Object.entries(map).sort((a,b)=>b[1]-a[1])[0];
    const pct = total ? (top[1]/total*100) : 0;
    el.style.display='block';
    el.innerHTML = `<strong>${escapeHtml(top[0])}</strong> is your biggest debit this month — ${fmt(top[1])} (${pct.toFixed(0)}% of total spending)`;
  }
  function renderBudgetWatchInsights(){
    const card = document.getElementById('budget-watch-card'); const list = document.getElementById('budget-watch-list');
    const budgetCats = Object.keys(budgets).filter(c=> budgets[c]>0 && categories.expense.includes(c));
    if(budgetCats.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthExpense = transactions.filter(t=>t.type==='expense' && t.date.startsWith(monthPrefix));
    const spentMap = {}; monthExpense.forEach(t=> spentMap[t.category]=(spentMap[t.category]||0)+t.amount);
    const rows = budgetCats.map(cat=>{
      const limit = budgets[cat]; const spent = spentMap[cat] || 0;
      const pct = Math.min(100, limit>0 ? spent/limit*100 : 0);
      return { cat, limit, spent, pct, over: spent>limit };
    }).sort((a,b)=> b.pct - a.pct);
    list.innerHTML='';
    // --warning only exists in css/styles.css's body[data-theme="black"] block (a Black-only
    // token, not a shared one) - every other theme keeps reading --gold exactly as before, so
    // this branch is required, not optional, to avoid an undefined-variable break on Light/Dark/
    // Crimson (which never asked for this change).
    const isBlackTheme = document.body.getAttribute('data-theme')==='black';
    rows.forEach(r=>{
      // Threshold colours, fill only: under 80% stays on --credit (neutral/on-track, unchanged),
      // 80-99.99% is --warning amber under Black (--gold everywhere else, unchanged), 100%+ is
      // --debit red - the same red an overspent category's own amount uses.
      const barColor = r.over ? 'var(--debit)' : (r.pct>=80 ? (isBlackTheme ? 'var(--warning)' : 'var(--gold)') : 'var(--credit)');
      const color = categoryColor(r.cat);
      const row = document.createElement('div'); row.className='budget-row clickable-row';
      row.innerHTML = `<div class="budget-row-top"><span class="budget-cat-left"><span class="cat-badge sm" style="${catBadgeStyle(r.cat, color)}">${categoryInitial(r.cat)}</span><span class="budget-cat-name">${escapeHtml(r.cat)}</span></span><span class="mono-num" style="font-size:12.5px;">${fmt(r.spent)} / ${fmt(r.limit)}</span></div><div class="budget-bar-track"><div class="budget-bar-fill" style="width:${r.pct}%; background:${barColor};"></div></div>`;
      row.addEventListener('click', ()=>{
        const catTx = monthExpense.filter(t=>t.category===r.cat);
        openCategoryDetail(r.cat, `${fmt(r.spent)} of ${fmt(r.limit)} budget this month`, catTx);
      });
      list.appendChild(row);
    });
  }
  function renderTrendChart(){
    let labels, incomeData, expenseData;
    if(trendRange==='6m'){
      const months=[]; const now = new Date();
      for(let i=5;i>=0;i--){ months.push(toLocalDateStr(new Date(now.getFullYear(), now.getMonth()-i, 1)).slice(0,7)); }
      incomeData = months.map(m=> sumByType(transactions.filter(t=>t.date.startsWith(m)),'income'));
      expenseData = months.map(m=> sumByType(transactions.filter(t=>t.date.startsWith(m)),'expense'));
      labels = months.map(m=>{ const [y,mo]=m.split('-').map(Number); return new Date(y,mo-1,1).toLocaleDateString('en-IN',{month:'short'}); });
    } else {
      const days=[];
      for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days.push(toLocalDateStr(d)); }
      incomeData = days.map(d=> sumByType(transactions.filter(t=>t.date===d),'income'));
      expenseData = days.map(d=> sumByType(transactions.filter(t=>t.date===d),'expense'));
      labels = days.map(formatShort);
    }
    const canvas = document.getElementById('chart-week-trend');
    if(charts.weekTrend) charts.weekTrend.destroy();
    if(window.Chart){
      const themeNow2 = document.body.getAttribute('data-theme');
      const isDark = themeNow2==='dark';
      const isCrimson = themeNow2==='crimson';
      const isBlack = themeNow2==='black';
      const gridColor = isDark ? '#232C42' : (isCrimson ? '#17151B' : (isBlack ? '#2A2A2A' : '#E2E8F0'));
      const tickColor = isDark ? '#8B95AC' : (isCrimson ? '#9A97A0' : (isBlack ? '#A0A0A0' : '#64748B'));
      // Chart.js needs a resolved colour string, not a live var() reference, so Black reads the
      // ACTUAL computed --credit/--debit off the body element rather than holding its own copy
      // of the hex - the single source of truth for both is css/styles.css's body[data-theme=
      // "black"] block; changing those two lines is now enough to re-colour this chart too,
      // nothing here needs editing. Light/Dark/Crimson keep their own literal hex, unchanged.
      const creditColor = isCrimson ? '#3DDC84' : (isBlack ? getComputedStyle(document.body).getPropertyValue('--credit').trim() : '#16A34A');
      const debitColor = isCrimson ? '#FF7A59' : (isBlack ? getComputedStyle(document.body).getPropertyValue('--debit').trim() : '#DC2626');
      charts.weekTrend = new Chart(canvas.getContext('2d'), {
        type:'bar',
        data:{ labels, datasets:[
          { label:'Credit', data:incomeData, backgroundColor:creditColor, borderRadius:4 },
          { label:'Debit', data:expenseData, backgroundColor:debitColor, borderRadius:4 }
        ]},
        options:{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ font:{family:'Inter', size:11, weight:600}, color:tickColor } } }, scales:{ y:{ beginAtZero:true, grid:{ color:gridColor }, ticks:{ color:tickColor } }, x:{ grid:{ display:false }, ticks:{ color:tickColor } } } }
      });
    }
  }

  function computeUpcomingCashFlow(){
    const todayStr = toLocalDateStr(new Date());
    const in30 = toLocalDateStr(new Date(Date.now()+30*86400000));
    const items = [];
    reminders.forEach(r=>{
      const status = reminderStatus(r, 30);
      if(status) items.push({ type:'reminder', id:r.id, label:r.title, dueLabel:status.dueLabel, sortDate:status.dueDateISO, amount:r.amount||0, kind:'Reminder', overdue:status.overdue });
    });
    recurring.forEach(r=>{
      const status = recurringDueStatus(r, 30);
      if(status) items.push({ type:'recurring', id:r.id, label:r.category, dueLabel:status.dueLabel, sortDate:status.dueDateISO, amount:r.amount, kind:'Recurring', overdue:status.overdue });
    });
    function pushEmiInstallments(list, kindLabel, itemType){
      list.filter(d=>d.type==='emi').forEach(d=>{
        buildEmiSchedule(d).forEach(inst=>{
          if(!inst.paid && inst.dueDate<=in30){
            items.push({ type:itemType, id:d.id, label:d.name, dueLabel:formatHuman(inst.dueDate), sortDate:inst.dueDate, amount:inst.amount, kind:kindLabel, overdue:inst.dueDate<todayStr, installmentDate:inst.dueDate });
          }
        });
      });
    }
    pushEmiInstallments(debts, 'EMI Debt', 'emiDebt');
    pushEmiInstallments(receivables, 'EMI Receivable', 'emiReceivable');
    items.sort((a,b)=> a.sortDate.localeCompare(b.sortDate));
    return items;
  }
  function renderUpcomingCashFlow(){
    const card = document.getElementById('upcoming-cashflow-card');
    const list = document.getElementById('upcoming-cashflow-list');
    if(!card || !list) return;
    const items = computeUpcomingCashFlow();
    if(items.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    setText('upcoming-cashflow-total', fmt(items.reduce((s,i)=>s+i.amount,0)));
    list.innerHTML='';
    items.forEach((i,idx)=>{
      const row = document.createElement('div'); row.className='reminder-card clickable-row'; row.dataset.upcomingIdx = idx;
      const actionLabel = i.type==='reminder' ? 'Mark Done' : 'Mark Paid';
      row.innerHTML = `
        <div class="reminder-card-top">
          <div><div class="reminder-name">${escapeHtml(i.label)}</div><div class="reminder-meta">${escapeHtml(i.kind)} · ${i.dueLabel}</div></div>
          <span class="reminder-status ${i.overdue?'overdue':'upcoming'}">${i.overdue?'Overdue':'Upcoming'}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:6px;">
          <span class="reminder-meta" style="font-weight:700; color:var(--ink);">${fmt(i.amount)}</span>
          <button type="button" class="btn-pill btn-outline upcoming-resolve-btn" data-idx="${idx}">${actionLabel}</button>
        </div>
      `;
      row.addEventListener('click', (e)=>{
        if(e.target.closest('button')) return;
        openUpcomingItemDetail(items[idx]);
      });
      list.appendChild(row);
    });
    list.querySelectorAll('.upcoming-resolve-btn').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        e.stopPropagation();
        // Without this guard, a double-tap (easy to trigger on mobile before refreshAll()
        // removes this row) could call logDebtPayment() twice, logging two separate payment
        // transactions for what the user meant as one tap. The button is destroyed by the
        // re-render inside resolveUpcomingItem() either way, so there's no re-enable to do.
        if(btn.disabled) return;
        btn.disabled = true;
        await resolveUpcomingItem(items[parseInt(btn.dataset.idx,10)]);
      });
    });
  }
  async function resolveUpcomingItem(item){
    if(item.type==='reminder'){
      await dismissReminder(item.id);
    } else if(item.type==='recurring'){
      await quickAddRecurring(item.id);
    } else {
      const isReceivable = item.type==='emiReceivable';
      const list = isReceivable ? receivables : debts;
      const debt = list.find(d=>d.id===item.id); if(!debt) return;
      const account = accounts[0] ? accounts[0].name : 'Cash';
      await logDebtPayment(item.id, debt.emiAmount, item.installmentDate || toLocalDateStr(new Date()), account);
    }
  }
  function openUpcomingItemDetail(item){
    if(item.type==='reminder'){
      goToMoreSub('more','reminders');
      startEditReminder(item.id);
    } else if(item.type==='recurring'){
      switchTab('add');
    } else {
      openSchedule(item.id);
    }
  }

  function populateEntryCategorySelect(type){
    const sel = document.getElementById('entry-category'); sel.innerHTML='';
    orderedCategoryNames(type).filter(c=> !NON_MANUAL_CATEGORIES.includes(c)).forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });
  }
  function populateEntryAccountSelect(){
    const sel = document.getElementById('entry-account'); if(!sel) return;
    const prev = sel.value;
    sel.innerHTML='';
    accounts.forEach(a=>{ const opt = document.createElement('option'); opt.value=a.name; opt.textContent=a.name; sel.appendChild(opt); });
    if(accounts.some(a=>a.name===prev)) sel.value = prev;
  }
  function getTxAccount(t){ return t.account || (accounts[0] ? accounts[0].name : 'Cash'); }
  function accountBalance(accountName){
    return transactions.filter(t=> getTxAccount(t)===accountName)
      .reduce((s,t)=> s + (t.type==='income' ? t.amount : -t.amount), 0);
  }
  function renderAddTodayList(){
    const container = document.getElementById('today-list'); container.innerHTML='';
    const today = toLocalDateStr(new Date());
    const list = transactions.filter(t=>t.date===today).sort((a,b)=> b.id.localeCompare(a.id));
    if(list.length===0){ container.innerHTML = '<p class="empty-note">No entries for today yet.</p>'; return; }
    // historyMode=true (4th arg): reuses the exact treatment already proven on the ACTIVITY LOG/
    // History list (PR #61) - hides the per-row edit/delete icons on mobile only (tapping the row
    // already opens the detail overlay, which has both) and switches to the stacked
    // .history-sub-mobile markup, instead of the flex-wrap layout that was crushing the category
    // name down to 1-2 characters here. Cross-theme fix (the underlying .history-row CSS rules
    // aren't theme-scoped) - Today's Entries had simply never been given this treatment when
    // History itself was fixed.
    list.forEach(t=> container.appendChild(buildActivityRow(t, true, false, true)));
    wireActivityActions(container);
  }

  async function deleteTransaction(id){
    const t = transactions.find(x=>x.id===id);
    if(!t) return false;
    // A transaction with a debtId is one half of a linked pair (see logDebtPayment) - the debt's
    // own payments array carries a matching entry (by txId), which is what debtPaid/debtRemaining
    // actually sum. Deleting the transaction without also removing that payment entry would leave
    // the debt's balance permanently wrong - exactly the "logged payments don't match History"
    // mismatch Integrity Check already checks for, just self-inflicted instead of caught later.
    let linkedDebt = null, linkedIsReceivable = false;
    if(t.debtId){
      linkedDebt = debts.find(d=>d.id===t.debtId);
      if(linkedDebt){ linkedIsReceivable = false; }
      else { linkedDebt = receivables.find(d=>d.id===t.debtId); linkedIsReceivable = true; }
    }
    let msg = 'Delete this entry? This cannot be undone.';
    if(linkedDebt){
      const remainingBefore = debtRemaining(linkedDebt);
      const paidWithoutThis = debtPaid(linkedDebt) - t.amount;
      const remainingAfter = Math.max(0, linkedDebt.total - paidWithoutThis);
      const noun = linkedIsReceivable ? 'what they still owe you' : 'what you still owe';
      msg += `\n\nThis entry is linked to "${linkedDebt.name}" - deleting it will change ${noun} from ${fmt(remainingBefore)} to ${fmt(remainingAfter)}.`;
    }
    if(!confirm(msg)) return false;
    recentlyDeletedTxIds.add(id);
    transactions = transactions.filter(x=>x.id!==id);
    if(linkedDebt){
      linkedDebt.payments = (linkedDebt.payments||[]).filter(p=>p.txId!==id);
      await (linkedIsReceivable ? saveReceivables() : saveDebts());
    }
    await saveTransactions();
    if(currentUser) window.trackrSync.syncDeleteTransaction(currentUser.id, id);
    await pruneDuplicateDismissalsForDeletedTx(id);
    refreshAll();
    return true;
  }
  function resetEntryDateDefault(){ document.getElementById('entry-date').value = toLocalDateStr(new Date()); }

  function startEditTransaction(id){
    const t = transactions.find(x=>x.id===id); if(!t) return;
    editingId = id;
    switchTab('add');
    document.querySelectorAll('#entry-form .type-btn').forEach(b=> b.classList.toggle('active', b.dataset.type===t.type));
    document.getElementById('entry-type').value = t.type;
    populateEntryCategorySelect(t.type);
    const catSelect = document.getElementById('entry-category');
    if(![...catSelect.options].some(o=>o.value===t.category)){
      const opt = document.createElement('option'); opt.value = t.category; opt.textContent = `${t.category} (no longer in list)`;
      catSelect.appendChild(opt);
    }
    catSelect.value = t.category;
    populateEntryAccountSelect();
    if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
    const acctSelect = document.getElementById('entry-account');
    const txAccount = getTxAccount(t);
    if(![...acctSelect.options].some(o=>o.value===txAccount)){
      const opt = document.createElement('option'); opt.value = txAccount; opt.textContent = `${txAccount} (no longer in list)`;
      acctSelect.appendChild(opt);
    }
    acctSelect.value = txAccount;
    document.getElementById('entry-date').value = t.date;
    document.getElementById('entry-amount').value = t.amount;
    document.getElementById('entry-note').value = t.note || '';
    document.querySelector('.stamp-btn').textContent = 'Update Entry';
    document.getElementById('cancel-edit-link').style.display = 'flex';
  }
  function cancelEdit(){
    editingId = null;
    document.getElementById('entry-form').reset();
    document.querySelector('.stamp-btn').textContent = 'Save Entry';
    document.getElementById('cancel-edit-link').style.display = 'none';
    document.querySelectorAll('#entry-form .type-btn').forEach(b=> b.classList.toggle('active', b.dataset.type==='income'));
    document.getElementById('entry-type').value = 'income';
    populateEntryCategorySelect('income');
    populateEntryAccountSelect();
    if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
    resetEntryDateDefault();
  }
  function goToAdd(type){
    switchTab('add');
    document.querySelectorAll('#entry-form .type-btn').forEach(b=> b.classList.toggle('active', b.dataset.type===type));
    document.getElementById('entry-type').value = type;
    populateEntryCategorySelect(type);
  }

  async function handleAddEntry(e){
    e.preventDefault();
    const type = document.getElementById('entry-type').value;
    const date = document.getElementById('entry-date').value;
    const category = document.getElementById('entry-category').value;
    const account = document.getElementById('entry-account').value;
    const amount = parseFloat(document.getElementById('entry-amount').value);
    const note = document.getElementById('entry-note').value.trim();
    const saveRecurringChecked = document.getElementById('entry-save-recurring').checked;
    const recurringRemindChecked = document.getElementById('entry-recurring-remind').checked;
    if(!date || !category || isNaN(amount) || amount<=0){ alert('Please fill in the date, category and a valid amount greater than 0.'); return; }
    if(editingId){
      const idx = transactions.findIndex(t=>t.id===editingId);
      if(idx>-1) transactions[idx] = { ...transactions[idx], type, date, category, account, amount, note };
      showStamp(type); await saveTransactions(); cancelEdit();
    } else {
      transactions.push({ id:uuid(), type, date, category, account, amount, note, createdAt: new Date().toISOString() });
      showStamp(type); await saveTransactions();
      if(type==='expense') checkBudgetCrossing(category, date, amount);
      if(saveRecurringChecked){
        const exists = recurring.some(r=> r.type===type && r.category===category && r.amount===amount && (r.note||'')===note);
        if(!exists){
          const dueDay = recurringRemindChecked ? parseInt(date.slice(8,10),10) : null;
          recurring.push({ id:'rec_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), type, category, amount, note, dueDay, lastDismissedPeriod: dueDay ? date.slice(0,7) : null });
          await saveRecurring();
        }
      }
      document.getElementById('entry-amount').value=''; document.getElementById('entry-note').value=''; document.getElementById('entry-save-recurring').checked=false;
      document.getElementById('entry-recurring-remind').checked=false; document.getElementById('entry-recurring-remind-row').style.display='none';
      resetEntryDateDefault();
    }
    refreshAll();
  }

  function renderRecurringChips(){
    const wrap = document.getElementById('recurring-quick-add'); const container = document.getElementById('recurring-chips');
    if(!wrap || !container) return;
    if(recurring.length===0){ wrap.style.display='none'; return; }
    wrap.style.display='block';
    container.innerHTML='';
    recurring.forEach(r=>{
      const color = r.type==='income' ? incomeAvatarColor(r.category) : categoryColor(r.category);
      const chip = document.createElement('button'); chip.type='button'; chip.className='recurring-chip'; chip.dataset.id=r.id;
      chip.setAttribute('aria-label', `Log ${r.category}, ${fmt(r.amount)}`);
      chip.innerHTML = `<span class="chip-badge" style="${catBadgeStyle(r.category, color)}">${r.type==='income'?'↑':categoryInitial(r.category)}</span><span>${escapeHtml(r.category)} · ${fmt(r.amount)}</span><span class="chip-del" data-id="${r.id}" aria-label="Remove ${escapeHtml(r.category)} quick add" role="button">×</span>`;
      container.appendChild(chip);
    });
    container.querySelectorAll('.chip-del').forEach(x=>{
      x.addEventListener('click', (e)=>{ e.stopPropagation(); deleteRecurring(x.dataset.id); });
    });
    container.querySelectorAll('.recurring-chip').forEach(chip=>{
      chip.addEventListener('click', ()=> quickAddRecurring(chip.dataset.id));
    });
  }
  async function quickAddRecurring(id){
    const r = recurring.find(x=>x.id===id); if(!r) return;
    const accountSelect = document.getElementById('entry-account');
    const account = (accountSelect && accountSelect.value) || (accounts[0] ? accounts[0].name : 'Cash');
    const today = toLocalDateStr(new Date());
    transactions.push({ id:uuid(), type:r.type, date:today, category:r.category, account, amount:r.amount, note:r.note||'', createdAt: new Date().toISOString() });
    if(r.dueDay) r.lastDismissedPeriod = today.slice(0,7);
    showStamp(r.type);
    await saveTransactions();
    await saveRecurring();
    if(r.type==='expense') checkBudgetCrossing(r.category, today, r.amount);
    refreshAll();
  }
  function recurringDueStatus(r, maxDiff){
    maxDiff = maxDiff===undefined ? 3 : maxDiff;
    if(!r.dueDay) return null;
    const today = new Date(); const todayStr = toLocalDateStr(today); const ym = todayStr.slice(0,7);
    if(r.lastDismissedPeriod === ym) return null;
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    const day = Math.min(r.dueDay, lastDayOfMonth);
    const dueDateThisMonth = `${ym}-${String(day).padStart(2,'0')}`;
    const diffDays = Math.round((new Date(dueDateThisMonth+'T00:00:00') - new Date(todayStr+'T00:00:00'))/86400000);
    if(diffDays > maxDiff) return null;
    return { overdue: diffDays < 0, diffDays, dueLabel: formatHuman(dueDateThisMonth), dueDateISO: dueDateThisMonth, periodKey: ym };
  }
  function renderRecurringDueCard(){
    const card = document.getElementById('recurring-due-card'); const list = document.getElementById('recurring-due-list');
    if(!card || !list) return;
    const items = recurring.map(r=> ({ r, status: recurringDueStatus(r) })).filter(x=>x.status);
    if(items.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    items.sort((a,b)=> a.status.diffDays - b.status.diffDays);
    list.innerHTML='';
    items.forEach(({r,status})=>{
      const row = document.createElement('div'); row.className='reminder-card';
      row.innerHTML = `<div class="reminder-card-top"><div><div class="reminder-name">${escapeHtml(r.category)}</div><div class="reminder-meta">${status.dueLabel} · ${fmt(r.amount)}</div></div><span class="reminder-status ${status.overdue?'overdue':'upcoming'}">${reminderStatusLabel(status)}</span></div><div class="reminder-actions"><button class="btn-pill btn-black log-recurring-due-btn" data-id="${r.id}">Log it</button><button class="btn-pill btn-outline skip-recurring-due-btn" data-id="${r.id}">Skip this month</button></div>`;
      list.appendChild(row);
    });
    list.querySelectorAll('.log-recurring-due-btn').forEach(btn=> btn.addEventListener('click', ()=> quickAddRecurring(btn.dataset.id)));
    list.querySelectorAll('.skip-recurring-due-btn').forEach(btn=> btn.addEventListener('click', ()=> skipRecurringDue(btn.dataset.id)));
  }
  async function skipRecurringDue(id){
    const r = recurring.find(x=>x.id===id); if(!r) return;
    const status = recurringDueStatus(r);
    r.lastDismissedPeriod = status ? status.periodKey : toLocalDateStr(new Date()).slice(0,7);
    await saveRecurring();
    refreshAll();
  }
  async function deleteRecurring(id){
    recurring = recurring.filter(r=>r.id!==id);
    await saveRecurring();
    renderRecurringChips();
  }

  function populateFilterCategorySelect(type){
    const sel = document.getElementById('filter-category'); const prev = sel.value;
    sel.innerHTML = '<option value="all">All Categories</option>';
    let list = [];
    if(type==='income') list = orderedCategoryNames('income'); else if(type==='expense') list = orderedCategoryNames('expense');
    else list = [...orderedCategoryNames('income'), ...orderedCategoryNames('expense')];
    list.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });
    if(list.includes(prev)) sel.value = prev;
  }
  function showPeriodInput(period){
    document.getElementById('period-daily').style.display = period==='daily' ? 'inline-block':'none';
    document.getElementById('period-weekly').style.display = period==='weekly' ? 'inline-block':'none';
    document.getElementById('period-monthly').style.display = period==='monthly' ? 'inline-block':'none';
    document.getElementById('period-custom').style.display = period==='custom' ? 'flex':'none';
    document.getElementById('hint-daily').style.display = period==='daily' ? 'inline':'none';
    document.getElementById('hint-weekly').style.display = period==='weekly' ? 'inline':'none';
    document.getElementById('hint-monthly').style.display = period==='monthly' ? 'inline':'none';
  }
  // categoryBreakdownData lives in money-math.js, loaded before this file.
  function renderCategoryBreakdown(filtered){
    const container = document.getElementById('category-breakdown-list'); container.innerHTML='';
    if(filtered.length===0){ container.innerHTML = '<p class="empty-note">No entries to break down.</p>'; return; }
    const entries = categoryBreakdownData(filtered);
    const max = Math.max(...entries.map(e=>e.amt));
    entries.forEach(e=>{
      const row = document.createElement('div'); row.className='breakdown-row';
      const pct = max ? (e.amt/max*100) : 0;
      const color = e.type==='income' ? incomeAvatarColor(e.category) : categoryColor(e.category);
      row.innerHTML = `<span class="dot" style="background:${color};"></span><span class="breakdown-name">${escapeHtml(e.category)} <span style="color:var(--ink-soft); font-size:10.5px;">(${e.type==='income'?'Credit':'Debit'})</span></span><span class="breakdown-track"><span class="breakdown-fill" style="width:${pct}%; background:${color};"></span></span><span class="breakdown-amt mono-num">${fmt(e.amt)}</span>`;
      container.appendChild(row);
    });
  }
  function renderPassbookTable(filtered){
    const tbody = document.getElementById('passbook-tbody'); const emptyNote = document.getElementById('report-empty-note'); const table = document.getElementById('passbook-table');
    tbody.innerHTML='';
    if(filtered.length===0){ emptyNote.style.display='block'; table.style.display='none'; return; }
    emptyNote.style.display='none'; table.style.display='table';
    let balance=0;
    // Issue 3: under Black, an em-dash placeholder ("nothing happened on this side") must not be
    // tinted the same as a real amount - only colour the cell that actually holds a figure, grey
    // for the dash. Every other theme keeps its original always-tinted behaviour, unchanged - the
    // Balance column itself was already untinted regardless of theme (no fix needed there).
    const isBlackReports = document.body.getAttribute('data-theme')==='black';
    filtered.forEach(t=>{
      balance += t.type==='income' ? t.amount : -t.amount;
      const tr = document.createElement('tr');
      const debit = t.type==='expense' ? fmt(t.amount) : '—';
      const credit = t.type==='income' ? fmt(t.amount) : '—';
      const debitColor = isBlackReports ? (t.type==='expense' ? 'var(--debit)' : 'var(--ink-soft)') : 'var(--debit)';
      const creditColor = isBlackReports ? (t.type==='income' ? 'var(--credit)' : 'var(--ink-soft)') : 'var(--credit)';
      tr.innerHTML = `<td>${formatHuman(t.date)}</td><td>${escapeHtml(t.note||'—')}</td><td>${escapeHtml(t.category)}</td><td class="num" style="color:${debitColor}">${debit}</td><td class="num" style="color:${creditColor}">${credit}</td><td class="num">${fmt(balance)}</td>`;
      tbody.appendChild(tr);
    });
  }
  function renderReports(){
    const activeBtn = document.querySelector('#period-type-segmented button.active');
    const periodType = activeBtn ? activeBtn.dataset.period : 'daily';
    let range, label;
    if(periodType==='daily'){
      const val = document.getElementById('period-daily').value || toLocalDateStr(new Date());
      range = { start:val, end:val }; label = `Daily Report — ${formatHuman(val)}`;
    } else if(periodType==='weekly'){
      const val = document.getElementById('period-weekly').value || toLocalDateStr(new Date());
      range = weekRangeFromDate(val); label = `Weekly Report — ${formatHuman(range.start)} to ${formatHuman(range.end)}`;
    } else if(periodType==='monthly'){
      const val = document.getElementById('period-monthly').value || toLocalDateStr(new Date());
      range = monthRangeFromDate(val); label = `Monthly Report — ${monthLabelFromDate(val)}`;
    } else {
      const s = document.getElementById('period-start').value; const en = document.getElementById('period-end').value;
      if(!s || !en){
        document.getElementById('report-title').textContent = 'Custom Report — pick a start and end date';
        setText('report-total-income', fmt(0)); setText('report-total-expense', fmt(0)); setText('report-net', fmt(0));
        document.getElementById('category-breakdown-list').innerHTML = '<p class="empty-note">Pick a date range above.</p>';
        document.getElementById('passbook-tbody').innerHTML=''; document.getElementById('report-empty-note').style.display='block';
        document.getElementById('passbook-table').style.display='none';
        currentReport = null; return;
      }
      range = { start: s<=en ? s:en, end: s<=en ? en:s }; label = `Custom Report — ${formatHuman(range.start)} to ${formatHuman(range.end)}`;
    }
    const typeFilter = document.getElementById('filter-type').value;
    const catFilter = document.getElementById('filter-category').value;
    let filtered = transactions.filter(t => t.date >= range.start && t.date <= range.end);
    if(typeFilter!=='all') filtered = filtered.filter(t=>t.type===typeFilter);
    if(catFilter!=='all') filtered = filtered.filter(t=>t.category===catFilter);
    filtered.sort((a,b)=> a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    const totalIncome = sumByType(filtered,'income'); const totalExpense = sumByType(filtered,'expense'); const net = totalIncome - totalExpense;
    document.getElementById('report-title').textContent = label;
    setText('report-total-income', fmt(totalIncome)); setText('report-total-expense', fmt(totalExpense)); setText('report-net', fmt(net));
    document.getElementById('report-net').classList.toggle('negative', net<0);
    renderCategoryBreakdown(filtered); renderPassbookTable(filtered);
    currentReport = {
      label, range, filtered, totalIncome, totalExpense, net,
      typeFilterLabel: typeFilter==='all' ? 'All' : (typeFilter==='income' ? 'Credit only':'Debit only'),
      catFilterLabel: catFilter==='all' ? 'All categories' : catFilter
    };
  }

  function populateHistoryFilterCategorySelect(type){
    const sel = document.getElementById('history-filter-category'); const prev = sel.value;
    sel.innerHTML = '<option value="all">All Categories</option>';
    let list = [];
    if(type==='income') list = orderedCategoryNames('income'); else if(type==='expense') list = orderedCategoryNames('expense');
    else list = [...orderedCategoryNames('income'), ...orderedCategoryNames('expense')];
    list.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });
    if(list.includes(prev)) sel.value = prev;
  }
  function populateHistoryFilterAccountSelect(){
    const sel = document.getElementById('history-filter-account'); if(!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="all">All Wallets</option>';
    accounts.forEach(a=>{ const opt = document.createElement('option'); opt.value=a.name; opt.textContent=a.name; sel.appendChild(opt); });
    if(accounts.some(a=>a.name===prev)) sel.value = prev;
  }
  // Date-range presets for the History filter panel - "This month"/"This year" etc always run
  // through today (not the end of the calendar period), matching how every other period-based
  // view in this app (getRingRangeDates, monthRangeFromDate as used by reports) treats an
  // in-progress period. Returns null for 'all' (no date filtering at all) and for 'custom' with
  // neither bound set yet (nothing to filter on until the user picks at least one date).
  function getHistoryDateRange(preset, customFrom, customTo){
    const today = new Date(); const todayStr = toLocalDateStr(today);
    if(preset==='this_month'){
      return { start: toLocalDateStr(new Date(today.getFullYear(), today.getMonth(), 1)), end: todayStr };
    }
    if(preset==='last_month'){
      const start = new Date(today.getFullYear(), today.getMonth()-1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: toLocalDateStr(start), end: toLocalDateStr(end) };
    }
    if(preset==='last_3_months'){
      return { start: toLocalDateStr(new Date(today.getFullYear(), today.getMonth()-2, 1)), end: todayStr };
    }
    if(preset==='this_year'){
      return { start: toLocalDateStr(new Date(today.getFullYear(), 0, 1)), end: todayStr };
    }
    if(preset==='custom'){
      if(!customFrom && !customTo) return null;
      return { start: customFrom || '0001-01-01', end: customTo || '9999-12-31' };
    }
    return null; // 'all'
  }
  // Free-text search previously only ever matched particulars/category (see the PR description
  // this shipped against) - typing a date in any form a user would naturally type it, including
  // the exact examples reported ("19", "19 Jul", "2026-07-19"), returned "No entries match" even
  // when many entries existed on that date. Checks, in order: the raw stored ISO string (covers
  // "2026-07-19", "2026-07", and partial-year searches), the same two human-readable renderings
  // already used everywhere else in this app (formatHuman "19 Jul 2026", formatShort "19 Jul"),
  // a day-first-swapped reading of formatShort ("Jul 19", the natural word order for a user who
  // types the month first), and finally a bare 1-2 digit search matched against the day-of-month
  // alone (covers "19" and "5"/"05" indifferently).
  function historySearchMatchesDate(t, search){
    if(t.date.toLowerCase().includes(search)) return true;
    const human = formatHuman(t.date).toLowerCase();
    if(human.includes(search)) return true;
    const short = formatShort(t.date).toLowerCase();
    if(short.includes(search)) return true;
    const shortParts = short.split(' ');
    if(shortParts.length===2 && `${shortParts[1]} ${shortParts[0]}`.includes(search)) return true;
    if(/^\d{1,2}$/.test(search)){
      const day = t.date.slice(8,10).replace(/^0/,'');
      if(day === search.replace(/^0/,'')) return true;
    }
    return false;
  }
  function historyFilterState(){
    return {
      search: (document.getElementById('history-search').value||'').trim().toLowerCase(),
      type: document.getElementById('history-filter-type').value,
      category: document.getElementById('history-filter-category').value,
      account: document.getElementById('history-filter-account').value,
      dateRangePreset: document.getElementById('history-filter-daterange').value,
      dateFrom: document.getElementById('history-filter-date-from').value,
      dateTo: document.getElementById('history-filter-date-to').value,
      amountMin: document.getElementById('history-filter-amount-min').value,
      amountMax: document.getElementById('history-filter-amount-max').value,
      sort: document.getElementById('history-filter-sort').value
    };
  }
  function historyActiveFilterCount(f){
    let n = 0;
    if(f.type!=='all') n++;
    if(f.category!=='all') n++;
    if(f.account!=='all') n++;
    if(f.dateRangePreset!=='all') n++;
    if(f.amountMin) n++;
    if(f.amountMax) n++;
    if(f.sort!=='date_desc') n++;
    return n;
  }
  function renderHistoryActiveChips(f, dateRange){
    const wrap = document.getElementById('history-active-filters');
    const chips = [];
    if(f.type!=='all') chips.push({ key:'type', label: f.type==='income' ? 'Credit only' : 'Debit only' });
    if(f.category!=='all') chips.push({ key:'category', label: f.category });
    if(f.account!=='all') chips.push({ key:'account', label: f.account });
    if(f.dateRangePreset!=='all'){
      const presetLabels = { this_month:'This month', last_month:'Last month', last_3_months:'Last 3 months', this_year:'This year', custom: dateRange ? `${formatShort(dateRange.start)} – ${formatShort(dateRange.end)}` : 'Custom range' };
      chips.push({ key:'daterange', label: presetLabels[f.dateRangePreset] || f.dateRangePreset });
    }
    if(f.amountMin) chips.push({ key:'amountMin', label: `Min ${fmt(Number(f.amountMin))}` });
    if(f.amountMax) chips.push({ key:'amountMax', label: `Max ${fmt(Number(f.amountMax))}` });
    if(f.sort!=='date_desc'){
      const sortLabels = { date_asc:'Oldest first', amount_desc:'Amount: highest first', amount_asc:'Amount: lowest first' };
      chips.push({ key:'sort', label: sortLabels[f.sort] || f.sort });
    }
    if(!chips.length){ wrap.style.display='none'; wrap.innerHTML=''; return; }
    wrap.style.display='flex';
    // Each chip carries its own X (44x44 tap target via .filter-chip-remove's invisible
    // ::before hit-area expansion, not a visually enlarged button - see styles.css) so removing
    // one filter no longer means either "Clear all" (loses every other active filter too) or
    // hunting down the matching dropdown/input to reset it manually.
    // icon('x',10) embedded directly (not a data-icon span) - this markup is inserted long after
    // boot's one-time injectIcons() pass, which nothing here re-triggers.
    wrap.innerHTML = chips.map(c=> `<span class="filter-chip">${escapeHtml(c.label)}<button type="button" class="filter-chip-remove" data-filter-key="${c.key}" aria-label="Remove ${escapeHtml(c.label)} filter">${icon('x',10)}</button></span>`).join('')
      + `<button type="button" class="filter-chip-clear" id="history-clear-filters-btn">Clear all</button>`;
    document.getElementById('history-clear-filters-btn').addEventListener('click', clearAllHistoryFilters);
    wrap.querySelectorAll('.filter-chip-remove').forEach(btn=> btn.addEventListener('click', ()=> clearSingleHistoryFilter(btn.dataset.filterKey)));
  }
  function clearSingleHistoryFilter(key){
    if(key==='type') document.getElementById('history-filter-type').value = 'all';
    else if(key==='category') document.getElementById('history-filter-category').value = 'all';
    else if(key==='account') document.getElementById('history-filter-account').value = 'all';
    else if(key==='daterange'){
      document.getElementById('history-filter-daterange').value = 'all';
      document.getElementById('history-filter-date-from').value = '';
      document.getElementById('history-filter-date-to').value = '';
      document.getElementById('history-custom-date-row').style.display = 'none';
    }
    else if(key==='amountMin') document.getElementById('history-filter-amount-min').value = '';
    else if(key==='amountMax') document.getElementById('history-filter-amount-max').value = '';
    else if(key==='sort') document.getElementById('history-filter-sort').value = 'date_desc';
    renderHistory();
  }
  function updateHistoryFilterCountBadge(count){
    const badge = document.getElementById('history-filter-count-badge');
    if(!badge) return;
    badge.style.display = count>0 ? 'inline-flex' : 'none';
    badge.textContent = String(count);
  }
  function clearAllHistoryFilters(){
    document.getElementById('history-filter-type').value = 'all';
    populateHistoryFilterCategorySelect('all');
    document.getElementById('history-filter-account').value = 'all';
    document.getElementById('history-filter-daterange').value = 'all';
    document.getElementById('history-filter-date-from').value = '';
    document.getElementById('history-filter-date-to').value = '';
    document.getElementById('history-custom-date-row').style.display = 'none';
    document.getElementById('history-filter-amount-min').value = '';
    document.getElementById('history-filter-amount-max').value = '';
    document.getElementById('history-filter-sort').value = 'date_desc';
    document.getElementById('history-search').value = '';
    renderHistory();
  }
  function renderHistory(){
    const f = historyFilterState();
    const dateRange = getHistoryDateRange(f.dateRangePreset, f.dateFrom, f.dateTo);
    let list = [...transactions];
    if(f.type!=='all') list = list.filter(t=>t.type===f.type);
    if(f.category!=='all') list = list.filter(t=>t.category===f.category);
    if(f.account!=='all') list = list.filter(t=>getTxAccount(t)===f.account);
    if(dateRange) list = list.filter(t=> t.date>=dateRange.start && t.date<=dateRange.end);
    if(f.amountMin) list = list.filter(t=> t.amount >= Number(f.amountMin));
    if(f.amountMax) list = list.filter(t=> t.amount <= Number(f.amountMax));
    if(f.search) list = list.filter(t=> (t.note||'').toLowerCase().includes(f.search) || t.category.toLowerCase().includes(f.search) || historySearchMatchesDate(t, f.search));
    const sorters = {
      date_desc: (a,b)=> b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
      date_asc: (a,b)=> a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
      amount_desc: (a,b)=> b.amount - a.amount || b.date.localeCompare(a.date),
      amount_asc: (a,b)=> a.amount - b.amount || a.date.localeCompare(b.date)
    };
    list.sort(sorters[f.sort] || sorters.date_desc);
    renderHistoryActiveChips(f, dateRange);
    updateHistoryFilterCountBadge(historyActiveFilterCount(f));
    const container = document.getElementById('history-list'); container.innerHTML='';
    const countNote = document.createElement('p'); countNote.className = 'period-hint'; countNote.style.marginBottom = '10px';
    countNote.textContent = `Showing ${list.length} entr${list.length===1?'y':'ies'}.`;
    container.appendChild(countNote);
    if(list.length===0){ container.appendChild(Object.assign(document.createElement('p'), { className:'empty-note', textContent:'No entries match.' })); return; }
    list.forEach(t=> container.appendChild(buildActivityRow(t, true, true, true)));
    wireActivityActions(container);
  }

  function renderBudgetSetList(){
    const container = document.getElementById('budget-set-list'); container.innerHTML='';
    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthExpense = transactions.filter(t=>t.type==='expense' && t.date.startsWith(monthPrefix));
    const spentMap = {}; monthExpense.forEach(t=> spentMap[t.category]=(spentMap[t.category]||0)+t.amount);
    // Same reasoning as renderBudgetWatchInsights() above - --warning is Black-only.
    const isBlackTheme2 = document.body.getAttribute('data-theme')==='black';
    orderedCategoryNames('expense').forEach(cat=>{
      const limit = budgets[cat] || 0; const spent = spentMap[cat] || 0;
      const pct = limit>0 ? Math.min(100, spent/limit*100) : 0;
      const over = limit>0 && spent>limit;
      // Same three-state threshold as the Home Budget Watch preview above - see its comment.
      const barColor = over ? 'var(--debit)' : (pct>=80 ? (isBlackTheme2 ? 'var(--warning)' : 'var(--gold)') : 'var(--credit)');
      const color = categoryColor(cat);
      const row = document.createElement('div'); row.className='budget-row';
      row.innerHTML = `
        <div class="budget-row-top">
          <span class="budget-cat-left"><span class="cat-badge sm" style="${catBadgeStyle(cat, color)}">${categoryInitial(cat)}</span><span class="budget-cat-name">${escapeHtml(cat)}</span></span>
          <span class="budget-limit-input"><span style="font-size:11.5px;color:var(--ink-soft); font-weight:600;">Limit ${settings.currency}</span><input type="number" min="0" step="1" class="budget-input" data-cat="${escapeHtml(cat)}" value="${limit||''}" placeholder="None"></span>
        </div>
        ${ limit>0
          ? `<div class="budget-bar-track"><div class="budget-bar-fill" style="width:${pct}%; background:${barColor};"></div></div><div class="budget-row-meta ${over?'over':''}">${over ? 'Over budget by '+fmt(spent-limit) : fmt(spent)+' of '+fmt(limit)+' spent · '+fmt(Math.max(0,limit-spent))+' left'}</div>`
          : `<div class="budget-row-meta">${fmt(spent)} spent this month so far</div>` }
      `;
      container.appendChild(row);
    });
    container.querySelectorAll('.budget-input').forEach(inp=>{
      inp.addEventListener('change', async (e)=>{
        const cat = e.target.dataset.cat; const val = parseFloat(e.target.value);
        if(isNaN(val) || val<=0){ delete budgets[cat]; } else { budgets[cat] = val; }
        await saveBudgets(); renderBudgetSetList(); renderBudgetWatchInsights(); updateBellBadge();
      });
    });
  }

  // debtPaid, debtRemaining, emiMonthsElapsed, debtOverdueCount live in money-math.js, loaded before this file.
  function formatMonthYear(date){ return date.toLocaleDateString('en-IN', { month:'short', year:'numeric' }); }
  // emiPayoffDate and buildEmiSchedule live in money-math.js, loaded before this file.

  // The Debts & EMIs page shows either the "I Owe" (debts) or "Owed to Me" (receivables)
  // list depending on activeDebtKind — every function below operates on whichever is current.
  function currentDebtList(){ return activeDebtKind==='debt' ? debts : receivables; }
  function currentDebtSaveFn(){ return activeDebtKind==='debt' ? saveDebts : saveReceivables; }
  function currentDeletedDebtIds(){ return activeDebtKind==='debt' ? recentlyDeletedDebtIds : recentlyDeletedReceivableIds; }
  function findInAnyDebtList(id){ return debts.find(x=>x.id===id) || receivables.find(x=>x.id===id); }

  function renderDebtsList(){
    renderDebtsListInto('debts-list', currentDebtList(), activeDebtKind==='receivable');
  }
  function renderDebtsListInto(containerId, list, isReceivable){
    const container = document.getElementById(containerId); if(!container) return;
    container.innerHTML='';
    if(list.length===0){ container.innerHTML = `<p class="empty-note">No ${isReceivable?'receivables':'debts'} tracked yet. Add one below.</p>`; return; }
    const sorted = [...list].sort((a,b)=>{
      const aPaid = debtRemaining(a)<=0.004, bPaid = debtRemaining(b)<=0.004;
      if(aPaid!==bPaid) return aPaid ? 1 : -1;
      return 0;
    });
    // Issue 3 (round 4): this per-item progress fill previously used a type colour (EMI=--link,
    // one-time=--gold, both light greys under Black) instead of the settled/pending rule, and the
    // inline "paid ... of ... remaining" text carried no colour at all - both read as "white
    // progress bar fills" next to the green overview bar above them. Fixed for Black only: the
    // fill always reads paid-progress in credit green (matching the overview bar's own always-
    // green fill), and the paid/remaining figures inline in the meta text get the same green/red
    // as everywhere else. Every other theme's type-coloured fill and plain meta text is untouched.
    const isBlackList = document.body.getAttribute('data-theme')==='black';
    sorted.forEach(d=>{
      const paid = debtPaid(d); const remaining = debtRemaining(d); const isPaidOff = remaining<=0.004;
      const pct = d.total>0 ? Math.min(100, paid/d.total*100) : 0;
      const overdue = debtOverdueCount(d);
      const card = document.createElement('div'); card.className = 'debt-card clickable-row type-'+d.type+(isPaidOff?' paid-off':'');
      card.addEventListener('click', (e)=>{
        if(e.target.closest('button, .log-payment-form, select, input')) return;
        openDebtDetail(d.id);
      });
      const typeLabel = d.type==='emi' ? `EMI · ${fmt(d.emiAmount)}/mo` : (isReceivable ? 'One-time receivable' : 'One-time debt');
      const typeColor = d.type==='emi' ? 'var(--link)' : 'var(--gold)';
      const barColor = isBlackList ? 'var(--credit)' : (isPaidOff ? 'var(--credit)' : typeColor);
      const paidLabel = isReceivable ? 'received' : 'paid';
      const paidOffLabel = isReceivable ? 'Fully Received ✓' : 'Paid Off ✓';
      const paidStr = isBlackList ? `<span style="color:var(--credit);">${fmt(paid)}</span>` : fmt(paid);
      const remainingStr = isBlackList ? `<span style="color:var(--debit);">${fmt(remaining)}</span>` : fmt(remaining);
      let installmentLine = '';
      if(d.type==='emi'){
        const payoff = emiPayoffDate(d);
        installmentLine = `<div class="debt-row-meta">Installment ${Math.min((d.payments||[]).length, d.tenure)} of ${d.tenure}${(overdue>0 && !isPaidOff) ? ` · <span class="overdue-tag">${overdue} due</span>` : ''}${payoff && !isPaidOff ? ` · ${isReceivable?'Fully received by':'Debt-free'} ${formatMonthYear(payoff)}` : ''}</div>`;
      }
      card.innerHTML = `
        <div class="debt-card-top">
          <div>
            <div class="debt-name">${escapeHtml(d.name)}</div>
            <div class="debt-type-badge" style="color:${typeColor};">${typeLabel}</div>
          </div>
          <div style="display:flex; gap:4px;">
            <button class="icon-btn-sm edit-debt-btn" data-id="${d.id}" aria-label="Edit">${icon('edit',14)}</button>
            <button class="icon-btn-sm del-debt-btn" data-id="${d.id}" aria-label="Delete">${icon('trash',14)}</button>
          </div>
        </div>
        <div class="debt-bar-track"><div class="debt-bar-fill" style="width:${pct}%; background:${barColor};"></div></div>
        <div class="debt-row-meta">${paidStr} ${paidLabel} of ${fmt(d.total)} ${isPaidOff ? '· <span class="paidoff-tag">'+paidOffLabel+'</span>' : '· '+remainingStr+' remaining'}</div>
        ${installmentLine}
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          ${ isPaidOff ? '' : `<button class="btn-pill btn-outline log-payment-btn" data-id="${d.id}">+ ${isReceivable?'Log Received':'Log Payment'}</button>` }
          ${ d.type==='emi' ? `<button class="btn-pill btn-outline view-schedule-btn" data-id="${d.id}">View Schedule</button>` : '' }
        </div>
        ${ isPaidOff ? '' : `
        <div class="log-payment-form" id="lp-form-${d.id}" style="display:none;">
          <label>Amount<input type="number" class="lp-amount" min="0.01" step="0.01" value="${d.type==='emi' ? d.emiAmount : ''}"></label>
          <label>Date<input type="date" class="lp-date" value="${toLocalDateStr(new Date())}"></label>
          <label>Account<select class="lp-account">${accounts.map(a=>`<option value="${escapeHtml(a.name)}">${escapeHtml(a.name)}</option>`).join('')}</select></label>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button type="button" class="btn-pill btn-black lp-confirm" data-id="${d.id}">Save</button>
            <button type="button" class="btn-pill btn-outline lp-cancel" data-id="${d.id}">Cancel</button>
          </div>
        </div>` }
      `;
      container.appendChild(card);
    });
    container.querySelectorAll('.view-schedule-btn').forEach(btn=> btn.addEventListener('click', ()=> openSchedule(btn.dataset.id)));
    container.querySelectorAll('.edit-debt-btn').forEach(btn=> btn.addEventListener('click', ()=> startEditDebt(btn.dataset.id)));
    container.querySelectorAll('.del-debt-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteDebt(btn.dataset.id)));
    // Scoped to the clicked button's own card (not a global getElementById lookup) — on
    // desktop the same debt/receivable can render into multiple containers at once
    // (Home, Add Entry, More all show it simultaneously), which would otherwise produce
    // duplicate lp-form-<id> elements and always resolve to whichever copy is first in
    // the document, regardless of which card the user actually clicked.
    container.querySelectorAll('.log-payment-btn').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = btn.closest('.debt-card').querySelector('.log-payment-form'); if(f) f.style.display = (f.style.display==='none' ? 'block' : 'none');
    }));
    container.querySelectorAll('.lp-cancel').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = btn.closest('.debt-card').querySelector('.log-payment-form'); if(f) f.style.display='none';
    }));
    container.querySelectorAll('.lp-confirm').forEach(btn=> btn.addEventListener('click', ()=> confirmLogPayment(btn.dataset.id, btn.closest('.log-payment-form'))));
  }

  function renderDebtSummaryInsights(){
    const card = document.getElementById('debt-summary-card'); if(!card) return;
    const active = debts.filter(d=> debtRemaining(d) > 0.004);
    if(active.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    const totalOutstanding = active.reduce((s,d)=> s+debtRemaining(d), 0);
    const overdueTotal = active.reduce((s,d)=> s+debtOverdueCount(d), 0);
    const payoffDates = active.map(emiPayoffDate).filter(Boolean);
    const latestPayoff = payoffDates.length ? new Date(Math.max(...payoffDates.map(d=>d.getTime()))) : null;
    setText('debt-summary-amount', fmt(totalOutstanding));
    setText('debt-summary-meta', `${active.length} active debt${active.length>1?'s':''}${overdueTotal>0 ? ' · '+overdueTotal+' EMI'+(overdueTotal>1?'s':'')+' overdue' : ''}${latestPayoff ? ' · debt-free by '+formatMonthYear(latestPayoff) : ''}`);
  }
  function renderReceivableSummaryInsights(){
    const card = document.getElementById('receivable-summary-card'); if(!card) return;
    const active = receivables.filter(d=> debtRemaining(d) > 0.004);
    if(active.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    const totalOutstanding = active.reduce((s,d)=> s+debtRemaining(d), 0);
    const overdueTotal = active.reduce((s,d)=> s+debtOverdueCount(d), 0);
    const payoffDates = active.map(emiPayoffDate).filter(Boolean);
    const latestPayoff = payoffDates.length ? new Date(Math.max(...payoffDates.map(d=>d.getTime()))) : null;
    setText('receivable-summary-amount', fmt(totalOutstanding));
    setText('receivable-summary-meta', `${active.length} active receivable${active.length>1?'s':''}${overdueTotal>0 ? ' · '+overdueTotal+' overdue' : ''}${latestPayoff ? ' · fully received by '+formatMonthYear(latestPayoff) : ''}`);
  }

  function renderDebtOverviewInto(prefix, list){
    list = list || debts;
    const card = document.getElementById(prefix+'-card'); if(!card) return;
    if(list.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    const totalCommitted = list.reduce((s,d)=>s+d.total,0);
    const totalPaid = list.reduce((s,d)=>s+debtPaid(d),0);
    const totalPending = list.reduce((s,d)=>s+debtRemaining(d),0);
    setText(prefix+'-total-committed', fmt(totalCommitted));
    setText(prefix+'-total-paid', fmt(totalPaid));
    setText(prefix+'-total-pending', fmt(totalPending));
    const pct = totalCommitted>0 ? Math.min(100, totalPaid/totalCommitted*100) : 0;
    const fillEl = document.getElementById(prefix+'-overall-fill'); if(fillEl) fillEl.style.width = pct+'%';

    const emiDebts = list.filter(d=>d.type==='emi');
    const lumpDebts = list.filter(d=>d.type==='lump');
    const emiSection = document.getElementById(prefix+'-emi-section');
    if(emiSection) emiSection.style.display = emiDebts.length ? 'block' : 'none';
    setText(prefix+'-emi-paid', fmt(emiDebts.reduce((s,d)=>s+debtPaid(d),0)));
    setText(prefix+'-emi-pending', fmt(emiDebts.reduce((s,d)=>s+debtRemaining(d),0)));
    const lumpSection = document.getElementById(prefix+'-lump-section');
    if(lumpSection) lumpSection.style.display = lumpDebts.length ? 'block' : 'none';
    setText(prefix+'-lump-paid', fmt(lumpDebts.reduce((s,d)=>s+debtPaid(d),0)));
    setText(prefix+'-lump-pending', fmt(lumpDebts.reduce((s,d)=>s+debtRemaining(d),0)));
    // Issue 3 (round 4): the top-level tiles above (-total-paid/-total-pending) already carry the
    // settled/pending rule via an inline style in index.html, but these nested EMI/One-time
    // breakdown rows never got any colour at all - they're plain .mono-num spans, inheriting the
    // card's ordinary white/ink text. Applied here in JS (not CSS) because the rule is genuinely
    // Black-only and every other theme's markup for these rows was never touched or reviewed for
    // this treatment, matching the established pattern of gating new Black colour logic behind a
    // live data-theme check rather than a shared CSS rule.
    if(document.body.getAttribute('data-theme')==='black'){
      ['emi-paid','lump-paid'].forEach(k=>{ const el=document.getElementById(prefix+'-'+k); if(el) el.style.color='var(--credit)'; });
      ['emi-pending','lump-pending'].forEach(k=>{ const el=document.getElementById(prefix+'-'+k); if(el) el.style.color='var(--debit)'; });
    }
  }
  function renderDebtOverview(){
    renderDebtOverviewInto('debtov', currentDebtList());
    // Desktop drops these from Reports — Home's own overview + active-debt list (see
    // renderDesktopExtras) covers this now, and debts aren't date-scoped like the rest
    // of a report anyway. Mobile is unchanged.
    if(isDesktop){
      const reportsDebtCard = document.getElementById('reportsdebt-card');
      const reportsReceivableCard = document.getElementById('reportsreceivable-card');
      if(reportsDebtCard) reportsDebtCard.style.display = 'none';
      if(reportsReceivableCard) reportsReceivableCard.style.display = 'none';
    } else {
      renderDebtOverviewInto('reportsdebt', debts);
      renderDebtOverviewInto('reportsreceivable', receivables);
    }
  }
  function updateDebtKindLabels(){
    const isReceivable = activeDebtKind==='receivable';
    setText('debts-page-title', isReceivable ? 'Receivables' : 'Debts & EMIs');
    setText('debts-page-intro', isReceivable
      ? 'Track money others owe you — a loan you gave, pending project income, anything you\'re expecting to be paid back. Set it up as EMI (fixed monthly installments) or One-time (any amount, whenever it comes in). Log a collection as you receive it — it\'s recorded in your transactions too, under "Loan Repayment Received".'
      : 'Track anything you owe — a loan, a credit card, money borrowed from someone. Every debt below is set up as one of two types: EMI (a fixed amount due every month, for a set number of months) or One-time (any amount, paid off whenever you like). Log a payment as you make it — it\'s recorded in your transactions too, under "EMI / Loan".');
    setText('debtov-label', isReceivable ? 'Receivables Overview — All Receivables' : 'Debt Overview — All Debts');
    setText('add-debt-btn-label', isReceivable ? 'Add Receivable' : 'Add Debt');
    setText('debt-total-hint', isReceivable ? '— the full amount owed to you' : '— the full amount owed');
  }

  // goalSaved and goalRemaining live in money-math.js, loaded before this file.

  function renderGoalsSummaryInsights(){
    const card = document.getElementById('goals-summary-card'); if(!card) return;
    const active = goals.filter(g=> goalRemaining(g) > 0.004);
    if(active.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    const totalSaved = active.reduce((s,g)=> s+goalSaved(g), 0);
    setText('goals-summary-amount', fmt(totalSaved));
    setText('goals-summary-meta', `${active.length} active goal${active.length>1?'s':''} · saving toward ${fmt(active.reduce((s,g)=>s+g.target,0))}`);
  }
  function renderGoalsOverview(){
    const card = document.getElementById('goalsov-card'); if(!card) return;
    if(goals.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    const totalTarget = goals.reduce((s,g)=>s+g.target,0);
    const totalSaved = goals.reduce((s,g)=>s+goalSaved(g),0);
    const totalRemaining = goals.reduce((s,g)=>s+goalRemaining(g),0);
    setText('goalsov-total-target', fmt(totalTarget));
    setText('goalsov-total-saved', fmt(totalSaved));
    setText('goalsov-total-remaining', fmt(totalRemaining));
    const pct = totalTarget>0 ? Math.min(100, totalSaved/totalTarget*100) : 0;
    document.getElementById('goalsov-overall-fill').style.width = pct+'%';
  }
  function renderGoalsList(){
    const container = document.getElementById('goals-list'); if(!container) return;
    container.innerHTML='';
    if(goals.length===0){ container.innerHTML = '<p class="empty-note">No savings goals yet. Add one below.</p>'; return; }
    const sorted = [...goals].sort((a,b)=>{
      const aDone = goalRemaining(a)<=0.004, bDone = goalRemaining(b)<=0.004;
      if(aDone!==bDone) return aDone ? 1 : -1;
      return 0;
    });
    // Issue 4 (round 4): saved-versus-target is the same settled/pending shape as everything else
    // in the app - saved goes credit green, remaining-to-target goes debit red, same as a debt's
    // paid/remaining pair. Previously this list used --goal (a neutral lavender/grey accent) for
    // both the fill and the text, with no settled/pending meaning at all. Black-only, matching the
    // debt-card fix immediately above; every other theme keeps its original --goal treatment.
    const isBlackGoals = document.body.getAttribute('data-theme')==='black';
    sorted.forEach(g=>{
      const saved = goalSaved(g); const remaining = goalRemaining(g); const isComplete = remaining<=0.004;
      const pct = g.target>0 ? Math.min(100, saved/g.target*100) : 0;
      const card = document.createElement('div'); card.className = 'goal-card clickable-row'+(isComplete?' complete':'');
      card.addEventListener('click', (e)=>{
        if(e.target.closest('button, .contribution-form, select, input')) return;
        openGoalDetail(g.id);
      });
      const metaParts = [];
      if(g.targetDate) metaParts.push(`Target date: ${formatHuman(g.targetDate)}`);
      if(g.note) metaParts.push(escapeHtml(g.note));
      const goalBarColor = isBlackGoals ? 'var(--credit)' : (isComplete?'var(--credit)':'var(--goal)');
      const savedStr = isBlackGoals ? `<span style="color:var(--credit);">${fmt(saved)}</span>` : fmt(saved);
      const remainingGoalStr = isBlackGoals ? `<span style="color:var(--debit);">${fmt(remaining)}</span>` : fmt(remaining);
      card.innerHTML = `
        <div class="goal-card-top">
          <div>
            <div class="goal-name">${escapeHtml(g.name)}</div>
            ${metaParts.length ? `<div class="goal-meta">${metaParts.join(' · ')}</div>` : ''}
          </div>
          <div style="display:flex; gap:4px;">
            <button class="icon-btn-sm edit-goal-btn" data-id="${g.id}" aria-label="Edit savings goal">${icon('edit',14)}</button>
            <button class="icon-btn-sm del-goal-btn" data-id="${g.id}" aria-label="Delete savings goal">${icon('trash',14)}</button>
          </div>
        </div>
        <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct}%; background:${goalBarColor};"></div></div>
        <div class="goal-row-meta">${savedStr} saved of ${fmt(g.target)} ${isComplete ? '· <span class="goal-reached-tag">Goal Reached ✓</span>' : '· '+remainingGoalStr+' to go ('+Math.round(pct)+'%)'}</div>
        ${ isComplete ? '' : `
        <button class="btn-pill btn-outline contribute-goal-btn" data-id="${g.id}">+ Add Contribution</button>
        <div class="contribution-form" id="contrib-form-${g.id}" style="display:none;">
          <label>Amount<input type="number" class="contrib-amount" min="0.01" step="0.01"></label>
          <label>Date<input type="date" class="contrib-date" value="${toLocalDateStr(new Date())}"></label>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button type="button" class="btn-pill btn-black contrib-confirm" data-id="${g.id}">Save Contribution</button>
            <button type="button" class="btn-pill btn-outline contrib-cancel" data-id="${g.id}">Cancel</button>
          </div>
        </div>` }
      `;
      container.appendChild(card);
    });
    container.querySelectorAll('.edit-goal-btn').forEach(btn=> btn.addEventListener('click', ()=> startEditGoal(btn.dataset.id)));
    container.querySelectorAll('.del-goal-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteGoal(btn.dataset.id)));
    container.querySelectorAll('.contribute-goal-btn').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('contrib-form-'+btn.dataset.id); if(f) f.style.display = (f.style.display==='none' ? 'block' : 'none');
    }));
    container.querySelectorAll('.contrib-cancel').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('contrib-form-'+btn.dataset.id); if(f) f.style.display='none';
    }));
    container.querySelectorAll('.contrib-confirm').forEach(btn=> btn.addEventListener('click', ()=> confirmGoalContribution(btn.dataset.id)));
  }
  async function confirmGoalContribution(goalId){
    const form = document.getElementById('contrib-form-'+goalId); if(!form) return;
    const amount = parseFloat(form.querySelector('.contrib-amount').value);
    const date = form.querySelector('.contrib-date').value;
    if(isNaN(amount) || amount<=0 || !date){ alert('Please enter a valid amount and date.'); return; }
    const g = goals.find(x=>x.id===goalId); if(!g) return;
    const wasComplete = goalRemaining(g) <= 0.004;
    if(!Array.isArray(g.contributions)) g.contributions = [];
    g.contributions.push({ id:'contrib_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), amount, date, createdAt: new Date().toISOString() });
    if(!wasComplete && goalRemaining(g) <= 0.004) playSfx('goal');
    await saveGoals();
    refreshAll();
  }
  function resetGoalForm(){
    editingGoalId = null;
    document.getElementById('add-goal-form').reset();
    document.getElementById('add-goal-form').style.display='none';
    document.getElementById('save-goal-btn').textContent = 'Save Goal';
  }
  async function handleAddGoal(e){
    e.preventDefault();
    const name = document.getElementById('goal-name').value.trim();
    const target = parseFloat(document.getElementById('goal-target').value);
    const initialSaved = parseFloat(document.getElementById('goal-initial-saved').value) || 0;
    const targetDate = document.getElementById('goal-target-date').value || null;
    const note = document.getElementById('goal-note').value.trim();
    if(!name || isNaN(target) || target<=0){ alert('Please enter a goal name and a valid target amount.'); return; }
    if(editingGoalId){
      const idx = goals.findIndex(g=>g.id===editingGoalId);
      if(idx>-1) goals[idx] = { ...goals[idx], name, target, initialSaved, targetDate, note };
    } else {
      goals.push({ id:uuid(), name, target, initialSaved, targetDate, note, contributions: [] });
    }
    playSfx('goal');
    await saveGoals();
    resetGoalForm();
    refreshAll();
  }
  function startEditGoal(id){
    const g = goals.find(x=>x.id===id); if(!g) return;
    editingGoalId = id;
    document.getElementById('add-goal-form').style.display='block';
    document.getElementById('goal-name').value = g.name;
    document.getElementById('goal-target').value = g.target;
    document.getElementById('goal-initial-saved').value = g.initialSaved || '';
    document.getElementById('goal-target-date').value = g.targetDate || '';
    document.getElementById('goal-note').value = g.note || '';
    document.getElementById('save-goal-btn').textContent = 'Update Goal';
    document.getElementById('add-goal-form').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
  async function deleteGoal(id){
    if(!confirm('Delete this savings goal? This only removes the goal tracker — it does not affect any of your transactions.')) return false;
    goals = goals.filter(g=>g.id!==id);
    await saveGoals();
    if(currentUser) window.trackrSync.syncDeleteGoal(currentUser.id, id);
    refreshAll();
    return true;
  }

  let goalDetailCurrentId = null;
  function openGoalDetail(id){
    const g = goals.find(x=>x.id===id); if(!g) return;
    goalDetailCurrentId = id;
    const saved = goalSaved(g); const remaining = goalRemaining(g); const isComplete = remaining<=0.004;
    setText('goaldetail-title', g.name);
    setText('goaldetail-amount', fmt(isComplete ? saved : remaining));
    setText('goaldetail-subtitle', isComplete ? 'Goal reached' : 'to go');
    // Issue 4 (round 4): this big figure shows Saved once the goal is reached, Remaining otherwise
    // - the same settled/pending shape as debtdetail-amount above, so it gets the same dynamic
    // colour treatment (green when it's the settled/saved figure, red while still pending), rather
    // than the static neutral --goal it had before. Black only.
    const isBlackGD = document.body.getAttribute('data-theme')==='black';
    document.getElementById('goaldetail-amount').style.color = isBlackGD ? (isComplete ? 'var(--credit)' : 'var(--debit)') : 'var(--goal)';
    const fields = document.getElementById('goaldetail-fields'); fields.innerHTML='';
    const rows = [
      ['Target', fmt(g.target)],
      ['Saved', fmt(saved), 'paid'],
    ];
    if(g.targetDate) rows.push(['Target Date', formatHuman(g.targetDate)]);
    rows.push(['Note', g.note ? g.note : '—']);
    rows.forEach(([label,value,kind])=>{
      const row = document.createElement('div'); row.className='txdetail-field';
      const valueColor = (isBlackGD && kind==='paid') ? ' style="color:var(--credit);"' : '';
      row.innerHTML = `<span class="txdetail-field-label">${escapeHtml(label)}</span><span class="txdetail-field-value"${valueColor}>${escapeHtml(String(value))}</span>`;
      fields.appendChild(row);
    });
    renderGoalDetailContributions(g);
    showOverlay('goaldetail-overlay');
    history.pushState({ goalDetailOpen:true }, '', '');
  }
  function closeGoalDetail(){ hideOverlay('goaldetail-overlay'); goalDetailCurrentId=null; }
  function renderGoalDetailContributions(g){
    const container = document.getElementById('goaldetail-contributions-list'); container.innerHTML='';
    const initial = g.initialSaved || 0;
    const contributions = [...(g.contributions||[])].sort((a,b)=> b.date.localeCompare(a.date));
    if(contributions.length===0 && initial<=0){ container.innerHTML = '<p class="empty-note">No contributions logged yet.</p>'; return; }
    if(initial>0){
      const row = document.createElement('div'); row.className='reminder-card';
      row.innerHTML = `<div class="reminder-card-top"><div><div class="reminder-name mono-num">${fmt(initial)}</div><div class="reminder-meta">Already saved when goal was created</div></div></div>`;
      container.appendChild(row);
    }
    contributions.forEach(c=>{
      const timeStr = c.createdAt ? formatTime12h(c.createdAt) : null;
      const row = document.createElement('div'); row.className='reminder-card';
      row.innerHTML = `
        <div class="reminder-card-top">
          <div><div class="reminder-name mono-num">${fmt(c.amount)}</div><div class="reminder-meta">${formatHuman(c.date)} · Logged ${timeStr || 'time not recorded'}</div></div>
          <div style="display:flex; gap:4px;">
            <button class="icon-btn-sm edit-contrib-btn" data-contrib-id="${c.id}" aria-label="Edit contribution">${icon('edit',14)}</button>
            <button class="icon-btn-sm del-contrib-btn" data-contrib-id="${c.id}" aria-label="Delete contribution">${icon('trash',14)}</button>
          </div>
        </div>
        <div class="log-payment-form" id="editcontrib-form-${c.id}" style="display:none;">
          <label>Amount<input type="number" class="ec-amount" min="0.01" step="0.01" value="${c.amount}"></label>
          <label>Date<input type="date" class="ec-date" value="${c.date}"></label>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button type="button" class="btn-pill btn-black ec-save" data-contrib-id="${c.id}">Save</button>
            <button type="button" class="btn-pill btn-outline ec-cancel" data-contrib-id="${c.id}">Cancel</button>
          </div>
        </div>`;
      container.appendChild(row);
    });
    container.querySelectorAll('.edit-contrib-btn').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('editcontrib-form-'+btn.dataset.contribId); if(f) f.style.display = (f.style.display==='none' ? 'block' : 'none');
    }));
    container.querySelectorAll('.ec-cancel').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('editcontrib-form-'+btn.dataset.contribId); if(f) f.style.display='none';
    }));
    container.querySelectorAll('.ec-save').forEach(btn=> btn.addEventListener('click', ()=> saveEditedContribution(goalDetailCurrentId, btn.dataset.contribId)));
    container.querySelectorAll('.del-contrib-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteContribution(goalDetailCurrentId, btn.dataset.contribId)));
  }
  async function saveEditedContribution(goalId, contribId){
    const g = goals.find(x=>x.id===goalId); if(!g) return;
    const contrib = (g.contributions||[]).find(c=>c.id===contribId); if(!contrib) return;
    const form = document.getElementById('editcontrib-form-'+contribId); if(!form) return;
    const amount = parseFloat(form.querySelector('.ec-amount').value);
    const date = form.querySelector('.ec-date').value;
    if(isNaN(amount) || amount<=0 || !date){ alert('Please enter a valid amount and date.'); return; }
    contrib.amount = amount; contrib.date = date;
    await saveGoals();
    openGoalDetail(goalId);
    refreshAll();
  }
  async function deleteContribution(goalId, contribId){
    if(!confirm('Delete this contribution record?')) return;
    const g = goals.find(x=>x.id===goalId); if(!g) return;
    const idx = (g.contributions||[]).findIndex(c=>c.id===contribId); if(idx===-1) return;
    g.contributions.splice(idx,1);
    await saveGoals();
    openGoalDetail(goalId);
    refreshAll();
  }

  async function handleAddDebt(e){
    e.preventDefault();
    const isReceivable = activeDebtKind==='receivable';
    const name = document.getElementById('debt-name').value.trim();
    const type = document.getElementById('debt-type-value').value;
    const emiAmount = parseFloat(document.getElementById('debt-emi-amount').value) || 0;
    const tenure = parseInt(document.getElementById('debt-tenure').value, 10) || 0;
    const lumpTotal = parseFloat(document.getElementById('debt-total').value);
    const total = type==='emi' ? (emiAmount * tenure) : lumpTotal;
    const startDate = document.getElementById('debt-start-date').value;
    const note = document.getElementById('debt-note').value.trim();
    if(!name || !startDate){ alert(`Please fill in the ${isReceivable?'receivable':'debt'} name and a start date.`); return; }
    if(type==='emi' && (isNaN(emiAmount) || emiAmount<=0 || !tenure || tenure<=0)){ alert('Please enter a valid EMI amount and tenure in months.'); return; }
    if(type==='lump' && (isNaN(lumpTotal) || lumpTotal<=0)){ alert('Please enter a valid total amount.'); return; }
    const list = currentDebtList();
    if(editingDebtId){
      const idx = list.findIndex(d=>d.id===editingDebtId);
      if(idx>-1){
        list[idx] = { ...list[idx], name, type, total, emiAmount: type==='emi'?emiAmount:0, tenure: type==='emi'?tenure:0, startDate, note };
      }
    } else {
      list.push({ id:uuid(), name, type, total, emiAmount: type==='emi'?emiAmount:0, tenure: type==='emi'?tenure:0, startDate, note, payments: [] });
    }
    await currentDebtSaveFn()();
    resetDebtForm();
    refreshAll();
  }
  function resetDebtForm(){
    editingDebtId = null;
    document.getElementById('add-debt-form').reset();
    document.getElementById('add-debt-form').style.display='none';
    document.getElementById('save-debt-btn').textContent = activeDebtKind==='receivable' ? 'Save Receivable' : 'Save Debt';
    document.getElementById('debt-type-value').value='emi';
    document.querySelectorAll('.debt-type-btn').forEach(b=> b.classList.toggle('active', b.dataset.debttype==='emi'));
    document.getElementById('emi-fields').style.display='block';
    document.getElementById('lump-fields').style.display='none';
    setText('debt-type-hint', 'A fixed installment is due every month, for a set number of months.');
    updateEmiTotalPreview();
    resetDebtStartDateDefault();
  }
  function updateEmiTotalPreview(){
    const emiAmount = parseFloat(document.getElementById('debt-emi-amount').value) || 0;
    const tenure = parseInt(document.getElementById('debt-tenure').value, 10) || 0;
    setText('emi-total-preview', `Total: ${fmt(emiAmount * tenure)} over ${tenure || 0} month${tenure===1?'':'s'}`);
  }
  function startEditDebt(id){
    const isReceivable = receivables.some(x=>x.id===id);
    if(activeDebtKind !== (isReceivable?'receivable':'debt')){
      activeDebtKind = isReceivable ? 'receivable' : 'debt';
      updateDebtKindLabels();
    }
    if(isDesktop) switchTab('add');
    const d = currentDebtList().find(x=>x.id===id); if(!d) return;
    editingDebtId = id;
    document.getElementById('add-debt-form').style.display='block';
    document.getElementById('debt-name').value = d.name;
    document.querySelectorAll('.debt-type-btn').forEach(b=> b.classList.toggle('active', b.dataset.debttype===d.type));
    document.getElementById('debt-type-value').value = d.type;
    document.getElementById('emi-fields').style.display = d.type==='emi' ? 'block' : 'none';
    document.getElementById('lump-fields').style.display = d.type==='lump' ? 'block' : 'none';
    setText('debt-type-hint', d.type==='emi'
      ? 'A fixed installment is due every month, for a set number of months.'
      : "Any amount, any time, until it's fully settled — no fixed schedule.");
    document.getElementById('debt-emi-amount').value = d.emiAmount || '';
    document.getElementById('debt-tenure').value = d.tenure || '';
    document.getElementById('debt-total').value = d.total || '';
    updateEmiTotalPreview();
    document.getElementById('debt-start-date').value = d.startDate;
    document.getElementById('debt-note').value = d.note || '';
    document.getElementById('save-debt-btn').textContent = activeDebtKind==='receivable' ? 'Update Receivable' : 'Update Debt';
    document.getElementById('add-debt-form').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
  function resetDebtStartDateDefault(){ const el = document.getElementById('debt-start-date'); if(el) el.value = toLocalDateStr(new Date()); }
  function openAddDebtForm(kind){
    if(activeDebtKind !== kind){
      activeDebtKind = kind;
      document.querySelectorAll('#debt-kind-toggle .type-btn').forEach(b=> b.classList.toggle('active', b.dataset.debtkind===kind));
      updateDebtKindLabels();
      renderDebtsList();
      renderDebtOverviewInto('debtov', currentDebtList());
    }
    editingDebtId = null;
    document.getElementById('save-debt-btn').textContent = kind==='receivable' ? 'Save Receivable' : 'Save Debt';
    document.getElementById('add-debt-form').style.display='block';
    document.getElementById('add-debt-form').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  // Core payment-logging logic shared by the debt card's inline form (confirmLogPayment)
  // and any other quick action that wants to log a payment without a form, e.g. the
  // Upcoming Cash Flow card's one-tap "Mark Paid".
  async function logDebtPayment(debtId, amount, date, account){
    const isReceivable = receivables.some(d=>d.id===debtId);
    const list = isReceivable ? receivables : debts;
    const saveFn = isReceivable ? saveReceivables : saveDebts;
    if(isNaN(amount) || amount<=0 || !date) return false;
    const debt = list.find(d=>d.id===debtId); if(!debt) return false;
    const wasPaidOff = debtRemaining(debt) <= 0.004;
    const nowIso = new Date().toISOString();
    const txId = uuid();
    debt.payments.push({ id:'pay_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), amount, date, createdAt: nowIso, txId });
    const txType = isReceivable ? 'income' : 'expense';
    // Play immediately, before the saves below — a fully-paid debt/receivable is a bigger
    // moment than a routine payment, so it gets the completion chime instead of stacking
    // it with the routine credit/debit sound.
    if(!wasPaidOff && debtRemaining(debt) <= 0.004) playSfx('credit');
    else playSfx(txType==='income' ? 'credit' : 'debit');
    await saveFn();
    const txCategory = isReceivable ? 'Loan Repayment Received' : 'EMI / Loan';
    const catList = isReceivable ? categories.income : categories.expense;
    if(!catList.includes(txCategory)) catList.push(txCategory);
    transactions.push({ id:txId, type:txType, category:txCategory, date, account, amount, note: debt.name+(isReceivable?' — received':' — payment'), createdAt: nowIso, debtId: debtId });
    await saveTransactions(); await saveCategories();
    refreshAll();
    return true;
  }
  async function confirmLogPayment(debtId, form){
    if(!form) return;
    const amount = parseFloat(form.querySelector('.lp-amount').value);
    const date = form.querySelector('.lp-date').value;
    const account = form.querySelector('.lp-account') ? form.querySelector('.lp-account').value : (accounts[0] ? accounts[0].name : 'Cash');
    if(isNaN(amount) || amount<=0 || !date){ alert('Please enter a valid amount and date.'); return; }
    await logDebtPayment(debtId, amount, date, account);
  }

  async function deleteDebt(id){
    const isReceivable = receivables.some(d=>d.id===id);
    const list = isReceivable ? receivables : debts;
    const deletedIds = isReceivable ? recentlyDeletedReceivableIds : recentlyDeletedDebtIds;
    const saveFn = isReceivable ? saveReceivables : saveDebts;
    const msg = isReceivable
      ? 'Remove this receivable from your tracker? Past collections already recorded in your transactions will NOT be deleted.'
      : 'Remove this debt from your tracker? Past payments already recorded in your transactions will NOT be deleted.';
    if(!confirm(msg)) return false;
    deletedIds.add(id);
    const idx = list.findIndex(d=>d.id===id);
    if(idx>-1) list.splice(idx,1);
    // Past payments deliberately stay (see the confirm message above), but their debtId
    // cross-reference must be cleared here - left pointing at a debt this device (and, once
    // synced, the cloud) no longer has, every future transactions sync would keep resending
    // that now-nonexistent debt_id in the same batch as every other transaction. A single
    // Postgres upsert statement covering many rows fails as one unit if any row violates a
    // foreign-key constraint, so this one stale reference silently blocked ALL transaction
    // syncing from succeeding again, not just the payment linked to this debt.
    let orphanedTransactions = false;
    transactions.forEach(t=>{ if(t.debtId===id){ t.debtId = null; orphanedTransactions = true; } });
    if(orphanedTransactions) await saveTransactions();
    await saveFn();
    if(currentUser) window.trackrSync.syncDeleteDebt(currentUser.id, id);
    refreshAll();
    return true;
  }

  function ordinalSuffix(n){
    n = parseInt(n,10);
    if(n%10===1 && n!==11) return 'st';
    if(n%10===2 && n!==12) return 'nd';
    if(n%10===3 && n!==13) return 'rd';
    return 'th';
  }
  function reminderStatus(r, maxDiff){
    maxDiff = maxDiff===undefined ? 3 : maxDiff;
    const today = new Date(); const todayStr = toLocalDateStr(today);
    if(r.repeat === 'once'){
      if(r.lastDismissedPeriod === 'done' || !r.dueDate) return null;
      const diffDays = Math.round((new Date(r.dueDate+'T00:00:00') - new Date(todayStr+'T00:00:00'))/86400000);
      if(diffDays > maxDiff) return null;
      return { overdue: diffDays < 0, diffDays, dueLabel: formatHuman(r.dueDate), dueDateISO: r.dueDate, periodKey: 'done' };
    } else {
      const ym = todayStr.slice(0,7);
      if(r.lastDismissedPeriod === ym) return null;
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
      const day = Math.min(r.dueDay||1, lastDayOfMonth);
      const dueDateThisMonth = `${ym}-${String(day).padStart(2,'0')}`;
      const diffDays = Math.round((new Date(dueDateThisMonth+'T00:00:00') - new Date(todayStr+'T00:00:00'))/86400000);
      if(diffDays > maxDiff) return null;
      return { overdue: diffDays < 0, diffDays, dueLabel: formatHuman(dueDateThisMonth), dueDateISO: dueDateThisMonth, periodKey: ym };
    }
  }
  function reminderStatusLabel(status){
    if(status.overdue) return `Overdue by ${Math.abs(status.diffDays)} day${Math.abs(status.diffDays)===1?'':'s'}`;
    if(status.diffDays===0) return 'Due today';
    return `Due in ${status.diffDays} day${status.diffDays===1?'':'s'}`;
  }
  function renderRemindersUpcoming(){
    const card = document.getElementById('reminders-upcoming-card'); const list = document.getElementById('reminders-upcoming-list');
    if(!card || !list) return;
    const items = reminders.map(r=> ({ r, status: reminderStatus(r, Math.max(3, r.remindDaysBefore||0)) })).filter(x=>x.status);
    if(items.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    items.sort((a,b)=> a.status.diffDays - b.status.diffDays);
    list.innerHTML='';
    items.forEach(({r,status})=>{
      const row = document.createElement('div'); row.className='reminder-card';
      row.innerHTML = `<div class="reminder-card-top"><div><div class="reminder-name">${escapeHtml(r.title)}</div><div class="reminder-meta">${status.dueLabel}${r.amount? ' · '+fmt(r.amount):''}</div></div><span class="reminder-status ${status.overdue?'overdue':'upcoming'}">${reminderStatusLabel(status)}</span></div>`;
      list.appendChild(row);
    });
  }
  function renderRemindersList(){
    const container = document.getElementById('reminders-list'); if(!container) return;
    container.innerHTML='';
    if(reminders.length===0){ container.innerHTML = '<p class="empty-note">No reminders set yet. Add one below.</p>'; return; }
    const withStatus = reminders.map(r=>({ r, status: reminderStatus(r, Math.max(3, r.remindDaysBefore||0)) }));
    withStatus.sort((a,b)=>{
      if(!!a.status !== !!b.status) return a.status ? -1 : 1;
      if(a.status && b.status) return a.status.diffDays - b.status.diffDays;
      return 0;
    });
    withStatus.forEach(({r,status})=>{
      const card = document.createElement('div'); card.className='reminder-card';
      const repeatLabel = r.repeat==='monthly' ? `Every month on the ${r.dueDay}${ordinalSuffix(r.dueDay)}` : `One-time · ${formatHuman(r.dueDate)}`;
      const remindLabel = r.remindDaysBefore>0 ? ` · Daily nudge from ${r.remindDaysBefore} day${r.remindDaysBefore===1?'':'s'} before` : '';
      card.innerHTML = `
        <div class="reminder-card-top">
          <div>
            <div class="reminder-name">${escapeHtml(r.title)}</div>
            <div class="reminder-meta">${repeatLabel}${r.amount? ' · '+fmt(r.amount):''}${remindLabel}</div>
            ${r.note? `<div class="reminder-meta">${escapeHtml(r.note)}</div>`:''}
          </div>
          ${ status ? `<span class="reminder-status ${status.overdue?'overdue':'upcoming'}">${reminderStatusLabel(status)}</span>` : '' }
        </div>
        <div class="reminder-actions">
          ${ status ? `<button class="btn-pill btn-outline dismiss-reminder-btn" data-id="${r.id}">Mark Done</button>` : '' }
          <button class="icon-btn-sm edit-reminder-btn" data-id="${r.id}" aria-label="Edit reminder">${icon('edit',14)}</button>
          <button class="icon-btn-sm del-reminder-btn" data-id="${r.id}" aria-label="Delete reminder">${icon('trash',14)}</button>
        </div>
      `;
      container.appendChild(card);
    });
    container.querySelectorAll('.dismiss-reminder-btn').forEach(btn=> btn.addEventListener('click', ()=> dismissReminder(btn.dataset.id)));
    container.querySelectorAll('.edit-reminder-btn').forEach(btn=> btn.addEventListener('click', ()=> startEditReminder(btn.dataset.id)));
    container.querySelectorAll('.del-reminder-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteReminder(btn.dataset.id)));
  }
  async function dismissReminder(id){
    const r = reminders.find(x=>x.id===id); if(!r) return;
    const status = reminderStatus(r);
    r.lastDismissedPeriod = status ? status.periodKey : (r.repeat==='once' ? 'done' : toLocalDateStr(new Date()).slice(0,7));
    playSfx('reminder');
    await saveReminders();
    refreshAll();
  }
  async function deleteReminder(id){
    if(!confirm('Delete this reminder?')) return;
    reminders = reminders.filter(r=>r.id!==id);
    await saveReminders();
    refreshAll();
  }
  async function handleAddReminder(e){
    e.preventDefault();
    const title = document.getElementById('reminder-title').value.trim();
    const repeat = document.getElementById('reminder-repeat-value').value;
    const amount = parseFloat(document.getElementById('reminder-amount').value) || 0;
    const note = document.getElementById('reminder-note').value.trim();
    if(!title){ alert('Please enter a title for this reminder.'); return; }
    let dueDay = null, dueDate = null;
    if(repeat==='monthly'){
      dueDay = parseInt(document.getElementById('reminder-due-day').value, 10);
      if(!dueDay || dueDay<1 || dueDay>31){ alert('Please enter a valid day of the month (1–31).'); return; }
    } else {
      dueDate = document.getElementById('reminder-due-date').value;
      if(!dueDate){ alert('Please pick a due date.'); return; }
    }
    let remindDaysBefore = parseInt(document.getElementById('reminder-remind-before').value, 10);
    if(!Number.isFinite(remindDaysBefore) || remindDaysBefore<0) remindDaysBefore = 0;
    if(remindDaysBefore>30) remindDaysBefore = 30;
    if(editingReminderId){
      const r = reminders.find(x=>x.id===editingReminderId);
      if(r){
        r.title = title; r.repeat = repeat; r.dueDay = dueDay; r.dueDate = dueDate; r.amount = amount; r.note = note; r.remindDaysBefore = remindDaysBefore;
        r.lastDismissedPeriod = null;
        clearNotifiedFor(r.id);
      }
      editingReminderId = null;
    } else {
      reminders.push({ id:'rem_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), title, repeat, dueDay, dueDate, amount, note, remindDaysBefore, lastDismissedPeriod:null });
    }
    await saveReminders();
    document.getElementById('add-reminder-form').reset();
    document.getElementById('add-reminder-form').style.display='none';
    document.querySelector('#add-reminder-form button[type="submit"]').textContent = 'Save Reminder';
    refreshAll();
  }
  function startEditReminder(id){
    const r = reminders.find(x=>x.id===id); if(!r) return;
    editingReminderId = id;
    document.getElementById('reminder-title').value = r.title;
    document.querySelectorAll('.reminder-repeat-btn').forEach(b=> b.classList.toggle('active', b.dataset.repeat===r.repeat));
    document.getElementById('reminder-repeat-value').value = r.repeat;
    const isMonthly = r.repeat==='monthly';
    document.getElementById('reminder-monthly-field').style.display = isMonthly ? 'block' : 'none';
    document.getElementById('reminder-once-field').style.display = isMonthly ? 'none' : 'block';
    document.getElementById('reminder-due-day').value = r.dueDay || 1;
    document.getElementById('reminder-due-date').value = r.dueDate || '';
    document.getElementById('reminder-remind-before').value = r.remindDaysBefore || '';
    document.getElementById('reminder-amount').value = r.amount || '';
    document.getElementById('reminder-note').value = r.note || '';
    document.querySelector('#add-reminder-form button[type="submit"]').textContent = 'Update Reminder';
    const form = document.getElementById('add-reminder-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
  function updateNotifPermissionStatus(){
    const el = document.getElementById('notif-permission-status'); if(!el) return;
    if(!('Notification' in window)){ el.textContent = 'Not supported in this browser.'; return; }
    if(Notification.permission==='granted') el.textContent = 'On — works while this tab/app is open.';
    else if(Notification.permission==='denied') el.textContent = 'Blocked — enable it in your browser/site settings.';
    else el.textContent = 'Off — only works while this tab is open.';
  }
  async function fireNotification(title, body){
    if(!('Notification' in window) || Notification.permission!=='granted') return;
    try{
      // Mobile browsers (Chrome/Android in particular) refuse `new Notification()` outright when a
      // service worker is registered — it throws silently and nothing shows. showNotification() via
      // the active service worker is the path that actually works there, including in the installed PWA.
      if('serviceWorker' in navigator){
        const reg = await navigator.serviceWorker.getRegistration();
        if(reg){ await reg.showNotification(title, { body, icon:'icon-192.png', badge:'icon-192.png' }); return; }
      }
      new Notification(title, { body });
    }catch(e){ console.error('Notification failed:', e); }
  }
  // Whether a native OS notification actually shows depends entirely on Notification.permission
  // being granted - most people never grant it. The in-app chime below is independent of that:
  // it's just the same SFX system already used for credit/debit/goal cues, playing while the app
  // happens to be open when something becomes newly due, regardless of OS notification setup.
  // Background/closed-app sound (which WOULD require that permission, plus a real web push
  // subscription) is a separate, larger feature, not this.
  async function maybeFireDueNotifications(){
    const canNotify = ('Notification' in window) && Notification.permission==='granted';
    const todayStr = toLocalDateStr(new Date());
    for(const r of reminders){
      const windowDays = Math.max(0, r.remindDaysBefore||0);
      const status = reminderStatus(r, windowDays);
      if(!status) continue;
      const shouldNotify = status.overdue || status.diffDays <= windowDays;
      const key = r.id+'_'+todayStr;
      if(shouldNotify && !notifiedReminderIds.has(key)){
        playSfx('reminder');
        if(canNotify) await fireNotification('Trackr reminder', `${r.title} — ${reminderStatusLabel(status)}`);
        notifiedReminderIds.add(key);
      }
    }
    for(const d of debts){
      const key = 'debt_'+d.id+'_'+todayStr;
      if(d.type==='emi' && debtOverdueCount(d)>0 && debtRemaining(d)>0.004 && !notifiedReminderIds.has(key)){
        playSfx('reminder');
        if(canNotify) await fireNotification('Trackr reminder', `${d.name} — EMI payment due`);
        notifiedReminderIds.add(key);
      }
    }
  }

  function drawSimpleTable(doc, startY, headers, colX, rows){
    const lineHeight = 6.2; const pageBottom = 282; let y = startY;
    function drawHeader(){
      doc.setFont('helvetica','bold'); doc.setFontSize(8.5);
      headers.forEach((h,i)=> doc.text(h, colX[i], y));
      y += 2; doc.setLineWidth(0.3); doc.line(14, y, 196, y); y += 5; doc.setFont('helvetica','normal');
    }
    drawHeader();
    rows.forEach(row=>{
      if(y > pageBottom){ doc.addPage(); y = 20; drawHeader(); }
      row.forEach((cell,i)=> doc.text(String(cell), colX[i], y));
      y += lineHeight;
    });
    return y;
  }
  function downloadPDF(){
    if(!currentReport){ alert('Please choose a valid period first.'); return; }
    if(!window.jspdf){ alert('The PDF library could not load. Please check your connection and try again.'); return; }
    try{
      const { jsPDF } = window.jspdf; const doc = new jsPDF(); const marginX = 14; let y = 20;
      doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.text('Trackr', marginX, y); y += 7;
      doc.setFontSize(11); doc.setFont('helvetica','normal');
      doc.text(currentReport.label, marginX, y); y += 6;
      doc.setFontSize(9); doc.setTextColor(100,100,100);
      doc.text(`Filter — Type: ${currentReport.typeFilterLabel}, Category: ${currentReport.catFilterLabel}`, marginX, y); y += 5;
      doc.text(`Generated on ${formatHuman(toLocalDateStr(new Date()))}`, marginX, y);
      doc.setTextColor(20,20,20); y += 10;
      doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(`Total Credit: ${fmtPdf(currentReport.totalIncome)}`, marginX, y); y += 6;
      doc.text(`Total Debit: ${fmtPdf(currentReport.totalExpense)}`, marginX, y); y += 6;
      doc.text(`Net: ${fmtPdf(currentReport.net)}`, marginX, y); y += 8;
      doc.setFont('helvetica','normal');
      doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text('Category Breakdown', marginX, y); y += 7;
      doc.setFontSize(8.5);
      const catData = categoryBreakdownData(currentReport.filtered);
      const catHeaders = ['Category','Type','Amount']; const catColX = [marginX, marginX+100, marginX+135];
      const catRows = catData.length ? catData.map(d=>[truncate(d.category,38), d.type==='income'?'Credit':'Debit', fmtPdf(d.amt)]) : [['-','-','No entries']];
      y = drawSimpleTable(doc, y, catHeaders, catColX, catRows); y += 8;
      if(y > 245){ doc.addPage(); y = 20; }
      doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text('All Transactions', marginX, y); y += 7;
      doc.setFontSize(8.5);
      const txHeaders = ['Date','Particulars','Category','Debit','Credit','Balance'];
      const txColX = [marginX, marginX+22, marginX+72, marginX+112, marginX+138, marginX+164];
      let balance = 0;
      const txRows = currentReport.filtered.length ? currentReport.filtered.map(t=>{
        balance += t.type==='income' ? t.amount : -t.amount;
        return [ formatHuman(t.date), truncate(t.note || '-', 24), truncate(t.category, 20), t.type==='expense' ? fmtPdf(t.amount) : '-', t.type==='income' ? fmtPdf(t.amount) : '-', fmtPdf(balance) ];
      }) : [['-','No entries for this period','-','-','-','-']];
      let finalY = drawSimpleTable(doc, y, txHeaders, txColX, txRows);
      if(debts.length>0){
        finalY += 10;
        if(finalY > 235){ doc.addPage(); finalY = 20; }
        doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text('Debts & EMIs Overview', marginX, finalY); finalY += 7;
        doc.setFontSize(9); doc.setFont('helvetica','normal');
        const totalCommitted = debts.reduce((s,d)=>s+d.total,0);
        const totalPaidAll = debts.reduce((s,d)=>s+debtPaid(d),0);
        const totalPendingAll = debts.reduce((s,d)=>s+debtRemaining(d),0);
        doc.text(`Total Committed: ${fmtPdf(totalCommitted)}`, marginX, finalY); finalY += 5;
        doc.text(`Total Paid: ${fmtPdf(totalPaidAll)}`, marginX, finalY); finalY += 5;
        doc.text(`Total Pending: ${fmtPdf(totalPendingAll)}`, marginX, finalY);
        finalY += 8;
        doc.setFontSize(8.5);
        const debtHeaders = ['Name','Type','Total','Paid','Pending'];
        const debtColX = [marginX, marginX+62, marginX+96, marginX+130, marginX+164];
        const debtRows = debts.map(d=> [truncate(d.name,26), d.type==='emi'?'EMI':'One-time', fmtPdf(d.total), fmtPdf(debtPaid(d)), fmtPdf(debtRemaining(d))]);
        finalY = drawSimpleTable(doc, finalY, debtHeaders, debtColX, debtRows);
      }
      if(receivables.length>0){
        finalY += 10;
        if(finalY > 235){ doc.addPage(); finalY = 20; }
        doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.text('Receivables Overview', marginX, finalY); finalY += 7;
        doc.setFontSize(9); doc.setFont('helvetica','normal');
        const totalCommittedR = receivables.reduce((s,d)=>s+d.total,0);
        const totalPaidAllR = receivables.reduce((s,d)=>s+debtPaid(d),0);
        const totalPendingAllR = receivables.reduce((s,d)=>s+debtRemaining(d),0);
        doc.text(`Total Committed: ${fmtPdf(totalCommittedR)}`, marginX, finalY); finalY += 5;
        doc.text(`Total Received: ${fmtPdf(totalPaidAllR)}`, marginX, finalY); finalY += 5;
        doc.text(`Total Pending: ${fmtPdf(totalPendingAllR)}`, marginX, finalY);
        finalY += 8;
        doc.setFontSize(8.5);
        const rcvHeaders = ['Name','Type','Total','Received','Pending'];
        const rcvColX = [marginX, marginX+62, marginX+96, marginX+130, marginX+164];
        const rcvRows = receivables.map(d=> [truncate(d.name,26), d.type==='emi'?'EMI':'One-time', fmtPdf(d.total), fmtPdf(debtPaid(d)), fmtPdf(debtRemaining(d))]);
        drawSimpleTable(doc, finalY, rcvHeaders, rcvColX, rcvRows);
      }
      const safeLabel = currentReport.label.replace(/[^a-z0-9]+/gi,'_').toLowerCase();
      doc.save(`trackr_${safeLabel}.pdf`);
    }catch(err){ console.error(err); alert('Something went wrong creating the PDF. Please try again.'); }
  }
  function csvEscape(val){ val = String(val==null?'':val); if(/[",\n]/.test(val)) return '"'+val.replace(/"/g,'""')+'"'; return val; }
  function downloadCSV(){
    if(!currentReport){ alert('Please choose a valid period first.'); return; }
    const rows = [['Date','Type','Category','Particulars','Amount']];
    currentReport.filtered.forEach(t=> rows.push([t.date, t.type==='income'?'Credit':'Debit', t.category, t.note||'', t.amount.toFixed(2)]));
    rows.push([]);
    rows.push(['Total Credit','','','', currentReport.totalIncome.toFixed(2)]);
    rows.push(['Total Debit','','','', currentReport.totalExpense.toFixed(2)]);
    rows.push(['Net','','','', currentReport.net.toFixed(2)]);
    if(debts.length>0){
      const totalCommitted = debts.reduce((s,d)=>s+d.total,0);
      const totalPaidAll = debts.reduce((s,d)=>s+debtPaid(d),0);
      const totalPendingAll = debts.reduce((s,d)=>s+debtRemaining(d),0);
      rows.push([]);
      rows.push(['--- Debts & EMIs Overview ---']);
      rows.push(['Total Committed','','','', totalCommitted.toFixed(2)]);
      rows.push(['Total Paid','','','', totalPaidAll.toFixed(2)]);
      rows.push(['Total Pending','','','', totalPendingAll.toFixed(2)]);
      rows.push([]);
      rows.push(['Debt Name','Type','Total','Paid','Pending']);
      debts.forEach(d=> rows.push([d.name, d.type==='emi'?'EMI':'One-time', d.total.toFixed(2), debtPaid(d).toFixed(2), debtRemaining(d).toFixed(2)]));
    }
    if(receivables.length>0){
      const totalCommittedR = receivables.reduce((s,d)=>s+d.total,0);
      const totalPaidAllR = receivables.reduce((s,d)=>s+debtPaid(d),0);
      const totalPendingAllR = receivables.reduce((s,d)=>s+debtRemaining(d),0);
      rows.push([]);
      rows.push(['--- Receivables Overview ---']);
      rows.push(['Total Committed','','','', totalCommittedR.toFixed(2)]);
      rows.push(['Total Received','','','', totalPaidAllR.toFixed(2)]);
      rows.push(['Total Pending','','','', totalPendingAllR.toFixed(2)]);
      rows.push([]);
      rows.push(['Receivable Name','Type','Total','Received','Pending']);
      receivables.forEach(d=> rows.push([d.name, d.type==='emi'?'EMI':'One-time', d.total.toFixed(2), debtPaid(d).toFixed(2), debtRemaining(d).toFixed(2)]));
    }
    const csv = rows.map(r=> r.map(csvEscape).join(',')).join('\n');
    const safeLabel = currentReport.label.replace(/[^a-z0-9]+/gi,'_').toLowerCase();
    triggerDownload(csv, `trackr_${safeLabel}.csv`, 'text/csv;charset=utf-8;');
  }
  function downloadBackup(){
    settings.lastBackupAt = new Date().toISOString();
    saveSettings();
    // Only the CURRENT scope's own bucket, never the whole multi-account categoryMeta object - a
    // backup file is this account's data; it must not carry another account's leftover
    // positions/colours that might still be sitting inert in this device's storage.
    const data = { transactions, categories, categoryMeta: categoryMetaBucket(), settings, budgets, debts, receivables, recurring, reminders, goals, accounts, exportedAt: new Date().toISOString() };
    triggerDownload(JSON.stringify(data, null, 2), `trackr_backup_${toLocalDateStr(new Date())}.json`, 'application/json');
    renderLastBackupNote();
    renderBackupNag();
  }
  const BACKUP_NAG_AFTER_DAYS = 30;
  const BACKUP_NAG_SNOOZE_DAYS = 7;
  function shouldShowBackupNag(){
    if(transactions.length===0 && debts.length===0 && receivables.length===0 && goals.length===0) return false;
    const daysSince = (iso)=> Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if(settings.lastBackupNagDismissedAt && daysSince(settings.lastBackupNagDismissedAt) < BACKUP_NAG_SNOOZE_DAYS) return false;
    if(!settings.lastBackupAt) return true;
    return daysSince(settings.lastBackupAt) > BACKUP_NAG_AFTER_DAYS;
  }
  function renderBackupNag(){
    const banner = document.getElementById('backup-nag-banner'); if(!banner) return;
    if(!shouldShowBackupNag()){ animateOut(banner); return; }
    animateIn(banner, 'block');
    const text = document.getElementById('backup-nag-text');
    if(currentUser){
      text.textContent = settings.lastBackupAt
        ? `It's been over ${BACKUP_NAG_AFTER_DAYS} days since your last local backup — your data is already synced to the cloud, but a local copy is a good extra safety net`
        : "You haven't made a local backup yet — your data is already synced to the cloud, but a local copy is a good extra safety net";
    } else {
      text.textContent = settings.lastBackupAt
        ? `It's been over ${BACKUP_NAG_AFTER_DAYS} days since your last backup — everything you've entered only lives on this device`
        : "You haven't backed up yet — everything you've entered only lives on this device";
    }
  }
  function renderBackupContextNote(){
    const el = document.getElementById('backup-context-note'); if(!el) return;
    el.textContent = currentUser
      ? 'Your data syncs automatically to the cloud. This also saves a local copy to your device if you want one.'
      : "You're not logged in, so this is your only backup — download a copy regularly so you don't lose data if this device is lost.";
  }
  async function dismissBackupNag(){
    settings.lastBackupNagDismissedAt = new Date().toISOString();
    await saveSettings();
    renderBackupNag();
  }
  // Every id in a restored backup is regenerated fresh, never reused from the file - a restore
  // between two different accounts (this exact scenario was hit testing Restore Backup's
  // merge-vs-replace behavior across accounts, and the planned friends'-migration flow depends
  // on it too) would otherwise carry over ids that may already exist as a DIFFERENT account's
  // rows in Supabase. Postgres RLS blocks the whole upsert for a conflicting id it doesn't own
  // - unlike the debt_id foreign-key bug, this can't be fixed in place afterward, since the
  // record is permanently unsyncable under the new account with its original id. (This is
  // separate from user_id itself: every local record's outgoing row already gets user_id
  // stamped from the CURRENTLY LOGGED-IN session at sync time - see toTransactionRow() etc in
  // js/supabase.js, which construct the row fresh from the passed-in userId rather than reading
  // any user_id off the local object - so there's nothing to fix there. The actual defect was
  // ids surviving a restore unchanged and colliding with another account's pre-existing rows.)
  function remapRestoredIds(state){
    const txIdMap = {}, debtIdMap = {};
    state.transactions.forEach(t=>{ if(t && t.id){ const fresh = uuid(); txIdMap[t.id] = fresh; t.id = fresh; } });
    state.debts.concat(state.receivables).forEach(d=>{ if(d && d.id){ const fresh = uuid(); debtIdMap[d.id] = fresh; d.id = fresh; } });
    state.goals.forEach(g=>{ if(g && g.id) g.id = uuid(); });
    state.transactions.forEach(t=>{ if(t.debtId && debtIdMap[t.debtId]) t.debtId = debtIdMap[t.debtId]; });
    state.debts.concat(state.receivables).forEach(d=>{
      (d.payments||[]).forEach(p=>{ if(p.txId && txIdMap[p.txId]) p.txId = txIdMap[p.txId]; });
    });
  }
  function handleRestoreFile(e){
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const data = JSON.parse(reader.result);
        if(!Array.isArray(data.transactions) || !data.categories){ throw new Error('Invalid file'); }
        // Explicit, unambiguous: a full replace, every data type, no exceptions - matches how
        // categories/settings/wallets/recurring/reminders/budgets already behaved; transactions/
        // debts/receivables used to silently merge instead (see below), which is exactly what
        // this confirmation now rules out up front.
        if(!confirm(
          "Replace ALL current data with this backup file?\n\n" +
          "Everything you have now — transactions, debts, receivables, goals, budgets, categories, " +
          "wallets, and reminders — will be permanently deleted, on this device and in your account. " +
          "This cannot be undone."
        )) return;

        // Delete this account's existing cloud data BEFORE writing anything new - a full
        // replace means nothing from before should survive anywhere, not just locally. (Doing
        // this first, rather than after uploading the restored data, avoids a brief window
        // where a delete running late could wipe out the very data just restored.)
        if(currentUser){
          if(window.trackrSync.purgeQueuedTables) await window.trackrSync.purgeQueuedTables(['transactions','debts','goals','budgets']);
          const results = await window.trackrSync.deleteAllCloudDataForUser(currentUser.id);
          const failed = Object.keys(results).filter(t=> !results[t]);
          if(failed.length>0){
            showAppToast(`Couldn't clear cloud ${failed.join(', ')} before restoring — check your connection and try again`);
          }
        }

        transactions = data.transactions || []; categories = data.categories || defaultCategories();
        // A backup taken before this round won't have categoryMeta at all - defaults to {}, same
        // as a fresh install, meaning every category simply falls back to auto colour/alphabetical
        // order until re-dragged/re-picked. Not a data loss: position/colour were never anything
        // but decoration this round adds meaning to.
        //
        // Written into ONLY this account's own scope (see categoryMetaScopeKey's own comment) -
        // never a wholesale replace of the whole categoryMeta object, which would blow away any
        // OTHER account's bucket that happens to still be sitting inert in this device's storage.
        // A backup file's categoryMeta is already flat (just the exporting account's own bucket -
        // see downloadBackup), so it's written straight in with no unwrapping needed.
        categoryMeta[categoryMetaScopeKey()] = (data.categoryMeta && typeof data.categoryMeta==='object' && !Array.isArray(data.categoryMeta)) ? data.categoryMeta : {};
        settings = data.settings || { currency:'₹' }; budgets = data.budgets || {}; debts = Array.isArray(data.debts) ? data.debts : [];
        receivables = Array.isArray(data.receivables) ? data.receivables : [];
        recurring = Array.isArray(data.recurring) ? data.recurring : []; reminders = Array.isArray(data.reminders) ? data.reminders : [];
        goals = Array.isArray(data.goals) ? data.goals : [];
        accounts = Array.isArray(data.accounts) && data.accounts.length ? data.accounts : defaultAccounts();
        remapRestoredIds({ transactions, debts, receivables, goals });
        if(!settings.theme) settings.theme = 'light';
        // A backup taken before this feature existed won't have these fields at all, and even one
        // that does references transaction ids/categories from the OLD data just replaced above -
        // dismissal state describing data that no longer exists (or, worse, the same id
        // coincidentally reused by something new) shouldn't carry over either way. Only this
        // account's own scope is reset - a different account that previously logged into this
        // device isn't touched by a restore that only ever replaces the CURRENT account's data.
        settings.dismissedBudgetAlerts = {};
        delete duplicateDismissals[duplicateDismissalScopeKey()];
        // Written directly, NOT via saveTransactions/saveDebts/saveReceivables - those merge
        // against whatever's still on local disk (deliberate for ordinary edits), which is
        // exactly what silently kept this device's prior entries alongside the restored ones
        // instead of replacing them. A restore should replace outright, same as everything else
        // in this function already does.
        await persistLocalKeys([
          ['transactions', transactions], ['debts', debts], ['receivables', receivables],
          ['goals', goals], ['budgets', budgets], ['categories', categories], ['categoryMeta', categoryMeta], ['settings', settings],
          ['recurring', recurring], ['reminders', reminders], ['accounts', accounts],
          ['duplicateDismissals', duplicateDismissals]
        ]);
        if(currentUser){
          // Debts/receivables must be AWAITED before transactions sync - a transaction's debt_id
          // foreign key needs the debt row actually committed server-side first. A previous fix
          // here only reordered these statements without awaiting them, which does nothing:
          // all three fire as overlapping in-flight requests regardless of source order, so the
          // transactions upsert could still reach and commit at Supabase before the debts one
          // does. Confirmed via real device testing - this is a genuine race, not just a local
          // ordering nicety, so it needs a real sequential await, not "fire in the right order."
          await window.trackrSync.syncUpsertDebts(currentUser.id, debts);
          await window.trackrSync.syncUpsertReceivables(currentUser.id, receivables);
          await window.trackrSync.syncUpsertTransactions(currentUser.id, transactions);
          window.trackrSync.syncUpsertGoals(currentUser.id, goals);
          window.trackrSync.syncBudgets(currentUser.id, budgets);
          // This screen's own confirm() text (above) promises categories are replaced "in your
          // account" too, same as every other data type here - deleteAllCloudDataForUser above
          // already wiped the account's old cloud categories, so this uploads the restored set
          // as the account's new one. categoriesReconciledOnce is left as-is (untouched, same as
          // every other flag in this function) - it's already true for a signed-in account
          // restoring a backup, and the cloud now genuinely holds this exact restored list, so a
          // later cloud pull correctly takes the "already reconciled, replace with cloud" branch
          // rather than re-running a merge against data that no longer needs merging.
          window.trackrSync.syncUpsertCategories(currentUser.id, categories, categoryMetaBucket());
        }
        populateEntryCategorySelect(document.getElementById('entry-type').value);
        populateEntryAccountSelect();
        if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
        populateFilterCategorySelect(document.getElementById('filter-type').value);
        populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
        applyTheme(settings.theme);
        balancesRevealed = false; isAppLocked = false;
        syncHideBalancesUI(); syncAppLockUI(); syncNetWorthToggleUI(); syncSfxToggleUI();
        resetHideBalancesTimer(); resetAppLockTimer();
        refreshAll();
        renderCategoriesView();
        if(settings.appLockEnabled && settings.appLockPin) lockApp();
        alert('Backup restored successfully.');
      }catch(err){ console.error(err); alert('Could not read this file. Please make sure it is a valid Trackr backup (.json) file.'); }
    };
    reader.readAsText(file); e.target.value = '';
  }

  function openGlobalSearch(){
    showOverlay('search-overlay');
    const input = document.getElementById('global-search-input');
    input.value=''; input.focus();
    renderGlobalSearchResults('');
    history.pushState({ searchOpen:true }, '', '');
  }
  function closeGlobalSearch(){ hideOverlay('search-overlay'); }

  function openNotificationsOverlay(){
    renderNotificationsList();
    showOverlay('notifications-overlay');
    history.pushState({ notificationsOpen:true }, '', '');
  }
  function closeNotificationsOverlay(){ hideOverlay('notifications-overlay'); }
  function goToAlertTarget(tab, sub){
    history.back();
    setTimeout(()=>{ if(sub){ goToMoreSub('more', sub); } else { switchTab(tab); } }, 50);
  }
  function renderNotificationsList(){
    const container = document.getElementById('notifications-list'); container.innerHTML='';
    const { overBudget, overdueDebts, dueReminders, dueRecurring } = collectAlerts();
    if(overBudget.length+overdueDebts.length+dueReminders.length+dueRecurring.length === 0){
      container.innerHTML = '<p class="empty-note">You\'re all caught up — no alerts right now.</p>';
      return;
    }
    function addSection(label){
      const h = document.createElement('div'); h.className='activity-group-label'; h.textContent=label; container.appendChild(h);
    }
    // title: the category/debt/reminder name, demoted to a small label (was previously the
    // biggest text in the card, competing with the number that actually matters).
    // keyFigure: the one number/status worth noticing at a glance - "Over by ₹1,100.00", "2
    // installments overdue", "Due today" - now visually primary, matching the big-number/small-
    // label relationship .txdetail-amount/.txdetail-category already use in the transaction
    // detail overlay, rather than a single run-on sentence.
    // meta: secondary supporting context, shown only when there's something worth adding beyond
    // the key figure itself (e.g. the raw spent/limit numbers behind "Over by...").
    function addRow(title, keyFigure, isAlert, meta, onClick, dismissKey){
      const row = document.createElement('div'); row.className='reminder-card clickable-row';
      const metaHtml = meta ? `<div class="reminder-meta">${escapeHtml(meta)}</div>` : '';
      row.innerHTML = `<div class="reminder-card-top"><div><div class="reminder-name">${escapeHtml(title)}</div><div class="reminder-key-figure${isAlert?' alert':''}">${escapeHtml(keyFigure)}</div>${metaHtml}</div></div>`;
      row.addEventListener('click', onClick);
      if(dismissKey){
        const dismissBtn = document.createElement('button');
        dismissBtn.type = 'button'; dismissBtn.className = 'alert-dismiss-btn';
        dismissBtn.setAttribute('aria-label', 'Dismiss this alert');
        dismissBtn.textContent = '×';
        dismissBtn.addEventListener('click', (e)=>{
          e.stopPropagation();
          dismissBudgetAlert(dismissKey);
        });
        row.querySelector('.reminder-card-top').appendChild(dismissBtn);
      }
      container.appendChild(row);
    }
    if(overBudget.length){
      addSection('Over Budget');
      overBudget.forEach(b=> addRow(b.category, `Over by ${fmt(b.spent-b.limit)}`, true, `${fmt(b.spent)} spent of ${fmt(b.limit)} limit`, ()=> goToAlertTarget(null,'budgets'), b.key));
    }
    if(overdueDebts.length){
      addSection('Overdue Debts');
      overdueDebts.forEach(d=> addRow(d.name, `${debtOverdueCount(d)} installment${debtOverdueCount(d)===1?'':'s'} overdue`, true, '', ()=> goToAlertTarget(null,'debts')));
    }
    if(dueReminders.length){
      addSection('Reminders');
      dueReminders.forEach(({r,status})=> addRow(r.title, reminderStatusLabel(status), false, r.amount?fmt(r.amount):'', ()=> goToAlertTarget(null,'reminders')));
    }
    if(dueRecurring.length){
      addSection('Due for Logging');
      dueRecurring.forEach(({r,status})=> addRow(r.category, reminderStatusLabel(status), false, fmt(r.amount), ()=> goToAlertTarget('insights',null)));
    }
  }
  async function dismissBudgetAlert(key){
    settings.dismissedBudgetAlerts[key] = true;
    await saveSettings();
    renderNotificationsList();
    updateBellBadge();
  }

  let scheduleScrollFadeTimer = null;
  let scheduleScrollFadeRaf = null;
  function hexToRgb(hex){
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec((hex||'').trim());
    return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : null;
  }
  // Shows the schedule list's native scrollbar thumb only while actively scrolling, fading it
  // out a moment after scrolling stops - mobile's native scrollbar otherwise shows at rest and
  // only hides once scrolled to an edge, backwards from what's expected. The fade itself is
  // driven manually via rAF writing a --schedule-thumb-color custom property (read by the
  // ::-webkit-scrollbar-thumb rule's background) through a sequence of alpha values, rather than
  // relying on a CSS transition/opacity change on that pseudo-element - real-device testing
  // confirmed neither reliably animates there (a background-color transition just snaps, and
  // opacity was outright ignored, permanently showing the thumb). A plain background-color VALUE
  // change does correctly repaint it though, so each rAF frame just writes a new one directly.
  // Bound once (guarded so repeat opens don't stack duplicate listeners) since the container
  // itself is never removed from the DOM, only shown/hidden.
  function bindScheduleScrollFade(){
    const body = document.querySelector('#schedule-overlay .search-overlay-body');
    if(!body || body.dataset.scrollFadeBound) return;
    body.dataset.scrollFadeBound = 'true';
    function fadeOut(){
      cancelAnimationFrame(scheduleScrollFadeRaf);
      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduceMotion){ body.style.setProperty('--schedule-thumb-color', 'transparent'); return; }
      const rgb = hexToRgb(getComputedStyle(body).getPropertyValue('--line')) || [148,163,184];
      const duration = 260, start = performance.now();
      function step(now){
        const t = Math.min(1, (now - start) / duration);
        body.style.setProperty('--schedule-thumb-color', `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${1 - t})`);
        if(t < 1){ scheduleScrollFadeRaf = requestAnimationFrame(step); }
        else { body.style.setProperty('--schedule-thumb-color', 'transparent'); }
      }
      scheduleScrollFadeRaf = requestAnimationFrame(step);
    }
    body.addEventListener('scroll', () => {
      cancelAnimationFrame(scheduleScrollFadeRaf);
      body.style.setProperty('--schedule-thumb-color', 'var(--line)');
      clearTimeout(scheduleScrollFadeTimer);
      scheduleScrollFadeTimer = setTimeout(fadeOut, 800);
    });
  }
  function openSchedule(debtId){
    const d = findInAnyDebtList(debtId); if(!d || d.type!=='emi') return;
    setText('schedule-debt-name', d.name);
    renderScheduleList(d);
    bindScheduleScrollFade();
    showOverlay('schedule-overlay');
    history.pushState({ scheduleOpen:true }, '', '');
  }
  function closeSchedule(){ hideOverlay('schedule-overlay'); }
  function renderScheduleList(d){
    const container = document.getElementById('schedule-list'); container.innerHTML='';
    const schedule = buildEmiSchedule(d);
    if(schedule.length===0){ container.innerHTML = '<p class="empty-note">No schedule to show.</p>'; return; }
    schedule.forEach(s=>{
      const row = document.createElement('div'); row.className='schedule-row';
      const statusClass = s.paid ? 'paid' : (s.overdue ? 'overdue' : 'upcoming');
      const statusLabel = s.paid ? 'Paid' : (s.overdue ? 'Overdue' : 'Upcoming');
      const timeStr = s.paidAt ? formatTime12h(s.paidAt) : null;
      const metaLine = s.paid ? `Paid ${formatHuman(s.paidDate)}${timeStr ? ' · '+timeStr : ' · time not recorded'}` : '';
      row.innerHTML = `
        <div class="schedule-row-top">
          <div class="schedule-row-left">
            <span class="schedule-no">${s.installmentNo}</span>
            <div>
              <div class="schedule-due">${formatHuman(s.dueDate)}</div>
              <div class="schedule-amt mono-num">${fmt(s.amount)}</div>
            </div>
          </div>
          <span class="schedule-status ${statusClass}">${statusLabel}</span>
        </div>
        <div class="schedule-meta">${metaLine}</div>
      `;
      container.appendChild(row);
    });
  }

  let debtDetailCurrentId = null;
  function openDebtDetail(id){
    const isReceivable = receivables.some(x=>x.id===id);
    const list = isReceivable ? receivables : debts;
    const d = list.find(x=>x.id===id); if(!d) return;
    debtDetailCurrentId = id;
    const paid = debtPaid(d); const remaining = debtRemaining(d); const isPaidOff = remaining<=0.004;
    setText('debtdetail-title', d.name);
    setText('debtdetail-badge-label', (d.type==='emi' ? 'EMI' : 'One-time') + ' ' + (isReceivable ? 'Receivable' : 'Debt'));
    // Issue 3: this "remaining" figure is the same not-yet-settled concept as Outstanding Debt/
    // Owed to You on Insights - under Black it must read red either way, same as those two now
    // do, rather than green for a receivable (money not yet received still isn't settled). Every
    // other theme keeps its original debt=red/receivable=green treatment, unchanged.
    const isBlackDD = document.body.getAttribute('data-theme')==='black';
    document.getElementById('debtdetail-amount').style.color = isBlackDD ? 'var(--debit)' : (isReceivable ? 'var(--credit)' : 'var(--debit)');
    setText('debtdetail-amount', fmt(remaining));
    setText('debtdetail-subtitle', isPaidOff ? (isReceivable ? 'Fully received' : 'Paid off') : 'remaining');
    const fields = document.getElementById('debtdetail-fields'); fields.innerHTML='';
    const rows = [
      ['Type', d.type==='emi' ? 'EMI — fixed monthly' : 'One-time'],
      ['Start Date', formatHuman(d.startDate)],
    ];
    if(d.type==='emi'){ rows.push(['EMI Amount', fmt(d.emiAmount)]); rows.push(['Tenure', d.tenure+' months']); }
    rows.push(['Total', fmt(d.total)]);
    // 'paid' flag marks the settled figure for the Black-only green treatment below - Total stays
    // neutral (it's a committed/total figure, not a settled one) and every other theme is untouched.
    rows.push([isReceivable ? 'Received' : 'Paid', fmt(paid), 'paid']);
    rows.push(['Note', d.note ? d.note : '—']);
    rows.forEach(([label,value,kind])=>{
      const row = document.createElement('div'); row.className='txdetail-field';
      const valueColor = (isBlackDD && kind==='paid') ? ' style="color:var(--credit);"' : '';
      row.innerHTML = `<span class="txdetail-field-label">${escapeHtml(label)}</span><span class="txdetail-field-value"${valueColor}>${escapeHtml(String(value))}</span>`;
      fields.appendChild(row);
    });
    renderDebtDetailPayments(d, isReceivable);
    showOverlay('debtdetail-overlay');
    history.pushState({ debtDetailOpen:true }, '', '');
  }
  function closeDebtDetail(){ hideOverlay('debtdetail-overlay'); debtDetailCurrentId=null; }
  function renderDebtDetailPayments(d, isReceivable){
    const container = document.getElementById('debtdetail-payments-list'); container.innerHTML='';
    const payments = [...(d.payments||[])].sort((a,b)=> b.date.localeCompare(a.date));
    if(payments.length===0){ container.innerHTML = '<p class="empty-note">No payments logged yet.</p>'; return; }
    payments.forEach(p=>{
      const timeStr = p.createdAt ? formatTime12h(p.createdAt) : null;
      const row = document.createElement('div'); row.className='reminder-card';
      row.innerHTML = `
        <div class="reminder-card-top">
          <div><div class="reminder-name mono-num">${fmt(p.amount)}</div><div class="reminder-meta">${formatHuman(p.date)} · Logged ${timeStr || 'time not recorded'}</div></div>
          <div style="display:flex; gap:4px;">
            <button class="icon-btn-sm edit-payment-btn" data-payment-id="${p.id}" aria-label="Edit payment">${icon('edit',14)}</button>
            <button class="icon-btn-sm del-payment-btn" data-payment-id="${p.id}" aria-label="Delete payment">${icon('trash',14)}</button>
          </div>
        </div>
        <div class="log-payment-form" id="editpay-form-${p.id}" style="display:none;">
          <label>Amount<input type="number" class="ep-amount" min="0.01" step="0.01" value="${p.amount}"></label>
          <label>Date<input type="date" class="ep-date" value="${p.date}"></label>
          <div style="display:flex; gap:8px; margin-top:10px;">
            <button type="button" class="btn-pill btn-black ep-save" data-payment-id="${p.id}">Save</button>
            <button type="button" class="btn-pill btn-outline ep-cancel" data-payment-id="${p.id}">Cancel</button>
          </div>
        </div>`;
      container.appendChild(row);
    });
    container.querySelectorAll('.edit-payment-btn').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('editpay-form-'+btn.dataset.paymentId); if(f) f.style.display = (f.style.display==='none' ? 'block' : 'none');
    }));
    container.querySelectorAll('.ep-cancel').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('editpay-form-'+btn.dataset.paymentId); if(f) f.style.display='none';
    }));
    container.querySelectorAll('.ep-save').forEach(btn=> btn.addEventListener('click', ()=> saveEditedPayment(debtDetailCurrentId, btn.dataset.paymentId)));
    container.querySelectorAll('.del-payment-btn').forEach(btn=> btn.addEventListener('click', ()=> deletePayment(debtDetailCurrentId, btn.dataset.paymentId)));
  }
  async function saveEditedPayment(debtId, paymentId){
    const isReceivable = receivables.some(x=>x.id===debtId);
    const list = isReceivable ? receivables : debts;
    const d = list.find(x=>x.id===debtId); if(!d) return;
    const payment = (d.payments||[]).find(p=>p.id===paymentId); if(!payment) return;
    const form = document.getElementById('editpay-form-'+paymentId); if(!form) return;
    const amount = parseFloat(form.querySelector('.ep-amount').value);
    const date = form.querySelector('.ep-date').value;
    if(isNaN(amount) || amount<=0 || !date){ alert('Please enter a valid amount and date.'); return; }
    payment.amount = amount; payment.date = date;
    await (isReceivable ? saveReceivables() : saveDebts());
    if(payment.txId){
      const tx = transactions.find(t=>t.id===payment.txId);
      if(tx){ tx.amount = amount; tx.date = date; await saveTransactions(); }
    }
    openDebtDetail(debtId);
    refreshAll();
  }
  async function deletePayment(debtId, paymentId){
    if(!confirm('Delete this payment record? Its linked transaction (if found) will be removed too.')) return;
    const isReceivable = receivables.some(x=>x.id===debtId);
    const list = isReceivable ? receivables : debts;
    const d = list.find(x=>x.id===debtId); if(!d) return;
    const idx = (d.payments||[]).findIndex(p=>p.id===paymentId); if(idx===-1) return;
    const payment = d.payments[idx];
    d.payments.splice(idx,1);
    await (isReceivable ? saveReceivables() : saveDebts());
    if(payment.txId){
      const txIdx = transactions.findIndex(t=>t.id===payment.txId);
      if(txIdx>-1){ recentlyDeletedTxIds.add(payment.txId); transactions.splice(txIdx,1); await saveTransactions(); }
    }
    openDebtDetail(debtId);
    refreshAll();
  }

  function renderGlobalSearchResults(query){
    const container = document.getElementById('global-search-results'); container.innerHTML='';
    const q = query.trim().toLowerCase();
    if(!q){ container.innerHTML = '<p class="empty-note">Type to search across transactions, categories, debts, and receivables.</p>'; return; }
    const matchedDebts = debts.filter(d=> d.name.toLowerCase().includes(q));
    const matchedReceivables = receivables.filter(d=> d.name.toLowerCase().includes(q));
    const matchedTx = transactions.filter(t=> t.category.toLowerCase().includes(q) || (t.note||'').toLowerCase().includes(q))
      .sort((a,b)=> b.date.localeCompare(a.date)).slice(0,40);
    if(matchedDebts.length===0 && matchedReceivables.length===0 && matchedTx.length===0){ container.innerHTML = '<p class="empty-note">No matches found.</p>'; return; }
    if(matchedDebts.length){
      const h = document.createElement('div'); h.className='activity-group-label'; h.textContent='Debts'; container.appendChild(h);
      matchedDebts.forEach(d=>{
        const row = document.createElement('div'); row.className='activity-row';
        row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="${catBadgeStyle(d.name)}">${categoryInitial(d.name)}</span><div><div class="activity-name">${escapeHtml(d.name)}</div><div class="activity-sub">${d.type==='emi'?'EMI':'One-time'} debt</div></div></div><div class="activity-right"><span class="activity-amt mono-num">${fmt(debtRemaining(d))} left</span></div>`;
        container.appendChild(row);
      });
    }
    if(matchedReceivables.length){
      const h = document.createElement('div'); h.className='activity-group-label'; h.textContent='Receivables'; container.appendChild(h);
      matchedReceivables.forEach(d=>{
        const row = document.createElement('div'); row.className='activity-row';
        row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="${catBadgeStyle(d.name)}">${categoryInitial(d.name)}</span><div><div class="activity-name">${escapeHtml(d.name)}</div><div class="activity-sub">${d.type==='emi'?'EMI':'One-time'} receivable</div></div></div><div class="activity-right"><span class="activity-amt mono-num">${fmt(debtRemaining(d))} left</span></div>`;
        container.appendChild(row);
      });
    }
    if(matchedTx.length){
      const h = document.createElement('div'); h.className='activity-group-label'; h.textContent='Transactions'; container.appendChild(h);
      matchedTx.forEach(t=> container.appendChild(buildActivityRow(t, true, true)));
      wireActivityActions(container);
      container.querySelectorAll('.edit-btn, .del-btn').forEach(b=> b.addEventListener('click', closeGlobalSearch));
    }
  }

  function renderCatList(type){
    const container = document.getElementById(type+'-cat-list'); container.innerHTML='';
    orderedCategoryNames(type).forEach(c=>{
      const color = categoryColor(c);
      const row = document.createElement('div'); row.className='cat-row'; row.dataset.type=type; row.dataset.cat=c;
      row.innerHTML = `<span class="cat-drag-handle" role="button" tabindex="0" aria-label="Drag to reorder ${escapeHtml(c)}">${icon('grip',16)}</span><span class="cat-row-left cat-row-pick-color" role="button" tabindex="0" aria-label="Change colour for ${escapeHtml(c)}"><span class="cat-badge sm" style="${catBadgeStyle(c, color)}">${categoryInitial(c)}</span>${escapeHtml(c)}</span><button class="icon-btn-sm del-cat-btn" data-type="${type}" data-cat="${escapeHtml(c)}" aria-label="Delete category ${escapeHtml(c)}">${icon('trash',14)}</button>`;
      container.appendChild(row);
    });
    container.querySelectorAll('.del-cat-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteCategory(btn.dataset.type, btn.dataset.cat)));
    container.querySelectorAll('.cat-row-pick-color').forEach(el=>{
      el.addEventListener('click', ()=>{
        const row = el.closest('.cat-row');
        openColorPicker(row.dataset.type, row.dataset.cat);
      });
    });
    // Per-row pointerdown (rebound fresh on every render, same pattern as .del-cat-btn above -
    // the row elements themselves are destroyed/recreated by innerHTML='' each render, so there's
    // nothing to leak). pointermove/pointerup are added to `document` only for the duration of an
    // actual drag (see onCategoryDragStart) - not bound here - so they survive the pointer moving
    // outside the handle/container's bounds, which WILL happen mid-drag.
    container.querySelectorAll('.cat-drag-handle').forEach(handle=> handle.addEventListener('pointerdown', onCategoryDragStart));
  }
  function renderCategoriesView(){ renderCatList('income'); renderCatList('expense'); document.getElementById('currency-input').value = settings.currency; }

  // Drag-to-reorder (Issue 1). Vanilla Pointer Events, not HTML5 drag-and-drop (which has no
  // built-in touch support) and not long-press-anywhere (the brief explicitly rules this out - on
  // a 354px touch screen it competes with page scrolling and misfires). Dragging can only START
  // from .cat-drag-handle, which carries touch-action:none in CSS - once the browser sees the
  // gesture begin there and the pointer gets captured to it, the browser's own scroll gesture
  // never engages for the rest of that same touch, even as the finger moves outside the handle's
  // original screen position. Classic "swap-with-neighbour, compensate the offset" sortable-list
  // algorithm: the dragged row is visually translateY'd by the running pointer delta, and the
  // instant its (transform-adjusted) midpoint crosses an immediate neighbour's midpoint, that
  // neighbour is swapped in the DOM and the translateY is reduced by exactly the neighbour's
  // height, so the row's ON-SCREEN position never jumps even though its DOM position just changed.
  let categoryDragState = null;
  function onCategoryDragStart(e){
    const handle = e.currentTarget;
    const row = handle.closest('.cat-row'); if(!row) return;
    const container = row.parentElement; if(!container) return;
    e.preventDefault();
    try{ handle.setPointerCapture(e.pointerId); }catch(err){}
    row.classList.add('cat-row-dragging');
    categoryDragState = { row, container, type: row.dataset.type, pointerId: e.pointerId, lastY: e.clientY, offsetY: 0 };
    document.addEventListener('pointermove', onCategoryDragMove);
    document.addEventListener('pointerup', onCategoryDragEnd);
    document.addEventListener('pointercancel', onCategoryDragEnd);
  }
  function onCategoryDragMove(e){
    const st = categoryDragState;
    if(!st || e.pointerId!==st.pointerId) return;
    const dy = e.clientY - st.lastY; st.lastY = e.clientY; st.offsetY += dy;
    st.row.style.transform = `translateY(${st.offsetY}px)`;
    let sib = st.offsetY>0 ? st.row.nextElementSibling : st.row.previousElementSibling;
    while(sib){
      const sibRect = sib.getBoundingClientRect();
      const dragRect = st.row.getBoundingClientRect();
      const dragMid = dragRect.top + dragRect.height/2;
      const sibMid = sibRect.top + sibRect.height/2;
      if(st.offsetY>0 && dragMid > sibMid){
        st.container.insertBefore(st.row, sib.nextElementSibling);
        st.offsetY -= sibRect.height;
        st.row.style.transform = `translateY(${st.offsetY}px)`;
        sib = st.row.nextElementSibling;
      } else if(st.offsetY<0 && dragMid < sibMid){
        st.container.insertBefore(st.row, sib);
        st.offsetY += sibRect.height;
        st.row.style.transform = `translateY(${st.offsetY}px)`;
        sib = st.row.previousElementSibling;
      } else break;
    }
  }
  function onCategoryDragEnd(e){
    const st = categoryDragState;
    if(!st || e.pointerId!==st.pointerId) return;
    st.row.classList.remove('cat-row-dragging');
    st.row.style.transform = '';
    document.removeEventListener('pointermove', onCategoryDragMove);
    document.removeEventListener('pointerup', onCategoryDragEnd);
    document.removeEventListener('pointercancel', onCategoryDragEnd);
    categoryDragState = null;
    const orderedNames = [...st.container.querySelectorAll('.cat-row')].map(r=>r.dataset.cat);
    persistCategoryOrder(st.type, orderedNames);
  }
  // Assigns fresh sequential positions (0..n-1) to the WHOLE list in its new order, credit and
  // debit numbered independently - this is also how the very FIRST reorder for a list is handled:
  // before this call every row in that list is "unpositioned" (orderedCategoryNames's alphabetical
  // fallback), and this one call transitions the entire list straight to "fully positioned" in a
  // single step, seeded from whatever order the user just dropped it in - not from the alphabetical
  // order it displayed a moment before. No incremental diffing needed since every row's position is
  // rewritten unconditionally.
  async function persistCategoryOrder(type, orderedNames){
    const dbType = type==='income' ? 'credit' : 'debit';
    const bucket = ensureCategoryMetaBucket();
    orderedNames.forEach((name, i)=>{
      const key = name+'|'+dbType;
      bucket[key] = { ...(bucket[key]||{}), position: i };
    });
    await saveCategories();
    renderCatList(type);
    populateEntryCategorySelect(document.getElementById('entry-type').value);
    populateFilterCategorySelect(document.getElementById('filter-type').value);
    populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
    if(type==='expense') renderBudgetSetList();
  }

  // Colour picker (Issue 2). categoryColorPickerCurrent tracks which (type, name) the open picker
  // is for, so selectCategoryColor doesn't need it threaded through the DOM.
  let categoryColorPickerCurrent = null;
  // hex -> {type, name} for every OTHER category's ACTUAL on-screen colour - auto-assigned or
  // manual, via categoryColor() (the same function every render call uses), not just a manual
  // categoryMeta.color. FIX (round "budgets + picker polish"): this used to only register a
  // category that had an explicit manual colour, so an auto-coloured category's swatch showed as
  // fully available in every other category's picker - two categories could visually land on the
  // same or near-identical colour with no warning. Excludes excludeKey (the category the picker is
  // currently open for - its own current colour must show as "selected", never as "taken by
  // someone else"). Checked across BOTH lists, not per-list (2c: History mixes credit and debit,
  // which is where a collision would actually be seen).
  function categoryColorTakenMap(excludeKey){
    const map = new Map();
    ['income','expense'].forEach(t=>{
      const dbType = t==='income' ? 'credit' : 'debit';
      (categories[t]||[]).forEach(name=>{
        const key = name+'|'+dbType;
        if(key===excludeKey) return;
        map.set(categoryColor(name), { type:t, name });
      });
    });
    return map;
  }
  function renderColorPickerGrid(type, name){
    const dbType = type==='income' ? 'credit' : 'debit';
    const key = name+'|'+dbType;
    // Same fix as categoryColorTakenMap above - this category's own current swatch must highlight
    // whether that colour came from a manual pick or an auto assignment, not just the former.
    const currentColor = categoryColor(name);
    const taken = categoryColorTakenMap(key);
    const grid = document.getElementById('color-picker-grid'); grid.innerHTML='';
    CAT_SWATCHES.forEach(sw=>{
      const owner = taken.get(sw.hex);
      const isCurrent = currentColor===sw.hex;
      const btn = document.createElement('button');
      btn.type='button';
      btn.className = 'swatch-btn' + (owner?' swatch-taken':'') + (isCurrent?' swatch-current':'');
      btn.style.background = sw.hex;
      if(owner) btn.disabled = true;
      btn.setAttribute('aria-label', owner ? `Taken by ${owner.name}` : (isCurrent ? 'Current colour' : `Choose this colour for ${name}`));
      if(owner) btn.title = `Used by ${owner.name}`;
      btn.innerHTML = owner ? icon('lock',13) : (isCurrent ? icon('check',15) : '');
      if(!owner) btn.addEventListener('click', ()=> selectCategoryColor(type, name, sw.hex));
      grid.appendChild(btn);
    });
  }
  function openColorPicker(type, name){
    categoryColorPickerCurrent = { type, name };
    setText('color-picker-title', `Colour for "${name}"`);
    renderColorPickerGrid(type, name);
    showOverlay('color-picker-overlay');
    if(!(history.state && history.state.colorPickerOpen)) history.pushState({ colorPickerOpen:true }, '', '');
  }
  function closeColorPicker(){ categoryColorPickerCurrent = null; hideOverlay('color-picker-overlay'); }
  async function selectCategoryColor(type, name, hex){
    const dbType = type==='income' ? 'credit' : 'debit';
    const key = name+'|'+dbType;
    const bucket = ensureCategoryMetaBucket();
    bucket[key] = { ...(bucket[key]||{}), color: hex };
    await saveCategories();
    renderCatList(type);
    refreshAll();
    closeColorPicker();
  }
  function addCategory(type, name){
    name = (name||'').trim(); if(!name) return;
    const exists = categories[type].some(c=>c.toLowerCase()===name.toLowerCase());
    if(exists){ alert('This category already exists.'); return; }
    categories[type].push(name); saveCategories();
    populateEntryCategorySelect(document.getElementById('entry-type').value);
    populateFilterCategorySelect(document.getElementById('filter-type').value);
    populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
    renderCategoriesView();
    if(type==='expense') renderBudgetSetList();
  }
  function deleteCategory(type, name){
    if(!confirm(`Remove "${name}" from ${type} categories? Past entries will keep this category label.`)) return;
    categories[type] = categories[type].filter(c=>c!==name);
    // Frees this category's position/colour immediately - a manually-picked swatch must return to
    // the available pool the instant its category is deleted (not just once some other device
    // happens to pull the delete), and since this map is purely local metadata about a row that's
    // about to stop existing server-side too (see syncDeleteCategory below), there's nothing to
    // separately "un-sync" here.
    delete ensureCategoryMetaBucket()[name+'|'+(type==='income' ? 'credit' : 'debit')];
    saveCategories();
    // An upsert batch (saveCategories, above) can never remove a row just by omitting it - this
    // explicit delete is what actually removes it server-side, same shape as deleteAccount's own
    // saveAccounts()-then-syncDeleteAccount() pair.
    if(currentUser) window.trackrSync.syncDeleteCategory(currentUser.id, name, type==='income' ? 'credit' : 'debit');
    if(type==='expense' && budgets[name]!==undefined){ delete budgets[name]; saveBudgets(); }
    populateEntryCategorySelect(document.getElementById('entry-type').value);
    populateFilterCategorySelect(document.getElementById('filter-type').value);
    populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
    renderCategoriesView();
    if(type==='expense'){ renderBudgetSetList(); renderBudgetWatchInsights(); updateBellBadge(); }
  }

  function renderAccountsList(){
    const container = document.getElementById('accounts-list'); if(!container) return;
    container.innerHTML='';
    if(accounts.length===0){ container.innerHTML = '<p class="empty-note">No accounts yet. Add one below.</p>'; return; }
    accounts.forEach(a=>{
      const bal = accountBalance(a.name);
      const row = document.createElement('div'); row.className='budget-row';
      row.innerHTML = `
        <div class="budget-row-top">
          <span class="budget-cat-left"><span class="cat-badge sm" style="${catBadgeStyle(a.name)}">${categoryInitial(a.name)}</span><span class="budget-cat-name">${escapeHtml(a.name)}</span></span>
          <span style="display:flex; gap:4px;">
            <button class="icon-btn-sm rename-account-btn" data-id="${a.id}" aria-label="Rename account ${escapeHtml(a.name)}">${icon('edit',14)}</button>
            <button class="icon-btn-sm del-account-btn" data-id="${a.id}" aria-label="Delete account ${escapeHtml(a.name)}">${icon('trash',14)}</button>
          </span>
        </div>
        <div class="budget-row-meta" style="font-size:14px; font-weight:700; color:${bal<0?'var(--debit)':'var(--ink)'};">${fmt(bal)}</div>
        <form class="rename-account-form" data-id="${a.id}" style="display:none; gap:8px; margin-top:8px;">
          <input type="text" class="rename-account-input" required style="flex:1; min-width:0; padding:8px 10px; border:1.5px solid var(--line); border-radius:10px; background:var(--bg); color:var(--ink); font-size:14px;">
          <button type="submit" class="btn-pill btn-black" style="padding:8px 14px; font-size:12.5px;">Save</button>
          <button type="button" class="btn-pill btn-outline cancel-rename-account-btn" style="padding:8px 14px; font-size:12.5px;">Cancel</button>
        </form>
      `;
      container.appendChild(row);
    });
    container.querySelectorAll('.del-account-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteAccount(btn.dataset.id)));
    container.querySelectorAll('.rename-account-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const row = btn.closest('.budget-row');
        const acc = accounts.find(a=>a.id===btn.dataset.id); if(!acc) return;
        row.querySelector('.budget-row-top').style.display = 'none';
        row.querySelector('.budget-row-meta').style.display = 'none';
        const form = row.querySelector('.rename-account-form');
        form.style.display = 'flex';
        const input = form.querySelector('.rename-account-input');
        input.value = acc.name;
        input.focus(); input.select();
      });
    });
    container.querySelectorAll('.cancel-rename-account-btn').forEach(btn=>{
      btn.addEventListener('click', ()=> renderAccountsList());
    });
    container.querySelectorAll('.rename-account-form').forEach(form=>{
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        handleRenameAccount(form.dataset.id, form.querySelector('.rename-account-input').value.trim());
      });
    });
  }
  async function handleRenameAccount(id, newName){
    if(!newName) return;
    const acc = accounts.find(a=>a.id===id); if(!acc) return;
    const oldName = acc.name;
    if(oldName===newName){ renderAccountsList(); return; }
    if(accounts.some(a=>a.id!==id && a.name.toLowerCase()===newName.toLowerCase())){
      alert('Another wallet already has this name.');
      return;
    }
    // Transactions reference a wallet by its NAME, not its id (there is no wallet foreign key on
    // a transaction row - see getTxAccount/accountBalance) - both mutations below happen
    // synchronously, before either persist/sync call starts, so a rename can't land half-done:
    // it's never possible for the wallet's name to change without every transaction that
    // referenced the old name changing with it in the same pass. A partial rename would silently
    // orphan those transactions - they'd stop appearing under the renamed wallet and stop
    // counting toward its balance, with no error to explain why.
    acc.name = newName;
    let affectedTx = false;
    transactions.forEach(t=>{ if(t.account===oldName){ t.account = newName; affectedTx = true; } });
    // Both upsert the SAME row(s) by id (accounts: user_id+id; transactions: id) with the new
    // name - an UPDATE in place, not an insert, so this can't create a duplicate row under the
    // new name either locally or in Supabase.
    await Promise.all([saveAccounts(), affectedTx ? saveTransactions() : Promise.resolve()]);
    populateEntryAccountSelect();
    if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
    refreshAll();
  }
  function renderAccountsHome(){
    const card = document.getElementById('accounts-home-card'); const list = document.getElementById('accounts-home-list');
    if(!card || !list) return;
    if(accounts.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    list.innerHTML='';
    accounts.forEach(a=>{
      const bal = accountBalance(a.name);
      const row = document.createElement('div'); row.className='activity-row';
      row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="${catBadgeStyle(a.name)}">${categoryInitial(a.name)}</span><div><div class="activity-name">${escapeHtml(a.name)}</div></div></div><div class="activity-right"><span class="activity-amt mono-num" style="color:${bal<0?'var(--debit)':'var(--ink)'};">${fmt(bal)}</span></div>`;
      list.appendChild(row);
    });
  }
  async function handleAddAccount(e){
    e.preventDefault();
    const input = document.getElementById('new-account-name');
    const name = input.value.trim();
    if(!name) return;
    if(accounts.some(a=>a.name.toLowerCase()===name.toLowerCase())){ alert('This account already exists.'); return; }
    accounts.push({ id:'acc_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), name });
    await saveAccounts();
    input.value='';
    populateEntryAccountSelect();
    if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
    refreshAll();
  }
  async function deleteAccount(id){
    if(accounts.length<=1){ alert('You need at least one account — add another before removing this one.'); return; }
    const acc = accounts.find(a=>a.id===id); if(!acc) return;
    if(!confirm(`Remove "${acc.name}"? Past entries already tagged to it will keep showing "${acc.name}", but it won't be selectable for new entries.`)) return;
    accounts = accounts.filter(a=>a.id!==id);
    await saveAccounts();
    if(currentUser) window.trackrSync.syncDeleteAccount(currentUser.id, id);
    populateEntryAccountSelect();
    if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
    refreshAll();
  }
  // One-time-per-account reconciliation for the accounts table specifically. It's newer than the
  // app's other synced tables, so any device that logged in before it existed (i.e. every
  // existing user, on the first login after the table is created) has local wallets that were
  // never pushed up - a plain "cloud replaces local" pull (the correct, normal behavior for every
  // later sync) would silently discard those the moment such a device contacts a cloud that's
  // still empty, or one another device already populated with ITS OWN divergent local wallets.
  // Confirmed by test: two devices with different local wallets, both doing their first-ever
  // pull against the same freshly-created table, would otherwise have whichever one syncs SECOND
  // silently overwrite/lose whatever's unique to it.
  //
  // Matches by ID FIRST, falling back to name only for a local record with no id match at all.
  // This used to match by name only - and that let a locally re-seeded default wallet (id
  // acc_cash, name "Cash", from hardClearAllLocalDataNoSync's unconditional
  // accounts=defaultAccounts() on every logout) survive alongside a cloud row that shares that
  // SAME id but was renamed ("Cash in hand"): the two don't name-match, so the old code kept both,
  // producing two local records sharing one id - which Postgres then refuses to upsert together
  // (21000, "ON CONFLICT DO UPDATE command cannot affect row a second time"), and which is exactly
  // the reported wallet re-seed duplicate bug. An id match now always lets the cloud's row win
  // outright (the local one is dropped, never merged in under it) - an id collision can no longer
  // produce two local records. Name-only matching (no id match) still applies for two genuinely
  // different devices that each created a same-named wallet before ever syncing - the cloud's id
  // wins there too, same as before.
  async function reconcileAccountsOnFirstContact(userId, cloudAccounts){
    const cloudById = new Map(cloudAccounts.map(a=>[a.id, a]));
    const cloudNameLower = new Set(cloudAccounts.map(a=> a.name.trim().toLowerCase()));
    const merged = [...cloudAccounts];
    accounts.forEach(a=>{
      if(cloudById.has(a.id)) return; // Same id already represented in the cloud - it wins.
      if(cloudNameLower.has(a.name.trim().toLowerCase())) return; // Same wallet, different id - cloud wins.
      merged.push(a); // Genuinely new to the cloud (no id or name match) - a real, distinct local wallet.
    });
    accounts = merged.length ? merged : defaultAccounts();
    try{ await window.storage.set('accounts', JSON.stringify(accounts)); }catch(e){ console.error(e); }
    window.trackrSync.syncUpsertAccounts(userId, accounts);
    accountsReconciledOnce[userId] = true;
    try{ await window.storage.set('accountsReconciledOnce', JSON.stringify(accountsReconciledOnce)); }catch(e){}
  }
  // One-time-per-account reconciliation for categories, same shape as
  // reconcileAccountsOnFirstContact directly above and for the same reason: categories are newer
  // than the app's other synced tables (in fact newer than accounts too), so any account logging
  // in for the first time after this table exists has local categories that were never pushed up.
  //
  // Merge rule (Issue 1c): UNION by (name, type), case-insensitive. A name already present in the
  // cloud (case-insensitively) is not duplicated - the cloud's own casing wins for that entry. A
  // local-only name (no case-insensitive match in the cloud) is genuinely new and gets added.
  // Nothing is ever deleted by this merge, on either side. There is no id-first pass the way
  // accounts has, because a category has no id of its own on the client at all - name+type (via
  // the addCategory guard's own existing case-insensitive-duplicate check) is already this app's
  // only notion of category identity, on every device, before this table ever existed.
  //
  // Also doubles as the "seed defaults for a genuinely fresh account" path (Issue 1d), with no
  // special-casing needed: `categories` in memory is ALWAYS populated by loadData() - with this
  // account's real local categories if it has ever set any, or with defaultCategories() if it
  // hasn't (a device that's never touched categories is indistinguishable, at this point, from one
  // that has only ever seen the defaults - which is exactly correct, since both cases should
  // upload defaults). When the cloud is genuinely empty (a brand-new account), the merge below
  // reduces to "every local entry is genuinely new to the cloud", so whatever's currently in
  // `categories` - real customizations or plain defaults - becomes the account's first-ever
  // server-side category list, uploaded once, right here. The defaults seeder never runs as a
  // separate step keyed off "local storage is empty", the exact shape of the original bug -
  // it runs (indirectly, as this merge's natural outcome) only when the ACCOUNT genuinely has
  // nothing server-side yet.
  async function reconcileCategoriesOnFirstContact(userId, cloudCategories, cloudCategoryMeta){
    const cloudIncomeLower = new Set(cloudCategories.income.map(n=> n.trim().toLowerCase()));
    const cloudExpenseLower = new Set(cloudCategories.expense.map(n=> n.trim().toLowerCase()));
    const mergedIncome = [...cloudCategories.income];
    const mergedExpense = [...cloudCategories.expense];
    categories.income.forEach(name=>{ if(!cloudIncomeLower.has(name.trim().toLowerCase())) mergedIncome.push(name); });
    categories.expense.forEach(name=>{ if(!cloudExpenseLower.has(name.trim().toLowerCase())) mergedExpense.push(name); });
    categories = { income: mergedIncome, expense: mergedExpense };
    // FIX (post-review): only this device's own '__local__' scope (pre-login/guest-mode edits, if
    // any) is eligible to fold into a fresh account's first sync - NEVER the bare shared variable,
    // which on a device previously used by a DIFFERENT account could still be holding that other
    // account's own bucket. categoryMeta is scoped per account now (see categoryMetaScopeKey's own
    // comment on why: a device that goes account A -> logout -> account B, first login ever, must
    // not let B's reconcile read A's positions/colours at all - not "usually doesn't", genuinely
    // cannot, since they live under different top-level keys). The merged result is written into
    // categoryMeta[userId] specifically, same as `categories` above conceptually becoming "this
    // account's own" - cloud values win on any key collision (mirrors how the category-NAME merge
    // above already lets the cloud's own casing win for a name it already has); local only fills in
    // keys the cloud doesn't have an opinion on yet, i.e. genuinely new local-only entries.
    const localGuestMeta = categoryMeta['__local__'] || {};
    const mergedMeta = { ...(cloudCategoryMeta||{}) };
    Object.keys(localGuestMeta).forEach(key=>{ if(!(key in mergedMeta)) mergedMeta[key] = localGuestMeta[key]; });
    categoryMeta[userId] = mergedMeta;
    // Persisted locally regardless of upload outcome below - this device's own merged view is
    // correct either way, and re-computing the same merge on a retry is what keeps a failed
    // upload's eventual retry idempotent (see the ok-gate immediately below).
    try{ await window.storage.set('categories', JSON.stringify(categories)); }catch(e){ console.error(e); }
    try{ await window.storage.set('categoryMeta', JSON.stringify(categoryMeta)); }catch(e){ console.error(e); }
    // The flag is only set on a CONFIRMED successful upsert - awaiting and checking .ok, not
    // fire-and-forget. syncUpsertCategories resolves {ok:true} regardless of whether the upload
    // was queued (offline) or permanently rejected (migration not yet applied, RLS/GRANT wrong) -
    // setting the flag on either of those would let a LATER, already-reconciled login treat an
    // empty/partial cloud as authoritative and fall back to defaultCategories() (js/app.js's other
    // branch, in attachUserAndSync), silently discarding real local data - the same shape as the
    // earlier wallet-reseed bug. Leaving the flag unset on failure means the next contact simply
    // retries this same merge - safe and idempotent, since `categories` in memory/local storage
    // already reflects the merged result computed above, so a retry re-attempts the same upload
    // rather than re-deriving a different merge (categoryMeta[userId] is likewise recomputed the
    // same way each retry, purely from cloudCategoryMeta + '__local__', so it reproduces
    // identically rather than drifting).
    const result = await window.trackrSync.syncUpsertCategories(userId, categories, categoryMeta[userId]);
    if(result && result.ok){
      categoriesReconciledOnce[userId] = true;
      try{ await window.storage.set('categoriesReconciledOnce', JSON.stringify(categoriesReconciledOnce)); }catch(e){}
    }
  }

  function renderMoreSubState(name){
    document.getElementById('more-menu').classList.remove('active');
    document.querySelectorAll('.more-sub').forEach(el=> el.classList.remove('active'));
    const target = document.getElementById('more-sub-'+name);
    if(target) target.classList.add('active');
  }
  function renderMoreMenuState(){
    document.getElementById('more-menu').classList.add('active');
    document.querySelectorAll('.more-sub').forEach(el=> el.classList.remove('active'));
  }
  function showMoreSub(name){
    renderMoreSubState(name);
    pushNavState('more', name);
  }
  function backToMoreMenu(){
    // The on-screen Back button always mirrors a real swipe/back-gesture navigation,
    // so the browser history stack and the visible screen never fall out of sync.
    history.back();
  }

  function collectAlerts(){
    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthExpense = transactions.filter(t=>t.type==='expense' && t.date.startsWith(monthPrefix));
    const spentMap = {}; monthExpense.forEach(t=> spentMap[t.category]=(spentMap[t.category]||0)+t.amount);
    // Keyed by category+month, not just category - dismissing this month's overage must not
    // suppress a genuinely new one if the same category goes over budget again in a future
    // month. collectAlerts only ever looks at the CURRENT month's spend to begin with, so the
    // month is already the natural period boundary; keying dismissal to match just reuses it.
    const overBudget = Object.keys(budgets)
      .filter(cat=> budgets[cat]>0 && (spentMap[cat]||0) > budgets[cat])
      .map(cat=> ({ category: cat, spent: spentMap[cat]||0, limit: budgets[cat], key: `${cat}:${monthPrefix}` }))
      .filter(b=> !settings.dismissedBudgetAlerts || !settings.dismissedBudgetAlerts[b.key]);
    const overdueDebts = debts.filter(d=> debtRemaining(d) > 0.004 && debtOverdueCount(d) > 0);
    const dueReminders = reminders.map(r=> ({ r, status: reminderStatus(r, Math.max(3, r.remindDaysBefore||0)) })).filter(x=>x.status);
    const dueRecurring = recurring.map(r=> ({ r, status: recurringDueStatus(r) })).filter(x=>x.status);
    return { overBudget, overdueDebts, dueReminders, dueRecurring };
  }
  function updateBellBadge(){
    const alerts = collectAlerts();
    const totalAlerts = alerts.overBudget.length + alerts.overdueDebts.length + alerts.dueReminders.length + alerts.dueRecurring.length;
    const badge = document.getElementById('bell-badge');
    if(totalAlerts>0){ badge.style.display='flex'; badge.textContent = totalAlerts>9?'9+':String(totalAlerts); }
    else { badge.style.display='none'; }
  }

  function refreshAll(){
    renderHomeBalance();
    renderNetWorth();
    renderAllRings();
    renderHomeActivity();
    renderHomeCatGrid();
    renderAccountsHome();
    renderAccountsList();
    renderInsightBanner();
    renderBudgetWatchInsights();
    renderDebtSummaryInsights();
    renderReceivableSummaryInsights();
    renderDebtOverview();
    renderGoalsSummaryInsights();
    renderGoalsOverview();
    renderGoalsList();
    renderRemindersUpcoming();
    renderRecurringDueCard();
    renderUpcomingCashFlow();
    renderTrendChart();
    renderReports();
    renderHistory();
    renderBudgetSetList();
    renderDebtsList();
    renderRemindersList();
    renderRecurringChips();
    renderAddTodayList();
    renderLastBackupNote();
    renderBackupNag();
    updateBellBadge();
    maybeFireDueNotifications();
    renderDesktopExtras();
  }

  // Desktop-only (>=781px, matching the .spine/.bottom-nav breakpoint): mirrors the debt/receivable
  // overview cards onto Home, and mounts the same Add Debt/Add Receivable form + a compact debts and
  // receivables list on Add Entry's now-empty right-hand column. Mobile is untouched — see applyDesktopLayout.
  function renderDesktopExtras(){
    if(!isDesktop) return;
    renderDebtOverviewInto('homedebt', debts);
    renderDebtOverviewInto('homereceivable', receivables);
    renderDebtsListInto('addentry-debts-list', debts, false);
    renderDebtsListInto('addentry-receivables-list', receivables, true);

    const activeDebts = debts.filter(d=> debtRemaining(d) > 0.004);
    const activeReceivables = receivables.filter(d=> debtRemaining(d) > 0.004);
    const homeDebtListCard = document.getElementById('homedebt-list-card');
    const homeReceivableListCard = document.getElementById('homereceivable-list-card');
    if(homeDebtListCard) homeDebtListCard.style.display = activeDebts.length ? 'block' : 'none';
    if(homeReceivableListCard) homeReceivableListCard.style.display = activeReceivables.length ? 'block' : 'none';
    renderDebtsListInto('homedebt-list', activeDebts, false);
    renderDebtsListInto('homereceivable-list', activeReceivables, true);
  }

  function applyDesktopLayout(){
    isDesktop = desktopMql.matches;
    const homeExtra = document.getElementById('home-desktop-extra');
    const addSide = document.getElementById('add-entry-side');
    const showAddDebtBtn = document.getElementById('show-add-debt-btn');
    const movedHint = document.getElementById('debt-form-moved-hint');
    const form = document.getElementById('add-debt-form');
    if(isDesktop){
      if(homeExtra) homeExtra.style.display = 'block';
      if(addSide) addSide.style.display = 'block';
      if(showAddDebtBtn) showAddDebtBtn.style.display = 'none';
      if(movedHint) movedHint.style.display = 'block';
      const slot = document.getElementById('add-debt-form-slot');
      if(form && slot) slot.appendChild(form);
    } else {
      if(homeExtra) homeExtra.style.display = 'none';
      if(addSide) addSide.style.display = 'none';
      if(showAddDebtBtn) showAddDebtBtn.style.display = '';
      if(movedHint) movedHint.style.display = 'none';
      const anchor = document.getElementById('add-debt-form-home-anchor');
      if(form && anchor) anchor.parentElement.insertBefore(form, anchor.nextSibling);
    }
    renderDesktopExtras();
  }

  function applyTheme(theme){
    if(theme==='sunset' || theme==='mounty' || theme==='reddy') theme = 'crimson';
    // Sun Light was removed entirely and replaced by Purply, which occupies the same light-theme
    // picker slot - a device with "sunlight" already saved (from before this round) redirects to
    // "purply" every time, same mechanism as the sunset/mounty/reddy -> crimson migration above.
    if(theme==='sunlight') theme = 'purply';
    // Purply itself was later retired and replaced by Webline in the same picker slot - a device
    // with "purply" already saved redirects to "light" (purply was a light theme, the closest
    // match of the three survivors), same one-time-redirect mechanism as both migrations above.
    // This alone only fixes the in-memory value for THIS call; see loadData() for the persisted,
    // before-first-paint half of this migration, which is what stops a purply device from ever
    // re-derailing through this same redirect on every subsequent load.
    if(theme==='purply') theme = 'light';
    // Webline (the pixel-console theme, v48-v50) was retired in turn and replaced by Black in the
    // same picker slot - a device with "webline" already saved redirects to "black" (both are
    // dark themes, the closest match), same one-time-redirect mechanism as every migration above.
    // Unlike Webline, Black is a plain CSS palette with no lazy-loaded module/stylesheet and no
    // mount()/unmount() side effects to reverse - there is deliberately no "deactivateBlack()" or
    // "activateBlack()" here, just the data-theme attribute below, same as Light/Dark/Crimson.
    if(theme==='webline') theme = 'black';
    document.body.setAttribute('data-theme', theme);
    // Mirrored onto <html> too, not just <body> - see the html{background} rule in styles.css:
    // a CSS custom property redefined on body[data-theme=X] only cascades to body's own
    // descendants, never to html (body's ANCESTOR, which doesn't inherit from what's below it).
    // Without this, any real horizontal overflow anywhere in the app - a native control
    // rendering wider than its flex container on a specific mobile browser, the kind of bug
    // that's recurred multiple times in this project - shows the WRONG (or no) background in the
    // exposed strip regardless of which fix closes the overflow itself this time.
    document.documentElement.setAttribute('data-theme', theme);
    const buttons = document.querySelectorAll('#theme-select [data-theme-choice]');
    buttons.forEach(b=> b.classList.toggle('active', b.getAttribute('data-theme-choice')===theme));
  }

  /* ---------- Privacy: Hide Balances ---------- */
  let balancesRevealed = false;
  let hideBalancesTimer = null;
  function maskAmount(str){
    const m = String(str).match(/^(-?[^0-9]*)/);
    const prefix = m ? m[1] : '';
    return prefix + '••••';
  }
  function updateBalanceRevealUI(){
    const btn = document.getElementById('balance-reveal-btn');
    if(!btn) return;
    btn.style.display = settings.hideBalances ? 'flex' : 'none';
    btn.innerHTML = balancesRevealed ? icon('eyeOff', 14) : icon('eye', 14);
    btn.title = balancesRevealed ? 'Hide balances' : 'Show balances';
    btn.setAttribute('aria-label', btn.title);
  }
  function toggleBalanceReveal(){
    if(!settings.hideBalances) return;
    balancesRevealed = !balancesRevealed;
    updateBalanceRevealUI();
    renderHomeBalance(); renderNetWorth();
    resetHideBalancesTimer();
  }
  function resetHideBalancesTimer(){
    if(hideBalancesTimer){ clearTimeout(hideBalancesTimer); hideBalancesTimer = null; }
    if(settings.hideBalances && balancesRevealed){
      const mins = settings.hideBalancesTimeoutMin || 5;
      hideBalancesTimer = setTimeout(()=>{
        balancesRevealed = false;
        updateBalanceRevealUI();
        renderHomeBalance(); renderNetWorth();
      }, mins*60000);
    }
  }
  function syncNetWorthToggleUI(){
    const toggle = document.getElementById('show-networth-toggle');
    if(!toggle) return;
    const on = settings.showNetWorth!==false;
    toggle.classList.toggle('on', on);
    toggle.setAttribute('aria-checked', on);
  }
  function syncHideBalancesUI(){
    const toggle = document.getElementById('hide-balances-toggle');
    const row = document.getElementById('hide-balances-timeout-row');
    const select = document.getElementById('hide-balances-timeout');
    if(!toggle) return;
    toggle.classList.toggle('on', !!settings.hideBalances);
    toggle.setAttribute('aria-checked', !!settings.hideBalances);
    if(row) row.style.display = settings.hideBalances ? 'flex' : 'none';
    if(select) select.value = String(settings.hideBalancesTimeoutMin || 5);
    updateBalanceRevealUI();
  }

  /* ---------- Cloud auth (Supabase) ---------- */
  let currentUser = null;
  let authMode = 'login';
  let appStarted = false;
  let unsyncableToastShownThisLaunch = false;
  // The code-based password reset signs out of its recovery session in the same page load it
  // was established in (no link, no navigation - onAuthStateChange is already listening the
  // whole time, unlike the old link flow which returned before ever registering it). Without
  // this guard, that deliberate sign-out would hit the SIGNED_OUT handler below and reload the
  // page, wiping the "password updated" screen before it ever showed.
  let suppressNextSignedOutReload = false;
  let pendingConfirmEmail = null;
  let resendCooldownUntil = 0;
  let resendCooldownTimer = null;

  // The login gate has no other content behind it to protect against once its hit-testing
  // is confirmed solid (z-index 4000 vs the bottom-nav's 50 - clicks at the nav's screen
  // position land on the overlay, not the nav, confirmed directly). But mobile browsers can
  // still transiently reveal fixed-position content underneath a scrollable page during their
  // own toolbar-collapse animation on scroll - locking body scroll entirely while any
  // full-screen gate is up removes the scroll gesture that triggers that in the first place,
  // rather than relying on the animation always landing in a correct end state.
  function lockBodyScroll(){
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  function unlockBodyScroll(){
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  const AUTH_VIEW_IDS = ['auth-form-view','auth-checkinbox-view','auth-confirmed-view','auth-forgot-view','auth-forgot-code-view','auth-reset-password-view','auth-reset-done-view'];
  function showOnlyAuthView(id){
    // animateIn() only actually plays the fade the first time (opening from fully closed) -
    // it's a no-op if the overlay is already open, so moving between login/forgot/code/done
    // while it stays open doesn't re-trigger the outer fade. The inner view's own entrance
    // (.auth-view's animation) needs reTriggerFade() explicitly - a plain display:none -> flex
    // toggle does NOT restart a CSS animation on its own when the animation-name was already
    // sitting on the element via a class that's never added/removed (confirmed by testing this
    // directly: 0 animationstart events fired without the explicit retrigger below).
    animateIn(document.getElementById('auth-overlay'), 'flex');
    AUTH_VIEW_IDS.forEach(v=>{ document.getElementById(v).style.display = (v===id) ? 'flex' : 'none'; });
    reTriggerFade(document.getElementById(id));
    lockBodyScroll();
  }
  function showAuthFormView(){
    showOnlyAuthView('auth-form-view');
  }
  function showAuthCheckInboxView(email){
    showOnlyAuthView('auth-checkinbox-view');
    document.getElementById('auth-checkinbox-email').textContent = email;
    document.getElementById('auth-signupcode-input').value = '';
    document.getElementById('auth-signupcode-error').style.display = 'none';
    pendingConfirmEmail = email;
    resendCooldownUntil = 0;
    updateResendButtonState();
  }
  function showAuthConfirmedView(){
    showOnlyAuthView('auth-confirmed-view');
  }
  function showAuthForgotView(){
    document.getElementById('auth-forgot-error').style.display = 'none';
    const loginEmail = document.getElementById('auth-email').value.trim();
    if(loginEmail) document.getElementById('auth-forgot-email').value = loginEmail;
    showOnlyAuthView('auth-forgot-view');
  }
  let pendingForgotPasswordEmail = null;
  let forgotCodeResendCooldownUntil = 0;
  let forgotCodeResendTimer = null;
  function showAuthForgotCodeView(email){
    document.getElementById('auth-forgot-code-email').textContent = email;
    document.getElementById('auth-forgot-code-error').style.display = 'none';
    document.getElementById('auth-forgot-code-input').value = '';
    pendingForgotPasswordEmail = email;
    forgotCodeResendCooldownUntil = 0;
    updateForgotCodeResendButtonState();
    showOnlyAuthView('auth-forgot-code-view');
  }
  function updateForgotCodeResendButtonState(){
    const btn = document.getElementById('auth-forgot-code-resend-btn');
    const note = document.getElementById('auth-forgot-code-resend-note');
    const remaining = Math.ceil((forgotCodeResendCooldownUntil - Date.now())/1000);
    if(remaining > 0){
      btn.disabled = true;
      note.style.display = 'block';
      note.textContent = `You can resend in ${remaining}s.`;
    } else {
      btn.disabled = false;
      note.style.display = 'none';
    }
  }
  async function handleResendForgotCode(){
    if(!pendingForgotPasswordEmail || Date.now() < forgotCodeResendCooldownUntil) return;
    const note = document.getElementById('auth-forgot-code-resend-note');
    document.getElementById('auth-forgot-code-resend-btn').disabled = true;
    try{
      const { error } = await window.trackrSync.client.auth.resetPasswordForEmail(pendingForgotPasswordEmail, {
        redirectTo: location.origin + location.pathname
      });
      if(error){
        note.style.display = 'block'; note.textContent = 'Could not resend — try again shortly.';
        updateForgotCodeResendButtonState();
        return;
      }
    }catch(e){
      note.style.display = 'block'; note.textContent = 'Could not resend — check your connection.';
      updateForgotCodeResendButtonState();
      return;
    }
    forgotCodeResendCooldownUntil = Date.now() + 30000;
    if(forgotCodeResendTimer) clearInterval(forgotCodeResendTimer);
    forgotCodeResendTimer = setInterval(()=>{
      updateForgotCodeResendButtonState();
      if(Date.now() >= forgotCodeResendCooldownUntil){ clearInterval(forgotCodeResendTimer); forgotCodeResendTimer = null; }
    }, 1000);
    updateForgotCodeResendButtonState();
  }
  function showAuthResetPasswordView(){
    document.getElementById('auth-reset-password-error').style.display = 'none';
    showOnlyAuthView('auth-reset-password-view');
  }
  function showAuthResetDoneView(){
    showOnlyAuthView('auth-reset-done-view');
  }
  function showAuthOverlay(mode){
    authMode = mode || 'login';
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleBtn = document.getElementById('auth-toggle-mode-btn');
    document.getElementById('auth-error').style.display = 'none';
    document.getElementById('auth-info').style.display = 'none';
    if(authMode==='signup'){
      title.textContent = 'Sign Up';
      subtitle.textContent = 'Create an account to back up and sync your data across devices.';
      submitBtn.textContent = 'Sign Up';
      toggleBtn.textContent = 'Already have an account? Log in';
      document.getElementById('auth-forgot-password-btn').style.display = 'none';
    } else {
      title.textContent = 'Log In';
      subtitle.textContent = 'Log in to back up and sync your data across devices.';
      submitBtn.textContent = 'Log In';
      toggleBtn.textContent = "Don't have an account? Sign up";
      document.getElementById('auth-forgot-password-btn').style.display = '';
    }
    showAuthFormView();
  }
  function hideAuthOverlay(){
    animateOut(document.getElementById('auth-overlay'));
    unlockBodyScroll();
  }
  function showAuthError(msg){
    const err = document.getElementById('auth-error');
    err.textContent = msg; err.style.display = 'block';
    document.getElementById('auth-info').style.display = 'none';
  }
  function showAuthInfo(msg){
    const info = document.getElementById('auth-info');
    info.textContent = msg; info.style.display = 'block';
    document.getElementById('auth-error').style.display = 'none';
  }
  // Supabase returns generic PostgrestError-style messages — map the ones users
  // actually hit to distinct, actionable copy instead of one generic error for all of them.
  function authErrorMessage(error, context){
    const rawMsg = error && error.message;
    const msg = (rawMsg || '').toLowerCase();
    if(context==='signup' && msg.includes('already registered')) return 'This email is already registered — log in instead.';
    if(context==='signup' && (msg.includes('rate limit') || msg.includes('too many'))) return 'Too many attempts — please wait a minute and try again.';
    if(context==='login' && msg.includes('email not confirmed')) return 'Please confirm your email before logging in.';
    if(context==='login' && msg.includes('invalid login credentials')) return 'Incorrect email or password.';
    // Guard against a message that isn't actually human-readable — a malformed response from an
    // edge function, a proxy, or a misconfigured SMTP provider can leave a Supabase AuthError with
    // no .message at all, or with .message set to little more than a stringified empty response
    // body ("{}", "[object Object]"). Falling through to error.message unconditionally in that
    // case is exactly what showed a literal "{}" to a real sign-up attempt instead of any
    // actionable text.
    const isReadable = rawMsg && rawMsg.trim() && !/^[{\[]/.test(rawMsg.trim()) && rawMsg.trim().toLowerCase() !== '[object object]';
    if(isReadable) return rawMsg;
    return context==='signup' ? 'Something went wrong creating your account. Please try again in a moment.' : 'Something went wrong. Please try again.';
  }
  function updateResendButtonState(){
    const btn = document.getElementById('auth-resend-btn');
    const note = document.getElementById('auth-resend-note');
    const remaining = Math.ceil((resendCooldownUntil - Date.now())/1000);
    if(remaining > 0){
      btn.disabled = true;
      note.style.display = 'block';
      note.textContent = `You can resend in ${remaining}s.`;
    } else {
      btn.disabled = false;
      note.style.display = 'none';
    }
  }
  async function handleResendConfirmation(){
    if(!pendingConfirmEmail || Date.now() < resendCooldownUntil) return;
    const note = document.getElementById('auth-resend-note');
    document.getElementById('auth-resend-btn').disabled = true;
    try{
      const { error } = await window.trackrSync.client.auth.resend({ type:'signup', email: pendingConfirmEmail });
      if(error){
        diagLogPage('auth:signup-resend-failed', { code: error.code, status: error.status, message: error.message });
        // Supabase enforces its own 60s-per-user minimum interval on resend regardless of the
        // 30s cooldown this button already applies locally (e.g. after a page reload resets the
        // local timer but the server-side window hasn't elapsed yet) - that specific rejection
        // reads as an ordinary readable message already (not JSON-shaped), so authErrorMessage's
        // is-it-readable check passes it straight through rather than falling back to something
        // generic and less actionable.
        note.style.display = 'block'; note.textContent = authErrorMessage(error, 'signup');
        updateResendButtonState();
        return;
      }
    }catch(e){
      diagLogPage('auth:signup-resend-threw', e && e.message);
      note.style.display = 'block'; note.textContent = 'Could not resend — check your connection.';
      updateResendButtonState();
      return;
    }
    resendCooldownUntil = Date.now() + 30000;
    if(resendCooldownTimer) clearInterval(resendCooldownTimer);
    resendCooldownTimer = setInterval(()=>{
      updateResendButtonState();
      if(Date.now() >= resendCooldownUntil){ clearInterval(resendCooldownTimer); resendCooldownTimer = null; }
    }, 1000);
    updateResendButtonState();
  }
  // Redeems the code from the signup confirmation email directly, exactly like
  // handleForgotCodeSubmit does for password recovery - verifyOtp() with type:'signup' (not
  // 'email', not 'recovery') both confirms the account AND returns a live session in one step, so
  // the user lands straight in the app rather than being sent back to re-enter credentials on the
  // login form. Accepts 6-10 digits rather than a hardcoded 8, matching handleForgotCodeSubmit's
  // own reasoning - this project's Email OTP length is currently configured to 8, but that's a
  // Supabase project setting this app doesn't control and has already been wrong once before.
  async function handleSignupCodeSubmit(e){
    e.preventDefault();
    const code = document.getElementById('auth-signupcode-input').value.trim();
    const errEl = document.getElementById('auth-signupcode-error');
    if(!/^[0-9]{6,10}$/.test(code)){ errEl.textContent = 'Enter the 8-digit code from your email.'; errEl.style.display = 'block'; return; }
    if(!pendingConfirmEmail){ errEl.textContent = 'Something went wrong — go back and sign up again.'; errEl.style.display = 'block'; return; }
    const submitBtn = document.getElementById('auth-signupcode-submit-btn');
    submitBtn.disabled = true;
    errEl.style.display = 'none';
    try{
      const { data, error } = await window.trackrSync.client.auth.verifyOtp({
        email: pendingConfirmEmail, token: code, type: 'signup'
      });
      if(error){
        diagLogPage('auth:signup-verify-failed', { code: error.code, status: error.status, message: error.message });
        errEl.textContent = authErrorMessage(error, 'signup'); errEl.style.display = 'block';
        return;
      }
      diagLogPage('auth:signup-verify-succeeded', {});
      await startAppForUser(data.session.user);
    }catch(e){
      diagLogPage('auth:signup-verify-threw', e && e.message);
      errEl.textContent = 'Something went wrong. Check your connection and try again.'; errEl.style.display = 'block';
    }finally{
      submitBtn.disabled = false;
    }
  }
  function togglePasswordVisibility(){
    const input = document.getElementById('auth-password');
    const btn = document.getElementById('auth-password-toggle');
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.innerHTML = icon(showing ? 'eye' : 'eyeOff', 18);
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  }
  function toggleResetPasswordVisibility(){
    const input = document.getElementById('auth-reset-password');
    const btn = document.getElementById('auth-reset-password-toggle');
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.innerHTML = icon(showing ? 'eye' : 'eyeOff', 18);
    btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  }
  async function handleForgotPasswordSubmit(e){
    e.preventDefault();
    const email = document.getElementById('auth-forgot-email').value.trim();
    const errEl = document.getElementById('auth-forgot-error');
    if(!email){ errEl.textContent = 'Enter your email.'; errEl.style.display = 'block'; return; }
    const submitBtn = document.getElementById('auth-forgot-submit-btn');
    // The button already disabled instantly before this round - the real gap was that a
    // disabled button with unchanged text gives no sign anything is happening, so the real
    // few-second wait for Supabase to queue the email (via Resend SMTP) reads as a frozen UI
    // rather than a working one. Swap in "Sending..." the instant the tap registers, restore
    // the original label if this errors back onto the same screen (a success instead navigates
    // to the code screen, where this button no longer matters).
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try{
      const { error } = await window.trackrSync.client.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + location.pathname
      });
      // Deliberately doesn't distinguish "no account with that email" from success - confirming
      // or denying an email's existence to an unauthenticated caller is its own small leak.
      if(error){ errEl.textContent = 'Something went wrong. Check your connection and try again.'; errEl.style.display = 'block'; return; }
      showAuthForgotCodeView(email);
    }catch(e){
      errEl.textContent = 'Something went wrong. Check your connection and try again.'; errEl.style.display = 'block';
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  // Redeems the code from the reset email directly - no link, no navigation. Supabase's recovery
  // email always carries this code (the {{ .Token }} template variable) alongside the
  // confirmation link; verifyOtp() with type:'recovery' establishes exactly the same kind of
  // live "recovery" session that clicking the link would, so the rest of the flow (set a new
  // password, then sign out of the recovery session) is unchanged.
  // Deliberately not assuming a fixed digit count - a real project's actual token length turned
  // out to be 8 digits, not the 6 originally assumed here, and it isn't something this app
  // controls or can query. Accepting a range instead of hardcoding one number.
  async function handleForgotCodeSubmit(e){
    e.preventDefault();
    const code = document.getElementById('auth-forgot-code-input').value.trim();
    const errEl = document.getElementById('auth-forgot-code-error');
    if(!/^[0-9]{6,10}$/.test(code)){ errEl.textContent = 'Enter the code from your email.'; errEl.style.display = 'block'; return; }
    if(!pendingForgotPasswordEmail){ errEl.textContent = 'Something went wrong — go back and re-enter your email.'; errEl.style.display = 'block'; return; }
    const submitBtn = document.getElementById('auth-forgot-code-submit-btn');
    submitBtn.disabled = true;
    try{
      const { error } = await window.trackrSync.client.auth.verifyOtp({
        email: pendingForgotPasswordEmail, token: code, type: 'recovery'
      });
      // Log the raw Supabase error before showing the generic user-facing message - a prior
      // round shipped this exact message with no way to tell WHY a genuinely correct code was
      // rejected (wrong OTP type, expired, superseded by a resend, etc). Inspectable via
      // Profile & Backup -> View Log without needing to reproduce with devtools attached.
      if(error){
        diagLogPage('auth:verifyOtp-recovery-failed', { code: error.code, status: error.status, message: error.message });
        errEl.textContent = 'That code is incorrect or has expired.'; errEl.style.display = 'block'; return;
      }
      showAuthResetPasswordView();
    }catch(e){
      errEl.textContent = 'Something went wrong. Check your connection and try again.'; errEl.style.display = 'block';
    }finally{
      submitBtn.disabled = false;
    }
  }
  async function handleResetPasswordSubmit(e){
    e.preventDefault();
    const password = document.getElementById('auth-reset-password').value;
    const errEl = document.getElementById('auth-reset-password-error');
    if(!password || password.length<6){ errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; return; }
    const submitBtn = document.getElementById('auth-reset-password-submit-btn');
    submitBtn.disabled = true;
    try{
      const { error } = await window.trackrSync.client.auth.updateUser({ password });
      // Same unconditional error.message passthrough that showed a literal "{}" on signup once
      // already - routed through the same authErrorMessage() readability guard rather than
      // trusting Supabase's message is always human-readable.
      if(error){ errEl.textContent = authErrorMessage(error, 'login'); errEl.style.display = 'block'; return; }
      // The recovery link left a live session behind (that's how updateUser() above could act
      // on this account at all) - sign out of it deliberately, matching the rest of this auth
      // flow's pattern of never silently dropping someone into a session from an email-link
      // click, and requiring an explicit login with the credentials they just set.
      suppressNextSignedOutReload = true;
      try{ await window.trackrSync.client.auth.signOut(); }catch(e2){}
      if(history.replaceState) history.replaceState(null, '', location.pathname);
      showAuthResetDoneView();
    }catch(e){
      errEl.textContent = 'Something went wrong. Check your connection and try again.'; errEl.style.display = 'block';
    }finally{
      submitBtn.disabled = false;
    }
  }
  async function handleAuthSubmit(e){
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if(!email || !password){ showAuthError('Enter an email and password.'); return; }
    const submitBtn = document.getElementById('auth-submit-btn');
    // startAppForUser() now stays up through the full cloud pull before revealing anything (see
    // its own comment on why - avoids flashing stale/zero data), which can take a real moment -
    // this button needs to keep showing that something's happening for that whole stretch, the
    // same "Sending…"-style treatment already used for the password-reset/PIN-recovery sends.
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = authMode==='signup' ? 'Signing up…' : 'Logging in…';
    try{
      if(authMode==='signup'){
        const { data, error } = await window.trackrSync.client.auth.signUp({ email, password });
        if(error){
          diagLogPage('auth:signup-failed', { code: error.code, status: error.status, message: error.message });
          showAuthError(authErrorMessage(error, 'signup'));
          return;
        }
        if(data.session){
          diagLogPage('auth:signup-succeeded', { autoConfirmed: true });
          await startAppForUser(data.session.user);
        } else {
          diagLogPage('auth:signup-succeeded', { autoConfirmed: false });
          showAuthCheckInboxView(email);
        }
      } else {
        const { data, error } = await window.trackrSync.client.auth.signInWithPassword({ email, password });
        if(error){ showAuthError(authErrorMessage(error, 'login')); return; }
        await startAppForUser(data.session.user);
      }
    } catch(e){
      if(authMode==='signup') diagLogPage('auth:signup-threw', e && e.message);
      showAuthError('Something went wrong. Check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  // Trackr is often shared across devices/people - logging out must not leave the previous
  // account's data sitting in local storage for whoever uses the device next. But this device
  // may hold edits made offline that never reached the cloud, so clearing local data outright
  // could destroy real, unsynced work. Approach taken: flush the pending-write queue, then only
  // proceed if it's confirmed empty afterward - if anything's still queued, block the logout
  // with a message specific to *why* it's still queued, rather than guess. This is simpler to
  // reason about than "clear and hope the sync finishes in time", and never leaves local
  // storage in an ambiguous half-synced state.
  async function logOutUser(){
    let retryResult = { stuckOnNetwork: false };
    try{ retryResult = await window.trackrSync.retryPendingWrites(); }catch(e){}
    let pendingCount = -1;
    try{ pendingCount = await window.trackrSync.getPendingWriteCount(); }catch(e){}
    if(pendingCount !== 0){
      // A connectivity problem resolves itself once the device is back online - blocking here
      // is enough, no need for a destructive escape hatch. A write the server is actively
      // rejecting (bad data, a stale reference) will NEVER clear no matter how many times this
      // is retried, so that case needs a real way out, not a dead end.
      if(retryResult.stuckOnNetwork || !navigator.onLine || pendingCount < 0){
        alert("Couldn't confirm all your changes have synced to your account yet. Connect to the internet and try again before logging out, so nothing gets lost.");
        return;
      }
      let summary = { count: pendingCount, tables: [] };
      try{ summary = await window.trackrSync.getPendingWriteSummary(); }catch(e){}
      const tableList = summary.tables.length ? summary.tables.join(', ') : 'your data';
      const wantsLogoutAnyway = confirm(
        `${summary.count} change${summary.count===1?'':'s'} to ${tableList} couldn't be saved to your account, even though you're connected — the server is rejecting the write itself, not a connection issue, so retrying again won't help.\n\n` +
        `Log out anyway? Those unsaved changes will stay only on this device and won't be backed up until you log back in from it.`
      );
      if(!wantsLogoutAnyway) return;
      // Falls through to the normal logout below - the stuck queue entries are left in local
      // storage as-is (not deleted), so if this device is used again before anything overwrites
      // them, they're still there to retry.
    }
    // From here logout is definitely proceeding - cover the screen before anything below runs (see
    // coverScreenForLogout's own comment for why this can't just rely on the reload's timing).
    logHomeReveal('logout-start');
    coverScreenForLogout();
    // Clear this device's copy of the account's data before actually signing out, so there's
    // no window where the SIGNED_OUT-triggered reload (see the auth listener in init()) could
    // land mid-clear and leave some keys wiped and others not. Uses the no-sync clear (not the
    // normal saveTransactions/.../saveBudgets calls) - those have currentUser-conditional cloud
    // side effects, and logout should never touch this account's cloud data, only this device's
    // local copy of it.
    await hardClearAllLocalDataNoSync();
    try{ await window.storage.set('migrated_to_cloud', 'false'); }catch(e){}
    // accountsReconciledOnce is deliberately NOT reset here any more - see its own declaration for
    // why resetting it on every logout was the actual cause of the wallet re-seed duplicate-id
    // bug. It's scoped per-account already, so a genuinely different user logging in on this same
    // device still gets their own first-contact reconciliation without needing anything wiped.
    try{ await window.storage.set('skippedLogin', 'false'); }catch(e){}
    // signOut() firing a SIGNED_OUT event is what actually triggers the reload that uncovers the
    // screen (see the auth listener in init()) - if that never arrives (e.g. no network right at
    // this moment), the cover above would stay up forever with no way back in. This is the
    // fallback for that case only; the normal path never reaches it, since the event beats it.
    const stuckLogoutFallback = setTimeout(()=> location.reload(), 4000);
    try{ await window.trackrSync.client.auth.signOut(); }catch(e){ clearTimeout(stuckLogoutFallback); location.reload(); }
  }

  /* ---------- Privacy: App Lock (PIN) ---------- */
  let isAppLocked = false;
  let appLockTimer = null;
  let pinMode = 'unlock';
  let pendingNewPin = null;
  // Tracks *why* we're in setup-new/setup-confirm, so Cancel and the final success step
  // know whether we're enabling app lock for the first time, changing an existing PIN
  // (leave everything else alone on cancel), or forcing a reset after a recovery code
  // was accepted (fall back to disabling app lock if abandoned mid-way).
  let pinFlowContext = 'toggle-enable';
  let pinLockoutInterval = null;
  const PIN_LOCKOUT_SCHEDULE_SEC = [30, 120, 300]; // 30s, 2min, then 5min for every attempt after that
  let pinRecoveryResendCooldownUntil = 0;
  let pinRecoveryResendTimer = null;
  function hashPin(pin){
    let hash = 0;
    for(let i=0;i<pin.length;i++){ hash = (hash*31 + pin.charCodeAt(i)) >>> 0; }
    return hash.toString(16);
  }
  // Recovery works by emailing a one-time code to whichever account is currently logged in,
  // reusing the SAME resetPasswordForEmail() + verifyOtp(type:'recovery') mechanism the
  // password-reset flow already uses successfully - not a locally-generated code saved at setup
  // time. That means recovery is only possible while online and logged in; see the "Forgotten
  // your PIN?" handler below for what happens when neither is true.
  // Previously used reauthenticate() + verifyOtp(type:'reauthentication') instead, since that's
  // the mechanism Supabase documents specifically for confirming identity on an ALREADY-
  // authenticated session. In practice it produced three distinct real-device failures across
  // rounds (missing required params, then a same-shape-as-recovery call still rejected as
  // "expired or invalid") despite recovery's identical call shape working reliably every time.
  // Confirmed directly against GoTrue's own source (internal/api/verify.go,
  // internal/api/reauthenticate.go) that recovery and reauthentication share the exact same OTP
  // expiry window (config.Mailer.OtpExp) - so a shorter reauthentication-specific expiry isn't
  // the explanation either. Nothing about PIN reset actually needs reauthentication's specific
  // semantics (confirming a sensitive action on the CURRENT session) - the new PIN is set
  // entirely locally afterward, never synced - so this only ever needed the same "prove control
  // of this email inbox" proof recovery already provides. Switched to the flow that's
  // demonstrably reliable rather than keep chasing reauthentication's failures.
  function isPinLockedOut(){
    return !!(settings.pinLockoutUntil && new Date(settings.pinLockoutUntil).getTime() > Date.now());
  }
  async function registerFailedPinAttempt(){
    settings.failedPinAttempts = (settings.failedPinAttempts||0) + 1;
    if(settings.failedPinAttempts >= 5){
      const idx = Math.min(settings.failedPinAttempts - 5, PIN_LOCKOUT_SCHEDULE_SEC.length - 1);
      settings.pinLockoutUntil = new Date(Date.now() + PIN_LOCKOUT_SCHEDULE_SEC[idx]*1000).toISOString();
    }
    await saveSettings();
    updatePinAttemptsUI();
  }
  async function resetPinAttempts(){
    settings.failedPinAttempts = 0;
    settings.pinLockoutUntil = null;
    await saveSettings();
  }
  // Shares the same failed-attempt counter and lockout schedule between wrong-PIN guesses and
  // wrong recovery-code guesses (not a separate, unlimited path) - 5 combined wrong attempts
  // either way triggers the same escalating lockout.
  function updatePinAttemptsUI(){
    const attemptsEl = document.getElementById('pinlock-attempts');
    const forgotLink = document.getElementById('pinlock-forgot-link');
    const pinInput = document.getElementById('pinlock-input');
    const recoveryInput = document.getElementById('pinlock-recovery-input');
    const submitBtn = document.getElementById('pinlock-submit');
    if(pinLockoutInterval){ clearInterval(pinLockoutInterval); pinLockoutInterval = null; }
    if(pinMode!=='unlock' && pinMode!=='recover'){
      attemptsEl.style.display = 'none';
      forgotLink.style.display = 'none';
      return;
    }
    const input = pinMode==='recover' ? recoveryInput : pinInput;
    const attempts = settings.failedPinAttempts || 0;
    // Always visible on the unlock screen (not gated behind failed attempts) - matching the
    // main login screen's always-visible "Forgot password?", and so it's discoverable by
    // someone who simply doesn't remember their PIN at all, not just after guessing wrong a
    // few times. Escalated to a bordered "prominent" style during lockout, since that's the
    // moment it matters most. Only shown on the unlock screen itself, not while already inside
    // the recovery-code flow it leads to.
    forgotLink.style.display = pinMode==='unlock' ? 'inline-block' : 'none';
    forgotLink.classList.toggle('prominent', pinMode==='unlock' && isPinLockedOut());
    if(isPinLockedOut()){
      input.disabled = true; submitBtn.disabled = true;
      const tick = ()=>{
        const remaining = Math.max(0, Math.ceil((new Date(settings.pinLockoutUntil).getTime() - Date.now())/1000));
        if(remaining<=0){
          clearInterval(pinLockoutInterval); pinLockoutInterval = null;
          input.disabled = false; submitBtn.disabled = false;
          attemptsEl.style.display = 'none';
          forgotLink.classList.remove('prominent');
          input.value=''; input.focus();
        } else {
          attemptsEl.textContent = `Too many attempts. Try again in ${remaining}s.`;
          attemptsEl.style.display = 'block';
        }
      };
      tick();
      pinLockoutInterval = setInterval(tick, 1000);
    } else {
      input.disabled = false; submitBtn.disabled = false;
      if(attempts>0 && attempts<5){
        const remaining = 5 - attempts;
        attemptsEl.textContent = `${remaining} attempt${remaining===1?'':'s'} remaining.`;
        attemptsEl.style.display = 'block';
      } else {
        attemptsEl.style.display = 'none';
      }
    }
  }
  function showPinOverlay(mode){
    pinMode = mode;
    const overlay = document.getElementById('pinlock-overlay');
    const title = document.getElementById('pinlock-title');
    const subtitle = document.getElementById('pinlock-subtitle');
    const cancelBtn = document.getElementById('pinlock-cancel-setup');
    const submitBtn = document.getElementById('pinlock-submit');
    const pinInput = document.getElementById('pinlock-input');
    const recoveryInput = document.getElementById('pinlock-recovery-input');

    document.getElementById('pinlock-error').style.display = 'none';
    document.getElementById('pinlock-attempts').style.display = 'none';
    document.getElementById('pinlock-recovery-resend-wrap').style.display = mode==='recover' ? 'block' : 'none';
    pinInput.value = ''; recoveryInput.value = '';
    pinInput.disabled = false; submitBtn.disabled = false;
    submitBtn.style.display = 'inline-flex';

    if(mode==='recover'){
      pinInput.style.display = 'none';
      recoveryInput.style.display = 'block';
      title.textContent = 'Enter Your Code';
      subtitle.textContent = `We sent a code to ${currentUser ? currentUser.email : 'your account email'}. Enter it below to reset your PIN.`;
      cancelBtn.textContent = 'Back';
      cancelBtn.style.display = 'inline-flex';
      submitBtn.textContent = 'Continue';
    } else {
      pinInput.style.display = 'block';
      recoveryInput.style.display = 'none';
      cancelBtn.textContent = 'Cancel';
      if(mode==='unlock'){
        title.textContent = 'Enter PIN';
        subtitle.textContent = 'Enter your 4-digit PIN to unlock Trackr.';
        cancelBtn.style.display = 'none';
        submitBtn.textContent = 'Unlock';
      } else if(mode==='setup-new'){
        title.textContent = 'Set a PIN';
        subtitle.textContent = 'Choose a 4-digit PIN to lock Trackr. This is a local deterrent, not real security — there’s no server, so the PIN can’t be recovered by us, and it isn’t protection against someone with access to this device’s storage.';
        cancelBtn.style.display = 'inline-flex';
        submitBtn.textContent = 'Continue';
      } else if(mode==='setup-confirm'){
        title.textContent = 'Confirm PIN';
        subtitle.textContent = 'Enter the same PIN again to confirm.';
        cancelBtn.style.display = 'inline-flex';
        submitBtn.textContent = 'Confirm';
      } else if(mode==='change-verify'){
        title.textContent = 'Change PIN';
        subtitle.textContent = 'Enter your current PIN to continue.';
        cancelBtn.style.display = 'inline-flex';
        submitBtn.textContent = 'Continue';
      }
    }
    // Retriggers a fade on the title/subtitle text every mode change, whether or not the
    // overlay itself was already open (unlock -> recover -> setup-new, etc. all reuse the same
    // overlay - only the text/inputs change) - gives the step-to-step change its own visual cue
    // without needing separate view elements to swap between, unlike the auth overlay above.
    reTriggerFade(title); reTriggerFade(subtitle);
    animateIn(overlay, 'flex');
    lockBodyScroll();
    updatePinAttemptsUI();
    setTimeout(()=>{ const i = mode==='recover' ? recoveryInput : pinInput; if(i) i.focus(); }, 60);
  }
  function hidePinOverlay(){
    animateOut(document.getElementById('pinlock-overlay'));
    unlockBodyScroll();
    if(pinLockoutInterval){ clearInterval(pinLockoutInterval); pinLockoutInterval = null; }
  }
  function showPinError(msg){
    const err = document.getElementById('pinlock-error');
    err.textContent = msg; err.style.display = 'block';
    const input = pinMode==='recover' ? document.getElementById('pinlock-recovery-input') : document.getElementById('pinlock-input');
    input.value = ''; input.focus();
  }
  // Tracks when the code was actually requested, so a verify attempt can log real elapsed time
  // instead of it having to be inferred from page-load timestamps in the log - directly answers
  // "was this genuinely expired, or something else" the next time this is investigated.
  let pinRecoveryCodeSentAt = null;
  // Sends the recovery code to whichever account is currently logged in - reused for both the
  // initial send (tapping "Forgotten your PIN?") and the resend button.
  async function sendPinRecoveryCode(){
    try{
      const { error } = await window.trackrSync.client.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: location.origin + location.pathname
      });
      pinRecoveryCodeSentAt = new Date().toISOString();
      diagLogPage('auth:pin-recovery-code-sent', { at: pinRecoveryCodeSentAt, error: error ? { code: error.code, status: error.status, message: error.message } : null });
      return !error;
    }catch(e){ diagLogPage('auth:pin-recovery-send-threw', e && e.message); return false; }
  }
  function updatePinRecoveryResendButtonState(){
    const btn = document.getElementById('pinlock-recovery-resend-btn');
    const note = document.getElementById('pinlock-recovery-resend-note');
    const remaining = Math.ceil((pinRecoveryResendCooldownUntil - Date.now())/1000);
    if(remaining > 0){
      btn.disabled = true;
      note.style.display = 'block';
      note.textContent = `You can resend in ${remaining}s.`;
    } else {
      btn.disabled = false;
      note.style.display = 'none';
    }
  }
  function armPinRecoveryResendCooldown(){
    pinRecoveryResendCooldownUntil = Date.now() + 30000;
    if(pinRecoveryResendTimer) clearInterval(pinRecoveryResendTimer);
    pinRecoveryResendTimer = setInterval(()=>{
      updatePinRecoveryResendButtonState();
      if(Date.now() >= pinRecoveryResendCooldownUntil){ clearInterval(pinRecoveryResendTimer); pinRecoveryResendTimer = null; }
    }, 1000);
    updatePinRecoveryResendButtonState();
  }
  async function handleResendPinRecoveryCode(){
    if(Date.now() < pinRecoveryResendCooldownUntil) return;
    const note = document.getElementById('pinlock-recovery-resend-note');
    document.getElementById('pinlock-recovery-resend-btn').disabled = true;
    const sent = await sendPinRecoveryCode();
    if(!sent){
      note.style.display = 'block'; note.textContent = 'Could not resend — check your connection.';
      updatePinRecoveryResendButtonState();
      return;
    }
    armPinRecoveryResendCooldown();
  }
  async function handlePinSubmit(){
    if(pinMode==='recover'){
      if(isPinLockedOut()) return;
      const code = document.getElementById('pinlock-recovery-input').value.trim();
      if(!/^[0-9]{6,10}$/.test(code)){ showPinError('Enter the code from your email.'); return; }
      try{
        const verifyAttemptedAt = new Date().toISOString();
        const { error } = await window.trackrSync.client.auth.verifyOtp({ email: currentUser.email, token: code, type: 'recovery' });
        // Logs real elapsed time between the code being sent and this verify attempt, requested
        // specifically so a future "expired" report is checkable against the actual timestamps
        // rather than inferred from page-load timing.
        const elapsedSec = pinRecoveryCodeSentAt ? Math.round((new Date(verifyAttemptedAt) - new Date(pinRecoveryCodeSentAt))/1000) : null;
        if(!error){
          // Symmetric with auth:pin-recovery-code-sent above - previously only the send step
          // was logged, so confirming a real success required a screenshot rather than a log
          // entry. Same timestamps as the failure branch below, for the same reason.
          diagLogPage('auth:pin-recovery-verify-succeeded', { sentAt: pinRecoveryCodeSentAt, verifyAttemptedAt, elapsedSec });
          await resetPinAttempts();
          pinFlowContext = 'recovery-reset';
          showPinOverlay('setup-new');
        } else {
          // Same raw-error capture as the password-reset code path above - whatever Supabase
          // actually says lands in Profile & Backup -> View Log instead of only ever showing
          // the generic copy.
          diagLogPage('auth:verifyOtp-pin-recovery-failed', { code: error.code, status: error.status, message: error.message, sentAt: pinRecoveryCodeSentAt, verifyAttemptedAt, elapsedSec });
          await registerFailedPinAttempt();
          showPinError('That code is incorrect or has expired.');
        }
      }catch(e){
        showPinError('Something went wrong. Check your connection and try again.');
      }
      return;
    }
    const val = document.getElementById('pinlock-input').value.trim();
    if(!/^[0-9]{4}$/.test(val)){ showPinError('Enter a 4-digit PIN.'); return; }
    if(pinMode==='unlock'){
      if(isPinLockedOut()) return;
      if(hashPin(val) === settings.appLockPin){
        await resetPinAttempts();
        isAppLocked = false;
        hidePinOverlay();
        resetAppLockTimer();
      } else {
        await registerFailedPinAttempt();
        showPinError('Incorrect PIN.');
      }
    } else if(pinMode==='change-verify'){
      if(hashPin(val) === settings.appLockPin){
        showPinOverlay('setup-new');
      } else {
        showPinError('Incorrect current PIN.');
      }
    } else if(pinMode==='setup-new'){
      pendingNewPin = val;
      showPinOverlay('setup-confirm');
    } else if(pinMode==='setup-confirm'){
      if(val === pendingNewPin){
        settings.appLockPin = hashPin(val);
        settings.appLockEnabled = true;
        await resetPinAttempts();
        await saveSettings();
        pendingNewPin = null;
        syncAppLockUI();
        // Recovery-reset reaches this branch while isAppLocked is still true (set by the
        // lockApp() call that put up the overlay in the first place) - left uncleared,
        // lockApp() would silently no-op on every future background/reopen (it early-returns
        // when it already thinks it's locked), permanently disabling re-locking for the rest
        // of the session. Harmless to clear here even for the toggle-enable/change-PIN
        // contexts, where it's already false.
        isAppLocked = false;
        resetAppLockTimer();
        hidePinOverlay();
        showAppToast(pinFlowContext==='recovery-reset' ? 'PIN reset — you\'re back in' : 'PIN saved', 'info');
      } else {
        pendingNewPin = null;
        showPinOverlay('setup-new');
        showPinError("PINs didn't match — try again.");
      }
    }
  }
  function lockApp(){
    if(!settings.appLockEnabled || !settings.appLockPin) return;
    if(isAppLocked) return;
    isAppLocked = true;
    showPinOverlay('unlock');
  }
  function resetAppLockTimer(){
    if(appLockTimer){ clearTimeout(appLockTimer); appLockTimer = null; }
    if(settings.appLockEnabled && !isAppLocked){
      const mins = settings.appLockTimeoutMin || 5;
      appLockTimer = setTimeout(()=> lockApp(), mins*60000);
    }
  }
  function syncAppLockUI(){
    const toggle = document.getElementById('app-lock-toggle');
    const row = document.getElementById('app-lock-timeout-row');
    const select = document.getElementById('app-lock-timeout');
    const changeBtn = document.getElementById('change-pin-btn');
    if(!toggle) return;
    toggle.classList.toggle('on', !!settings.appLockEnabled);
    toggle.setAttribute('aria-checked', !!settings.appLockEnabled);
    if(row) row.style.display = settings.appLockEnabled ? 'flex' : 'none';
    if(select) select.value = String(settings.appLockTimeoutMin || 5);
    if(changeBtn) changeBtn.style.display = settings.appLockEnabled ? 'inline-flex' : 'none';
  }

  // Keyed by the SUPABASE table name (matches op.table in js/supabase.js's rejected-records
  // store) - debts and receivables share one server-side table (split by direction), so both
  // local arrays are searched under the single 'debts' key. `markDeleted`, where present,
  // registers the id in the same recentlyDeleted*Ids set deleteTransaction()/deleteDebt() use -
  // transactions/debts/receivables persist via a disk-merge-by-id (saveTransactions() etc),
  // which would otherwise silently resurrect a just-removed record from the still-on-disk copy
  // the moment save runs. goals persists with a direct overwrite, no such set exists or is
  // needed.
  const REJECTABLE_TABLES = {
    transactions: { lists: ()=>[['transactions',transactions]], save: ()=>saveTransactions(), markDeleted: id=>recentlyDeletedTxIds.add(id), label: t=> `${t.category} · ${fmt(t.amount)} · ${formatHuman(t.date)}${t.note?' — '+t.note:''}` },
    debts: { lists: ()=>[['debts',debts],['receivables',receivables]], save: ()=>Promise.all([saveDebts(),saveReceivables()]), markDeleted: (id,listName)=> (listName==='receivables' ? recentlyDeletedReceivableIds : recentlyDeletedDebtIds).add(id), label: d=> `${d.name}` },
    goals: { lists: ()=>[['goals',goals]], save: ()=>saveGoals(), label: g=> `${g.name} (goal)` },
    accounts: { lists: ()=>[['accounts',accounts]], save: ()=>saveAccounts(), label: a=> `${a.name} (wallet)` }
  };
  // Cross-references the ids Supabase has permanently refused - an RLS violation (the row
  // belongs to a different account, most likely surviving a cross-account Restore Backup from
  // before ids were regenerated on restore), a permissions/policy misconfiguration (an entirely
  // different, operator-fixable thing that happens to raise the same 42501 code as the above -
  // see reasonFor() in runIntegrityCheck for how those two are told apart), a foreign-key
  // violation, a cardinality violation from a duplicate id (21000 - see dedupeAccountsById and
  // reconcileAccountsOnFirstContact for why that could happen at all), or any other error Postgrest
  // actually returned a response for (see runOp's PERMANENT_FAILURE_CODES comment in
  // js/supabase.js for why every one of those, not just the two originally-named codes, ends up
  // recorded here instead of silently retried forever) - against what's still actually sitting in
  // local storage right now, so a record already cleared some other way doesn't show up as a
  // stale false positive here. Always retries each marked id first (see
  // retryPermanentlyRejectedOnce) - a marker is never trusted as still-accurate on its own, since
  // the server-side cause it recorded may since have been fixed.
  // Supplied to retryPermanentlyRejectedDeletesOnce (js/supabase.js) as its cheap, no-network
  // first guard against firing a queued delete against a row that's since been re-created under
  // the same key - most concretely defaultAccounts()'s fixed acc_cash/acc_bank/acc_card ids,
  // reseeded on every logout, but written generically for every synced table's actual key shape.
  function localRecordExistsForDelete(table, match){
    if(table==='accounts') return accounts.some(a=>a.id===match.id);
    if(table==='transactions') return transactions.some(t=>t.id===match.id);
    if(table==='debts') return debts.some(d=>d.id===match.id) || receivables.some(d=>d.id===match.id);
    if(table==='goals') return goals.some(g=>g.id===match.id);
    if(table==='budgets') return Object.prototype.hasOwnProperty.call(budgets||{}, match.category);
    if(table==='dismissed_duplicates'){
      const bucket = duplicateDismissals[duplicateDismissalScopeKey()];
      return !!(bucket && bucket[match.group_key]);
    }
    if(table==='categories'){
      const list = match.type==='credit' ? categories.income : categories.expense;
      return list.includes(match.name);
    }
    return false;
  }
  async function findUnsyncableRecords(){
    if(currentUser){
      await retryPermanentlyRejectedOnce();
      await retryPermanentlyRejectedDismissalsOnce();
      await retryPermanentlyRejectedCategoriesOnce();
      if(window.trackrSync.retryPermanentlyRejectedDeletesOnce) await window.trackrSync.retryPermanentlyRejectedDeletesOnce(localRecordExistsForDelete);
    }
    const store = (window.trackrSync.getPermanentlyRejectedRecords ? await window.trackrSync.getPermanentlyRejectedRecords() : {}) || {};
    const found = [];
    Object.keys(REJECTABLE_TABLES).forEach(table=>{
      const entries = Array.isArray(store[table]) ? store[table] : [];
      const lists = REJECTABLE_TABLES[table].lists();
      entries.forEach(entry=>{
        for(const [listName, list] of lists){
          const record = list.find(r=>r.id===entry.id);
          if(record){ found.push({ table, listName, id: entry.id, record, code: entry.code, message: entry.message }); break; }
        }
      });
    });
    return found;
  }
  // Re-attempts the write for every record still marked permanently unsyncable, on the actual
  // current local copy of that record (not whatever it looked like when first rejected) - if the
  // server accepts it now, the marker clears itself silently, with no toast or dialog, exactly
  // like any other successful background sync. This is what makes a record able to recover once
  // its real cause (a missing GRANT, a corrected RLS policy) is fixed operator-side, instead of
  // staying flagged forever just because it was rejected once. Safe to call often - a record with
  // nothing marked against it costs nothing here, and one still genuinely rejected just gets its
  // stored reason refreshed (see recordPermanentlyRejected's upsert-by-id behavior).
  let retryPermanentlyRejectedInFlight = null;
  async function retryPermanentlyRejectedOnce(){
    if(!currentUser || !navigator.onLine) return;
    if(retryPermanentlyRejectedInFlight) return retryPermanentlyRejectedInFlight;
    retryPermanentlyRejectedInFlight = (async ()=>{
      try{
        const store = (window.trackrSync.getPermanentlyRejectedRecords ? await window.trackrSync.getPermanentlyRejectedRecords() : {}) || {};
        for(const table of Object.keys(REJECTABLE_TABLES)){
          const entries = Array.isArray(store[table]) ? store[table] : [];
          if(!entries.length) continue;
          const lists = REJECTABLE_TABLES[table].lists();
          for(const entry of entries){
            let record = null, listName = null;
            for(const [ln, list] of lists){
              const r = list.find(x=>x.id===entry.id);
              if(r){ record = r; listName = ln; break; }
            }
            if(!record){
              // No longer exists locally under any list for this table (deleted some other way
              // since) - nothing left to retry, so the marker is just dead weight now.
              if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord(table, entry.id);
              continue;
            }
            const result = await window.trackrSync.retryPermanentWrite(table, listName, record, currentUser.id);
            if(result && result.ok){
              diagLogPage('page:permanently-rejected-recovered', { table, id: entry.id });
              if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord(table, entry.id);
            }
          }
        }
      }catch(e){}
    })();
    try{ await retryPermanentlyRejectedInFlight; } finally { retryPermanentlyRejectedInFlight = null; }
  }
  // Companion to retryPermanentlyRejectedOnce above, for dismissed_duplicates specifically - that
  // table doesn't fit REJECTABLE_TABLES' shape (there's no local array of {id,...} records to look
  // a dismissal up in; its "record" is just a boolean flag keyed by group_key in
  // duplicateDismissals). Confirmed missing in production: a "Keep both" made while the table
  // didn't exist yet (PGRST205) got attempted once, recorded as permanently rejected, and then
  // NEVER retried, since nothing was ever looking at the 'dismissed_duplicates' key in that store -
  // the dismissal stayed stranded on that one device even after the migration was applied and the
  // table became reachable. This runs alongside retryPermanentlyRejectedOnce (same call sites), so
  // it retries automatically on the next successful sync, not only the next "Keep both" click.
  let retryPermanentlyRejectedDismissalsInFlight = null;
  async function retryPermanentlyRejectedDismissalsOnce(){
    if(!currentUser || !navigator.onLine) return;
    if(retryPermanentlyRejectedDismissalsInFlight) return retryPermanentlyRejectedDismissalsInFlight;
    retryPermanentlyRejectedDismissalsInFlight = (async ()=>{
      try{
        const store = (window.trackrSync.getPermanentlyRejectedRecords ? await window.trackrSync.getPermanentlyRejectedRecords() : {}) || {};
        const entries = Array.isArray(store['dismissed_duplicates']) ? store['dismissed_duplicates'] : [];
        if(!entries.length) return;
        const bucket = duplicateDismissals[duplicateDismissalScopeKey()];
        for(const entry of entries){
          if(!bucket || !bucket[entry.id]){
            // No longer dismissed locally (pruned since - see pruneDuplicateDismissalsForDeletedTx)
            // - nothing left to retry, so the marker is just dead weight now.
            if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord('dismissed_duplicates', entry.id);
            continue;
          }
          const result = await window.trackrSync.retryPermanentWrite('dismissed_duplicates', null, entry.id, currentUser.id);
          if(result && result.ok){
            diagLogPage('page:permanently-rejected-recovered', { table:'dismissed_duplicates', id: entry.id });
            if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord('dismissed_duplicates', entry.id);
          }
        }
      }catch(e){}
    })();
    try{ await retryPermanentlyRejectedDismissalsInFlight; } finally { retryPermanentlyRejectedDismissalsInFlight = null; }
  }
  // Companion to retryPermanentlyRejectedDismissalsOnce above, for categories - same reason (no
  // per-record id to fit REJECTABLE_TABLES' id-keyed shape, and the exact same "table didn't exist
  // yet" failure mode is anticipated here too: the first category upsert attempted before this
  // round's migration is applied will get a resolved-but-rejected response (PGRST205, "relation
  // does not exist"), same as dismissed_duplicates' own confirmed production incident, and without
  // this would stay permanently stranded even after the migration is applied and the table becomes
  // reachable). entry.id here is the composite "name|type" key syncedRowKeyOf('categories')
  // produces (js/supabase.js) - split back apart to look the category up locally.
  let retryPermanentlyRejectedCategoriesInFlight = null;
  async function retryPermanentlyRejectedCategoriesOnce(){
    if(!currentUser || !navigator.onLine) return;
    if(retryPermanentlyRejectedCategoriesInFlight) return retryPermanentlyRejectedCategoriesInFlight;
    retryPermanentlyRejectedCategoriesInFlight = (async ()=>{
      try{
        const store = (window.trackrSync.getPermanentlyRejectedRecords ? await window.trackrSync.getPermanentlyRejectedRecords() : {}) || {};
        const entries = Array.isArray(store['categories']) ? store['categories'] : [];
        if(!entries.length) return;
        for(const entry of entries){
          const sepIdx = entry.id.lastIndexOf('|');
          const name = entry.id.slice(0, sepIdx), type = entry.id.slice(sepIdx+1);
          const list = type==='credit' ? categories.income : categories.expense;
          if(!list.includes(name)){
            // No longer present locally (deleted, or renamed, since) - nothing left to retry.
            if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord('categories', entry.id);
            continue;
          }
          // Merges in position/color from local categoryMeta - retryPermanentWrite's categories
          // branch reads them straight off this object (see its own comment in js/supabase.js).
          const meta = categoryMetaBucket()[name+'|'+type] || {};
          const result = await window.trackrSync.retryPermanentWrite('categories', null, { name, type, position: meta.position, color: meta.color }, currentUser.id);
          if(result && result.ok){
            diagLogPage('page:permanently-rejected-recovered', { table:'categories', id: entry.id });
            if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord('categories', entry.id);
          }
        }
      }catch(e){}
    })();
    try{ await retryPermanentlyRejectedCategoriesInFlight; } finally { retryPermanentlyRejectedCategoriesInFlight = null; }
  }
  // Local-only, deliberately - reverted from a previous round's attempt to also issue a remote
  // delete here. That change assumed a record only ever reaches this list for one of two
  // reasons - it genuinely belongs to a different account (remote delete harmlessly no-ops
  // against RLS) or it's a stale false-positive (remote delete then destroys a healthy record).
  // Proven wrong in production: four wallets were flagged as unsyncable while healthy and
  // correctly owned the entire time, and the v35 retry fix silently cleared all four on its own -
  // meaning the remote delete's only real-world effect was ever the second, harmful case. This
  // button removes the record from THIS DEVICE ONLY; the cloud copy (if the record is in fact
  // fine) is untouched.
  async function removeUnsyncableRecord(table, listName, id){
    const cfg = REJECTABLE_TABLES[table]; if(!cfg) return;
    if(cfg.markDeleted) cfg.markDeleted(id, listName);
    const [, list] = cfg.lists().find(([name])=>name===listName) || [];
    if(list){ const idx = list.findIndex(r=>r.id===id); if(idx>-1) list.splice(idx,1); }
    await cfg.save();
    if(window.trackrSync.clearPermanentlyRejectedRecord) await window.trackrSync.clearPermanentlyRejectedRecord(table, id);
  }
  async function runIntegrityCheck(){
    const results = document.getElementById('integrity-check-results');
    results.style.display = 'block';
    results.innerHTML = '<p class="period-hint">Checking…</p>';

    const seen = {};
    transactions.forEach(t=>{
      const key = [t.type, t.category, t.account, t.amount, t.date, (t.note||'').trim().toLowerCase()].join('|');
      (seen[key] = seen[key] || []).push(t);
    });
    // Keyed by the actual set of transaction ids involved (sorted, so member order never
    // matters), not the shared field signature - if a third matching transaction joins this
    // exact group later, the id-set changes and the dismissal correctly stops applying, since the
    // underlying duplicate data is no longer the same thing that was reviewed and dismissed.
    const dupGroups = Object.values(seen).filter(g=> g.length > 1)
      .map(g=> ({ transactions: g, key: 'dup:' + g.map(t=>t.id).sort().join(',') }))
      .filter(g=> !isDuplicateGroupDismissed(g.key));

    const debtMismatches = [];
    debts.forEach(d=>{
      const expectedNote = d.name + ' — payment';
      const matchingTx = transactions.filter(t=> t.category==='EMI / Loan' && t.note===expectedNote);
      const loggedCount = (d.payments||[]).length;
      if(loggedCount !== matchingTx.length){
        debtMismatches.push({ debt:d, loggedCount, txCount: matchingTx.length });
      }
    });

    const unsyncable = currentUser ? await findUnsyncableRecords() : [];

    let html = '';
    if(dupGroups.length===0 && debtMismatches.length===0 && unsyncable.length===0){
      html = `<div class="card" style="background:var(--bg); border:1.5px solid var(--credit);">
        <div style="display:flex; align-items:center; gap:8px; color:var(--credit); font-weight:700; font-size:14px;">✓ All clear</div>
        <p class="period-hint" style="margin-top:6px;">Checked ${transactions.length} transaction${transactions.length!==1?'s':''} and ${debts.length} debt${debts.length!==1?'s':''} — no duplicates, mismatches, or unsyncable records found.</p>
      </div>`;
    } else {
      if(unsyncable.length>0){
        const byTable = {};
        unsyncable.forEach(u=> (byTable[u.table] = byTable[u.table]||[]).push(u));
        html += `<div class="card-label" style="margin-bottom:8px;">CAN'T SYNC TO YOUR ACCOUNT (${unsyncable.length})</div>`;
        html += `<div class="card" style="background:var(--bg); margin-bottom:10px; border-left:3px solid var(--debit);">
          <p class="period-hint" style="margin:0 0 10px;">Retried automatically just now - these still didn't sync. Nothing else here is affected.</p>`;
        // Postgres reports BOTH a genuine RLS ownership mismatch (the row really does belong to a
        // different account - most likely left over from a cross-account Restore Backup) and a
        // server-side permissions misconfiguration (e.g. a missing GRANT on the table, entirely
        // unrelated to who owns the row) under the exact same code, 42501. The message text is
        // the only thing that actually tells them apart ("row-level security policy" vs
        // "permission denied"). These need very different copy: an ownership mismatch never
        // resolves on retry and is what Remove is for; a permissions error is an operator-fixable
        // server misconfiguration that this app already retries on its own (see
        // retryPermanentlyRejectedOnce/findUnsyncableRecords above) - calling it "permanent" here
        // was factually wrong and needlessly alarming for rows that belonged to the right account
        // the whole time.
        const reasonFor = entry => {
          const msg = (entry.message || '').toLowerCase();
          if(entry.code==='42501'){
            return msg.includes('permission denied')
              ? "Blocked by a server permissions setting, not a data problem — retried automatically"
              : "Belongs to a different account";
          }
          if(entry.code==='23503') return "References something that no longer exists on the server";
          return "Server rejected this — retried automatically";
        };
        Object.keys(byTable).forEach(table=>{
          byTable[table].forEach(u=>{
            html += `<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; border-top:1px solid var(--line);">
              <span style="font-size:13px;">${escapeHtml(REJECTABLE_TABLES[table].label(u.record))} <span class="period-hint">(${u.listName} — ${escapeHtml(reasonFor(u))})</span></span>
              <button type="button" class="btn-pill btn-outline unsyncable-remove-btn" data-table="${table}" data-list="${u.listName}" data-id="${u.id}" style="padding:4px 10px; font-size:12px;">Remove from this device</button>
            </div>`;
          });
        });
        html += `</div>`;
      }
      if(dupGroups.length>0){
        // Repeated identical entries are frequently legitimate for a finance app (two identical
        // fares in a day, a bill split into equal instalments) - framing every repeat as a
        // "possible duplicate" problem with only a dismiss action offered no way to act on one
        // that genuinely IS an accidental double-submit. This section is a neutral review now,
        // with a real decision either way.
        html += `<div class="card-label" style="margin-bottom:8px;">REPEATED ENTRIES — CHECK THESE ARE INTENTIONAL (${dupGroups.length})</div>`;
        dupGroups.forEach((groupObj, groupIdx)=>{
          const group = groupObj.transactions, key = groupObj.key;
          // The created-at gap is the single strongest signal for telling an accidental
          // double-submit (created seconds apart) from two real, separate events (created
          // minutes or hours apart) - it already exists on every row and was never shown before.
          const sortedByCreated = [...group].sort((a,b)=> new Date(a.createdAt||0) - new Date(b.createdAt||0));
          const oldest = sortedByCreated[0], newest = sortedByCreated[sortedByCreated.length-1];
          const gapMs = new Date(newest.createdAt||0) - new Date(oldest.createdAt||0);
          const gapText = group.length===2
            ? `created ${formatTimeGap(gapMs)} apart`
            : `created within ${formatTimeGap(gapMs)} of each other`;
          // Defaults to the most recently created copy for deletion - a double-tap or accidental
          // resubmit is the one that landed SECOND, so it's the likelier accident. The user can
          // still pick a different one via the radios below.
          const defaultPickId = newest.id;
          html += `<div class="card integrity-dup-card" style="background:var(--bg); border-left:3px solid var(--debit); overflow-x:hidden;">
            <div class="integrity-dup-title">${escapeHtml(group[0].category)} · ${fmt(group[0].amount)} · ${formatHuman(group[0].date)}</div>
            <div class="integrity-dup-sub period-hint">${group.length} copies · ${gapText}</div>
            <div class="integrity-dup-copies" style="margin:10px 0;">
              ${sortedByCreated.map(t=>{
                const timeStr = t.createdAt ? formatTime12h(t.createdAt) : null;
                const createdLabel = timeStr ? `${formatHuman(t.date)}, ${timeStr}` : formatHuman(t.date);
                return `<label class="integrity-dup-copy-row" style="display:flex; align-items:flex-start; gap:10px; padding:8px 0; border-top:1px solid var(--line); cursor:pointer;">
                  <input type="radio" name="dup-pick-${groupIdx}" class="dup-pick-radio" value="${t.id}" ${t.id===defaultPickId?'checked':''} style="margin-top:3px; flex-shrink:0;">
                  <span style="flex:1; min-width:0;">
                    <span style="display:block; font-size:13px; font-weight:600;">${escapeHtml(t.category)} · ${fmt(t.amount)} · ${formatHuman(t.date)}</span>
                    <span class="period-hint" style="display:block;">${escapeHtml(getTxAccount(t))} · ${escapeHtml(t.note||'(no note)')} · created ${createdLabel}</span>
                  </span>
                </label>`;
              }).join('')}
            </div>
            <div class="integrity-dup-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
              <button type="button" class="btn-pill btn-outline dup-keep-btn" data-key="${escapeHtml(key)}">Keep both — this is intentional</button>
              <button type="button" class="btn-pill btn-black dup-delete-btn">Delete selected copy</button>
            </div>
          </div>`;
        });
      }
      if(debtMismatches.length>0){
        html += `<div class="card-label" style="margin:14px 0 8px;">DEBT / TRANSACTION MISMATCHES (${debtMismatches.length})</div>`;
        debtMismatches.forEach(({debt,loggedCount,txCount})=>{
          html += `<div class="card" style="background:var(--bg); margin-bottom:10px; border-left:3px solid var(--gold);">
            <div style="font-weight:700;">${escapeHtml(debt.name)}</div>
            <div class="period-hint">${loggedCount} payment${loggedCount!==1?'s':''} logged on this debt, but ${txCount} matching transaction${txCount!==1?'s':''} found in History — these should always match.</div>
          </div>`;
        });
      }
      html += `<p class="period-hint" style="margin-top:10px;">Head to History to review and delete any extra entries — that's the safe way to fix these without touching anything else.</p>`;
    }
    results.innerHTML = html;
    results.querySelectorAll('.unsyncable-remove-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const table = btn.dataset.table, listName = btn.dataset.list, id = btn.dataset.id;
        if(!confirm(`Remove this record from this device only? Your account's cloud copy, if one exists, is not touched — this only affects local data on this device, with no way to undo.`)) return;
        btn.disabled = true;
        await removeUnsyncableRecord(table, listName, id);
        refreshAll();
        runIntegrityCheck();
      });
    });
    results.querySelectorAll('.dup-keep-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        await dismissDuplicateGroup(btn.dataset.key);
        runIntegrityCheck();
      });
    });
    results.querySelectorAll('.dup-delete-btn').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        // Only one copy is ever deleted per click, whichever radio is currently selected in THIS
        // card - never a bulk "reduce to one". A group of 3+ is handled by deleting one at a time
        // and letting the group get re-evaluated fresh (via runIntegrityCheck() below) after each
        // deletion, exactly like any other transaction count change would.
        const card = btn.closest('.integrity-dup-card');
        const picked = card.querySelector('.dup-pick-radio:checked');
        if(!picked) return;
        // deleteTransaction already owns the confirm dialog, the linked-debt balance warning, the
        // debt.payments cleanup, the Supabase delete, and pruning any now-dead dismissal entry -
        // reusing it here instead of a separate deletion path means a duplicate copy gets exactly
        // the same safety net as deleting it from History would.
        const deleted = await deleteTransaction(picked.value);
        if(deleted) runIntegrityCheck();
      });
    });
  }
  function duplicateDismissalScopeKey(){ return currentUser ? currentUser.id : '__local__'; }
  async function saveDuplicateDismissals(){
    try{ await window.storage.set('duplicateDismissals', JSON.stringify(duplicateDismissals)); }catch(e){}
  }
  // Synced via the dismissed_duplicates table (see the SQL migration in this round's PR
  // description) - a dismissal made on one device now reaches every device for the same account
  // (see attachUserAndSync's dismissedDuplicates merge), and still survives this account's own
  // logout/login (duplicateDismissals is kept outside settings for exactly that reason - see its
  // own declaration). A genuinely different user logging into this same device still starts with
  // nothing dismissed, since this is scoped by user id, same as accountsReconciledOnce.
  function isDuplicateGroupDismissed(key){
    const bucket = duplicateDismissals[duplicateDismissalScopeKey()];
    return !!(bucket && bucket[key]);
  }
  async function dismissDuplicateGroup(key){
    const scope = duplicateDismissalScopeKey();
    if(!duplicateDismissals[scope]) duplicateDismissals[scope] = {};
    duplicateDismissals[scope][key] = true;
    await saveDuplicateDismissals();
    if(currentUser) window.trackrSync.syncUpsertDismissedDuplicate(currentUser.id, key);
  }
  // A dismissal keyed by an exact set of transaction ids can never match again once any one of
  // those ids stops existing (see the dupGroups key comment) - it's already permanently inert,
  // never capable of wrongly suppressing a future, genuinely different group. This just clears the
  // dead entry out of storage instead of leaving it there forever, so the mechanism doesn't
  // accumulate orphans the way the sync-rejection markers used to get stuck. Also deletes the
  // cloud-side row for the exact same reason - left behind, it would just get pulled back down by
  // a different device (or this one, on its next login) and merged right back into
  // duplicateDismissals, undoing the local prune the moment a sync happened to run.
  async function pruneDuplicateDismissalsForDeletedTx(id){
    const bucket = duplicateDismissals[duplicateDismissalScopeKey()];
    if(!bucket) return;
    let changed = false;
    const deadKeys = [];
    Object.keys(bucket).forEach(key=>{
      const ids = key.slice(4).split(',');
      if(ids.includes(id)){ delete bucket[key]; changed = true; deadKeys.push(key); }
    });
    if(changed) await saveDuplicateDismissals();
    if(currentUser) deadKeys.forEach(key=> window.trackrSync.syncDeleteDismissedDuplicate(currentUser.id, key));
  }

  function bindCrossTabSync(){
    const STORAGE_PREFIX = 'moneyLedgerPremium:';
    window.addEventListener('storage', (e)=>{
      if(!e.key || e.key.indexOf(STORAGE_PREFIX)!==0) return;
      const key = e.key.slice(STORAGE_PREFIX.length);
      try{
        if(key==='transactions'){
          transactions = e.newValue ? JSON.parse(e.newValue) : [];
          if(!Array.isArray(transactions)) transactions = [];
          refreshAll();
        } else if(key==='debts'){
          debts = e.newValue ? JSON.parse(e.newValue) : [];
          if(!Array.isArray(debts)) debts = [];
          debts.forEach(d=>{ if(!Array.isArray(d.payments)) d.payments = []; });
          refreshAll();
        } else if(key==='categories'){
          const c = e.newValue ? JSON.parse(e.newValue) : null;
          if(c && Array.isArray(c.income) && Array.isArray(c.expense)){ categories = c; renderCategoriesView(); }
          refreshAll();
        } else if(key==='budgets'){
          const b = e.newValue ? JSON.parse(e.newValue) : {};
          budgets = (b && typeof b==='object' && !Array.isArray(b)) ? b : {};
          refreshAll();
        } else if(key==='reminders'){
          reminders = e.newValue ? JSON.parse(e.newValue) : [];
          if(!Array.isArray(reminders)) reminders = [];
          refreshAll();
        } else if(key==='goals'){
          goals = e.newValue ? JSON.parse(e.newValue) : [];
          if(!Array.isArray(goals)) goals = [];
          goals.forEach(g=>{ if(!Array.isArray(g.contributions)) g.contributions = []; });
          refreshAll();
        } else if(key==='accounts'){
          const a = e.newValue ? JSON.parse(e.newValue) : null;
          if(Array.isArray(a) && a.length>0){ accounts = a; populateEntryAccountSelect(); if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect(); }
          refreshAll();
        } else if(key==='recurring'){
          recurring = e.newValue ? JSON.parse(e.newValue) : [];
          if(!Array.isArray(recurring)) recurring = [];
        }
      }catch(err){ console.error('Cross-tab sync error for', key, err); }
    });
  }

  function bindPrivacyEvents(){
    const revealBtn = document.getElementById('balance-reveal-btn');
    if(revealBtn) revealBtn.addEventListener('click', toggleBalanceReveal);

    const hideToggle = document.getElementById('hide-balances-toggle');
    if(hideToggle) hideToggle.addEventListener('click', async ()=>{
      settings.hideBalances = !settings.hideBalances;
      balancesRevealed = false;
      playSfx('toggle');
      await saveSettings();
      syncHideBalancesUI();
      renderHomeBalance(); renderNetWorth();
      resetHideBalancesTimer();
    });
    const hideTimeoutSel = document.getElementById('hide-balances-timeout');
    if(hideTimeoutSel) hideTimeoutSel.addEventListener('change', async (e)=>{
      settings.hideBalancesTimeoutMin = parseInt(e.target.value, 10) || 5;
      await saveSettings();
      resetHideBalancesTimer();
    });

    const lockToggle = document.getElementById('app-lock-toggle');
    if(lockToggle) lockToggle.addEventListener('click', async ()=>{
      if(!settings.appLockEnabled){
        if(settings.appLockPin){
          settings.appLockEnabled = true;
          playSfx('toggle');
          await saveSettings();
          syncAppLockUI();
          resetAppLockTimer();
        } else {
          pinFlowContext = 'toggle-enable';
          showPinOverlay('setup-new');
        }
      } else {
        settings.appLockEnabled = false;
        isAppLocked = false;
        playSfx('toggle');
        await saveSettings();
        syncAppLockUI();
        if(appLockTimer){ clearTimeout(appLockTimer); appLockTimer = null; }
      }
    });
    const lockTimeoutSel = document.getElementById('app-lock-timeout');
    if(lockTimeoutSel) lockTimeoutSel.addEventListener('change', async (e)=>{
      settings.appLockTimeoutMin = parseInt(e.target.value, 10) || 5;
      await saveSettings();
      resetAppLockTimer();
    });
    document.getElementById('change-pin-btn').addEventListener('click', ()=>{
      pinFlowContext = 'change';
      showPinOverlay('change-verify');
    });

    document.getElementById('pinlock-submit').addEventListener('click', handlePinSubmit);
    document.getElementById('pinlock-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter') handlePinSubmit(); });
    document.getElementById('pinlock-input').addEventListener('input', (e)=>{
      if(/^[0-9]{4}$/.test(e.target.value)) setTimeout(handlePinSubmit, 60);
    });
    document.getElementById('pinlock-recovery-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter') handlePinSubmit(); });
    document.getElementById('pinlock-forgot-link').addEventListener('click', async (e)=>{
      // Recovery proves identity by emailing a code to the account this device is already
      // logged into - with no account session (offline/skipped-login use), there's no email
      // to send it to, so recovery via this path isn't possible at all. Surfacing the actual
      // last resort here (not just documenting it elsewhere) rather than leaving a dead end.
      if(!currentUser){
        alert("Resetting your PIN this way needs you to be logged into your account, so a code can be emailed to you — this device is currently using Trackr without an account.\n\nIf you can't log into your account either, the only way back in is to clear this browser's site data for Trackr and start over. That permanently erases anything on this device that hasn't been backed up to your account.");
        return;
      }
      const btn = e.currentTarget;
      // Same gap as the password-reset flow: the button already disabled instantly, but with
      // its text unchanged a disabled link gives no sign anything is happening during the real
      // few-second wait for Supabase to queue the email - reads as frozen rather than working.
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      const sent = await sendPinRecoveryCode();
      btn.disabled = false;
      btn.textContent = originalText;
      if(!sent){
        alert("Couldn't send a code to your email right now — check your connection and try again.");
        return;
      }
      showPinOverlay('recover');
      armPinRecoveryResendCooldown();
    });
    document.getElementById('pinlock-recovery-resend-btn').addEventListener('click', handleResendPinRecoveryCode);
    document.getElementById('pinlock-cancel-setup').addEventListener('click', async ()=>{
      if(pinMode==='recover'){
        showPinOverlay('unlock');
        return;
      }
      hidePinOverlay();
      pendingNewPin = null;
      if(pinFlowContext!=='change'){
        settings.appLockEnabled = false;
        await saveSettings();
        syncAppLockUI();
      }
      pinFlowContext = 'toggle-enable';
    });

    ['click','touchstart','keydown','scroll'].forEach(evt=>{
      document.addEventListener(evt, ()=>{ resetHideBalancesTimer(); resetAppLockTimer(); }, {passive:true});
    });
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState==='hidden'){
        if(settings.hideBalances && balancesRevealed){
          balancesRevealed = false; updateBalanceRevealUI(); renderHomeBalance(); renderNetWorth();
        }
        if(settings.appLockEnabled && settings.appLockPin) lockApp();
      } else if(document.visibilityState==='visible'){
        resetHideBalancesTimer(); resetAppLockTimer();
      }
    });
  }
  function renderLastBackupNote(){
    const el = document.getElementById('last-backup-note'); if(!el) return;
    if(!settings.lastBackupAt){ el.textContent = "You haven't backed up yet — do it once from the button above, just in case."; return; }
    const days = Math.floor((Date.now() - new Date(settings.lastBackupAt).getTime()) / 86400000);
    if(days <= 0) el.textContent = 'Backed up today.';
    else if(days === 1) el.textContent = 'Last backup: yesterday.';
    else if(days <= 30) el.textContent = `Last backup: ${days} days ago.`;
    else el.textContent = `Last backup: ${days} days ago — might be worth doing again.`;
  }

  function setDefaultDates(){
    const today = toLocalDateStr(new Date());
    document.getElementById('entry-date').value = today; document.getElementById('entry-date').max = today;
    document.getElementById('period-daily').value = today; document.getElementById('period-weekly').value = today; document.getElementById('period-monthly').value = today;
    document.getElementById('period-start').value = today.slice(0,8)+'01'; document.getElementById('period-end').value = today;
    document.getElementById('debt-start-date').value = today;
    document.getElementById('reminder-due-date').value = today;
  }

  function bindEvents(){
    document.querySelectorAll('.tab-btn').forEach(btn=> btn.addEventListener('click', ()=> switchTab(btn.dataset.tab)));
    // Scoped to [data-tab] specifically - .link-btn is also used for several buttons that
    // aren't tab-navigation links at all (auth mode toggle, PIN forgot/cancel, etc). Binding
    // this to every .link-btn indiscriminately meant clicking any of those also ran
    // goToMoreSub(undefined, undefined), which threw inside renderTabUI (getElementById('view-undefined')
    // is null) after already stripping .active off every view section as a side effect.
    document.querySelectorAll('.link-btn[data-tab]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ goToMoreSub(btn.dataset.tab, btn.dataset.sub); });
    });
    document.querySelectorAll('.more-row').forEach(btn=> btn.addEventListener('click', ()=> showMoreSub(btn.dataset.sub)));
    document.querySelectorAll('[data-back]').forEach(btn=> btn.addEventListener('click', backToMoreMenu));

    document.getElementById('bell-btn').addEventListener('click', openNotificationsOverlay);
    document.getElementById('close-notifications-btn').addEventListener('click', ()=> history.back());
    document.getElementById('notifications-overlay').addEventListener('click', (e)=>{ if(e.target.id==='notifications-overlay') history.back(); });
    document.getElementById('settings-btn').addEventListener('click', ()=>{ goToMoreSub('more', 'settings'); });
    document.getElementById('profile-btn').addEventListener('click', ()=>{ goToMoreSub('more', 'account'); });
    document.getElementById('backup-nag-now-btn').addEventListener('click', downloadBackup);
    document.getElementById('backup-nag-later-btn').addEventListener('click', dismissBackupNag);
    document.getElementById('app-toast-close').addEventListener('click', hideAppToast);

    document.getElementById('global-search-btn').addEventListener('click', openGlobalSearch);
    document.getElementById('close-search-btn').addEventListener('click', ()=> history.back());
    document.getElementById('global-search-input').addEventListener('input', (e)=> renderGlobalSearchResults(e.target.value));
    document.getElementById('search-overlay').addEventListener('click', (e)=>{ if(e.target.id==='search-overlay') history.back(); });
    document.addEventListener('keydown', (e)=>{
      if(e.key!=='Escape') return;
      if(document.getElementById('search-overlay').classList.contains('open')) history.back();
      else if(document.getElementById('schedule-overlay').classList.contains('open')) history.back();
      else if(document.getElementById('category-detail-overlay').classList.contains('open')) history.back();
      else if(document.getElementById('txdetail-overlay').classList.contains('open')) history.back();
      else if(document.getElementById('color-picker-overlay').classList.contains('open')) history.back();
    });
    document.getElementById('close-schedule-btn').addEventListener('click', ()=> history.back());
    document.getElementById('schedule-overlay').addEventListener('click', (e)=>{ if(e.target.id==='schedule-overlay') history.back(); });
    document.getElementById('close-catdetail-btn').addEventListener('click', ()=> history.back());
    document.getElementById('category-detail-overlay').addEventListener('click', (e)=>{ if(e.target.id==='category-detail-overlay') history.back(); });
    document.getElementById('close-color-picker-btn').addEventListener('click', ()=> history.back());
    document.getElementById('color-picker-overlay').addEventListener('click', (e)=>{ if(e.target.id==='color-picker-overlay') history.back(); });
    document.getElementById('close-txdetail-btn').addEventListener('click', ()=> history.back());
    document.getElementById('txdetail-overlay').addEventListener('click', (e)=>{ if(e.target.id==='txdetail-overlay') history.back(); });
    document.getElementById('txdetail-edit-btn').addEventListener('click', ()=>{
      if(!txDetailCurrentId) return;
      const id = txDetailCurrentId;
      closeAllOverlaysThenRun(()=> startEditTransaction(id));
    });
    document.getElementById('txdetail-delete-btn').addEventListener('click', async ()=>{
      if(!txDetailCurrentId) return;
      const deleted = await deleteTransaction(txDetailCurrentId);
      if(deleted && document.getElementById('txdetail-overlay').classList.contains('open')) history.back();
    });

    document.getElementById('close-debtdetail-btn').addEventListener('click', ()=> history.back());
    document.getElementById('debtdetail-overlay').addEventListener('click', (e)=>{ if(e.target.id==='debtdetail-overlay') history.back(); });
    document.getElementById('debtdetail-edit-btn').addEventListener('click', ()=>{
      if(!debtDetailCurrentId) return;
      const id = debtDetailCurrentId;
      closeAllOverlaysThenRun(()=> startEditDebt(id));
    });
    document.getElementById('debtdetail-delete-btn').addEventListener('click', async ()=>{
      if(!debtDetailCurrentId) return;
      const deleted = await deleteDebt(debtDetailCurrentId);
      if(deleted && document.getElementById('debtdetail-overlay').classList.contains('open')) history.back();
    });

    document.getElementById('close-goaldetail-btn').addEventListener('click', ()=> history.back());
    document.getElementById('goaldetail-overlay').addEventListener('click', (e)=>{ if(e.target.id==='goaldetail-overlay') history.back(); });
    document.getElementById('goaldetail-edit-btn').addEventListener('click', ()=>{
      if(!goalDetailCurrentId) return;
      const id = goalDetailCurrentId;
      closeAllOverlaysThenRun(()=> startEditGoal(id));
    });
    document.getElementById('goaldetail-delete-btn').addEventListener('click', async ()=>{
      if(!goalDetailCurrentId) return;
      const deleted = await deleteGoal(goalDetailCurrentId);
      if(deleted && document.getElementById('goaldetail-overlay').classList.contains('open')) history.back();
    });

    document.querySelectorAll('#theme-select [data-theme-choice]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const newTheme = btn.getAttribute('data-theme-choice');
        if(settings.theme===newTheme) return;
        settings.theme = newTheme;
        await saveSettings();
        applyTheme(newTheme);
        // Issue 3 (round 5) root cause: applyTheme() only flips the data-theme attribute, which is
        // enough on its own for anything driven by CSS custom properties, but every Black-only
        // colour this project has added since round 3 (category avatars, budget bars, debt/goal
        // paid-vs-pending text, progress fills...) is computed in JS and baked into a rendered
        // element's innerHTML/inline style at the moment it was last drawn - it does not react to
        // the data-theme attribute changing underneath it. Before this fix, only renderAllRings()
        // and renderTrendChart() (both canvas-drawn, so they have to be redrawn explicitly anyway)
        // re-ran here - every other already-rendered card (Active Debts/Receivables text being the
        // reported case, but really any themed JS-rendered element) kept whatever colour markup it
        // was last drawn with under the PREVIOUS theme until something else happened to trigger a
        // re-render. A device that opens the app with data already loaded and switches theme via
        // Settings - not the fresh-login-with-theme-preset flow every automated test in this
        // project has used so far - hits this every time. refreshAll() re-runs every render
        // function in the app from current in-memory state (no network/data changes), which is the
        // same sweep already used after login and after every data mutation, so this is just
        // extending that same pattern to cover a theme change too. Superset of the two calls it
        // replaces (both are already part of refreshAll()).
        refreshAll();
      });
    });

    document.getElementById('show-networth-toggle').addEventListener('click', async ()=>{
      settings.showNetWorth = settings.showNetWorth===false ? true : false;
      playSfx('toggle');
      syncNetWorthToggleUI();
      renderNetWorth();
      await saveSettings();
    });

    document.getElementById('sfx-toggle').addEventListener('click', async ()=>{
      settings.sfxEnabled = settings.sfxEnabled===false ? true : false;
      syncSfxToggleUI();
      if(settings.sfxEnabled) playSfx('toggle');
      await saveSettings();
    });

    document.getElementById('show-add-reminder-btn').addEventListener('click', ()=>{
      editingReminderId = null;
      document.getElementById('add-reminder-form').reset();
      document.querySelectorAll('.reminder-repeat-btn').forEach(b=> b.classList.toggle('active', b.dataset.repeat==='monthly'));
      document.getElementById('reminder-repeat-value').value = 'monthly';
      document.getElementById('reminder-monthly-field').style.display = 'block';
      document.getElementById('reminder-once-field').style.display = 'none';
      document.querySelector('#add-reminder-form button[type="submit"]').textContent = 'Save Reminder';
      document.getElementById('add-reminder-form').style.display='block';
    });
    document.getElementById('cancel-add-reminder-btn').addEventListener('click', ()=>{
      editingReminderId = null;
      document.getElementById('add-reminder-form').style.display='none';
      document.getElementById('add-reminder-form').reset();
      document.querySelector('#add-reminder-form button[type="submit"]').textContent = 'Save Reminder';
    });

    document.getElementById('show-add-goal-btn').addEventListener('click', ()=>{
      editingGoalId = null;
      document.getElementById('save-goal-btn').textContent = 'Save Goal';
      document.getElementById('add-goal-form').style.display='block';
    });
    document.getElementById('cancel-add-goal-btn').addEventListener('click', resetGoalForm);
    document.getElementById('add-goal-form').addEventListener('submit', handleAddGoal);

    document.getElementById('add-account-form').addEventListener('submit', handleAddAccount);
    document.querySelectorAll('.reminder-repeat-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.reminder-repeat-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        document.getElementById('reminder-repeat-value').value = btn.dataset.repeat;
        const isMonthly = btn.dataset.repeat==='monthly';
        document.getElementById('reminder-monthly-field').style.display = isMonthly ? 'block' : 'none';
        document.getElementById('reminder-once-field').style.display = isMonthly ? 'none' : 'block';
      });
    });
    document.getElementById('add-reminder-form').addEventListener('submit', handleAddReminder);
    document.getElementById('enable-notif-btn').addEventListener('click', async ()=>{
      if(!('Notification' in window)){ updateNotifPermissionStatus(); return; }
      try{ await Notification.requestPermission(); }catch(e){}
      updateNotifPermissionStatus();
      maybeFireDueNotifications();
    });
    document.getElementById('test-notif-btn').addEventListener('click', async ()=>{
      if(!('Notification' in window)){ alert('Notifications are not supported in this browser.'); return; }
      if(Notification.permission!=='granted'){ alert('Turn on notifications with the Enable button first.'); return; }
      await fireNotification('Trackr test', 'If you can see this, notifications are working on this device.');
    });

    document.getElementById('show-add-debt-btn').addEventListener('click', ()=> openAddDebtForm(activeDebtKind));
    document.getElementById('addentry-add-debt-btn').addEventListener('click', ()=> openAddDebtForm('debt'));
    document.getElementById('addentry-add-receivable-btn').addEventListener('click', ()=> openAddDebtForm('receivable'));
    document.getElementById('goto-addentry-link').addEventListener('click', ()=> switchTab('add'));
    document.querySelectorAll('#debt-kind-toggle .type-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        if(activeDebtKind===btn.dataset.debtkind) return;
        activeDebtKind = btn.dataset.debtkind;
        document.querySelectorAll('#debt-kind-toggle .type-btn').forEach(b=> b.classList.toggle('active', b===btn));
        resetDebtForm();
        updateDebtKindLabels();
        renderDebtsList();
        renderDebtOverviewInto('debtov', currentDebtList());
      });
    });
    document.getElementById('cancel-add-debt-btn').addEventListener('click', resetDebtForm);
    document.querySelectorAll('.debt-type-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.debt-type-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        document.getElementById('debt-type-value').value = btn.dataset.debttype;
        const isEmi = btn.dataset.debttype==='emi';
        document.getElementById('emi-fields').style.display = isEmi ? 'block' : 'none';
        document.getElementById('lump-fields').style.display = isEmi ? 'none' : 'block';
        setText('debt-type-hint', isEmi
          ? 'A fixed installment is due every month, for a set number of months.'
          : "Pay any amount, any time, until it's fully settled — no fixed schedule.");
      });
    });
    document.getElementById('debt-emi-amount').addEventListener('input', updateEmiTotalPreview);
    document.getElementById('debt-tenure').addEventListener('input', updateEmiTotalPreview);
    document.getElementById('add-debt-form').addEventListener('submit', handleAddDebt);

    document.getElementById('qa-money-in').addEventListener('click', ()=> goToAdd('income'));
    document.getElementById('qa-money-out').addEventListener('click', ()=> goToAdd('expense'));

    document.querySelectorAll('#entry-form .type-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('#entry-form .type-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        document.getElementById('entry-type').value = btn.dataset.type; populateEntryCategorySelect(btn.dataset.type);
      });
    });
    document.getElementById('entry-form').addEventListener('submit', handleAddEntry);
    document.getElementById('cancel-edit-link').addEventListener('click', cancelEdit);
    document.getElementById('entry-save-recurring').addEventListener('change', (e)=>{
      const row = document.getElementById('entry-recurring-remind-row');
      row.style.display = e.target.checked ? 'flex' : 'none';
      if(!e.target.checked) document.getElementById('entry-recurring-remind').checked = false;
    });

    document.querySelectorAll('.ring-period-btn[data-range]').forEach(btn=>{
      btn.addEventListener('click', ()=>{ ringRange = btn.dataset.range; renderAllRings(); });
    });
    document.querySelectorAll('.mini-toggle-btn[data-trendrange]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.mini-toggle-btn[data-trendrange]').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        trendRange = btn.dataset.trendrange; renderTrendChart();
      });
    });

    document.querySelectorAll('#period-type-segmented button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('#period-type-segmented button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        showPeriodInput(btn.dataset.period); renderReports();
      });
    });
    ['period-daily','period-weekly','period-monthly','period-start','period-end'].forEach(id=>{
      document.getElementById(id).addEventListener('change', renderReports);
    });
    document.getElementById('filter-type').addEventListener('change', (e)=>{ populateFilterCategorySelect(e.target.value); renderReports(); });
    document.getElementById('filter-category').addEventListener('change', renderReports);
    document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
    document.getElementById('download-csv-btn').addEventListener('click', downloadCSV);

    document.getElementById('history-search').addEventListener('input', renderHistory);
    document.getElementById('history-filter-type').addEventListener('change', (e)=>{ populateHistoryFilterCategorySelect(e.target.value); renderHistory(); });
    document.getElementById('history-filter-category').addEventListener('change', renderHistory);
    document.getElementById('history-filter-account').addEventListener('change', renderHistory);
    document.getElementById('history-filter-sort').addEventListener('change', renderHistory);
    document.getElementById('history-filter-amount-min').addEventListener('input', renderHistory);
    document.getElementById('history-filter-amount-max').addEventListener('input', renderHistory);
    document.getElementById('history-filter-date-from').addEventListener('change', renderHistory);
    document.getElementById('history-filter-date-to').addEventListener('change', renderHistory);
    document.getElementById('history-filter-daterange').addEventListener('change', (e)=>{
      document.getElementById('history-custom-date-row').style.display = e.target.value==='custom' ? 'flex' : 'none';
      renderHistory();
    });
    // Collapsed by default on mobile (same 780px breakpoint every other mobile/desktop split in
    // this app uses) so the filter panel doesn't push the actual list below the fold on a small
    // screen - desktop has the width to spare and keeps the panel open, matching how the filter
    // row always behaved here before this round. Either way it's just a starting point: the
    // toggle button works identically on both, so nothing is ever permanently hidden.
    const historyFiltersPanel = document.getElementById('history-filters-panel');
    const historyFiltersToggleBtn = document.getElementById('history-filters-toggle-btn');
    if(window.matchMedia('(max-width:780px)').matches) historyFiltersPanel.classList.add('collapsed');
    historyFiltersToggleBtn.setAttribute('aria-expanded', String(!historyFiltersPanel.classList.contains('collapsed')));
    historyFiltersToggleBtn.addEventListener('click', ()=>{
      historyFiltersPanel.classList.toggle('collapsed');
      historyFiltersToggleBtn.setAttribute('aria-expanded', String(!historyFiltersPanel.classList.contains('collapsed')));
    });

    document.getElementById('add-income-cat-form').addEventListener('submit', (e)=>{ e.preventDefault(); addCategory('income', document.getElementById('new-income-cat').value); document.getElementById('new-income-cat').value=''; });
    document.getElementById('add-expense-cat-form').addEventListener('submit', (e)=>{ e.preventDefault(); addCategory('expense', document.getElementById('new-expense-cat').value); document.getElementById('new-expense-cat').value=''; });

    document.getElementById('currency-input').addEventListener('change', async (e)=>{
      settings.currency = e.target.value.trim() || '₹'; e.target.value = settings.currency;
      await saveSettings(); refreshAll();
    });

    document.getElementById('account-action-btn').addEventListener('click', ()=>{
      if(currentUser) logOutUser(); else showAuthOverlay('login');
    });
    document.getElementById('backup-btn').addEventListener('click', downloadBackup);
    document.getElementById('restore-btn').addEventListener('click', ()=> document.getElementById('restore-file-input').click());
    document.getElementById('integrity-check-btn').addEventListener('click', runIntegrityCheck);
    document.getElementById('restore-file-input').addEventListener('change', handleRestoreFile);

    document.getElementById('reset-data-btn').addEventListener('click', async ()=>{
      if(!confirm('This will permanently delete all entries, categories, budgets, debts, goals, accounts, recurring templates, and reminders you have saved. Continue?')) return;
      // Asked fresh every time (never a remembered default) since this is destructive and
      // irreversible - someone could reasonably expect either answer, so don't guess.
      const alsoDeleteCloud = currentUser ? confirm(
        "Also permanently delete this data from your account in the cloud?\n\n" +
        "If you cancel, only this device is cleared — your account keeps its cloud copy."
      ) : false;
      // The cloud delete must be CONFIRMED complete before any local data is touched - not the
      // other way around. If it fails, or this tab is backgrounded/killed before it resolves,
      // local data must still be exactly as it was, not wiped ahead of a cloud copy that was
      // never actually confirmed gone (see performCloudResetDelete's own comment, and
      // resumeInterruptedResetIfAny for what happens if this app is reopened mid-delete).
      if(alsoDeleteCloud && currentUser){
        const cloudDeleteConfirmed = await performCloudResetDelete(currentUser.id);
        if(!cloudDeleteConfirmed) return;
        // Cloud is now CONFIRMED empty for this account - re-seed it as a fresh signup would,
        // rather than leaving it (and this device) genuinely blank. See finishConfirmedReset's
        // own comment for why this is safe and why it can't reopen the earlier silent-reseed bug.
        await finishConfirmedReset(currentUser.id);
      } else {
        // Local-only reset (declined the cloud prompt, or not logged in at all) - the cloud copy,
        // if any, was never touched, so there's nothing to treat as "confirmed empty" here. Just
        // the local wipe, same as before this round's fix.
        await hardClearAllLocalDataNoSync();
        settings = { currency:'₹', theme:'light', dismissedBudgetAlerts:{} };
        try{ await window.storage.set('settings', JSON.stringify(settings)); }catch(e){}
        // Reset Everything is a full wipe of this account's data on this device, unlike an
        // ordinary logout - duplicateDismissals stays intentionally untouched by logout (see its
        // own declaration), but this deliberately-more-aggressive action clears this account's
        // own dismissal scope too, same as everything else here.
        delete duplicateDismissals[duplicateDismissalScopeKey()];
        try{ await window.storage.set('duplicateDismissals', JSON.stringify(duplicateDismissals)); }catch(e){}
      }
      populateEntryCategorySelect(document.getElementById('entry-type').value);
      populateEntryAccountSelect();
      if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
      populateFilterCategorySelect(document.getElementById('filter-type').value);
      populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
      applyTheme('light');
      balancesRevealed = false; isAppLocked = false;
      if(hideBalancesTimer){ clearTimeout(hideBalancesTimer); hideBalancesTimer = null; }
      if(appLockTimer){ clearTimeout(appLockTimer); appLockTimer = null; }
      syncHideBalancesUI(); syncAppLockUI(); syncNetWorthToggleUI(); syncSfxToggleUI();
      refreshAll();
      renderCategoriesView();
    });
  }

  function syncAccountStatusUI(){
    const note = document.getElementById('account-status-note');
    const btn = document.getElementById('account-action-btn');
    if(!note || !btn) return;
    if(currentUser){
      note.textContent = `Logged in as ${currentUser.email} — synced across devices.`;
      btn.textContent = 'Log Out';
    } else {
      note.textContent = 'Not logged in — using this device only.';
      btn.textContent = 'Log In';
    }
    renderBackupContextNote();
  }
  // Attaches (or detaches, if user is null) a Supabase user to the already-running app —
  // used both during the very first boot and when someone who chose "Skip for now" earlier
  // logs in later from Settings, without re-running the one-time UI bootstrap below.
  // Asks before uploading any pre-existing on-device data into the account being logged
  // into - this device may have been used by someone else, or offline, before this login,
  // so silently absorbing whatever's sitting in local storage was a real leak/surprise risk.
  // Only ever asked once per device (mirrors migrateLocalDataToCloudIfNeeded's own flag) -
  // declining doesn't leave the prompt resurfacing on every future login here.
  async function maybeOfferLocalDataMerge(userId){
    try{
      const flag = await window.storage.get('migrated_to_cloud');
      if(flag && flag.value==='true') return;
    }catch(e){}
    const localCount = transactions.length + debts.length + receivables.length + goals.length;
    if(localCount===0){
      try{ await window.trackrSync.skipMigration(); }catch(e){}
      return;
    }
    const noun = localCount===1 ? 'entry' : 'entries';
    // Question first, consequence second - matches every other confirm() in the app (e.g.
    // "Delete this entry? This cannot be undone."), and reads faster on a small screen than
    // opening with context before ever getting to the actual yes/no being asked.
    const wantsMerge = confirm(
      `Add the ${localCount} ${noun} saved on this device to your account?\n\n` +
      `If you cancel, they won't be added, and this device will show your account's cloud data instead.`
    );
    if(wantsMerge){
      await window.trackrSync.migrateLocalDataToCloudIfNeeded(userId, { transactions, debts, receivables, goals, budgets, accounts });
    } else {
      await window.trackrSync.skipMigration();
      // Clear this device's declined data now, before the cloud pull below overwrites transactions/
      // debts/receivables/goals/budgets. Uses the no-sync clear, not saveTransactions/.../saveBudgets -
      // those have currentUser-conditional cloud side effects (saveBudgets in particular reconciles
      // by diff and would delete every cloud budget category not present in this now-empty local
      // state), which would reach out and touch this account's real cloud data over something that's
      // only meant to discard what's sitting on this one device.
      await clearFinancialDataNoSync();
    }
  }
  async function attachUserAndSync(user, refreshAfter){
    currentUser = user || null;
    syncAccountStatusUI();
    if(!currentUser) return;
    try{
      // Must run before maybeOfferLocalDataMerge/the pull below - if the previous session's Reset
      // Everything was interrupted mid-cloud-delete, local data here is stale leftover from before
      // that reset, not real data to offer merging into the cloud, and finishing the reset (which
      // wipes it) has to happen before anything else reads or persists it.
      await resumeInterruptedResetIfAny(currentUser.id);
      await maybeOfferLocalDataMerge(currentUser.id);
      const cloud = await window.trackrSync.pullCloudData(currentUser.id);
      // pullCloudData leaves a field null ONLY when that table's fetch actually threw (it always
      // returns [] / {} for a genuinely empty-but-successful query) - so this is an unambiguous
      // signal the cloud read failed, as opposed to "there's just no data yet". Previously this
      // was only ever logged to the console: the UI would silently keep showing whatever was in
      // local cache (empty, on a device that had never synced before) with zero indication to the
      // user that the numbers on screen didn't reflect what's actually in Supabase.
      const pullFailed = cloud.transactions===null || cloud.debts===null || cloud.receivables===null || cloud.goals===null || cloud.budgets===null;
      // Persisted directly, NOT via saveTransactions/saveDebts/saveReceivables - a fresh cloud
      // pull is the account's authoritative state, but those functions merge the incoming data
      // against whatever's still sitting on THIS device's local disk (deliberate for ordinary
      // edits, to protect a concurrent write from a different tab). Reusing them here meant
      // anything deleted on another device (or in a previous session on this one - Reset
      // Everything, a single delete, anything) would get silently resurrected locally the
      // moment this device next pulled and merged its own stale disk copy back in. A pull
      // should replace local state outright, never merge with what it's about to supersede.
      const toPersist = [];
      if(cloud.transactions!==null){ transactions = cloud.transactions; toPersist.push(['transactions', transactions]); }
      if(cloud.debts!==null){ debts = cloud.debts; debts.forEach(d=>{ if(!Array.isArray(d.payments)) d.payments = []; }); toPersist.push(['debts', debts]); }
      if(cloud.receivables!==null){ receivables = cloud.receivables; receivables.forEach(d=>{ if(!Array.isArray(d.payments)) d.payments = []; }); toPersist.push(['receivables', receivables]); }
      if(cloud.goals!==null){ goals = cloud.goals; goals.forEach(g=>{ if(!Array.isArray(g.contributions)) g.contributions = []; }); toPersist.push(['goals', goals]); }
      if(cloud.budgets!==null){
        budgets = await reconcileBudgetsTruncationOnce(currentUser.id, budgets, cloud.budgets);
        toPersist.push(['budgets', budgets]);
      }
      if(cloud.accounts!==null){
        // See dedupeAccountsById's own comment for why this call exists here too, not just in
        // loadData() - attachUserAndSync can run without a preceding loadData() call (the
        // "already running" reauth branch of startAppForUserImpl), so this is the only guaranteed
        // point where a collision gets resolved with the winner-selection and transaction-
        // reassignment logic before reconcileAccountsOnFirstContact/the replace branch below ever
        // runs - otherwise dedupeRowsById's blunt, cloud-blind "keep whichever is last" in
        // js/supabase.js is the only thing left standing between a collision and Postgres.
        if(dedupeAccountsById(cloud.accounts) && window.trackrSync.purgeQueuedTables){
          await window.trackrSync.purgeQueuedTables(['accounts']);
        }
        if(!accountsReconciledOnce[currentUser.id]){
          // See reconcileAccountsOnFirstContact's own comment - this device may have local
          // wallets that were never pushed up, and another device may have already populated the
          // cloud with ITS OWN divergent set. Persists and pushes internally, so it's
          // deliberately NOT added to toPersist below (that would just redundantly re-write the
          // same key with the same value).
          await reconcileAccountsOnFirstContact(currentUser.id, cloud.accounts);
        } else {
          // Once reconciled, the cloud is authoritative outright - including a genuinely empty
          // cloud (e.g. right after Reset Everything's cloud-delete really did confirm every row
          // gone). This used to fall back to defaultAccounts() whenever cloud.accounts was empty,
          // reasoning that an empty entry-account picker was worse - but that silently reseeded
          // the default 3 wallets back into local storage on every single login after a real
          // reset, with no way to tell "this account has never had wallets" apart from "this
          // account's wallets were just deleted on purpose". renderAccountsList already has its
          // own empty state ("No accounts yet. Add one below.") for exactly this case, so there's
          // no picker-with-nothing-selectable problem left to guard against here.
          accounts = cloud.accounts;
          toPersist.push(['accounts', accounts]);
        }
      }
      else if(cloud.accountsError){
        // Expected, anticipated state until the accounts table + RLS exist in the real Supabase
        // project - logged here for traceability (so it's never invisible if something's
        // actually wrong), but deliberately NOT surfaced as the same "couldn't reach the cloud"
        // toast below, which is reserved for a genuine failure of the four tables that already
        // work today. Local accounts stay exactly as they are.
        diagLogPage('page:accounts-pull-failed', cloud.accountsError);
      }
      if(cloud.categories!==null){
        // Same shape as accounts directly above, for the same reason - categories is newer still.
        if(!categoriesReconciledOnce[currentUser.id]){
          // See reconcileCategoriesOnFirstContact's own comment. Persists and pushes internally,
          // so deliberately NOT added to toPersist below (would just redundantly re-write the same
          // key with the same value).
          await reconcileCategoriesOnFirstContact(currentUser.id, cloud.categories, cloud.categoryMeta);
        } else {
          // Once reconciled, the cloud is authoritative outright - including a genuinely empty
          // cloud (e.g. right after Reset Everything's cloud-delete really did confirm every row
          // gone). This used to fall back to defaultCategories() whenever both lists came back
          // empty, reasoning that an empty Add Entry picker was worse - but that silently reseeded
          // the full default category list back into local storage on every single login after a
          // real reset, with no way to tell "this account has never had categories" apart from
          // "this account's categories were just deleted on purpose". An empty picker here
          // degrades the same way populateEntryAccountSelect already does with zero accounts -
          // no crash, just nothing to pick - so there's no problem left to guard against here.
          categories = cloud.categories;
          // Cloud replaces THIS ACCOUNT'S OWN scope outright, same as `categories` itself on this
          // branch - once reconciled, the cloud is authoritative for position/colour too. Only
          // categoryMeta[currentUser.id] is touched - any other account's bucket that might still
          // be sitting in this device's storage (see categoryMetaScopeKey's own comment) is left
          // completely alone, never read or overwritten by this login.
          categoryMeta[currentUser.id] = cloud.categoryMeta || {};
          toPersist.push(['categories', categories]);
          toPersist.push(['categoryMeta', categoryMeta]);
        }
      }
      else if(cloud.categoriesError){
        // Expected, anticipated state until the categories table + RLS exist in the real Supabase
        // project (see the migration SQL in this round's PR description) - logged for
        // traceability, deliberately not surfaced as the generic "couldn't reach the cloud" toast
        // below. Local categories stay exactly as they are.
        diagLogPage('page:categories-pull-failed', cloud.categoriesError);
      }
      if(cloud.dismissedDuplicates!==null){
        // A pure UNION with whatever's already local, never an authoritative replace like the
        // other tables above - a dismissal is additive-only by nature (made via "Keep both",
        // cleared via pruneDuplicateDismissalsForDeletedTx, which already deletes the cloud row
        // too), so there's no "this device's copy is stale, discard it" case to protect against
        // here the way there is for transactions/debts/goals/budgets/accounts. Adding cloud-only
        // keys in means a dismissal made on a different device now applies here too; keeping any
        // local-only key (e.g. made moments ago, still offline, not yet pushed) means it isn't
        // lost just because this pull happened to land first.
        const scope = duplicateDismissalScopeKey();
        if(!duplicateDismissals[scope]) duplicateDismissals[scope] = {};
        let dismissalsChanged = false;
        cloud.dismissedDuplicates.forEach(key=>{
          if(!duplicateDismissals[scope][key]){ duplicateDismissals[scope][key] = true; dismissalsChanged = true; }
        });
        if(dismissalsChanged) toPersist.push(['duplicateDismissals', duplicateDismissals]);
      } else if(cloud.dismissedDuplicatesError){
        // Same reasoning as cloud.accountsError above - a new, optional table that may not exist
        // in every Supabase project yet; local dismissals stay exactly as they are.
        diagLogPage('page:dismissed-duplicates-pull-failed', cloud.dismissedDuplicatesError);
      }
      await persistLocalKeys(toPersist);
      window.trackrSync.retryPendingWrites();
      if(pullFailed){
        // Same standard as the OTP/sync-rejection logging elsewhere - log the ACTUAL reason
        // (which table, what error code/message, whether the device even thought it was online)
        // rather than only ever showing the generic toast with nothing behind it in View Log.
        diagLogPage('page:cloud-pull-failed', cloud.error);
        showAppToast(cloudPullFailureMessage(cloud.error));
      }
    }catch(e){
      console.error('Cloud sync failed, continuing with local cache:', e);
      const errInfo = { table:null, code:e && e.code || null, message: e && e.message || String(e), name: e && e.name || null, online: navigator.onLine, thrownOutsidePull:true };
      diagLogPage('page:cloud-pull-failed', errInfo);
      showAppToast(cloudPullFailureMessage(errInfo));
    }
    // A permanently-rejected write (RLS/FK violation - see PERMANENT_FAILURE_CODES in
    // js/supabase.js) never throws and never reaches cloudPullFailureMessage above - runOp()
    // records it and moves on, by design, so one bad row doesn't block every other sync. That
    // silence was itself the bug once (a whole table's default rows rejected on every login with
    // literally nothing shown to the user, not even a wrong message - the wallet-id-collision
    // case this was written for). Told once per app launch, deliberately worded as ongoing
    // rather than "temporary" - retrying the identical write changes nothing here, this only
    // clears once the underlying id conflict itself is resolved.
    if(!unsyncableToastShownThisLaunch){
      try{
        const unsyncable = await findUnsyncableRecords();
        if(unsyncable.length){
          unsyncableToastShownThisLaunch = true;
          diagLogPage('page:unsyncable-records-found', { count: unsyncable.length, tables: [...new Set(unsyncable.map(u=>u.table))] });
          showAppToast(`${unsyncable.length} item${unsyncable.length===1?'':'s'} can't sync to your account — see Integrity Check under Account & Backup.`);
        }
      }catch(e){}
    }
    if(refreshAfter) refreshAll();
  }
  // Logged at every moment the app shell's reveal state changes (auth overlay hiding, the loading
  // overlay fading, or logout re-covering the screen) - a fast visual flash isn't something a
  // user can screenshot, so this is what makes the NEXT report of one diagnosable from View Log
  // instead of guesswork: whether what was on screen at that exact instant was the confirmed-real
  // figure, the skeleton placeholder, or (the bug shape) neither - a bare zero pretending to be real.
  function logHomeReveal(path){
    try{
      const bal = document.getElementById('home-balance');
      const isSkeleton = bal ? bal.classList.contains('skeleton') : null;
      diagLogPage('page:home-reveal', {
        path,
        homeBalanceAtReveal: bal ? bal.textContent.trim() : null,
        dataState: isSkeleton===null ? null : (isSkeleton ? 'skeleton' : 'real'),
      });
    }catch(e){}
  }
  // Instantly re-covers the screen with the same loading overlay used at startup, with no fade-in
  // (a fade would itself expose the very gap this closes, since the background is party visible
  // through a transitioning opacity) - used right before logout clears local data below. That
  // clear, and the reload signOut()'s SIGNED_OUT event triggers afterward, previously had no
  // cover at all: the auth overlay only protects the LOGIN direction, and by the time someone is
  // logged in and looking at, say, the More screen, the loading overlay already faded out long
  // ago. Whatever the exact timing of the async signOut()/reload turns out to be on a given
  // device, this guarantees nothing in that gap is ever visible, rather than relying on the
  // timing lining up.
  function coverScreenForLogout(){
    const el = document.getElementById('loading-overlay');
    if(!el) return;
    el.style.transition = 'none';
    el.style.display = 'flex';
    el.style.opacity = '1';
    const bal = document.getElementById('home-balance');
    if(bal){ bal.classList.add('skeleton'); bal.textContent = 'Loading…'; }
  }
  // Both the explicit post-signIn call (handleAuthSubmit) and the onAuthStateChange SIGNED_IN
  // listener below can end up calling this for the very same login - confirmed via View Log: a
  // "reauth" reveal logged a zero balance, immediately followed by a "first-start" reveal with
  // the correct one, meaning two concurrent runs were racing on the same shared transactions/
  // debts/etc arrays (one's loadData()/cloud-pull clobbering what the other had already
  // computed, before its own refreshAll() got to run). Whichever call arrives first runs for
  // real; a second call arriving before the first finishes piggybacks on the SAME in-flight
  // promise instead of starting an independent, racing execution.
  let startAppForUserPromise = null;
  function startAppForUser(user){
    if(startAppForUserPromise) return startAppForUserPromise;
    startAppForUserPromise = startAppForUserImpl(user).finally(()=>{ startAppForUserPromise = null; });
    return startAppForUserPromise;
  }
  async function startAppForUserImpl(user){
    if(appStarted){
      // attachUserAndSync (cloud pull + refreshAll, since refreshAfter=true) must finish BEFORE
      // the auth overlay hides - hiding it first (as this previously did) reveals whatever the
      // Home screen was already showing underneath (a guest/offline zero-state, or stale data
      // from before login) for the entire network round-trip, then visibly flashes to the real
      // numbers once the pull finally completes and refreshAll() runs. Doing the data refresh
      // first means the screen underneath is already correct by the time it's ever shown.
      await attachUserAndSync(user, true);
      logHomeReveal('reauth');
      hideAuthOverlay();
      return;
    }
    appStarted = true;
    // NOT hidden here (as this previously did) - on a completely fresh install (no prior guest
    // session), the auth overlay IS the login form the user just submitted, and hiding it this
    // early reveals the Home screen underneath before loadData()/attachUserAndSync()/refreshAll()
    // below have populated it with anything real. The loading overlay isn't covering for it either
    // at this point - it already faded out before this same auth screen first appeared. Moved to
    // after refreshAll() so the first thing ever shown here is already correct, same principle as
    // the appStarted branch above. (When a session already exists at page load, this whole
    // function still runs through this branch, but the loading overlay - not this one - is what's
    // actually covering the screen throughout, so this move doesn't change anything for that path.)
    try{ await loadData(); }catch(e){ console.error(e); }
    await attachUserAndSync(user, false);
    // dedupeAccountsById() (inside loadData(), before currentUser existed) may have already
    // repaired a local id collision - push the corrected accounts/transactions up now that a user
    // is actually attached. Harmless even if attachUserAndSync's own cloud-pull branch already
    // replaced `accounts` wholesale with the (already-correct) cloud copy in the meantime - this
    // is then just an idempotent re-upsert of the same rows.
    if(accountsRepairedThisLoad && currentUser){
      await saveAccounts();
      await saveTransactions();
      accountsRepairedThisLoad = false;
    }
    injectIcons();
    applyTheme(settings.theme || 'light');
    populateEntryCategorySelect('income');
    populateEntryAccountSelect();
    if(typeof populateHistoryFilterAccountSelect==='function') populateHistoryFilterAccountSelect();
    populateFilterCategorySelect('all');
    populateHistoryFilterCategorySelect('all');
    setDefaultDates();
    bindEvents();
    bindPrivacyEvents();
    bindCrossTabSync();
    syncHideBalancesUI();
    syncAppLockUI();
    syncNetWorthToggleUI();
    syncSfxToggleUI();
    updateNotifPermissionStatus();
    applyDesktopLayout();
    desktopMql.addEventListener('change', applyDesktopLayout);
    refreshAll();
    logHomeReveal('first-start');
    hideAuthOverlay();
    renderCategoriesView();
    history.replaceState({ tab:'home', sub:null }, '', '');
    window.addEventListener('popstate', (e)=>{
      const state = e.state || { tab:'home', sub:null };
      if(!state.searchOpen){ closeGlobalSearch(); }
      if(!state.scheduleOpen){ closeSchedule(); }
      if(!state.catDetailOpen){ closeCategoryDetail(); }
      if(!state.txDetailOpen){ closeTransactionDetail(); }
      if(!state.notificationsOpen){ closeNotificationsOverlay(); }
      if(!state.debtDetailOpen){ closeDebtDetail(); }
      if(!state.goalDetailOpen){ closeGoalDetail(); }
      if(!state.diagLogOpen){ closeDiagLogOverlay(); }
      if(!state.colorPickerOpen){ closeColorPicker(); }
      if(state.tab){
        renderTabUI(state.tab);
        if(state.tab==='more'){
          if(state.sub) renderMoreSubState(state.sub); else renderMoreMenuState();
        }
      }
    });
    fadeOutLoadingOverlay();
    if(settings.appLockEnabled && settings.appLockPin){ lockApp(); } else { resetAppLockTimer(); }
    resetHideBalancesTimer();
    setInterval(maybeFireDueNotifications, 5*60*1000);
    window.addEventListener('online', ()=>{ if(currentUser) window.trackrSync.retryPendingWrites(); });
  }

  async function init(){
    preloadSfx();
    injectIcons(); // auth screen needs its icon before a session check even resolves
    document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
    document.getElementById('auth-toggle-mode-btn').addEventListener('click', ()=> showAuthOverlay(authMode==='login' ? 'signup' : 'login'));
    document.getElementById('auth-skip-btn').addEventListener('click', async ()=>{
      try{ await window.storage.set('skippedLogin', 'true'); }catch(e){}
      startAppForUser(null);
    });
    document.getElementById('auth-password-toggle').addEventListener('click', togglePasswordVisibility);
    document.getElementById('auth-resend-btn').addEventListener('click', handleResendConfirmation);
    document.getElementById('auth-signupcode-form').addEventListener('submit', handleSignupCodeSubmit);
    document.getElementById('auth-checkinbox-back-btn').addEventListener('click', ()=> showAuthOverlay('login'));
    document.getElementById('auth-confirmed-login-btn').addEventListener('click', ()=> showAuthOverlay('login'));
    document.getElementById('auth-forgot-password-btn').addEventListener('click', showAuthForgotView);
    document.getElementById('auth-forgot-back-btn').addEventListener('click', ()=> showAuthOverlay('login'));
    document.getElementById('auth-forgot-code-back-btn').addEventListener('click', ()=> showAuthOverlay('login'));
    document.getElementById('auth-forgot-form').addEventListener('submit', handleForgotPasswordSubmit);
    document.getElementById('auth-forgot-code-form').addEventListener('submit', handleForgotCodeSubmit);
    document.getElementById('auth-forgot-code-resend-btn').addEventListener('click', handleResendForgotCode);
    document.getElementById('auth-reset-password-toggle').addEventListener('click', toggleResetPasswordVisibility);
    document.getElementById('auth-reset-password-form').addEventListener('submit', handleResetPasswordSubmit);
    document.getElementById('auth-reset-done-login-btn').addEventListener('click', ()=> showAuthOverlay('login'));
    // Long-press-the-logo shortcut to View Log from the auth screen - the only path a signed-out
    // user has to their own device's diagnostic log. auth:signup-* entries are written on exactly
    // the device of someone who by definition can't log in yet, and the rest of Install
    // Diagnostics lives behind More -> Profile & Backup, which this same auth gate blocks - so
    // without this, those entries were permanently unreachable by the only people who generate
    // them. Deliberately not a visible button (keeps the login screen uncluttered for the
    // overwhelming majority who never need it) - mirrors the discreet long-press pattern already
    // used nowhere else in this app, chosen over a link that only appears after an error since a
    // thrown exception before any error UI renders would otherwise still leave someone stuck.
    (function(){
      const brandMark = document.getElementById('auth-brand-mark');
      if(!brandMark) return;
      let pressTimer = null;
      const LONG_PRESS_MS = 900;
      function start(){
        clear();
        pressTimer = setTimeout(()=>{
          pressTimer = null;
          const overlay = document.getElementById('diaglog-overlay');
          if(overlay) overlay.classList.add('above-auth-gate');
          openDiagLogOverlay();
        }, LONG_PRESS_MS);
      }
      function clear(){ if(pressTimer){ clearTimeout(pressTimer); pressTimer = null; } }
      brandMark.addEventListener('mousedown', start);
      brandMark.addEventListener('mouseup', clear);
      brandMark.addEventListener('mouseleave', clear);
      brandMark.addEventListener('touchstart', start, { passive:true });
      brandMark.addEventListener('touchend', clear);
      brandMark.addEventListener('touchcancel', clear);
    })();

    // A confirmation-link click lands back here with the email-verification token still
    // in the URL — createClient() above auto-detects it and would otherwise silently log
    // the user straight into a live session. Discard that session and show an explicit
    // "confirmed, now log in" screen instead, per the redesigned flow.
    if(window.trackrSync.cameFromEmailConfirmation){
      try{ await window.trackrSync.client.auth.signOut(); }catch(e){}
      if(history.replaceState) history.replaceState(null, '', location.pathname);
      fadeOutLoadingOverlay();
      showAuthConfirmedView();
      return;
    }
    // A password-reset link lands back here the same way, EXCEPT the live "recovery" session
    // it establishes needs to stay intact - handleResetPasswordSubmit() below calls
    // updateUser() using exactly that session, and only signs out once the new password is
    // actually set.
    if(window.trackrSync.cameFromPasswordRecovery){
      if(history.replaceState) history.replaceState(null, '', location.pathname);
      fadeOutLoadingOverlay();
      showAuthResetPasswordView();
      return;
    }

    window.trackrSync.client.auth.onAuthStateChange((event, session)=>{
      if(event==='SIGNED_IN' && session && session.user && !appStarted){
        startAppForUser(session.user);
      } else if(event==='SIGNED_OUT'){
        appStarted = false;
        currentUser = null;
        if(suppressNextSignedOutReload){ suppressNextSignedOutReload = false; return; }
        location.reload();
      }
    });

    let session = null;
    try{
      const { data } = await window.trackrSync.client.auth.getSession();
      session = data && data.session;
    }catch(e){ console.error(e); }

    if(session && session.user){
      await startAppForUser(session.user);
      return;
    }

    // Only ever show the login gate on a genuine first-ever open (no session, and no prior
    // "Skip for now" choice recorded) - someone who already chose to use Trackr offline
    // shouldn't be re-prompted to log in every single time they open the app. They can still
    // log in later, deliberately, from the Log In action in Profile & Backup.
    let skippedLogin = false;
    try{
      const flag = await window.storage.get('skippedLogin');
      skippedLogin = !!(flag && flag.value === 'true');
    }catch(e){}

    if(skippedLogin){
      await startAppForUser(null);
    } else {
      fadeOutLoadingOverlay();
      showAuthOverlay('login');
    }
  }

  /* ---------- Diagnostic log (shared with sw.js) ----------
     sw.js writes lifecycle events (install/activate/fetch) to this same
     IndexedDB store from its own execution context, independent of whether
     this page is even open. This side adds the registration-side events
     (register called/resolved/failed, controllerchange) and exposes a
     reader so Profile & Backup can display/copy the combined timeline -
     the whole point being to have something to inspect *after* a failed
     install, rather than only ever being able to theorize about timing. */
  const DIAG_DB_NAME = 'trackrDiagnostics';
  const DIAG_STORE_NAME = 'events';
  // This log persists indefinitely across reloads AND app updates (that's the whole point - it
  // survives a failed install to be inspected afterward) - which means, without a build tag on
  // each entry, an OLD entry from a build that's since been fixed is visually indistinguishable
  // from a fresh one on a later report. Populated once real early (see the SW registration
  // handler below) via getRunningSwVersion() - the one source that can't lie about what's really
  // running, same reasoning as the version display in Profile & Backup.
  let cachedPageBuildVersion = null;
  function diagLogPage(event, detail){
    try{
      const req = indexedDB.open(DIAG_DB_NAME, 1);
      req.onupgradeneeded = () => {
        if(!req.result.objectStoreNames.contains(DIAG_STORE_NAME)){
          req.result.createObjectStore(DIAG_STORE_NAME, { keyPath:'id', autoIncrement:true });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        try{
          const tx = db.transaction(DIAG_STORE_NAME, 'readwrite');
          tx.objectStore(DIAG_STORE_NAME).add({
            ts: Date.now(), source:'page', event, buildVersion: cachedPageBuildVersion,
            detail: detail==null ? null : (typeof detail==='string' ? detail : JSON.stringify(detail))
          });
          tx.oncomplete = () => db.close();
          tx.onerror = () => db.close();
        }catch(e){ try{ db.close(); }catch(e2){} }
      };
      req.onerror = () => {};
    }catch(e){}
  }
  function readDiagLog(){
    return new Promise((resolve) => {
      try{
        const req = indexedDB.open(DIAG_DB_NAME, 1);
        req.onupgradeneeded = () => {
          if(!req.result.objectStoreNames.contains(DIAG_STORE_NAME)){
            req.result.createObjectStore(DIAG_STORE_NAME, { keyPath:'id', autoIncrement:true });
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          try{
            const tx = db.transaction(DIAG_STORE_NAME, 'readonly');
            const getAll = tx.objectStore(DIAG_STORE_NAME).getAll();
            getAll.onsuccess = () => { db.close(); resolve(getAll.result || []); };
            getAll.onerror = () => { db.close(); resolve([]); };
          }catch(e){ try{ db.close(); }catch(e2){} resolve([]); }
        };
        req.onerror = () => resolve([]);
      }catch(e){ resolve([]); }
    });
  }
  function formatDiagLog(entries){
    if(!entries.length) return 'No diagnostic events recorded yet on this device.';
    // This log persists across app updates, so an entry from a build that's since been fixed can
    // otherwise look identical to a fresh one - tagging the build each entry was recorded under
    // (swVersion for sw.js's own entries, buildVersion for page-side ones) makes that visible
    // directly in the log instead of needing to be inferred or assumed.
    return entries
      .sort((a,b)=> a.ts-b.ts)
      .map(e => {
        const build = e.swVersion || e.buildVersion;
        return `${new Date(e.ts).toISOString()}${build ? ' ('+build+')' : ''} [${e.source}] ${e.event}${e.detail ? ' — '+e.detail : ''}`;
      })
      .join('\n');
  }
  // Hard cap on the diagnostic log's own entry count, oldest evicted first - this log has never
  // had one in the time it's existed, and a real production log confirmed it: 1038 entries over
  // 11 days, growing without bound by design. 2000 is generous even with the per-entry message
  // cap now in place (capErrorMessage/capMessageStr in js/supabase.js) - at a few hundred bytes
  // per entry worst-case post-truncation, 2000 entries is a small fraction of what IndexedDB
  // typically allows an origin (tens of MB minimum on every real browser), so this exists purely
  // as a backstop against unbounded growth, not because normal use is expected to approach it.
  // Deliberately NOT applied inside every individual writer (sw.js's diagLog, this file's
  // diagLogPage, or supabase.js's own logSyncError/logDedupeCollision/logDeleteRetryDiscarded) -
  // that would mean re-implementing the same count-and-evict logic in three separate files
  // sharing one IndexedDB store by convention, not by any shared module. Run once per launch
  // instead, right after the log's first write this session, which is frequent enough for an app
  // opened regularly and avoids that duplication entirely.
  const DIAG_LOG_ENTRY_CAP = 2000;
  function pruneDiagLogIfOversized(){
    return new Promise((resolve) => {
      try{
        const req = indexedDB.open(DIAG_DB_NAME, 1);
        req.onupgradeneeded = () => {
          if(!req.result.objectStoreNames.contains(DIAG_STORE_NAME)){
            req.result.createObjectStore(DIAG_STORE_NAME, { keyPath:'id', autoIncrement:true });
          }
        };
        req.onsuccess = () => {
          const db = req.result;
          try{
            const countTx = db.transaction(DIAG_STORE_NAME, 'readonly');
            const countReq = countTx.objectStore(DIAG_STORE_NAME).count();
            countReq.onsuccess = () => {
              const total = countReq.result || 0;
              const excess = total - DIAG_LOG_ENTRY_CAP;
              if(excess <= 0){ db.close(); resolve(); return; }
              // ids are autoIncrement, so ascending id order IS oldest-first - a cursor walking
              // forward from the start and deleting exactly `excess` records evicts the oldest
              // entries without ever needing to read/sort every entry into memory first.
              const delTx = db.transaction(DIAG_STORE_NAME, 'readwrite');
              const cursorReq = delTx.objectStore(DIAG_STORE_NAME).openCursor();
              let deleted = 0;
              cursorReq.onsuccess = (e) => {
                const cursor = e.target.result;
                if(cursor && deleted < excess){ cursor.delete(); deleted++; cursor.continue(); }
              };
              delTx.oncomplete = () => { db.close(); resolve(); };
              delTx.onerror = () => { db.close(); resolve(); };
            };
            countReq.onerror = () => { db.close(); resolve(); };
          }catch(e){ try{ db.close(); }catch(e2){} resolve(); }
        };
        req.onerror = () => resolve();
      }catch(e){ resolve(); }
    });
  }
  diagLogPage('page:script-start');
  pruneDiagLogIfOversized();

  /* ---------- PWA update detection ----------
     Only ever touches the Cache Storage API (via sw.js) - never localStorage or
     IndexedDB, so local data and the Supabase session are untouched by an update. */
  let updateInProgress = false; // only reload on controllerchange if WE asked for this activation
  let swRegistration = null;
  // Asks the ACTUAL controlling service worker what version it is, rather than trusting a
  // hardcoded string on the page - a stale-cached page could otherwise report a build number
  // that doesn't match what's really running. Resolves null if there's no controller yet
  // (very first load, before activation) or the worker doesn't answer in time.
  function getRunningSwVersion(){
    return new Promise((resolve) => {
      if(!('serviceWorker' in navigator) || !navigator.serviceWorker.controller){ resolve(null); return; }
      const channel = new MessageChannel();
      const timer = setTimeout(()=> resolve(null), 1500);
      channel.port1.onmessage = (e) => { clearTimeout(timer); resolve(e.data && e.data.version || null); };
      navigator.serviceWorker.controller.postMessage({ type:'GET_VERSION' }, [channel.port2]);
    });
  }
  function showUpdateBanner(reg){
    const el = document.getElementById('sw-update-banner');
    if(!el || !reg.waiting) return;
    positionAboveBottomNav(el, 14);
    animateIn(el, 'flex');
    setBottomSpaceReservation('updateBanner', el.getBoundingClientRect().height + 14);
    const btn = document.getElementById('sw-update-btn');
    btn.onclick = () => {
      btn.disabled = true;
      btn.textContent = 'Updating…';
      updateInProgress = true;
      reg.waiting.postMessage({ type:'SKIP_WAITING' });
    };
  }
  function hideUpdateBanner(){
    const el = document.getElementById('sw-update-banner');
    if(el) animateOut(el);
    setBottomSpaceReservation('updateBanner', 0);
  }

  // A prior JS measure-and-nudge approach here (pinBottomNav, comparing .bottom-nav's rendered
  // rect against window.visualViewport) was removed - real-device evidence showed it applied ZERO
  // correction despite the nav still floating ~90pt above the true screen bottom. That's not a
  // tuning problem: if the WebKit quirk responsible makes visualViewport itself report the same
  // (wrong) height nav is already being positioned against, the two measurements agree and no gap
  // is ever detected, even though a real gap exists against the physical screen. The actual fix
  // is in css/styles.css - .bottom-nav is no longer position:fixed at all, so it's not subject to
  // position:fixed's viewport-anchoring behavior (whatever it's doing on this device) in the first
  // place; it's an ordinary in-flow flex child of body now, positioned by ordinary layout math -
  // the same mechanism already proven correct for .views' own bottom-reaching behavior.
  //
  // Nothing in this file recomputed on resize/orientationchange/visualViewport-resize before this -
  // confirmed by grep, and confirmed as the cause of a separate real-device report: a bottom-docked
  // toast/banner positioned against a stale window.innerHeight while iOS Safari's toolbar was
  // mid-transition. Only re-measures and repositions whatever's currently on screen - never calls
  // into sync/Supabase/storage, so this can fire as often as the browser likes without side effects
  // beyond a layout recalculation.
  function reflowBottomDockedUI(){
    const toastEl = document.getElementById('app-toast');
    if(toastEl && toastEl.classList.contains('show')){
      positionAboveBottomNav(toastEl, 14);
      setBottomSpaceReservation('toast', toastEl.getBoundingClientRect().height + 14);
    }
    const bannerEl = document.getElementById('sw-update-banner');
    if(bannerEl && bannerEl.classList.contains('open')){
      positionAboveBottomNav(bannerEl, 14);
      setBottomSpaceReservation('updateBanner', bannerEl.getBoundingClientRect().height + 14);
    }
  }
  // Debounced rather than run on every event: a toolbar collapse/expand or an inset recompute
  // fires several resize/visualViewport events in quick succession as it animates, and this only
  // needs to land once the dust settles, not on every intermediate frame. 150ms is short enough to
  // feel immediate once the gesture ends, long enough to coalesce a whole burst into one pass.
  let viewportReflowTimer = null;
  function scheduleViewportReflow(){
    clearTimeout(viewportReflowTimer);
    viewportReflowTimer = setTimeout(reflowBottomDockedUI, 150);
  }
  window.addEventListener('resize', scheduleViewportReflow);
  window.addEventListener('orientationchange', scheduleViewportReflow);
  if(window.visualViewport) window.visualViewport.addEventListener('resize', scheduleViewportReflow);

  if ('serviceWorker' in navigator) {
    document.getElementById('sw-update-dismiss').addEventListener('click', hideUpdateBanner);
    // Registered immediately rather than waiting for window's 'load' event (which only fires
    // once every image/font/CDN script has finished) - on a slow connection, that delay was
    // exactly the window where someone could install to the home screen and background the
    // tab before the service worker ever got a chance to register at all, leaving nothing
    // able to serve the app offline afterward - not a cache bug at that point, just no
    // service worker in existence yet to consult.
    diagLogPage('page:sw-register-called');
    navigator.serviceWorker.register('sw.js').then(reg => {
      swRegistration = reg;
      diagLogPage('page:sw-register-resolved', {
        hasController: !!navigator.serviceWorker.controller,
        active: !!reg.active, installing: !!reg.installing, waiting: !!reg.waiting
      });
      getRunningSwVersion().then(v => { cachedPageBuildVersion = v; });
      updateVersionDisplay();
      // A worker may already be waiting if it installed while this tab was
      // closed/backgrounded - only prompt if something is already actively
      // controlling the page (i.e. this is a genuine update, not the very
      // first-ever install, which also transiently has no controller yet).
      if(reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if(!installing) return;
        diagLogPage('page:updatefound');
        installing.addEventListener('statechange', () => {
          diagLogPage('page:installing-statechange', installing.state);
          if(installing.state === 'installed' && navigator.serviceWorker.controller){
            showUpdateBanner(reg);
          }
        });
      });
    }).catch(err => diagLogPage('page:sw-register-failed', err && err.message));
    // clients.claim() in sw.js's activate handler fires controllerchange on the very
    // first-ever activation too (an ordinary first visit, not an update - there's no
    // "old" version to move away from) - only reload here if the user actually clicked
    // Update above, otherwise every fresh install would silently reload itself once.
    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      diagLogPage('page:controllerchange', { updateInProgress });
      updateVersionDisplay();
      if(!updateInProgress || reloadedForUpdate) return;
      reloadedForUpdate = true;
      location.reload();
    });
  }

  /* ---------- Manual "Check for Updates" (Profile & Backup) ---------- */
  const checkUpdateBtn = document.getElementById('check-update-btn');
  const appVersionNote = document.getElementById('app-version-note');
  // Shows which build is ACTUALLY running on this device (via the controlling service worker
  // itself, not a hardcoded string) - this is what makes "have I actually gotten a given fix
  // yet" a directly checkable fact instead of a guess, on either side.
  async function updateVersionDisplay(){
    if(!appVersionNote) return;
    const version = await getRunningSwVersion();
    if(version) appVersionNote.textContent = `Running build ${version} on this device. Checks for updates automatically, or check now.`;
  }
  if(checkUpdateBtn){
    checkUpdateBtn.addEventListener('click', async () => {
      if(!('serviceWorker' in navigator) || !swRegistration){
        if(appVersionNote) appVersionNote.textContent = "Updates aren't available in this browser.";
        return;
      }
      checkUpdateBtn.disabled = true;
      const originalText = checkUpdateBtn.textContent;
      checkUpdateBtn.textContent = 'Checking…';
      try{
        await swRegistration.update();
        // update() resolves once the browser has checked sw.js for changes - if that
        // produced a new worker, it'll be sitting in .installing or .waiting by now.
        await new Promise(r => setTimeout(r, 800));
        if(swRegistration.waiting && navigator.serviceWorker.controller){
          showUpdateBanner(swRegistration);
          if(appVersionNote) appVersionNote.textContent = 'A new version is available below.';
        } else if(swRegistration.installing){
          if(appVersionNote) appVersionNote.textContent = 'Downloading an update — check back in a moment.';
        } else if(appVersionNote){
          // Explicit "no update" feedback - updateVersionDisplay() alone re-renders the exact
          // same "Running build vX..." string that was already showing before the click, which
          // looked exactly like nothing had happened. This is the one outcome that needs its
          // own distinct sentence, not just the default status text re-applied.
          const version = await getRunningSwVersion();
          appVersionNote.textContent = version
            ? `You're on the latest version (build ${version}).`
            : "You're on the latest version.";
        }
      }catch(e){
        if(appVersionNote) appVersionNote.textContent = "Couldn't check for updates — check your connection.";
      } finally {
        checkUpdateBtn.disabled = false;
        checkUpdateBtn.textContent = originalText;
      }
    });
  }

  /* ---------- Install diagnostics viewer (Profile & Backup) ----------
     A real overlay (not an inline expanding div) - the earlier inline version could render
     entirely below the fold on a tall settings page with no visible change above it, which
     is exactly what looked like "View Log does nothing" on desktop. Follows the same
     showOverlay/hideOverlay + history-state pattern as every other overlay in the app, so
     the close button, tapping the backdrop, and the browser/gesture back button all work. */
  const viewDiagLogBtn = document.getElementById('view-diag-log-btn');
  const copyDiagLogBtn = document.getElementById('copy-diag-log-btn');
  const diagLogResults = document.getElementById('diag-log-results');
  async function openDiagLogOverlay(){
    const entries = await readDiagLog();
    if(diagLogResults) diagLogResults.textContent = formatDiagLog(entries);
    showOverlay('diaglog-overlay');
    if(!(history.state && history.state.diagLogOpen)) history.pushState({ diagLogOpen:true }, '', '');
  }
  function closeDiagLogOverlay(){
    hideOverlay('diaglog-overlay');
    // Always stripped here regardless of how this closed (close button, backdrop tap, back
    // gesture) - harmless no-op if it was never added (opened the ordinary way, from More).
    const overlayEl = document.getElementById('diaglog-overlay');
    if(overlayEl) overlayEl.classList.remove('above-auth-gate');
  }
  if(viewDiagLogBtn) viewDiagLogBtn.addEventListener('click', openDiagLogOverlay);
  document.getElementById('close-diaglog-btn').addEventListener('click', ()=> history.back());
  document.getElementById('diaglog-overlay').addEventListener('click', (e)=>{ if(e.target.id==='diaglog-overlay') history.back(); });
  // Copy Log worked on desktop but silently did nothing usable on mobile. navigator.clipboard.
  // writeText() has several documented mobile-specific failure modes that don't show up on
  // desktop Chrome: it throws NotAllowedError when the document doesn't have focus at the exact
  // moment it's called (mobile Chrome enforces this more strictly than desktop), and this log
  // grows UNBOUNDED for the lifetime of the install (see diagLogPage's own comment - it persists
  // across every reload and app update, nothing here has ever pruned it), so a long-lived
  // install's log can be a large payload that some mobile browsers/WebViews are known to choke
  // on for clipboard writes even where they work fine for a short string. Both are real,
  // documented mobile-vs-desktop gaps, not something reproducible in a desktop-browser-in-
  // mobile-viewport test - see the shipping notes for what was and wasn't verified against an
  // actual device. Rather than chase one exact cause blind, this now defends against both at
  // once: try the modern Clipboard API first, fall back to the legacy execCommand('copy') path
  // (a different code path, unaffected by the same Permissions-Policy/focus timing), and if
  // BOTH fail, the caller always has a completely clipboard-independent Download .txt action
  // and a manually-selectable log view available - so there's always a way to get the log off
  // the device, whatever the mobile browser's clipboard support turns out to be.
  async function copyTextToClipboard(text){
    try{
      if(window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(text);
        return true;
      }
    }catch(e){}
    try{
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.top = '0'; ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
      const ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok) return true;
    }catch(e){}
    return false;
  }
  function downloadDiagLogAsTxt(text, filenamePrefix){
    try{
      const blob = new Blob([text], { type:'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${filenamePrefix || 'trackr-diagnostics'}-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.txt`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=> URL.revokeObjectURL(url), 2000);
      return true;
    }catch(e){ return false; }
  }
  async function handleCopyDiagLog(){
    const text = formatDiagLog(await readDiagLog());
    const ok = await copyTextToClipboard(text);
    if(ok){ showAppToast('Diagnostic log copied'); return; }
    await openDiagLogOverlay();
    showAppToast("Couldn't copy automatically — use Download .txt below, or select the log and copy manually");
  }
  if(copyDiagLogBtn) copyDiagLogBtn.addEventListener('click', handleCopyDiagLog);
  const copyDiagLogInlineBtn = document.getElementById('copy-diag-log-inline-btn');
  if(copyDiagLogInlineBtn) copyDiagLogInlineBtn.addEventListener('click', async () => {
    // Already open and rendered - use it directly rather than re-reading IndexedDB, both for
    // speed and to keep this call as close to the triggering tap as possible.
    const text = (diagLogResults && diagLogResults.textContent) || formatDiagLog(await readDiagLog());
    const ok = await copyTextToClipboard(text);
    showAppToast(ok ? 'Diagnostic log copied' : "Couldn't copy automatically — try Download .txt instead");
  });
  const downloadDiagLogBtn = document.getElementById('download-diag-log-btn');
  if(downloadDiagLogBtn) downloadDiagLogBtn.addEventListener('click', async () => {
    const text = (diagLogResults && diagLogResults.textContent) || formatDiagLog(await readDiagLog());
    showAppToast(downloadDiagLogAsTxt(text) ? 'Log downloaded' : "Couldn't start the download — select the log and copy manually");
  });

  // Read-only, purely additive: gathers a snapshot of viewport/layout state at the moment the
  // button is pressed and hands it to the SAME download mechanism as the install diagnostics log
  // above (downloadDiagLogAsTxt). Nothing here changes layout, styles, or positioning - the only
  // DOM write is a single temporary, non-rendering probe element (position:fixed, visibility:
  // hidden, off-screen, zero interaction), appended, measured, and removed synchronously within
  // one function call before anything else runs. Exists because three straight rounds of fixing
  // the iOS bottom-nav gap from inference/reasoning (containing-block theories, viewport-height
  // theories) all failed on the real device - this collects the actual numbers instead of another
  // guess.
  function readEnvVar(name, sentinel){
    // env()'s fallback argument only engages when the named variable is UNDEFINED on this
    // platform (a device/browser with no notion of it at all, e.g. desktop, or an Android device
    // outside a display cutout context) - not when it's defined and legitimately zero. Reading it
    // back with a distinctive sentinel value that would never occur naturally lets the two cases
    // be told apart: if the computed padding comes back AS the sentinel, the variable was never
    // defined at all; any other value (including a real "0px") is the platform's actual answer.
    const jsProp = 'padding' + name.charAt(0).toUpperCase() + name.slice(1); // name is 'top'|'right'|'bottom'|'left'
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed; visibility:hidden; pointer-events:none; left:-9999px; top:-9999px; width:0; height:0; margin:0; padding:0;';
    probe.style.setProperty(`padding-${name}`, `env(safe-area-inset-${name}, ${sentinel}px)`);
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe)[jsProp];
    document.body.removeChild(probe);
    const isFallback = resolved === `${sentinel}px`;
    return { resolved, isFallback };
  }
  async function gatherLayoutDiagnostics(){
    const lines = [];
    const push = (label, value) => lines.push(`${label}: ${value}`);
    const section = (title) => { lines.push(''); lines.push(`--- ${title} ---`); };
    const rect = (sel) => {
      const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if(!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    };
    const cs = (el, prop) => el ? getComputedStyle(el)[prop] : null;

    lines.push(`Trackr Layout Diagnostics — ${new Date().toISOString()}`);

    section('ENVIRONMENT');
    push('navigator.standalone', typeof navigator.standalone !== 'undefined' ? navigator.standalone : '(undefined - not iOS Safari)');
    push('matchMedia(display-mode: standalone).matches', window.matchMedia('(display-mode: standalone)').matches);
    push('devicePixelRatio', window.devicePixelRatio);
    push('userAgent', navigator.userAgent);
    push('SW_VERSION (running)', await getRunningSwVersion() || '(none - no active controller)');

    section('VIEWPORT');
    push('window.innerWidth / innerHeight', `${window.innerWidth} / ${window.innerHeight}`);
    push('window.outerWidth / outerHeight', `${window.outerWidth} / ${window.outerHeight}`);
    push('screen.width / height', `${screen.width} / ${screen.height}`);
    push('screen.availWidth / availHeight', `${screen.availWidth} / ${screen.availHeight}`);
    push('documentElement.clientWidth / clientHeight', `${document.documentElement.clientWidth} / ${document.documentElement.clientHeight}`);
    if(window.visualViewport){
      const vv = window.visualViewport;
      push('visualViewport.width / height', `${vv.width} / ${vv.height}`);
      push('visualViewport.offsetLeft / offsetTop', `${vv.offsetLeft} / ${vv.offsetTop}`);
      push('visualViewport.pageLeft / pageTop', `${vv.pageLeft} / ${vv.pageTop}`);
      push('visualViewport.scale', vv.scale);
    } else {
      push('visualViewport', '(unavailable)');
    }

    section('SAFE AREA INSETS (measured via a temporary, non-rendering probe element, then removed)');
    for(const side of ['top','right','bottom','left']){
      const withSentinel = readEnvVar(side, 999999);
      push(`env(safe-area-inset-${side})`, withSentinel.isFallback ? 'UNDEFINED on this platform (fallback engaged)' : withSentinel.resolved);
      const withZeroFallback = readEnvVar(side, 0);
      push(`env(safe-area-inset-${side}, 0px)`, withZeroFallback.resolved);
    }

    section('GEOMETRY (getBoundingClientRect, in viewport coordinates)');
    const activeViewForContext = document.querySelector('.view.active');
    push('Active view when captured', activeViewForContext ? (activeViewForContext.id || '(no id)') : '(none active)');
    const geomTargets = [
      ['document.documentElement', document.documentElement],
      ['document.body', document.body],
      ['main', document.querySelector('main')],
      ['.views', document.querySelector('.views')],
      ['.bottom-nav', document.querySelector('.bottom-nav')],
    ];
    const viewsEl = document.querySelector('.views');
    const lastChildOfViews = viewsEl ? viewsEl.lastElementChild : null;
    const lastChildOfViewsLabel = `.views last child (<${lastChildOfViews ? lastChildOfViews.tagName.toLowerCase() : '?'}${lastChildOfViews && lastChildOfViews.id ? '#'+lastChildOfViews.id : ''}${lastChildOfViews && lastChildOfViews.className ? '.'+String(lastChildOfViews.className).replace(/\s+/g,'.') : ''}>)`;
    geomTargets.push([lastChildOfViewsLabel, lastChildOfViews]);
    // .views' children are the .view panels (Home/Insights/.../More), most display:none - its
    // LITERAL last DOM child (above, as specifically requested) is whichever panel is defined
    // last in index.html, not necessarily the one on screen right now. A plain "last element
    // child of the active .view" turned out unreliable too (More's own last child is a hidden
    // sub-menu panel, giving a nonsensical 0x0 rect) - the one thing that's both meaningful and
    // consistent across every view is the last actual transaction/list row rendered on screen,
    // if the active view has any, so that's what this reports instead.
    const activeView = document.querySelector('.view.active');
    const activeRows = activeView ? activeView.querySelectorAll('.activity-row') : [];
    const lastVisibleInActiveView = activeRows.length ? activeRows[activeRows.length-1] : null;
    const lastVisibleLabel = `[bonus, not explicitly requested] last .activity-row in the active .view (<${activeView ? activeView.id||activeView.tagName.toLowerCase() : '?'}>, ${activeRows.length} row(s) found)`;
    geomTargets.push([lastVisibleLabel, lastVisibleInActiveView]);
    const geoms = {};
    for(const [label, el] of geomTargets){
      const r = rect(el);
      geoms[label] = r;
      push(label, r ? `top=${r.top.toFixed(2)} bottom=${r.bottom.toFixed(2)} height=${r.height.toFixed(2)}` : '(not found)');
    }

    section('COMPUTED STYLES');
    const htmlEl = document.documentElement, bodyEl = document.body, mainEl = document.querySelector('main'), navEl = document.querySelector('.bottom-nav');
    push('html.height', cs(htmlEl,'height')); push('html.minHeight', cs(htmlEl,'minHeight'));
    push('html.overflow', cs(htmlEl,'overflow')); push('html.overflowX', cs(htmlEl,'overflowX')); push('html.overflowY', cs(htmlEl,'overflowY'));
    push('body.height', cs(bodyEl,'height')); push('body.minHeight', cs(bodyEl,'minHeight'));
    push('body.display', cs(bodyEl,'display')); push('body.flexDirection', cs(bodyEl,'flexDirection'));
    push('body.overflow', cs(bodyEl,'overflow')); push('body.overflowX', cs(bodyEl,'overflowX')); push('body.overflowY', cs(bodyEl,'overflowY'));
    push('body.paddingBottom', cs(bodyEl,'paddingBottom')); push('body.marginBottom', cs(bodyEl,'marginBottom'));
    push('main.height', cs(mainEl,'height')); push('main.minHeight', cs(mainEl,'minHeight')); push('main.flex', cs(mainEl,'flex'));
    push('main.paddingBottom', cs(mainEl,'paddingBottom')); push('main.marginBottom', cs(mainEl,'marginBottom'));
    push('.views.height', cs(viewsEl,'height')); push('.views.maxHeight', cs(viewsEl,'maxHeight')); push('.views.overflowY', cs(viewsEl,'overflowY'));
    push('.views.paddingBottom', cs(viewsEl,'paddingBottom')); push('.views.marginBottom', cs(viewsEl,'marginBottom'));
    push('.bottom-nav.position', cs(navEl,'position')); push('.bottom-nav.bottom', cs(navEl,'bottom')); push('.bottom-nav.height', cs(navEl,'height'));
    push('.bottom-nav.paddingBottom', cs(navEl,'paddingBottom')); push('.bottom-nav.marginBottom', cs(navEl,'marginBottom')); push('.bottom-nav.transform', cs(navEl,'transform'));

    section('BOTTOM SPACE RESERVATION (setBottomSpaceReservation, js/app.js)');
    push('Target element', '.views (sets its inline style.paddingBottom)');
    push('Current bottomSpaceReservations object', JSON.stringify(bottomSpaceReservations));
    push('Last call', lastBottomSpaceReservationCall ? JSON.stringify(lastBottomSpaceReservationCall) : '(never called this session)');
    push('.views current inline paddingBottom', viewsEl ? (viewsEl.style.paddingBottom || '(empty - not currently reserving space)') : '(not found)');
    push('Note', 'Since v45, .bottom-nav is in normal flex flow (not position:fixed), so it no longer needs .views to reserve clearance for it — this reservation is now used only by #app-toast/#sw-update-banner while they are visibly docked, not for the nav itself. Not changed this round per the read-only constraint — reported as-is.');

    section('DERIVED');
    const navGeom = geoms['.bottom-nav'];
    const lastChildGeom = geoms[lastChildOfViewsLabel];
    const lastVisibleGeom = geoms[lastVisibleLabel];
    if(navGeom){
      push('GAP B = screen.height - (.bottom-nav bottom)', `${screen.height} - ${navGeom.bottom.toFixed(2)} = ${(screen.height - navGeom.bottom).toFixed(2)}`);
    } else {
      push('GAP B', '(.bottom-nav not found or not visible)');
    }
    if(navGeom && lastChildGeom){
      push('GAP A = (.bottom-nav top) - (last child of .views, bottom) [literal, as requested]', `${navGeom.top.toFixed(2)} - ${lastChildGeom.bottom.toFixed(2)} = ${(navGeom.top - lastChildGeom.bottom).toFixed(2)}`);
    } else {
      push('GAP A (literal)', '(.bottom-nav or last child of .views not found)');
    }
    if(navGeom && lastVisibleGeom){
      push('GAP A\' = (.bottom-nav top) - (last child of ACTIVE .view, bottom) [bonus, likely closer to "the last content card" on screen]', `${navGeom.top.toFixed(2)} - ${lastVisibleGeom.bottom.toFixed(2)} = ${(navGeom.top - lastVisibleGeom.bottom).toFixed(2)}`);
    } else {
      push("GAP A'", '(.bottom-nav or last child of active .view not found)');
    }

    return lines.join('\n');
  }
  const layoutDiagBtn = document.getElementById('layout-diag-btn');
  if(layoutDiagBtn) layoutDiagBtn.addEventListener('click', async () => {
    const text = await gatherLayoutDiagnostics();
    showAppToast(downloadDiagLogAsTxt(text, 'trackr-layout-diagnostics') ? 'Layout diagnostics downloaded' : "Couldn't start the download");
  });

  init();
})();
