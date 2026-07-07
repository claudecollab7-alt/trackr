  if(!window.storage){
    (function(){
      const PREFIX = 'moneyLedgerPremium:';
      function lsKey(key, shared){ return PREFIX + (shared ? 'shared:' : '') + key; }
      window.storage = {
        async get(key, shared){
          try{ const raw = localStorage.getItem(lsKey(key, shared)); if(raw===null) return null; return { key, value: raw, shared: !!shared }; }
          catch(e){ return null; }
        },
        async set(key, value, shared){
          try{ localStorage.setItem(lsKey(key, shared), value); return { key, value, shared: !!shared }; }
          catch(e){ return null; }
        },
        async delete(key, shared){
          try{ localStorage.removeItem(lsKey(key, shared)); return { key, deleted:true, shared: !!shared }; }
          catch(e){ return null; }
        },
        async list(prefix, shared){
          try{
            const full = lsKey(prefix || '', shared); const keys = [];
            for(let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if(k && k.indexOf(full)===0) keys.push(k.slice(PREFIX.length + (shared?7:0))); }
            return { keys, prefix, shared: !!shared };
          }catch(e){ return null; }
        }
      };
    })();
  }
