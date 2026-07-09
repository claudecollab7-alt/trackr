(function(){
  "use strict";

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
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
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

  let transactions = [];
  let categories = defaultCategories();
  let settings = { currency: '₹' };
  let budgets = {};
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
  let trendRange = '7d';
  let ringRange = 'month';
  let activeDebtKind = 'debt'; // 'debt' (I Owe) or 'receivable' (Owed to Me) — which list the Debts & EMIs page currently shows
  // Cross-tab data safety: if this tab deletes a record, remember its id so a later
  // merge-on-save (which reconciles against whatever another tab may have written)
  // never silently resurrects something this tab intentionally removed.
  let recentlyDeletedTxIds = new Set();
  let recentlyDeletedDebtIds = new Set();
  let recentlyDeletedReceivableIds = new Set();

  const CAT_PALETTE = ['#16A34A','#DC2626','#F59E0B','#2563EB','#14B8A6','#9333EA','#0EA5E9','#F97316','#84CC16','#EC4899','#DC4018','#DC7E18','#CBCB16','#31DC18','#18DC96','#18C5DC','#1881DC','#2618DC','#DC18DB','#DC1849'];
  const CAT_PALETTE_MOUNTY = ['#67301E','#55671E','#82671C','#37821C','#8E6129','#298E3F','#6D3717','#176D54','#7B6D24','#4E7B24','#977020','#209720','#67411E','#1E6741','#823A1C','#64821C','#8E7829','#3F8E29','#6D4B17','#176D2E','#7B4824','#247B65','#978C20','#549720','#67521E','#1E6721','#82521C','#1C8252','#8E4D29','#6B8E29','#6D5F17','#266D17','#7B5C24','#247B3F','#975820','#209780','#67321E','#3A671E','#826A1C','#1C8226','#8E6429','#298E64','#6D3A17','#4B6D17','#7B7024','#2E7B24','#977420','#20974C','#67441E','#1E675C'];

  function defaultCategories(){
    return {
      income: ['Salary','Business','Freelance','Investment Returns','Rental Income','Gift / Bonus','Other Income'],
      expense: ['Food & Groceries','Transport','Rent','Utilities & Bills','Shopping','Entertainment','Healthcare','Education','Investments','Insurance','Other Expense']
    };
  }
  function defaultAccounts(){
    return [
      { id:'acc_cash', name:'Cash' },
      { id:'acc_bank', name:'Bank' },
      { id:'acc_card', name:'Card' }
    ];
  }
  function categoryColor(name){
    const palette = document.body.getAttribute('data-theme')==='mounty' ? CAT_PALETTE_MOUNTY : CAT_PALETTE;
    const allCats = [...(categories && categories.income || []), ...(categories && categories.expense || [])];
    const idx = allCats.indexOf(name);
    if(idx !== -1) return palette[idx % palette.length];
    let hash=0; const s=name||'?';
    for(let i=0;i<s.length;i++){ hash = s.charCodeAt(i) + ((hash<<5)-hash); }
    return palette[Math.abs(hash) % palette.length];
  }
  function categoryInitial(name){ const s=(name||'?').trim(); return (s.charAt(0)||'?').toUpperCase(); }

  // toLocalDateStr lives in money-math.js, loaded before this file.
  function formatHuman(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }
  function formatShort(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
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
    try{ const s = await window.storage.get('settings'); settings = s ? JSON.parse(s.value) : { currency:'₹' }; } catch(e){ settings = { currency:'₹' }; }
    try{ const b = await window.storage.get('budgets'); budgets = b ? JSON.parse(b.value) : {}; } catch(e){ budgets = {}; }
    try{ const dbt = await window.storage.get('debts'); debts = dbt ? JSON.parse(dbt.value) : []; } catch(e){ debts = []; }
    try{ const rcv = await window.storage.get('receivables'); receivables = rcv ? JSON.parse(rcv.value) : []; } catch(e){ receivables = []; }
    try{ const r = await window.storage.get('recurring'); recurring = r ? JSON.parse(r.value) : []; } catch(e){ recurring = []; }
    try{ const rm = await window.storage.get('reminders'); reminders = rm ? JSON.parse(rm.value) : []; } catch(e){ reminders = []; }
    try{ const g = await window.storage.get('goals'); goals = g ? JSON.parse(g.value) : []; } catch(e){ goals = []; }
    try{ const a = await window.storage.get('accounts'); accounts = a ? JSON.parse(a.value) : defaultAccounts(); } catch(e){ accounts = defaultAccounts(); }
    // Defensive shape checks — guards against corrupted/legacy storage causing crashes downstream
    if(!Array.isArray(transactions)) transactions = [];
    if(!categories || !Array.isArray(categories.income) || !Array.isArray(categories.expense)) categories = defaultCategories();
    if(!settings || typeof settings !== 'object') settings = { currency:'₹' };
    if(!settings.currency) settings.currency = '₹';
    if(!settings.theme) settings.theme = 'light';
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
    // Migration: 'EMI / Loan' is no longer a default manual-entry category — it's auto-added only
    // when a real debt payment is logged. Strip it from installs that still have the old default
    // saved, but only if it was never actually used (so real history is never touched).
    if(categories.expense.includes('EMI / Loan') && !transactions.some(t=> t.category==='EMI / Loan')){
      categories.expense = categories.expense.filter(c=> c!=='EMI / Loan');
      await saveCategories();
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
  }
  async function saveCategories(){ try{ await window.storage.set('categories', JSON.stringify(categories)); } catch(e){ console.error(e); } }
  async function saveSettings(){ try{ await window.storage.set('settings', JSON.stringify(settings)); } catch(e){ console.error(e); } }
  async function saveRecurring(){ try{ await window.storage.set('recurring', JSON.stringify(recurring)); } catch(e){ console.error(e); } }
  async function saveReminders(){ try{ await window.storage.set('reminders', JSON.stringify(reminders)); } catch(e){ console.error(e); } }
  async function saveGoals(){ try{ await window.storage.set('goals', JSON.stringify(goals)); } catch(e){ console.error(e); } }
  async function saveAccounts(){ try{ await window.storage.set('accounts', JSON.stringify(accounts)); } catch(e){ console.error(e); } }
  async function saveBudgets(){ try{ await window.storage.set('budgets', JSON.stringify(budgets)); } catch(e){ console.error(e); } }
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
    const trackColor = themeNow==='dark' ? '#232C42' : (themeNow==='mounty' ? '#123029' : '#E2E8F0');
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
    renderInsightsBreakdownList(expenseTx, total);
    document.querySelectorAll('.ring-period-btn[data-range]').forEach(b=> b.classList.toggle('active', b.dataset.range===ringRange));
  }
  function renderInsightsBreakdownList(expenseTx, total){
    const container = document.getElementById('insights-breakdown-list');
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

  function buildActivityRow(t, withActions, showDate){
    const row = document.createElement('div'); row.className='activity-row clickable-row';
    const color = t.type==='income' ? '#16A34A' : categoryColor(t.category);
    const badgeChar = t.type==='income' ? '↑' : categoryInitial(t.category);
    const sub = `${escapeHtml(t.note || (t.type==='income'?'Credit':'Debit'))}${showDate ? ' · '+formatHuman(t.date) : ''}`;
    let actionsHtml = '';
    if(withActions){
      actionsHtml = `<div class="activity-actions"><button class="icon-btn-sm edit-btn" data-id="${t.id}" aria-label="Edit entry">${icon('edit',14)}</button><button class="icon-btn-sm del-btn" data-id="${t.id}" aria-label="Delete entry">${icon('trash',14)}</button></div>`;
    }
    row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="background:${color};">${badgeChar}</span><div><div class="activity-name">${escapeHtml(t.category)}</div><div class="activity-sub">${sub}</div></div></div><div class="activity-right"><span class="activity-amt ${t.type} mono-num">${t.type==='income'?'+':'-'}${fmt(t.amount)}</span>${actionsHtml}</div>`;
    row.dataset.category = t.category; row.dataset.txType = t.type;
    row.addEventListener('click', (e)=>{
      if(e.target.closest('.activity-actions')) return;
      openTransactionDetail(t.id);
    });
    return row;
  }
  const OVERLAY_STATE_FLAGS = ['catDetailOpen','txDetailOpen','goalDetailOpen','searchOpen','notificationsOpen','scheduleOpen','debtDetailOpen'];
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
  const OVERLAY_ANIM_MS = 220;
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
  function openTransactionDetail(id){
    const t = transactions.find(x=>x.id===id); if(!t) return;
    txDetailCurrentId = id;
    const badge = document.getElementById('txdetail-badge');
    badge.className = 'txdetail-badge '+t.type;
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
  }

  function renderHomeBalance(){
    const netBalance = sumByType(transactions,'income') - sumByType(transactions,'expense');
    const masked = settings.hideBalances && !balancesRevealed;
    setText('home-balance', masked ? maskAmount(fmt(netBalance)) : fmt(netBalance));
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
    const totalDebt = debts.reduce((s,d)=> s + debtRemaining(d), 0);
    const totalReceivable = receivables.reduce((s,d)=> s + debtRemaining(d), 0);
    if(totalDebt <= 0.004 && totalReceivable <= 0.004){ row.style.display='none'; return; }
    row.style.display='flex';
    const netBalance = sumByType(transactions,'income') - sumByType(transactions,'expense');
    const netWorth = netBalance - totalDebt + totalReceivable;
    const el = document.getElementById('networth-amount');
    const masked = settings.hideBalances && !balancesRevealed;
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
      cell.innerHTML = `<div class="cat-grid-top"><span class="cat-amt mono-num">${fmt(amt)}</span><span class="cat-pct">${pct}%</span></div><div class="cat-grid-name">${escapeHtml(cat)}</div><span class="cat-badge sm" style="background:${color};">${categoryInitial(cat)}</span>`;
      cell.addEventListener('click', ()=>{
        const catTx = monthExpense.filter(t=>t.category===cat);
        openCategoryDetail(cat, `${fmt(amt)} this month`, catTx);
      });
      container.appendChild(cell);
    });
  }

  let appToastTimer = null;
  function showAppToast(message, type){
    const el = document.getElementById('app-toast');
    document.getElementById('app-toast-msg').textContent = message;
    el.classList.toggle('info', type==='info');
    el.classList.add('show');
    if(appToastTimer) clearTimeout(appToastTimer);
    appToastTimer = setTimeout(()=> el.classList.remove('show'), 6000);
  }
  function hideAppToast(){
    if(appToastTimer){ clearTimeout(appToastTimer); appToastTimer = null; }
    document.getElementById('app-toast').classList.remove('show');
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
    rows.forEach(r=>{
      const barColor = r.over ? 'var(--debit)' : (r.pct>=80 ? 'var(--gold)' : 'var(--credit)');
      const color = categoryColor(r.cat);
      const row = document.createElement('div'); row.className='budget-row clickable-row';
      row.innerHTML = `<div class="budget-row-top"><span class="budget-cat-left"><span class="cat-badge sm" style="background:${color};">${categoryInitial(r.cat)}</span><span class="budget-cat-name">${escapeHtml(r.cat)}</span></span><span class="mono-num" style="font-size:12.5px;">${fmt(r.spent)} / ${fmt(r.limit)}</span></div><div class="budget-bar-track"><div class="budget-bar-fill" style="width:${r.pct}%; background:${barColor};"></div></div>`;
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
      const isMounty = themeNow2==='mounty';
      const gridColor = isDark ? '#232C42' : (isMounty ? '#123029' : '#E2E8F0');
      const tickColor = isDark ? '#8B95AC' : (isMounty ? '#8EB69B' : '#64748B');
      const creditColor = isMounty ? '#5FD98C' : '#16A34A';
      const debitColor = isMounty ? '#E2795C' : '#DC2626';
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
      if(status) items.push({ label:r.title, dueLabel:status.dueLabel, sortDate:status.dueDateISO, amount:r.amount||0, kind:'Reminder', overdue:status.overdue });
    });
    recurring.forEach(r=>{
      const status = recurringDueStatus(r, 30);
      if(status) items.push({ label:r.category, dueLabel:status.dueLabel, sortDate:status.dueDateISO, amount:r.amount, kind:'Recurring', overdue:status.overdue });
    });
    function pushEmiInstallments(list, kindLabel){
      list.filter(d=>d.type==='emi').forEach(d=>{
        buildEmiSchedule(d).forEach(inst=>{
          if(!inst.paid && inst.dueDate<=in30){
            items.push({ label:d.name, dueLabel:formatHuman(inst.dueDate), sortDate:inst.dueDate, amount:inst.amount, kind:kindLabel, overdue:inst.dueDate<todayStr });
          }
        });
      });
    }
    pushEmiInstallments(debts, 'EMI Debt');
    pushEmiInstallments(receivables, 'EMI Receivable');
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
    items.forEach(i=>{
      const row = document.createElement('div'); row.className='reminder-card';
      row.innerHTML = `<div class="reminder-card-top"><div><div class="reminder-name">${escapeHtml(i.label)}</div><div class="reminder-meta">${escapeHtml(i.kind)} · ${i.dueLabel}</div></div><span class="reminder-status ${i.overdue?'overdue':'upcoming'}">${i.overdue?'Overdue':'Upcoming'}</span></div><div class="reminder-meta" style="margin-top:6px; font-weight:700; color:var(--ink);">${fmt(i.amount)}</div>`;
      list.appendChild(row);
    });
  }

  function populateEntryCategorySelect(type){
    const sel = document.getElementById('entry-category'); sel.innerHTML='';
    categories[type].forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });
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
    list.forEach(t=> container.appendChild(buildActivityRow(t, true, false)));
    wireActivityActions(container);
  }

  async function deleteTransaction(id){
    if(!confirm('Delete this entry? This cannot be undone.')) return false;
    recentlyDeletedTxIds.add(id);
    transactions = transactions.filter(t=>t.id!==id);
    await saveTransactions();
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
      await saveTransactions(); showStamp(type); cancelEdit();
    } else {
      transactions.push({ id:'tx_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), type, date, category, account, amount, note, createdAt: new Date().toISOString() });
      await saveTransactions(); showStamp(type);
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
      const color = r.type==='income' ? '#16A34A' : categoryColor(r.category);
      const chip = document.createElement('button'); chip.type='button'; chip.className='recurring-chip'; chip.dataset.id=r.id;
      chip.setAttribute('aria-label', `Log ${r.category}, ${fmt(r.amount)}`);
      chip.innerHTML = `<span class="chip-badge" style="background:${color};">${r.type==='income'?'↑':categoryInitial(r.category)}</span><span>${escapeHtml(r.category)} · ${fmt(r.amount)}</span><span class="chip-del" data-id="${r.id}" aria-label="Remove ${escapeHtml(r.category)} quick add" role="button">×</span>`;
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
    transactions.push({ id:'tx_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), type:r.type, date:today, category:r.category, account, amount:r.amount, note:r.note||'', createdAt: new Date().toISOString() });
    if(r.dueDay) r.lastDismissedPeriod = today.slice(0,7);
    await saveTransactions();
    await saveRecurring();
    showStamp(r.type);
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
    if(type==='income') list = categories.income; else if(type==='expense') list = categories.expense;
    else list = [...categories.income, ...categories.expense];
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
      const color = e.type==='income' ? '#16A34A' : categoryColor(e.category);
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
    filtered.forEach(t=>{
      balance += t.type==='income' ? t.amount : -t.amount;
      const tr = document.createElement('tr');
      const debit = t.type==='expense' ? fmt(t.amount) : '—';
      const credit = t.type==='income' ? fmt(t.amount) : '—';
      tr.innerHTML = `<td>${formatHuman(t.date)}</td><td>${escapeHtml(t.note||'—')}</td><td>${escapeHtml(t.category)}</td><td class="num" style="color:var(--debit)">${debit}</td><td class="num" style="color:var(--credit)">${credit}</td><td class="num">${fmt(balance)}</td>`;
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
    if(type==='income') list = categories.income; else if(type==='expense') list = categories.expense;
    else list = [...categories.income, ...categories.expense];
    list.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt); });
    if(list.includes(prev)) sel.value = prev;
  }
  function renderHistory(){
    const search = (document.getElementById('history-search').value||'').trim().toLowerCase();
    const typeFilter = document.getElementById('history-filter-type').value;
    const catFilter = document.getElementById('history-filter-category').value;
    let list = [...transactions];
    if(typeFilter!=='all') list = list.filter(t=>t.type===typeFilter);
    if(catFilter!=='all') list = list.filter(t=>t.category===catFilter);
    if(search) list = list.filter(t=> (t.note||'').toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
    list.sort((a,b)=> b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    const container = document.getElementById('history-list'); container.innerHTML='';
    if(list.length===0){ container.innerHTML = '<p class="empty-note">No entries match.</p>'; return; }
    const countNote = document.createElement('p'); countNote.className = 'period-hint'; countNote.style.marginBottom = '10px';
    countNote.textContent = `Showing ${list.length} entr${list.length===1?'y':'ies'}.`;
    container.appendChild(countNote);
    list.forEach(t=> container.appendChild(buildActivityRow(t, true, true)));
    wireActivityActions(container);
  }

  function renderBudgetSetList(){
    const container = document.getElementById('budget-set-list'); container.innerHTML='';
    const today = toLocalDateStr(new Date()); const monthPrefix = today.slice(0,7);
    const monthExpense = transactions.filter(t=>t.type==='expense' && t.date.startsWith(monthPrefix));
    const spentMap = {}; monthExpense.forEach(t=> spentMap[t.category]=(spentMap[t.category]||0)+t.amount);
    categories.expense.forEach(cat=>{
      const limit = budgets[cat] || 0; const spent = spentMap[cat] || 0;
      const pct = limit>0 ? Math.min(100, spent/limit*100) : 0;
      const over = limit>0 && spent>limit;
      const barColor = over ? 'var(--debit)' : (pct>=80 ? 'var(--gold)' : 'var(--credit)');
      const color = categoryColor(cat);
      const row = document.createElement('div'); row.className='budget-row';
      row.innerHTML = `
        <div class="budget-row-top">
          <span class="budget-cat-left"><span class="cat-badge sm" style="background:${color};">${categoryInitial(cat)}</span><span class="budget-cat-name">${escapeHtml(cat)}</span></span>
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
    const container = document.getElementById('debts-list'); if(!container) return;
    const isReceivable = activeDebtKind==='receivable';
    const list = currentDebtList();
    container.innerHTML='';
    if(list.length===0){ container.innerHTML = `<p class="empty-note">No ${isReceivable?'receivables':'debts'} tracked yet. Add one below.</p>`; return; }
    const sorted = [...list].sort((a,b)=>{
      const aPaid = debtRemaining(a)<=0.004, bPaid = debtRemaining(b)<=0.004;
      if(aPaid!==bPaid) return aPaid ? 1 : -1;
      return 0;
    });
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
      const barColor = isPaidOff ? 'var(--credit)' : typeColor;
      const paidLabel = isReceivable ? 'received' : 'paid';
      const paidOffLabel = isReceivable ? 'Fully Received ✓' : 'Paid Off ✓';
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
        <div class="debt-row-meta">${fmt(paid)} ${paidLabel} of ${fmt(d.total)} ${isPaidOff ? '· <span class="paidoff-tag">'+paidOffLabel+'</span>' : '· '+fmt(remaining)+' remaining'}</div>
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
    container.querySelectorAll('.log-payment-btn').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('lp-form-'+btn.dataset.id); if(f) f.style.display = (f.style.display==='none' ? 'block' : 'none');
    }));
    container.querySelectorAll('.lp-cancel').forEach(btn=> btn.addEventListener('click', ()=>{
      const f = document.getElementById('lp-form-'+btn.dataset.id); if(f) f.style.display='none';
    }));
    container.querySelectorAll('.lp-confirm').forEach(btn=> btn.addEventListener('click', ()=> confirmLogPayment(btn.dataset.id)));
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
  }
  function renderDebtOverview(){
    renderDebtOverviewInto('debtov', currentDebtList());
    renderDebtOverviewInto('reportsdebt', debts);
    renderDebtOverviewInto('reportsreceivable', receivables);
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
        <div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct}%; background:${isComplete?'var(--credit)':'var(--goal)'};"></div></div>
        <div class="goal-row-meta">${fmt(saved)} saved of ${fmt(g.target)} ${isComplete ? '· <span class="goal-reached-tag">Goal Reached ✓</span>' : '· '+fmt(remaining)+' to go ('+Math.round(pct)+'%)'}</div>
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
    if(!Array.isArray(g.contributions)) g.contributions = [];
    g.contributions.push({ id:'contrib_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), amount, date, createdAt: new Date().toISOString() });
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
      goals.push({ id:'goal_'+Date.now()+'_'+Math.random().toString(36).slice(2,7), name, target, initialSaved, targetDate, note, contributions: [] });
    }
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
    const fields = document.getElementById('goaldetail-fields'); fields.innerHTML='';
    const rows = [
      ['Target', fmt(g.target)],
      ['Saved', fmt(saved)],
    ];
    if(g.targetDate) rows.push(['Target Date', formatHuman(g.targetDate)]);
    rows.push(['Note', g.note ? g.note : '—']);
    rows.forEach(([label,value])=>{
      const row = document.createElement('div'); row.className='txdetail-field';
      row.innerHTML = `<span class="txdetail-field-label">${escapeHtml(label)}</span><span class="txdetail-field-value">${escapeHtml(String(value))}</span>`;
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
      list.push({ id:(isReceivable?'rcv_':'debt_')+Date.now()+'_'+Math.random().toString(36).slice(2,7), name, type, total, emiAmount: type==='emi'?emiAmount:0, tenure: type==='emi'?tenure:0, startDate, note, payments: [] });
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

  async function confirmLogPayment(debtId){
    const isReceivable = activeDebtKind==='receivable';
    const form = document.getElementById('lp-form-'+debtId); if(!form) return;
    const amount = parseFloat(form.querySelector('.lp-amount').value);
    const date = form.querySelector('.lp-date').value;
    const account = form.querySelector('.lp-account') ? form.querySelector('.lp-account').value : (accounts[0] ? accounts[0].name : 'Cash');
    if(isNaN(amount) || amount<=0 || !date){ alert('Please enter a valid amount and date.'); return; }
    const debt = currentDebtList().find(d=>d.id===debtId); if(!debt) return;
    const nowIso = new Date().toISOString();
    const txId = 'tx_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
    debt.payments.push({ id:'pay_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), amount, date, createdAt: nowIso, txId });
    await currentDebtSaveFn()();
    const txType = isReceivable ? 'income' : 'expense';
    const txCategory = isReceivable ? 'Loan Repayment Received' : 'EMI / Loan';
    const catList = isReceivable ? categories.income : categories.expense;
    if(!catList.includes(txCategory)) catList.push(txCategory);
    transactions.push({ id:txId, type:txType, category:txCategory, date, account, amount, note: debt.name+(isReceivable?' — received':' — payment'), createdAt: nowIso });
    await saveTransactions(); await saveCategories();
    refreshAll();
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
    await saveFn();
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
    const items = reminders.map(r=> ({ r, status: reminderStatus(r) })).filter(x=>x.status);
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
    const withStatus = reminders.map(r=>({ r, status: reminderStatus(r) }));
    withStatus.sort((a,b)=>{
      if(!!a.status !== !!b.status) return a.status ? -1 : 1;
      if(a.status && b.status) return a.status.diffDays - b.status.diffDays;
      return 0;
    });
    withStatus.forEach(({r,status})=>{
      const card = document.createElement('div'); card.className='reminder-card';
      const repeatLabel = r.repeat==='monthly' ? `Every month on the ${r.dueDay}${ordinalSuffix(r.dueDay)}` : `One-time · ${formatHuman(r.dueDate)}`;
      card.innerHTML = `
        <div class="reminder-card-top">
          <div>
            <div class="reminder-name">${escapeHtml(r.title)}</div>
            <div class="reminder-meta">${repeatLabel}${r.amount? ' · '+fmt(r.amount):''}</div>
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
    if(editingReminderId){
      const r = reminders.find(x=>x.id===editingReminderId);
      if(r){
        r.title = title; r.repeat = repeat; r.dueDay = dueDay; r.dueDate = dueDate; r.amount = amount; r.note = note;
        r.lastDismissedPeriod = null;
        notifiedReminderIds.delete(r.id);
      }
      editingReminderId = null;
    } else {
      reminders.push({ id:'rem_'+Date.now()+'_'+Math.random().toString(36).slice(2,5), title, repeat, dueDay, dueDate, amount, note, lastDismissedPeriod:null });
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
  async function maybeFireDueNotifications(){
    if(!('Notification' in window) || Notification.permission!=='granted') return;
    for(const r of reminders){
      const status = reminderStatus(r);
      if(status && (status.overdue || status.diffDays===0) && !notifiedReminderIds.has(r.id)){
        await fireNotification('Trackr reminder', `${r.title} — ${reminderStatusLabel(status)}`);
        notifiedReminderIds.add(r.id);
      }
    }
    for(const d of debts){
      if(d.type==='emi' && debtOverdueCount(d)>0 && debtRemaining(d)>0.004 && !notifiedReminderIds.has('debt_'+d.id)){
        await fireNotification('Trackr reminder', `${d.name} — EMI payment due`);
        notifiedReminderIds.add('debt_'+d.id);
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
    const data = { transactions, categories, settings, budgets, debts, receivables, recurring, reminders, goals, accounts, exportedAt: new Date().toISOString() };
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
    if(!shouldShowBackupNag()){ banner.style.display='none'; return; }
    banner.style.display='block';
    const text = document.getElementById('backup-nag-text');
    text.textContent = settings.lastBackupAt
      ? `It's been over ${BACKUP_NAG_AFTER_DAYS} days since your last backup — everything you've entered only lives on this device.`
      : "You haven't backed up yet — everything you've entered only lives on this device.";
  }
  async function dismissBackupNag(){
    settings.lastBackupNagDismissedAt = new Date().toISOString();
    await saveSettings();
    renderBackupNag();
  }
  function handleRestoreFile(e){
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = async ()=>{
      try{
        const data = JSON.parse(reader.result);
        if(!Array.isArray(data.transactions) || !data.categories){ throw new Error('Invalid file'); }
        if(!confirm('This will replace all current data with the contents of this backup file. Continue?')) return;
        transactions = data.transactions || []; categories = data.categories || defaultCategories();
        settings = data.settings || { currency:'₹' }; budgets = data.budgets || {}; debts = Array.isArray(data.debts) ? data.debts : [];
        receivables = Array.isArray(data.receivables) ? data.receivables : [];
        recurring = Array.isArray(data.recurring) ? data.recurring : []; reminders = Array.isArray(data.reminders) ? data.reminders : [];
        goals = Array.isArray(data.goals) ? data.goals : [];
        accounts = Array.isArray(data.accounts) && data.accounts.length ? data.accounts : defaultAccounts();
        if(!settings.theme) settings.theme = 'light';
        await saveTransactions(); await saveCategories(); await saveSettings(); await saveBudgets(); await saveDebts(); await saveReceivables(); await saveRecurring(); await saveReminders(); await saveGoals(); await saveAccounts();
        populateEntryCategorySelect(document.getElementById('entry-type').value);
        populateEntryAccountSelect();
        populateFilterCategorySelect(document.getElementById('filter-type').value);
        populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
        applyTheme(settings.theme);
        balancesRevealed = false; isAppLocked = false;
        syncHideBalancesUI(); syncAppLockUI();
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
    function addRow(title, meta, onClick){
      const row = document.createElement('div'); row.className='reminder-card clickable-row';
      row.innerHTML = `<div class="reminder-card-top"><div><div class="reminder-name">${escapeHtml(title)}</div><div class="reminder-meta">${meta}</div></div></div>`;
      row.addEventListener('click', onClick);
      container.appendChild(row);
    }
    if(overBudget.length){
      addSection('Over Budget');
      overBudget.forEach(b=> addRow(b.category, `${fmt(b.spent)} of ${fmt(b.limit)} — over by ${fmt(b.spent-b.limit)}`, ()=> goToAlertTarget(null,'budgets')));
    }
    if(overdueDebts.length){
      addSection('Overdue Debts');
      overdueDebts.forEach(d=> addRow(d.name, `${debtOverdueCount(d)} installment${debtOverdueCount(d)===1?'':'s'} overdue`, ()=> goToAlertTarget(null,'debts')));
    }
    if(dueReminders.length){
      addSection('Reminders');
      dueReminders.forEach(({r,status})=> addRow(r.title, `${reminderStatusLabel(status)}${r.amount?' · '+fmt(r.amount):''}`, ()=> goToAlertTarget(null,'reminders')));
    }
    if(dueRecurring.length){
      addSection('Due for Logging');
      dueRecurring.forEach(({r,status})=> addRow(r.category, `${reminderStatusLabel(status)} · ${fmt(r.amount)}`, ()=> goToAlertTarget('insights',null)));
    }
  }

  function openSchedule(debtId){
    const d = findInAnyDebtList(debtId); if(!d || d.type!=='emi') return;
    setText('schedule-debt-name', d.name);
    renderScheduleList(d);
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
        ${ metaLine ? `<div class="schedule-meta">${metaLine}</div>` : '' }
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
    document.getElementById('debtdetail-amount').style.color = isReceivable ? 'var(--credit)' : 'var(--debit)';
    setText('debtdetail-amount', fmt(remaining));
    setText('debtdetail-subtitle', isPaidOff ? (isReceivable ? 'Fully received' : 'Paid off') : 'remaining');
    const fields = document.getElementById('debtdetail-fields'); fields.innerHTML='';
    const rows = [
      ['Type', d.type==='emi' ? 'EMI — fixed monthly' : 'One-time'],
      ['Start Date', formatHuman(d.startDate)],
    ];
    if(d.type==='emi'){ rows.push(['EMI Amount', fmt(d.emiAmount)]); rows.push(['Tenure', d.tenure+' months']); }
    rows.push(['Total', fmt(d.total)]);
    rows.push([isReceivable ? 'Received' : 'Paid', fmt(paid)]);
    rows.push(['Note', d.note ? d.note : '—']);
    rows.forEach(([label,value])=>{
      const row = document.createElement('div'); row.className='txdetail-field';
      row.innerHTML = `<span class="txdetail-field-label">${escapeHtml(label)}</span><span class="txdetail-field-value">${escapeHtml(String(value))}</span>`;
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
        row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="background:${categoryColor(d.name)};">${categoryInitial(d.name)}</span><div><div class="activity-name">${escapeHtml(d.name)}</div><div class="activity-sub">${d.type==='emi'?'EMI':'One-time'} debt</div></div></div><div class="activity-right"><span class="activity-amt mono-num">${fmt(debtRemaining(d))} left</span></div>`;
        container.appendChild(row);
      });
    }
    if(matchedReceivables.length){
      const h = document.createElement('div'); h.className='activity-group-label'; h.textContent='Receivables'; container.appendChild(h);
      matchedReceivables.forEach(d=>{
        const row = document.createElement('div'); row.className='activity-row';
        row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="background:${categoryColor(d.name)};">${categoryInitial(d.name)}</span><div><div class="activity-name">${escapeHtml(d.name)}</div><div class="activity-sub">${d.type==='emi'?'EMI':'One-time'} receivable</div></div></div><div class="activity-right"><span class="activity-amt mono-num">${fmt(debtRemaining(d))} left</span></div>`;
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
    categories[type].forEach(c=>{
      const color = categoryColor(c);
      const row = document.createElement('div'); row.className='cat-row';
      row.innerHTML = `<span class="cat-row-left"><span class="cat-badge sm" style="background:${color};">${categoryInitial(c)}</span>${escapeHtml(c)}</span><button class="icon-btn-sm del-cat-btn" data-type="${type}" data-cat="${escapeHtml(c)}" aria-label="Delete category ${escapeHtml(c)}">${icon('trash',14)}</button>`;
      container.appendChild(row);
    });
    container.querySelectorAll('.del-cat-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteCategory(btn.dataset.type, btn.dataset.cat)));
  }
  function renderCategoriesView(){ renderCatList('income'); renderCatList('expense'); document.getElementById('currency-input').value = settings.currency; }
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
    categories[type] = categories[type].filter(c=>c!==name); saveCategories();
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
          <span class="budget-cat-left"><span class="cat-badge sm" style="background:${categoryColor(a.name)};">${categoryInitial(a.name)}</span><span class="budget-cat-name">${escapeHtml(a.name)}</span></span>
          <button class="icon-btn-sm del-account-btn" data-id="${a.id}" aria-label="Delete account ${escapeHtml(a.name)}">${icon('trash',14)}</button>
        </div>
        <div class="budget-row-meta" style="font-size:14px; font-weight:700; color:${bal<0?'var(--debit)':'var(--ink)'};">${fmt(bal)}</div>
      `;
      container.appendChild(row);
    });
    container.querySelectorAll('.del-account-btn').forEach(btn=> btn.addEventListener('click', ()=> deleteAccount(btn.dataset.id)));
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
      row.innerHTML = `<div class="activity-left"><span class="cat-badge" style="background:${categoryColor(a.name)};">${categoryInitial(a.name)}</span><div><div class="activity-name">${escapeHtml(a.name)}</div></div></div><div class="activity-right"><span class="activity-amt mono-num" style="color:${bal<0?'var(--debit)':'var(--ink)'};">${fmt(bal)}</span></div>`;
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
    refreshAll();
  }
  async function deleteAccount(id){
    if(accounts.length<=1){ alert('You need at least one account — add another before removing this one.'); return; }
    const acc = accounts.find(a=>a.id===id); if(!acc) return;
    if(!confirm(`Remove "${acc.name}"? Past entries already tagged to it will keep showing "${acc.name}", but it won't be selectable for new entries.`)) return;
    accounts = accounts.filter(a=>a.id!==id);
    await saveAccounts();
    populateEntryAccountSelect();
    refreshAll();
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
    const overBudget = Object.keys(budgets)
      .filter(cat=> budgets[cat]>0 && (spentMap[cat]||0) > budgets[cat])
      .map(cat=> ({ category: cat, spent: spentMap[cat]||0, limit: budgets[cat] }));
    const overdueDebts = debts.filter(d=> debtRemaining(d) > 0.004 && debtOverdueCount(d) > 0);
    const dueReminders = reminders.map(r=> ({ r, status: reminderStatus(r) })).filter(x=>x.status);
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
  }

  function applyTheme(theme){
    if(theme==='sunset') theme = 'mounty';
    document.body.setAttribute('data-theme', theme);
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

  /* ---------- Privacy: App Lock (PIN) ---------- */
  let isAppLocked = false;
  let appLockTimer = null;
  let pinMode = 'unlock';
  let pendingNewPin = null;
  function hashPin(pin){
    let hash = 0;
    for(let i=0;i<pin.length;i++){ hash = (hash*31 + pin.charCodeAt(i)) >>> 0; }
    return hash.toString(16);
  }
  function showPinOverlay(mode){
    pinMode = mode;
    const overlay = document.getElementById('pinlock-overlay');
    const title = document.getElementById('pinlock-title');
    const subtitle = document.getElementById('pinlock-subtitle');
    const cancelBtn = document.getElementById('pinlock-cancel-setup');
    const submitBtn = document.getElementById('pinlock-submit');
    document.getElementById('pinlock-error').style.display = 'none';
    document.getElementById('pinlock-input').value = '';
    if(mode==='unlock'){
      title.textContent = 'Enter PIN';
      subtitle.textContent = 'Enter your 4-digit PIN to unlock Trackr.';
      cancelBtn.style.display = 'none';
      submitBtn.textContent = 'Unlock';
    } else if(mode==='setup-new'){
      title.textContent = 'Set a PIN';
      subtitle.textContent = 'Choose a 4-digit PIN to lock Trackr. This is a local deterrent, not real security — there’s no server, so the PIN can’t be recovered, and it isn’t protection against someone with access to this device’s storage.';
      cancelBtn.style.display = 'inline-flex';
      submitBtn.textContent = 'Continue';
    } else if(mode==='setup-confirm'){
      title.textContent = 'Confirm PIN';
      subtitle.textContent = 'Enter the same PIN again to confirm.';
      cancelBtn.style.display = 'inline-flex';
      submitBtn.textContent = 'Confirm';
    }
    overlay.style.display = 'flex';
    setTimeout(()=>{ const i = document.getElementById('pinlock-input'); if(i) i.focus(); }, 60);
  }
  function hidePinOverlay(){ document.getElementById('pinlock-overlay').style.display = 'none'; }
  function showPinError(msg){
    const err = document.getElementById('pinlock-error');
    err.textContent = msg; err.style.display = 'block';
    document.getElementById('pinlock-input').value = '';
    document.getElementById('pinlock-input').focus();
  }
  async function handlePinSubmit(){
    const val = document.getElementById('pinlock-input').value.trim();
    if(!/^[0-9]{4}$/.test(val)){ showPinError('Enter a 4-digit PIN.'); return; }
    if(pinMode==='unlock'){
      if(hashPin(val) === settings.appLockPin){
        isAppLocked = false;
        hidePinOverlay();
        resetAppLockTimer();
      } else {
        showPinError('Incorrect PIN. Try again.');
      }
    } else if(pinMode==='setup-new'){
      pendingNewPin = val;
      showPinOverlay('setup-confirm');
    } else if(pinMode==='setup-confirm'){
      if(val === pendingNewPin){
        settings.appLockPin = hashPin(val);
        settings.appLockEnabled = true;
        await saveSettings();
        pendingNewPin = null;
        hidePinOverlay();
        syncAppLockUI();
        resetAppLockTimer();
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
    if(!toggle) return;
    toggle.classList.toggle('on', !!settings.appLockEnabled);
    toggle.setAttribute('aria-checked', !!settings.appLockEnabled);
    if(row) row.style.display = settings.appLockEnabled ? 'flex' : 'none';
    if(select) select.value = String(settings.appLockTimeoutMin || 5);
  }

  function runIntegrityCheck(){
    const results = document.getElementById('integrity-check-results');
    results.style.display = 'block';

    const seen = {};
    transactions.forEach(t=>{
      const key = [t.type, t.category, t.account, t.amount, t.date, (t.note||'').trim().toLowerCase()].join('|');
      (seen[key] = seen[key] || []).push(t);
    });
    const dupGroups = Object.values(seen).filter(g=> g.length > 1);

    const debtMismatches = [];
    debts.forEach(d=>{
      const expectedNote = d.name + ' — payment';
      const matchingTx = transactions.filter(t=> t.category==='EMI / Loan' && t.note===expectedNote);
      const loggedCount = (d.payments||[]).length;
      if(loggedCount !== matchingTx.length){
        debtMismatches.push({ debt:d, loggedCount, txCount: matchingTx.length });
      }
    });

    let html = '';
    if(dupGroups.length===0 && debtMismatches.length===0){
      html = `<div class="card" style="background:var(--bg); border:1.5px solid var(--credit);">
        <div style="display:flex; align-items:center; gap:8px; color:var(--credit); font-weight:700; font-size:14px;">✓ All clear</div>
        <p class="period-hint" style="margin-top:6px;">Checked ${transactions.length} transaction${transactions.length!==1?'s':''} and ${debts.length} debt${debts.length!==1?'s':''} — no duplicates or mismatches found.</p>
      </div>`;
    } else {
      if(dupGroups.length>0){
        html += `<div class="card-label" style="margin-bottom:8px;">POSSIBLE DUPLICATE ENTRIES (${dupGroups.length})</div>`;
        dupGroups.forEach(group=>{
          html += `<div class="card" style="background:var(--bg); margin-bottom:10px; border-left:3px solid var(--debit);">
            <div style="font-weight:700;">${escapeHtml(group[0].category)} · ${fmt(group[0].amount)} · ${formatHuman(group[0].date)}</div>
            <div class="period-hint">${escapeHtml(group[0].note||'(no note)')} — appears ${group.length} times, all identical</div>
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
          if(Array.isArray(a) && a.length>0){ accounts = a; populateEntryAccountSelect(); }
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
          await saveSettings();
          syncAppLockUI();
          resetAppLockTimer();
        } else {
          showPinOverlay('setup-new');
        }
      } else {
        settings.appLockEnabled = false;
        isAppLocked = false;
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

    document.getElementById('pinlock-submit').addEventListener('click', handlePinSubmit);
    document.getElementById('pinlock-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter') handlePinSubmit(); });
    document.getElementById('pinlock-cancel-setup').addEventListener('click', async ()=>{
      hidePinOverlay();
      pendingNewPin = null;
      settings.appLockEnabled = false;
      await saveSettings();
      syncAppLockUI();
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
    document.querySelectorAll('.link-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{ goToMoreSub(btn.dataset.tab, btn.dataset.sub); });
    });
    document.querySelectorAll('.more-row').forEach(btn=> btn.addEventListener('click', ()=> showMoreSub(btn.dataset.sub)));
    document.querySelectorAll('[data-back]').forEach(btn=> btn.addEventListener('click', backToMoreMenu));

    document.getElementById('bell-btn').addEventListener('click', openNotificationsOverlay);
    document.getElementById('close-notifications-btn').addEventListener('click', ()=> history.back());
    document.getElementById('notifications-overlay').addEventListener('click', (e)=>{ if(e.target.id==='notifications-overlay') history.back(); });
    document.getElementById('settings-btn').addEventListener('click', ()=>{ goToMoreSub('more', 'settings'); });
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
    });
    document.getElementById('close-schedule-btn').addEventListener('click', ()=> history.back());
    document.getElementById('schedule-overlay').addEventListener('click', (e)=>{ if(e.target.id==='schedule-overlay') history.back(); });
    document.getElementById('close-catdetail-btn').addEventListener('click', ()=> history.back());
    document.getElementById('category-detail-overlay').addEventListener('click', (e)=>{ if(e.target.id==='category-detail-overlay') history.back(); });
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
        renderAllRings();
        renderTrendChart();
      });
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

    document.getElementById('show-add-debt-btn').addEventListener('click', ()=>{
      editingDebtId = null;
      document.getElementById('save-debt-btn').textContent = activeDebtKind==='receivable' ? 'Save Receivable' : 'Save Debt';
      document.getElementById('add-debt-form').style.display='block';
    });
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

    document.getElementById('add-income-cat-form').addEventListener('submit', (e)=>{ e.preventDefault(); addCategory('income', document.getElementById('new-income-cat').value); document.getElementById('new-income-cat').value=''; });
    document.getElementById('add-expense-cat-form').addEventListener('submit', (e)=>{ e.preventDefault(); addCategory('expense', document.getElementById('new-expense-cat').value); document.getElementById('new-expense-cat').value=''; });

    document.getElementById('currency-input').addEventListener('change', async (e)=>{
      settings.currency = e.target.value.trim() || '₹'; e.target.value = settings.currency;
      await saveSettings(); refreshAll();
    });

    document.getElementById('backup-btn').addEventListener('click', downloadBackup);
    document.getElementById('restore-btn').addEventListener('click', ()=> document.getElementById('restore-file-input').click());
    document.getElementById('integrity-check-btn').addEventListener('click', runIntegrityCheck);
    document.getElementById('restore-file-input').addEventListener('change', handleRestoreFile);

    document.getElementById('reset-data-btn').addEventListener('click', async ()=>{
      if(!confirm('This will permanently delete all entries, categories, budgets, debts, goals, accounts, recurring templates, and reminders you have saved. Continue?')) return;
      transactions = []; categories = defaultCategories(); settings = { currency:'₹', theme:'light' }; budgets = {}; debts = []; recurring = []; reminders = []; goals = []; accounts = defaultAccounts();
      await saveTransactions(); await saveCategories(); await saveSettings(); await saveBudgets(); await saveDebts(); await saveRecurring(); await saveReminders(); await saveGoals(); await saveAccounts();
      populateEntryCategorySelect(document.getElementById('entry-type').value);
      populateEntryAccountSelect();
      populateFilterCategorySelect(document.getElementById('filter-type').value);
      populateHistoryFilterCategorySelect(document.getElementById('history-filter-type').value);
      applyTheme('light');
      balancesRevealed = false; isAppLocked = false;
      if(hideBalancesTimer){ clearTimeout(hideBalancesTimer); hideBalancesTimer = null; }
      if(appLockTimer){ clearTimeout(appLockTimer); appLockTimer = null; }
      syncHideBalancesUI(); syncAppLockUI();
      refreshAll();
      renderCategoriesView();
    });
  }

  async function init(){
    try{ await loadData(); }catch(e){ console.error(e); }
    injectIcons();
    applyTheme(settings.theme || 'light');
    populateEntryCategorySelect('income');
    populateEntryAccountSelect();
    populateFilterCategorySelect('all');
    populateHistoryFilterCategorySelect('all');
    setDefaultDates();
    bindEvents();
    bindPrivacyEvents();
    bindCrossTabSync();
    syncHideBalancesUI();
    syncAppLockUI();
    updateNotifPermissionStatus();
    refreshAll();
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
      if(state.tab){
        renderTabUI(state.tab);
        if(state.tab==='more'){
          if(state.sub) renderMoreSubState(state.sub); else renderMoreMenuState();
        }
      }
    });
    document.getElementById('loading-overlay').style.display='none';
    if(settings.appLockEnabled && settings.appLockPin){ lockApp(); } else { resetAppLockTimer(); }
    resetHideBalancesTimer();
    setInterval(maybeFireDueNotifications, 5*60*1000);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(()=>{}); });
  }

  init();
})();
