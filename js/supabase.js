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
  // A password-reset link lands back here the same way - detectSessionInUrl would otherwise
  // silently establish a live "recovery" session and drop the user straight into the app.
  // app.js uses this to show a dedicated "set a new password" screen instead.
  const cameFromPasswordRecovery = /type=recovery/.test(location.hash) || /type=recovery/.test(location.search);

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
      // Never send an explicit null here - a NOT NULL created_at column only falls back to
      // its DEFAULT when the column is omitted from the insert, not when it's present but
      // null. A transaction from before this field existed (or any other way it ended up
      // missing locally) would otherwise upsert-fail every future batch containing it, the
      // same permanently-stuck-sync failure mode the debt_id foreign key bug produced.
      created_at: t.createdAt || new Date().toISOString()
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
  // Shares the same IndexedDB store app.js's diagLogPage()/readDiagLog() use for Install
  // Diagnostics (and that sw.js also writes to independently) - this file loads before app.js
  // and isn't in its closure, so it keeps its own tiny writer against the same store/schema
  // rather than reaching across files. Every rejected write lands here with the raw
  // Postgrest error (code/message/details/hint) and which table/rows were involved, so the
  // next stuck-write report can be read straight out of the log instead of reproduced blind.
  const DIAG_DB_NAME = 'trackrDiagnostics';
  const DIAG_STORE_NAME = 'events';
  function logSyncError(op, error){
    const ids = op.kind==='upsert' ? op.rows.map(r=>r.id).filter(Boolean) : Object.values(op.match||{});
    const detail = {
      table: op.table, kind: op.kind, ids,
      code: error && error.code, message: error && error.message,
      details: error && error.details, hint: error && error.hint
    };
    console.error('Sync write rejected by server:', detail);
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
          tx.objectStore(DIAG_STORE_NAME).add({ ts: Date.now(), source:'sync', event:'sync-write-rejected', detail: JSON.stringify(detail) });
          tx.oncomplete = () => db.close();
          tx.onerror = () => db.close();
        }catch(e){ try{ db.close(); }catch(e2){} }
      };
      req.onerror = () => {};
    }catch(e){}
  }
  // Records ids the server has told us, in no uncertain terms, it will NEVER accept from this
  // session - an RLS violation (42501) means the row belongs to a different account, which no
  // amount of retrying fixes. Kept separate from the pending-write queue (which is for ops
  // still worth retrying) and persisted so Data Integrity Check can surface these at any later
  // point, even after the diagnostic log has rotated past the original failure.
  const PERMANENT_REJECT_KEY = 'permanentlyRejectedRecords';
  async function getPermanentlyRejectedRecords(){
    try{
      const raw = await window.storage.get(PERMANENT_REJECT_KEY);
      return raw ? JSON.parse(raw.value) : {};
    }catch(e){ return {}; }
  }
  async function recordPermanentlyRejected(table, ids, error){
    if(!ids.length) return;
    try{
      const store = await getPermanentlyRejectedRecords();
      if(!Array.isArray(store[table])) store[table] = [];
      ids.forEach(id=>{
        if(id && !store[table].some(r=>r.id===id)){
          store[table].push({ id, code: error && error.code, message: error && error.message, detectedAt: new Date().toISOString() });
        }
      });
      await window.storage.set(PERMANENT_REJECT_KEY, JSON.stringify(store));
    }catch(e){}
  }
  async function clearPermanentlyRejectedRecord(table, id){
    try{
      const store = await getPermanentlyRejectedRecords();
      if(Array.isArray(store[table])) store[table] = store[table].filter(r=>r.id!==id);
      await window.storage.set(PERMANENT_REJECT_KEY, JSON.stringify(store));
    }catch(e){}
  }
  const RLS_VIOLATION_CODE = '42501';
  async function runOp(op){
    if(op.kind==='upsert'){
      const conflictCol = op.table==='budgets' ? 'user_id,category' : 'id';
      const { error } = await supabaseClient.from(op.table).upsert(op.rows, { onConflict: conflictCol });
      if(!error) return;
      logSyncError(op, error);
      if(error.code===RLS_VIOLATION_CODE){
        if(op.rows.length>1){
          // A batch upsert fails as one Postgres statement, same as the debt_id foreign-key
          // bug - but unlike that case, an RLS violation can't be fixed by correcting a field,
          // so isolate exactly which row(s) are permanently rejected by retrying one at a time,
          // letting the rest of the batch succeed instead of every future write to this whole
          // table being blocked behind one row that belongs to a different account.
          const rejectedIds = [];
          for(const row of op.rows){
            const { error: rowErr } = await supabaseClient.from(op.table).upsert([row], { onConflict: conflictCol });
            if(rowErr && rowErr.code===RLS_VIOLATION_CODE) rejectedIds.push(row.id);
            else if(rowErr){ logSyncError({ ...op, rows:[row] }, rowErr); throw rowErr; }
          }
          if(rejectedIds.length) await recordPermanentlyRejected(op.table, rejectedIds, error);
          return;
        }
        await recordPermanentlyRejected(op.table, [op.rows[0].id], error);
        return; // Not thrown - the caller would otherwise queue this for a pointless retry.
      }
      throw error;
    } else if(op.kind==='delete'){
      let q = supabaseClient.from(op.table).delete();
      Object.keys(op.match).forEach(k=>{ q = q.eq(k, op.match[k]); });
      const { error } = await q;
      if(!error) return;
      logSyncError(op, error);
      if(error.code===RLS_VIOLATION_CODE) return; // Nothing to delete under this account anyway.
      throw error;
    }
  }
  async function syncOrQueue(op){
    if(!navigator.onLine){ await queuePendingWrite(op); return; }
    try{ await runOp(op); }
    catch(e){ await queuePendingWrite(op); }
  }
  // Used by logout to decide whether it's safe to clear this device's local copy of the
  // account's data - a non-zero count means there's still something made offline (or that
  // failed to reach the server) that only exists on this device right now.
  async function getPendingWriteCount(){
    await loadPendingQueue();
    return pendingQueue.length;
  }
  // Distinguishes "still offline" (navigator.onLine is false, or the request itself never
  // reached the server) from a genuinely stuck write (we're online and the server actively
  // rejected it — a malformed row, a stale foreign key, etc). The two need different messaging:
  // the first resolves itself once connectivity returns, the second never will no matter how
  // many times it's retried, so callers need to know which one they're looking at instead of
  // getting the same dead-end "reconnect and try again." RLS violations (42501) never reach
  // this queue at all - runOp() above resolves those immediately into the separate
  // permanently-rejected-records store instead, since retrying is never worth it and lumping
  // them in with this generic "stuck" messaging would be actively wrong.
  async function getPendingWriteSummary(){
    await loadPendingQueue();
    const tables = [...new Set(pendingQueue.map(op=>op.table))];
    return { count: pendingQueue.length, tables };
  }
  async function retryPendingWrites(){
    if(retryInFlight) return { stuckOnNetwork: false };
    retryInFlight = true;
    let stuckOnNetwork = false;
    try{
      await loadPendingQueue();
      while(pendingQueue.length>0){
        if(!navigator.onLine){ stuckOnNetwork = true; break; }
        const op = pendingQueue[0];
        try{
          await runOp(op);
          pendingQueue.shift();
          await savePendingQueue();
        }catch(e){
          // A network-level failure (fetch never got a response) means "still offline" in
          // practice even if navigator.onLine hasn't caught up yet - genuinely retryable.
          // Anything else is the server actively rejecting this specific op, which won't
          // change on its own.
          stuckOnNetwork = !navigator.onLine || e instanceof TypeError;
          break;
        }
      }
    } finally { retryInFlight = false; }
    return { stuckOnNetwork };
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

  // Used by "Reset Everything" when the user explicitly confirms they also want their
  // cloud-stored copy deleted (asked fresh every time - never remembered as a default,
  // since this is destructive). debts/receivables share the same server-side table, so
  // deleting by user_id here correctly removes both in one pass.
  // Runs each delete directly (not via syncOrQueue) and reports per-table success/failure -
  // this is a deliberate, explicit deletion the user just confirmed, so a failure should be
  // surfaced right away rather than silently queued for a "later" that might never prompt a
  // retry, leaving the caller wrongly believing the cloud copy is gone.
  async function deleteAllCloudDataForUser(userId){
    const results = {};
    for(const table of ['transactions','debts','goals','budgets']){
      try{
        await runOp({ kind:'delete', table, match:{ user_id:userId } });
        results[table] = true;
      }catch(e){
        results[table] = false;
        console.error(`Failed to delete cloud "${table}" rows for user:`, e);
      }
    }
    return results;
  }

  window.trackrSync = {
    client: supabaseClient,
    cameFromEmailConfirmation,
    cameFromPasswordRecovery,
    syncUpsertTransactions, syncDeleteTransaction,
    syncUpsertDebts, syncUpsertReceivables, syncDeleteDebt,
    syncUpsertGoals, syncDeleteGoal,
    syncBudgets,
    pullCloudData,
    migrateLocalDataToCloudIfNeeded,
    skipMigration,
    retryPendingWrites,
    getPendingWriteCount,
    getPendingWriteSummary,
    deleteAllCloudDataForUser,
    purgeQueuedTables,
    getPermanentlyRejectedRecords,
    clearPermanentlyRejectedRecord
  };
