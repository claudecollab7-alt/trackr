  if(!window.storage){
    (function(){
      const PREFIX = 'moneyLedgerPremium:';
      function lsKey(key){ return PREFIX + key; }

      // Silent second copy of every key in IndexedDB. localStorage and IndexedDB
      // are cleared by different browser conditions (e.g. Safari's "Prevent
      // Cross-Site Tracking" storage eviction hits them differently), so a
      // mirror here means one being wiped doesn't necessarily lose the data.
      const IDB_NAME = 'trackrBackupMirror';
      const IDB_STORE = 'kv';
      let idbPromise = null;
      function idbOpen(){
        if(idbPromise) return idbPromise;
        idbPromise = new Promise((resolve)=>{
          if(!window.indexedDB){ resolve(null); return; }
          try{
            const req = indexedDB.open(IDB_NAME, 1);
            req.onupgradeneeded = ()=>{ req.result.createObjectStore(IDB_STORE); };
            req.onsuccess = ()=> resolve(req.result);
            req.onerror = ()=> resolve(null);
          }catch(e){ resolve(null); }
        });
        return idbPromise;
      }
      async function idbGet(key){
        const db = await idbOpen(); if(!db) return undefined;
        return new Promise((resolve)=>{
          try{
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(key);
            req.onsuccess = ()=> resolve(req.result);
            req.onerror = ()=> resolve(undefined);
          }catch(e){ resolve(undefined); }
        });
      }
      async function idbSet(key, value){
        const db = await idbOpen(); if(!db) return;
        return new Promise((resolve)=>{
          try{
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put(value, key);
            tx.oncomplete = ()=> resolve();
            tx.onerror = ()=> resolve();
          }catch(e){ resolve(); }
        });
      }
      async function idbDelete(key){
        const db = await idbOpen(); if(!db) return;
        return new Promise((resolve)=>{
          try{
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).delete(key);
            tx.oncomplete = ()=> resolve();
            tx.onerror = ()=> resolve();
          }catch(e){ resolve(); }
        });
      }

      window.storage = {
        async get(key){
          try{
            const raw = localStorage.getItem(lsKey(key));
            if(raw!==null) return { key, value: raw };
          }catch(e){ /* fall through to IndexedDB */ }
          // localStorage missing or unreadable — try the mirror and self-heal it back.
          const mirrored = await idbGet(key);
          if(mirrored===undefined || mirrored===null) return null;
          try{ localStorage.setItem(lsKey(key), mirrored); }catch(e){}
          return { key, value: mirrored };
        },
        async set(key, value){
          idbSet(key, value);
          try{ localStorage.setItem(lsKey(key), value); return { key, value }; }
          catch(e){ return null; }
        },
        async delete(key){
          idbDelete(key);
          try{ localStorage.removeItem(lsKey(key)); return { key, deleted:true }; }
          catch(e){ return null; }
        },
        async list(prefix){
          try{
            const full = lsKey(prefix || ''); const keys = [];
            for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(k && k.indexOf(full)===0) keys.push(k.slice(PREFIX.length)); }
            return { keys, prefix };
          }catch(e){ return null; }
        }
      };
    })();
  }
