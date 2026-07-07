  if(!window.storage){
    (function(){
      const PREFIX = 'moneyLedgerPremium:';
      function lsKey(key){ return PREFIX + key; }
      window.storage = {
        async get(key){
          try{ const raw = localStorage.getItem(lsKey(key)); if(raw===null) return null; return { key, value: raw }; }
          catch(e){ return null; }
        },
        async set(key, value){
          try{ localStorage.setItem(lsKey(key), value); return { key, value }; }
          catch(e){ return null; }
        },
        async delete(key){
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
