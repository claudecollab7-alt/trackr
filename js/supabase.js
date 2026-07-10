  /* ---------- Supabase-backed cloud sync ----------
     Column mapping assumption (I can't query your project's schema from this
     environment, so this mirrors the app's own field names as closely as
     possible — if your first test transaction doesn't show up correctly in
     the Table Editor, this mapping is the first place to check):
       transactions: id, user_id, type, category, account, amount, note, date, created_at
       debts:        id, user_id, name, type, total, emi_amount, tenure, start_date, note, payments (jsonb)
       goals:        id, user_id, name, target, initial_saved, target_date, note, contributions (jsonb)
       budgets:      user_id, category, limit_amount  — needs a unique constraint on (user_id, category)
     Only these four tables exist server-side, so receivables/reminders/recurring/
     accounts/categories/settings stay local-only for now. */
  const supabaseClient = window.supabase.createClient(
    'https://jjnxtmfntixysqvoighh.supabase.co',
    'sb_publishable_5GivZn5OcSCKBpO_75INFQ_2yDEl3jr'
  );

  const SYNC_TABLES = ['transactions', 'debts', 'goals', 'budgets'];

  function toTransactionRow(t, userId){
    return { id:t.id, user_id:userId, type:t.type, category:t.category, account:t.account, amount:t.amount, note:t.note||'', date:t.date, created_at:t.createdAt||null };
  }
  function toDebtRow(d, userId){
    return { id:d.id, user_id:userId, name:d.name, type:d.type, total:d.total, emi_amount:d.emiAmount||0, tenure:d.tenure||0, start_date:d.startDate, note:d.note||'', payments:d.payments||[] };
  }
  function toGoalRow(g, userId){
    return { id:g.id, user_id:userId, name:g.name, target:g.target, initial_saved:g.initialSaved||0, target_date:g.targetDate||null, note:g.note||'', contributions:g.contributions||[] };
  }
  function fromTransactionRow(r){
    return { id:r.id, type:r.type, category:r.category, account:r.account, amount:r.amount, note:r.note||'', date:r.date, createdAt:r.created_at||new Date().toISOString() };
  }
  function fromDebtRow(r){
    return { id:r.id, name:r.name, type:r.type, total:r.total, emiAmount:r.emi_amount||0, tenure:r.tenure||0, startDate:r.start_date, note:r.note||'', payments:Array.isArray(r.payments)?r.payments:[] };
  }
  function fromGoalRow(r){
    return { id:r.id, name:r.name, target:r.target, initialSaved:r.initial_saved||0, targetDate:r.target_date||null, note:r.note||'', contributions:Array.isArray(r.contributions)?r.contributions:[] };
  }

  /* ---------- Offline pending-write queue ----------
     Every background sync call goes through here. On failure (offline, or any
     other error) the operation is appended to a small queue persisted in
     localStorage, and retried whenever connectivity returns or the app reloads. */
  const PENDING_QUEUE_KEY = 'pendingSyncQueue';
  let pendingQueue = [];
  let queueLoaded = false;
  let retryInFlight = false;

  async function loadPendingQueue(){
    if(queueLoaded) return;
    queueLoaded = true;
    try{
      const raw = await window.storage.get(PENDING_QUEUE_KEY);
      pendingQueue = raw ? JSON.parse(raw.value) : [];
      if(!Array.isArray(pendingQueue)) pendingQueue = [];
    }catch(e){ pendingQueue = []; }
  }
  async function savePendingQueue(){
    try{ await window.storage.set(PENDING_QUEUE_KEY, JSON.stringify(pendingQueue)); }catch(e){}
  }
  async function queuePendingWrite(op){
    await loadPendingQueue();
    pendingQueue.push(op);
    await savePendingQueue();
  }
  async function runOp(op){
    if(op.kind==='upsert'){
      const conflictCol = op.table==='budgets' ? 'user_id,category' : 'id';
      const { error } = await supabaseClient.from(op.table).upsert(op.rows, { onConflict: conflictCol });
      if(error) throw error;
    } else if(op.kind==='delete'){
      let q = supabaseClient.from(op.table).delete();
      Object.keys(op.match).forEach(k=>{ q = q.eq(k, op.match[k]); });
      const { error } = await q;
      if(error) throw error;
    }
  }
  async function syncOrQueue(op){
    if(!navigator.onLine){ await queuePendingWrite(op); return; }
    try{ await runOp(op); }
    catch(e){ await queuePendingWrite(op); }
  }
  async function retryPendingWrites(){
    if(retryInFlight) return;
    retryInFlight = true;
    try{
      await loadPendingQueue();
      while(pendingQueue.length>0){
        const op = pendingQueue[0];
        try{
          await runOp(op);
          pendingQueue.shift();
          await savePendingQueue();
        }catch(e){ break; } // still offline or a real error — stop, leave the rest queued
      }
    } finally { retryInFlight = false; }
  }
  window.addEventListener('online', retryPendingWrites);

  /* ---------- Upsert / delete entry points, one per table ---------- */
  function syncUpsertTransactions(userId, rows){ return syncOrQueue({ kind:'upsert', table:'transactions', rows: rows.map(t=>toTransactionRow(t,userId)) }); }
  function syncDeleteTransaction(id){ return syncOrQueue({ kind:'delete', table:'transactions', match:{ id } }); }
  function syncUpsertDebts(userId, rows){ return syncOrQueue({ kind:'upsert', table:'debts', rows: rows.map(d=>toDebtRow(d,userId)) }); }
  function syncDeleteDebt(id){ return syncOrQueue({ kind:'delete', table:'debts', match:{ id } }); }
  function syncUpsertGoals(userId, rows){ return syncOrQueue({ kind:'upsert', table:'goals', rows: rows.map(g=>toGoalRow(g,userId)) }); }
  function syncDeleteGoal(id){ return syncOrQueue({ kind:'delete', table:'goals', match:{ id } }); }
  async function syncBudgets(userId, budgetsObj){
    // Budgets have no local id/delete-tracking of their own (it's a plain
    // {category: limit} map) — reconcile against whatever's on the server
    // instead: upsert the current categories, delete any server-side category
    // that's no longer present locally.
    const rows = Object.keys(budgetsObj).map(cat=> ({ user_id:userId, category:cat, limit_amount:budgetsObj[cat] }));
    if(rows.length>0) await syncOrQueue({ kind:'upsert', table:'budgets', rows });
    if(!navigator.onLine) return;
    try{
      const { data, error } = await supabaseClient.from('budgets').select('category').eq('user_id', userId);
      if(error || !data) return;
      const localCats = new Set(Object.keys(budgetsObj));
      const toDelete = data.map(r=>r.category).filter(c=> !localCats.has(c));
      for(const cat of toDelete){
        await syncOrQueue({ kind:'delete', table:'budgets', match:{ user_id:userId, category:cat } });
      }
    }catch(e){}
  }

  /* ---------- Pull cloud data (source of truth when online) ---------- */
  async function pullTable(table, userId){
    const { data, error } = await supabaseClient.from(table).select('*').eq('user_id', userId);
    if(error) throw error;
    return data || [];
  }
  async function pullCloudData(userId){
    const result = { transactions:null, debts:null, goals:null, budgets:null };
    try{
      const [txRows, debtRows, goalRows, budgetRows] = await Promise.all([
        pullTable('transactions', userId), pullTable('debts', userId),
        pullTable('goals', userId), pullTable('budgets', userId)
      ]);
      result.transactions = txRows.map(fromTransactionRow);
      result.debts = debtRows.map(fromDebtRow);
      result.goals = goalRows.map(fromGoalRow);
      const budgetsObj = {};
      budgetRows.forEach(r=>{ budgetsObj[r.category] = r.limit_amount; });
      result.budgets = budgetsObj;
    }catch(e){ console.error('Cloud fetch failed, staying on local cache:', e); }
    return result;
  }

  /* ---------- One-time migration of pre-existing local data ---------- */
  async function migrateLocalDataToCloudIfNeeded(userId, localData){
    try{
      const flag = await window.storage.get('migrated_to_cloud');
      if(flag && flag.value==='true') return;
    }catch(e){}
    try{
      if(localData.transactions.length) await runOp({ kind:'upsert', table:'transactions', rows: localData.transactions.map(t=>toTransactionRow(t,userId)) });
      if(localData.debts.length) await runOp({ kind:'upsert', table:'debts', rows: localData.debts.map(d=>toDebtRow(d,userId)) });
      if(localData.goals.length) await runOp({ kind:'upsert', table:'goals', rows: localData.goals.map(g=>toGoalRow(g,userId)) });
      const budgetRows = Object.keys(localData.budgets).map(cat=> ({ user_id:userId, category:cat, limit_amount:localData.budgets[cat] }));
      if(budgetRows.length) await runOp({ kind:'upsert', table:'budgets', rows: budgetRows });
      await window.storage.set('migrated_to_cloud', 'true');
    }catch(e){
      console.error('Initial cloud migration failed — will retry next login:', e);
    }
  }

  window.trackrSync = {
    client: supabaseClient,
    syncUpsertTransactions, syncDeleteTransaction,
    syncUpsertDebts, syncDeleteDebt,
    syncUpsertGoals, syncDeleteGoal,
    syncBudgets,
    pullCloudData,
    migrateLocalDataToCloudIfNeeded,
    retryPendingWrites
  };
