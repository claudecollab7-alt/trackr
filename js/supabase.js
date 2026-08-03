  /* ---------- Supabase-backed cloud sync ----------
     Verified column mapping (per the real schema):
       transactions: id, user_id, type(credit/debit), date, category, account, amount, particulars, debt_id, created_at
       debts:        id, user_id, name, direction(i_owe/owed_to_me), debt_type(emi/one_time), total_amount, monthly_amount, installments, start_date, created_at
       goals:        id, user_id, name, target_amount, saved_amount, deadline, created_at
       budgets:      id, user_id, category, monthly_limit, created_at
       accounts:     id (text, not uuid — local ids are plain strings like "acc_cash"),
                     user_id, name, created_at
     Debts and receivables share the "debts" table, split by direction.
     There's no payments/contributions storage in this schema — see the notes
     on fromDebtRow/toGoalRow below for how those are handled.
     Wallets/accounts sync requires an `accounts` table + RLS policy to actually exist in the
     real Supabase project — this code assumes it, but can't create or verify it from here (no
     real network access). See the migration SQL in this round's PR description. Until that
     table exists, every account upsert/delete just queues and retries harmlessly via the same
     pending-write mechanism already used for any offline/unreachable write — reminders/
     recurring/categories/settings remain genuinely local-only by design, unrelated to this. */

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
  // No created_at sent - local accounts never tracked one (unlike transactions, which fall back
  // to `new Date().toISOString()` for exactly this reason), so this is omitted entirely rather
  // than fabricated, letting the column's own DEFAULT now() apply on first insert and stay
  // untouched on every later upsert of the same row (Supabase's upsert only SETs the columns
  // actually present in the payload).
  function toAccountRow(a, userId){
    return { id: a.id, user_id: userId, name: a.name };
  }
  function fromAccountRow(r){
    return { id: r.id, name: r.name };
  }
  // dismissed_duplicates has no id column of its own - (user_id, group_key) IS the primary key,
  // since a dismissal is nothing more than "this exact group_key is dismissed for this user" (see
  // the SQL migration in this round's PR description). No created_at needed client-side either,
  // same reasoning as accounts above - the column's own DEFAULT now() covers it.
  function toDismissedDuplicateRow(userId, groupKey){
    return { user_id: userId, group_key: groupKey };
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
  // The one field that actually identifies a row varies by table: most have `id`, but
  // dismissed_duplicates has no id column at all (its key is group_key), and budgets rows are
  // built as {user_id, category, monthly_limit} with no id field either. Getting this wrong for
  // budgets specifically was a real, confirmed bug: every synced-row key function in this file
  // defaulted to `r.id`, which is undefined for a budget row, so a batch with 2+ budget
  // categories collapsed to a single row wherever a key was needed (the dedupe below in
  // particular) - silently and permanently discarding every category but one, most seriously
  // during a first-ever cloud migration where there's no earlier successful save to fall back on.
  function syncedRowKeyOf(table){
    if(table==='dismissed_duplicates') return r=>r.group_key;
    if(table==='budgets') return r=>r.category;
    return r=>r.id;
  }
  function logSyncError(op, error){
    const ids = op.kind==='upsert'
      ? op.rows.map(syncedRowKeyOf(op.table)).filter(Boolean)
      : Object.values(op.match||{});
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
  // Records ids the server has told us it will NEVER accept from this session as-is - an RLS
  // violation (42501) means the row belongs to a different account, and a foreign-key violation
  // (23503) means it references something (a debt_id, most likely) that doesn't exist server-
  // side. Neither resolves by blindly retrying the exact same payload, so both are pulled out of
  // the pending-write queue (which is for ops still worth retrying) and persisted here instead,
  // so Data Integrity Check can surface them at any later point, even after the diagnostic log
  // has rotated past the original failure.
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
        if(!id) return;
        // Upsert-by-id rather than insert-only-if-absent: a retried write that fails AGAIN can
        // fail for a DIFFERENT reason than the first time (e.g. a missing-GRANT permission error
        // gets fixed server-side, but the row genuinely does belong to another account) - the
        // stored code/message needs to reflect the latest attempt, not freeze on whatever was
        // true the first time this id was ever seen.
        const idx = store[table].findIndex(r=>r.id===id);
        const entry = { id, code: error && error.code, message: error && error.message, detectedAt: new Date().toISOString() };
        if(idx>-1) store[table][idx] = entry; else store[table].push(entry);
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
  // Used by logout (and Reset Everything, which shares the same local-clear call) - the marker
  // list is stored under its own key, separate from the transactions/debts/goals/accounts arrays
  // it describes, so the ordinary "clear this device's copy of the account's data" step was
  // silently leaving it behind. On the next login, the same records get re-pulled from the cloud
  // with the same ids, re-matched against these stale markers, and flagged all over again - a
  // second account on the same device, or the same account re-logging in after the server-side
  // cause was fixed, saw the exact same stale "can't sync" list either way.
  async function clearAllPermanentlyRejectedRecords(){
    try{ await window.storage.set(PERMANENT_REJECT_KEY, JSON.stringify({})); }catch(e){}
  }
  // Companion store for DELETE failures - a resolved error on a delete used to just get logged
  // and dropped outright, never queued or recorded anywhere retryable (confirmed in production:
  // a dismissal auto-clear delete that failed while dismissed_duplicates didn't exist yet -
  // PGRST205 - never got retried once the table was created; the stale dismissal stayed in the
  // cloud forever). A delete's match (e.g. {user_id, id} or {user_id, group_key}) IS the whole
  // "record" here - there's no local row to look up the way an upsert retry needs one, so this is
  // a flat list of match objects per table, deduped by their own JSON-stable key.
  const PERMANENT_REJECT_DELETE_KEY = 'permanentlyRejectedDeletes';
  function matchKeyOf(match){ return JSON.stringify(Object.keys(match).sort().map(k=>[k, match[k]])); }
  async function getPermanentlyRejectedDeletes(){
    try{
      const raw = await window.storage.get(PERMANENT_REJECT_DELETE_KEY);
      return raw ? JSON.parse(raw.value) : {};
    }catch(e){ return {}; }
  }
  async function recordPermanentlyRejectedDelete(table, match, error){
    try{
      const store = await getPermanentlyRejectedDeletes();
      if(!Array.isArray(store[table])) store[table] = [];
      const matchKey = matchKeyOf(match);
      const entry = { matchKey, match, code: error && error.code, message: error && error.message, detectedAt: new Date().toISOString() };
      const idx = store[table].findIndex(e=>e.matchKey===matchKey);
      if(idx>-1) store[table][idx] = entry; else store[table].push(entry);
      await window.storage.set(PERMANENT_REJECT_DELETE_KEY, JSON.stringify(store));
    }catch(e){}
  }
  async function clearPermanentlyRejectedDelete(table, matchKey){
    try{
      const store = await getPermanentlyRejectedDeletes();
      if(Array.isArray(store[table])) store[table] = store[table].filter(e=>e.matchKey!==matchKey);
      await window.storage.set(PERMANENT_REJECT_DELETE_KEY, JSON.stringify(store));
    }catch(e){}
  }
  async function clearAllPermanentlyRejectedDeletes(){
    try{ await window.storage.set(PERMANENT_REJECT_DELETE_KEY, JSON.stringify({})); }catch(e){}
  }
  // Re-attempts every still-outstanding failed delete, on every successful sync (see where this
  // is called from in app.js) - not only the next time the user happens to take some other
  // action. Retrying the exact same match is always safe here: a delete is idempotent (deleting
  // an already-gone or never-existent row is just 0 rows affected, no error), so there's no
  // "does the local record still exist" check to make the way the upsert-retry needs one.
  async function retryPermanentlyRejectedDeletesOnce(){
    if(!navigator.onLine) return;
    const store = await getPermanentlyRejectedDeletes();
    for(const table of Object.keys(store)){
      for(const entry of (store[table]||[])){
        try{
          let q = supabaseClient.from(table).delete();
          Object.keys(entry.match).forEach(k=> q = q.eq(k, entry.match[k]));
          const { error } = await q;
          if(!error) await clearPermanentlyRejectedDelete(table, entry.matchKey);
        }catch(e){}
      }
    }
  }
  const RLS_VIOLATION_CODE = '42501';
  const FK_VIOLATION_CODE = '23503';
  // Historically the only two codes treated as "permanent" (isolated per-record into
  // recordPermanentlyRejected, surfaced by Data Integrity Check) - everything else fell through to
  // `throw error` below, which syncOrQueue's catch re-queues for retry exactly like a genuine
  // offline blip. That was wrong for ANY other Postgrest-returned error, not just these two: a
  // cardinality violation (21000 - "ON CONFLICT DO UPDATE command cannot affect row a second
  // time", the actual shape of the accounts duplicate-id bug), a check violation, an invalid-enum
  // value, anything - all mean the exact same thing 42501/23503 do, which is that Supabase was
  // REACHED and responded with an authoritative rejection of this exact payload. Retrying an
  // unchanged payload against an unchanged schema can only ever repeat that same rejection. A
  // genuinely transient failure (offline, DNS failure, a dropped connection) never reaches this
  // line at all - fetch throws before postgrest-js ever has a `{error}` response to hand back, and
  // that thrown exception is what syncOrQueue's own try/catch (and retryPendingWrites' `instanceof
  // TypeError` check) already exists to handle. So the real dividing line was never "which
  // error code" - it's "did we get a response back at all" - and this is kept as a named set only
  // because 42501/23503 need their own copy in reasonFor() (js/app.js) to explain what kind of
  // rejection it is, not because other codes are treated any differently below.
  const PERMANENT_FAILURE_CODES = new Set([RLS_VIOLATION_CODE, FK_VIOLATION_CODE]);
  // Last-resort safety net, for every synced table, immediately before any upsert ever reaches
  // Postgres: a duplicate key within a single batch makes the whole upsert fail with a cardinality
  // violation (21000) - and since that's a real response (not a thrown exception), the op used to
  // sit at recordPermanentlyRejected or, before this round, get silently re-queued forever,
  // blocking every other write behind it. Two distinct legitimate records can never collide here -
  // every id in this app is generated as either a uuid or (for accounts specifically, post the
  // composite-key fix) unique per user, and dismissed_duplicates has no id column at all - its key
  // is group_key, already unique per user by construction (see dismissDuplicateGroup) - so a
  // collision can only ever mean the SAME record made it into the array twice, never two different
  // records that both deserve to exist. Keeps whichever occurrence is LAST in the array, since
  // callers always build `rows` from their own in-memory array in save-order, so the last
  // occurrence reflects the most recently saved local state.
  function dedupeRowsById(table, rows){
    const keyOf = syncedRowKeyOf(table);
    const byKey = new Map();
    rows.forEach(r=> byKey.set(keyOf(r), r));
    if(byKey.size !== rows.length){
      const seen = new Set(); const duplicateKeys = [];
      rows.forEach(r=>{ const k = keyOf(r); if(seen.has(k)) duplicateKeys.push(k); else seen.add(k); });
      logDedupeCollision(table, duplicateKeys, byKey.size, rows.length);
    }
    return Array.from(byKey.values());
  }
  // Same diagnostic store logSyncError writes to - a collision caught here is exactly the kind of
  // thing a later bug report needs to be diagnosable from View Log rather than reproduced blind.
  function logDedupeCollision(table, duplicateIds, keptCount, originalCount){
    console.warn('Deduped duplicate id(s) before upsert:', table, duplicateIds);
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
          tx.objectStore(DIAG_STORE_NAME).add({ ts: Date.now(), source:'sync', event:'sync-dedupe-collision', detail: JSON.stringify({ table, duplicateIds, keptCount, originalCount }) });
          tx.oncomplete = () => db.close();
          tx.onerror = () => db.close();
        }catch(e){ try{ db.close(); }catch(e2){} }
      };
      req.onerror = () => {};
    }catch(e){}
  }
  async function runOp(op){
    if(op.kind==='upsert'){
      // accounts' id alone used to be the primary key - every user's default wallets
      // (acc_cash/acc_bank/acc_card, seeded with the same fixed ids for everyone) collided with
      // whichever account first created rows with those ids, since a second user's upsert was
      // evaluated as an update of a row they don't own rather than an insert. The table's PK is
      // now composite (user_id, id) (see the accompanying SQL migration), the same shape budgets
      // already used for exactly this reason - so the conflict target here must match.
      const conflictCol = op.table==='budgets' ? 'user_id,category' : op.table==='accounts' ? 'user_id,id' : op.table==='dismissed_duplicates' ? 'user_id,group_key' : 'id';
      const rows = dedupeRowsById(op.table, op.rows);
      const { error } = await supabaseClient.from(op.table).upsert(rows, { onConflict: conflictCol });
      if(!error) return;
      logSyncError({ ...op, rows }, error);
      // See PERMANENT_FAILURE_CODES' own comment above - ANY error resolved here (not just
      // 42501/23503) means the server responded and rejected this exact payload, so it's isolated
      // per-record rather than thrown for syncOrQueue to blindly re-queue.
      const keyOf = syncedRowKeyOf(op.table);
      if(rows.length>1){
        // A batch upsert fails as one Postgres statement - isolate exactly which row(s) are
        // rejected by retrying one at a time, letting the rest of the batch succeed instead of
        // every future write to this whole table being blocked behind one bad row.
        const rejectedIds = [];
        for(const row of rows){
          const { error: rowErr } = await supabaseClient.from(op.table).upsert([row], { onConflict: conflictCol });
          if(rowErr) rejectedIds.push(keyOf(row));
        }
        if(rejectedIds.length) await recordPermanentlyRejected(op.table, rejectedIds, error);
        return;
      }
      await recordPermanentlyRejected(op.table, [keyOf(rows[0])], error);
      return; // Not thrown - the caller would otherwise queue this for a pointless retry.
    } else if(op.kind==='delete'){
      let q = supabaseClient.from(op.table).delete();
      Object.keys(op.match).forEach(k=>{ q = q.eq(k, op.match[k]); });
      const { error } = await q;
      if(!error) return;
      logSyncError(op, error);
      // A resolved error here is the server's word on this exact delete right now - but unlike
      // an upsert (which usually fails because of something about the ROW itself, e.g. an
      // ownership mismatch), a delete can fail for a reason that resolves entirely server-side
      // with no payload change needed at all - e.g. PGRST205 ("table not found in schema cache")
      // during the window before a new table's migration has been applied. Recording this instead
      // of just dropping it means retryPermanentlyRejectedDeletesOnce (called on every successful
      // sync - see app.js) picks it back up automatically once whatever blocked it is fixed,
      // instead of the delete being silently lost forever after just one attempt (confirmed in
      // production: a dismissal's auto-clear delete never reached the cloud this way).
      await recordPermanentlyRejectedDelete(op.table, op.match, error);
      return;
    }
  }
  async function syncOrQueue(op){
    if(!navigator.onLine){ await queuePendingWrite(op); return; }
    try{ await runOp(op); }
    catch(e){ await queuePendingWrite(op); }
  }
  // Re-attempts the write for a single record the server previously refused permanently
  // (RLS/FK, see PERMANENT_FAILURE_CODES above) instead of leaving it flagged forever. A 42501
  // in particular can be an operator-fixable condition (a missing GRANT, a corrected policy) as
  // much as a genuine ownership mismatch - the record deserves a real chance to clear its own
  // flag once whatever caused it is actually resolved, not a permanent, one-way label. Called
  // from app.js's REJECTABLE_TABLES-driven retry loop, which already knows which local list
  // (debts vs receivables) an id belongs to - direction can't be recovered from the id alone.
  // localRow is a full local record object for every table except dismissed_duplicates, where
  // it's just the group_key string (a dismissal's "record" IS its key - see
  // toDismissedDuplicateRow) - callers already know this per-table shape, matching how
  // js/app.js's retry loops read from their respective local data structures.
  async function retryPermanentWrite(table, listName, localRow, userId){
    if(!navigator.onLine) return { ok:false, skipped:true };
    let row, conflictCol, recordKey;
    if(table==='accounts'){ row = toAccountRow(localRow, userId); conflictCol = 'user_id,id'; recordKey = localRow.id; }
    else if(table==='transactions'){ row = toTransactionRow(localRow, userId); conflictCol = 'id'; recordKey = localRow.id; }
    else if(table==='goals'){ row = toGoalRow(localRow, userId); conflictCol = 'id'; recordKey = localRow.id; }
    else if(table==='debts'){ row = toDebtRow(localRow, userId, listName==='receivables'); conflictCol = 'id'; recordKey = localRow.id; }
    else if(table==='dismissed_duplicates'){ row = toDismissedDuplicateRow(userId, localRow); conflictCol = 'user_id,group_key'; recordKey = localRow; }
    else return { ok:false };
    try{
      const { error } = await supabaseClient.from(table).upsert([row], { onConflict: conflictCol });
      if(!error) return { ok:true };
      // See runOp's PERMANENT_FAILURE_CODES comment - any resolved error here means the server
      // responded and rejected this exact row, regardless of which code it carries, so the marker
      // is refreshed to reflect the latest attempt rather than left stale. A genuine connectivity
      // failure never reaches this line - it throws instead, caught below.
      await recordPermanentlyRejected(table, [recordKey], error);
      return { ok:false };
    }catch(e){ return { ok:false }; }
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
  // rejected it — a malformed row, a stale foreign key, a duplicate id, etc). The two need
  // different messaging: the first resolves itself once connectivity returns, the second never
  // will no matter how many times it's retried, so callers need to know which one they're looking
  // at instead of getting the same dead-end "reconnect and try again." No server-rejected write
  // (any Postgrest error code, not just 42501/23503) ever reaches this queue at all any more -
  // runOp() above resolves every one of those immediately into the separate
  // permanently-rejected-records store instead, since retrying an identical payload is never worth
  // it and lumping them in with this generic "stuck" messaging would be actively wrong. This queue
  // is reserved for genuine connectivity failures only.
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
  // Every delete below is scoped by BOTH user_id and id, not id alone - RLS's own USING clause
  // (auth.uid() = user_id) already makes a cross-account delete impossible today regardless of
  // what the client sends, but this project has already hit one real server-side misconfiguration
  // that silently widened what a policy actually allowed (the missing GRANT that caused the
  // accounts collision investigated in an earlier round). Scoping explicitly client-side too means
  // a delete can never reach past its own account's rows even if RLS itself were ever broken,
  // instead of depending entirely on the server getting that one thing right.
  function syncUpsertTransactions(userId, rows){ return syncOrQueue({ kind:'upsert', table:'transactions', rows: rows.map(t=>toTransactionRow(t,userId)) }); }
  function syncDeleteTransaction(userId, id){ return syncOrQueue({ kind:'delete', table:'transactions', match:{ user_id:userId, id } }); }
  function syncUpsertDebts(userId, rows){ return syncOrQueue({ kind:'upsert', table:'debts', rows: rows.map(d=>toDebtRow(d,userId,false)) }); }
  function syncUpsertReceivables(userId, rows){ return syncOrQueue({ kind:'upsert', table:'debts', rows: rows.map(d=>toDebtRow(d,userId,true)) }); }
  function syncDeleteDebt(userId, id){ return syncOrQueue({ kind:'delete', table:'debts', match:{ user_id:userId, id } }); }
  function syncUpsertGoals(userId, rows){ return syncOrQueue({ kind:'upsert', table:'goals', rows: rows.map(g=>toGoalRow(g,userId)) }); }
  function syncDeleteGoal(userId, id){ return syncOrQueue({ kind:'delete', table:'goals', match:{ user_id:userId, id } }); }
  function syncUpsertAccounts(userId, rows){ return syncOrQueue({ kind:'upsert', table:'accounts', rows: rows.map(a=>toAccountRow(a,userId)) }); }
  function syncDeleteAccount(userId, id){ return syncOrQueue({ kind:'delete', table:'accounts', match:{ user_id:userId, id } }); }
  // A "keep both" dismissal - see js/app.js's dismissDuplicateGroup - upserted as its own row so it
  // reaches every device for this account, not just the one it was made on. Deleted (not just left
  // to expire) the moment the group it describes stops existing - see syncDeleteDismissedDuplicate
  // and pruneDuplicateDismissalsForDeletedTx - so a stale dismissal can never wrongly suppress a
  // future, genuinely different group that happens to reuse the same group_key shape.
  function syncUpsertDismissedDuplicate(userId, groupKey){ return syncOrQueue({ kind:'upsert', table:'dismissed_duplicates', rows: [toDismissedDuplicateRow(userId, groupKey)] }); }
  function syncDeleteDismissedDuplicate(userId, groupKey){ return syncOrQueue({ kind:'delete', table:'dismissed_duplicates', match:{ user_id:userId, group_key:groupKey } }); }
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
    const result = { transactions:null, debts:null, receivables:null, goals:null, budgets:null, accounts:null, error:null, accountsError:null, dismissedDuplicates:null, dismissedDuplicatesError:null };
    // Each table tagged with its own name so a thrown error can be traced back to which one
    // actually failed - Promise.all itself only ever surfaces the FIRST rejection it sees, with
    // no indication of which of the 4 concurrent requests that was.
    const tag = (p, table) => p.catch(e => { throw Object.assign(e instanceof Error ? e : new Error(String(e && e.message || e)), { __table: table }); });
    // Accounts is pulled concurrently with the other four, but deliberately kept OUT of their
    // Promise.all and given its own independent catch: that table is newer than the other four
    // and may not exist in every Supabase project yet (see the migration SQL from the previous
    // round). Promise.all is all-or-nothing - lumping accounts in with it meant a single missing
    // table poisoned the whole pull, discarding transactions/debts/goals/budgets that had already
    // loaded fine and showing the generic "couldn't reach the cloud" toast for something that
    // isn't actually a network problem at all. Isolating it here means the other four succeed on
    // their own regardless of whether accounts exists yet.
    const accountsPromise = pullTable('accounts', userId)
      .then(rows => { result.accounts = rows.map(fromAccountRow); })
      .catch(e => { result.accountsError = { table:'accounts', code: e.code || null, message: e.message || String(e), name: e.name || null, online: navigator.onLine }; });
    // Same isolation as accounts above, and for the same reason - dismissed_duplicates is newer
    // still and may not exist in every Supabase project yet, so it must never be able to poison
    // the four core tables' Promise.all below.
    const dismissedDuplicatesPromise = pullTable('dismissed_duplicates', userId)
      .then(rows => { result.dismissedDuplicates = rows.map(r=>r.group_key); })
      .catch(e => { result.dismissedDuplicatesError = { table:'dismissed_duplicates', code: e.code || null, message: e.message || String(e), name: e.name || null, online: navigator.onLine }; });
    try{
      const [txRows, debtRows, goalRows, budgetRows] = await Promise.all([
        tag(pullTable('transactions', userId), 'transactions'), tag(pullTable('debts', userId), 'debts'),
        tag(pullTable('goals', userId), 'goals'), tag(pullTable('budgets', userId), 'budgets')
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
    }catch(e){
      console.error('Cloud fetch failed, staying on local cache:', e);
      // navigator.onLine only ever reports "definitely offline" reliably - "true" doesn't
      // guarantee the request actually reached anything, but distinguishes the common airplane-
      // mode/no-radio case from an actual server-side rejection (RLS, a timeout, a real network
      // error while apparently online), which is the ambiguity this is meant to resolve.
      result.error = { table: e.__table || null, code: e.code || null, message: e.message || String(e), name: e.name || null, online: navigator.onLine };
    }
    await accountsPromise;
    await dismissedDuplicatesPromise;
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
      // Debts/receivables before transactions - same dependency order as Restore Backup (see
      // handleRestoreFile in js/app.js): a transaction's debt_id foreign key needs the debt row
      // committed first. This path already awaited each op in sequence, so the bug here was
      // purely the ordering, not a race - but on a first-ever migration where the account has
      // both debts and debt-payment transactions, this would have hit the exact same FK
      // violation the restore race did, deterministically rather than intermittently.
      if(localData.debts.length) await runOp({ kind:'upsert', table:'debts', rows: localData.debts.map(d=>toDebtRow(d,userId,false)) });
      if(localData.receivables && localData.receivables.length) await runOp({ kind:'upsert', table:'debts', rows: localData.receivables.map(d=>toDebtRow(d,userId,true)) });
      if(localData.transactions.length) await runOp({ kind:'upsert', table:'transactions', rows: localData.transactions.map(t=>toTransactionRow(t,userId)) });
      if(localData.goals.length) await runOp({ kind:'upsert', table:'goals', rows: localData.goals.map(g=>toGoalRow(g,userId)) });
      const budgetRows = Object.keys(localData.budgets).map(cat=> ({ user_id:userId, category:cat, monthly_limit:localData.budgets[cat] }));
      if(budgetRows.length) await runOp({ kind:'upsert', table:'budgets', rows: budgetRows });
      // Migrated separately and non-fatally: the accounts table is newer than the other four and
      // may not exist in every Supabase project yet, so a failure here must not stop
      // 'migrated_to_cloud' from being set - that would make the migration look like it never
      // completed and re-upload everything else above on every future login, just because this
      // one optional step couldn't land.
      try{
        if(localData.accounts && localData.accounts.length) await runOp({ kind:'upsert', table:'accounts', rows: localData.accounts.map(a=>toAccountRow(a,userId)) });
      }catch(e2){ console.error('Accounts migration failed (table may not exist yet):', e2); }
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
    for(const table of ['transactions','debts','goals','budgets','accounts','dismissed_duplicates']){
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
    syncUpsertAccounts, syncDeleteAccount,
    syncUpsertDismissedDuplicate, syncDeleteDismissedDuplicate,
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
    clearPermanentlyRejectedRecord,
    clearAllPermanentlyRejectedRecords,
    retryPermanentWrite,
    getPermanentlyRejectedDeletes,
    clearPermanentlyRejectedDelete,
    clearAllPermanentlyRejectedDeletes,
    retryPermanentlyRejectedDeletesOnce
  };
