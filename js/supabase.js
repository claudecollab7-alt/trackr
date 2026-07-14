  /* ---------- Supabase-backed cloud sync ----------
     Verified column mapping (per the real schema):
       transactions: id, user_id, type(credit/debit), date, category, account, amount, particulars, debt_id, created_at
       debts:        id, user_id, name, direction(i_owe/owed_to_me), debt_type(emi/one_time), total_amount, monthly_amount, installments, start_date, created_at
       goals:        id, user_id, name, target_amount, saved_amount, deadline, created_at
       budgets:      id, user_id, category, monthly_limit, created_at
     Debts and receivables share the "debts" table, split by direction.
     There's no payments/contributions storage in this schema — see the notes
     on fromDebtRow/toGoalRow below for how those are handled.
     Only these four tables exist server-side, so reminders/recurring/accounts/
     categories/settings stay local-only. */

  // Captured before createClient() below, which asynchronously parses and strips
  // this same hash to auto-establish a session (detectSessionInUrl, on by default) —
  // app.js uses this to show a distinct "email confirmed" screen instead of silently
  // dropping the user straight into a live session from a confirmation-link click.
  const cameFromEmailConfirmation = /type=signup/.test(location.hash) || /type=signup/.test(location.search);

  const supabaseClient = window.supabase.createClient(
    'https://jjnxtmfntixysqvoighh.supabase.co',
    'sb_publishable_5GivZn5OcSCKBpO_75INFQ_2yDEl3jr'
  );

  function toTransactionRow(t, userId){
    return {
      id: t.id, user_id: userId,
      type: t.type==='income' ? 'credit' : 'debit',
      date: t.date, category: t.category, account: t.account, amount: t.amount,
      particulars: t.note || '',
      debt_id: t.debtId || null,
      created_at: t.createdAt || null
    };
  }
  function fromTransactionRow(r){
    return {
      id: r.id, type: r.type==='credit' ? 'income' : 'expense',
      category: r.category, account: r.account, amount: r.amount,
      note: r.particulars || '', date: r.date,
      createdAt: r.created_at || new Date().toISOString(),
      debtId: r.debt_id || null
    };
  }
  function toDebtRow(d, userId, isReceivable){
    // No payments column here — a debt/receivable's payment history lives in
    // transactions.debt_id, not on this row. See fromDebtRow.
    return {
      id: d.id, user_id: userId, name: d.name,
      direction: isReceivable ? 'owed_to_me' : 'i_owe',
      debt_type: d.type==='emi' ? 'emi' : 'one_time',
      total_amount: d.total, monthly_amount: d.emiAmount || 0, installments: d.tenure || 0,
      start_date: d.startDate
    };
  }
  // linkedPayments = payments array already reconstructed (by the caller) from
  // whichever pulled transactions have debt_id === r.id.
  function fromDebtRow(r, linkedPayments){
    return {
      id: r.id, name: r.name,
      type: r.debt_type==='emi' ? 'emi' : 'lump',
      total: r.total_amount, emiAmount: r.monthly_amount || 0, tenure: r.installments || 0,
      startDate: r.start_date, note: '',
      payments: linkedPayments || []
    };
  }
  function toGoalRow(g, userId){
    // No contributions column — only a single running total is stored, so we
    // send the computed current total (initialSaved + all contributions),
    // not just initialSaved. goalSaved() comes from money-math.js.
    return {
      id: g.id, user_id: userId, name: g.name,
      target_amount: g.target, saved_amount: goalSaved(g),
      deadline: g.targetDate || null
    };
  }
  // Contribution-by-contribution history can't be recovered from a single
  // saved_amount column, so a pulled goal starts a fresh local baseline:
  // initialSaved = the cloud total, contributions = []. The running total is
  // still correct going forward; only the itemized history doesn't carry
  // across devices. (Flagged to the user — would need a goal_id column on
  // transactions, mirroring debt_id, to do better.)
  function fromGoalRow(r){
    return {
      id: r.id, name: r.name, target: r.target_amount,
      initialSaved: r.saved_amount || 0, targetDate: r.deadline || null,
      note: '', contributions: []
    };
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
  // Drops any queued write for the given tables — used when the caller is about to
  // resend the full, corrected state for those tables anyway (e.g. after remapping
  // ids that made every earlier queued write for them permanently fail), so a dead
  // op doesn't sit at the front of the queue blocking every other write behind it.
  async function purgeQueuedTables(tableNames){
    await loadPendingQueue();
    pendingQueue = pendingQueue.filter(op=> !tableNames.includes(op.table));
    await savePendingQueue();
  }
  window.addEventListener('online', retryPendingWrites);

  /* ---------- Upsert / delete entry points, one per table ---------- */
  function syncUpsertTransactions(userId, rows){ return syncOrQueue({ kind:'upsert', table:'transactions', rows: rows.map(t=>toTransactionRow(t,userId)) }); }
  function syncDeleteTransaction(id){ return syncOrQueue({ kind:'delete', table:'transactions', match:{ id } }); }
  function syncUpsertDebts(userId, rows){ return syncOrQueue({ kind:'upsert', table:'debts', rows: rows.map(d=>toDebtRow(d,userId,false)) }); }
  function syncUpsertReceivables(userId, rows){ return syncOrQueue({ kind:'upsert', table:'debts', rows: rows.map(d=>toDebtRow(d,userId,true)) }); }
  function syncDeleteDebt(id){ return syncOrQueue({ kind:'delete', table:'debts', match:{ id } }); }
  function syncUpsertGoals(userId, rows){ return syncOrQueue({ kind:'upsert', table:'goals', rows: rows.map(g=>toGoalRow(g,userId)) }); }
  function syncDeleteGoal(id){ return syncOrQueue({ kind:'delete', table:'goals', match:{ id } }); }
  async function syncBudgets(userId, budgetsObj){
    // Budgets have no local id/delete-tracking of their own (it's a plain
    // {category: limit} map) — reconcile against whatever's on the server
    // instead: blind-upsert the current categories (relies on a DB-level
    // unique constraint on (user_id, category) to update in place rather
    // than insert a duplicate row — see the note in the chat reply), then
    // separately fetch what's on the server and delete any category that's
    // no longer present locally.
    const rows = Object.keys(budgetsObj).map(cat=> ({ user_id:userId, category:cat, monthly_limit:budgetsObj[cat] }));
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
    const result = { transactions:null, debts:null, receivables:null, goals:null, budgets:null };
    try{
      const [txRows, debtRows, goalRows, budgetRows] = await Promise.all([
        pullTable('transactions', userId), pullTable('debts', userId),
        pullTable('goals', userId), pullTable('budgets', userId)
      ]);
      const transactions = txRows.map(fromTransactionRow);
      const paymentsByDebtId = {};
      transactions.forEach(t=>{
        if(t.debtId){
          (paymentsByDebtId[t.debtId] = paymentsByDebtId[t.debtId] || []).push({ id:t.id, amount:t.amount, date:t.date, createdAt:t.createdAt, txId:t.id });
        }
      });
      const debts = [], receivables = [];
      debtRows.forEach(r=>{
        const obj = fromDebtRow(r, paymentsByDebtId[r.id]);
        if(r.direction==='owed_to_me') receivables.push(obj); else debts.push(obj);
      });
      result.transactions = transactions;
      result.debts = debts;
      result.receivables = receivables;
      result.goals = goalRows.map(fromGoalRow);
      const budgetsObj = {};
      budgetRows.forEach(r=>{ budgetsObj[r.category] = r.monthly_limit; });
      result.budgets = budgetsObj;
    }catch(e){ console.error('Cloud fetch failed, staying on local cache:', e); }
    return result;
  }

  /* ---------- One-time migration of pre-existing local data ---------- */
  // Records the same "handled" flag as an actual migration would, without uploading
  // anything - used when the user is asked "add this device's data to your account?"
  // and declines. Without this, the same prompt would resurface on every future login
  // on this device (migrateLocalDataToCloudIfNeeded would keep seeing no flag set).
  async function skipMigration(){
    try{ await window.storage.set('migrated_to_cloud', 'true'); }catch(e){}
  }
  async function migrateLocalDataToCloudIfNeeded(userId, localData){
    try{
      const flag = await window.storage.get('migrated_to_cloud');
      if(flag && flag.value==='true') return;
    }catch(e){}
    try{
      if(localData.transactions.length) await runOp({ kind:'upsert', table:'transactions', rows: localData.transactions.map(t=>toTransactionRow(t,userId)) });
      if(localData.debts.length) await runOp({ kind:'upsert', table:'debts', rows: localData.debts.map(d=>toDebtRow(d,userId,false)) });
      if(localData.receivables && localData.receivables.length) await runOp({ kind:'upsert', table:'debts', rows: localData.receivables.map(d=>toDebtRow(d,userId,true)) });
      if(localData.goals.length) await runOp({ kind:'upsert', table:'goals', rows: localData.goals.map(g=>toGoalRow(g,userId)) });
      const budgetRows = Object.keys(localData.budgets).map(cat=> ({ user_id:userId, category:cat, monthly_limit:localData.budgets[cat] }));
      if(budgetRows.length) await runOp({ kind:'upsert', table:'budgets', rows: budgetRows });
      await window.storage.set('migrated_to_cloud', 'true');
    }catch(e){
      console.error('Initial cloud migration failed — will retry next login:', e);
    }
  }

  window.trackrSync = {
    client: supabaseClient,
    cameFromEmailConfirmation,
    syncUpsertTransactions, syncDeleteTransaction,
    syncUpsertDebts, syncUpsertReceivables, syncDeleteDebt,
    syncUpsertGoals, syncDeleteGoal,
    syncBudgets,
    pullCloudData,
    migrateLocalDataToCloudIfNeeded,
    skipMigration,
    retryPendingWrites,
    purgeQueuedTables
  };
