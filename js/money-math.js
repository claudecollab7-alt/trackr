// Pure money-math functions shared by the app and test.html.
// No DOM access here on purpose, so these can run and be tested in isolation.

function toLocalDateStr(d){
  const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}

function sumByType(list, type){ return list.filter(t=>t.type===type).reduce((s,t)=>s+t.amount,0); }

function categoryBreakdownData(filtered){
  const map = {};
  filtered.forEach(t=>{ const key = t.category+'\u0001'+t.type; map[key] = (map[key]||0) + t.amount; });
  return Object.entries(map).map(([key,amt])=>{ const [category,type] = key.split('\u0001'); return { category, type, amt }; }).sort((a,b)=> b.amt - a.amt);
}

function debtPaid(d){ return (d.payments||[]).reduce((s,p)=>s+p.amount,0); }
function debtRemaining(d){ return Math.max(0, d.total - debtPaid(d)); }

function emiMonthsElapsed(startDate){
  const start = new Date(startDate+'T00:00:00'); const today = new Date();
  let months = (today.getFullYear()-start.getFullYear())*12 + (today.getMonth()-start.getMonth());
  if(today.getDate() >= start.getDate()) months += 1;
  return Math.max(0, months);
}

function debtOverdueCount(d){
  if(d.type!=='emi') return 0;
  const expected = Math.min(emiMonthsElapsed(d.startDate), d.tenure);
  return Math.max(0, expected - (d.payments||[]).length);
}

function emiPayoffDate(d){
  if(d.type!=='emi') return null;
  const remainingInstallments = Math.max(0, d.tenure - (d.payments||[]).length);
  if(remainingInstallments<=0) return null;
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth()+remainingInstallments, 1);
}

function buildEmiSchedule(d){
  if(d.type !== 'emi') return [];
  const start = new Date(d.startDate+'T00:00:00');
  const sortedPayments = [...(d.payments||[])].sort((a,b)=> a.date.localeCompare(b.date));
  const todayStr = toLocalDateStr(new Date());
  const schedule = [];
  for(let i=0; i<d.tenure; i++){
    const dueDateObj = new Date(start.getFullYear(), start.getMonth()+i, start.getDate());
    const dueDateStr = toLocalDateStr(dueDateObj);
    const payment = sortedPayments[i];
    schedule.push({
      installmentNo: i+1,
      dueDate: dueDateStr,
      amount: d.emiAmount,
      paid: !!payment,
      paidDate: payment ? payment.date : null,
      paidAmount: payment ? payment.amount : null,
      overdue: !payment && dueDateStr < todayStr
    });
  }
  return schedule;
}

function goalSaved(g){ return (g.initialSaved||0) + (g.contributions||[]).reduce((s,c)=>s+c.amount,0); }
function goalRemaining(g){ return Math.max(0, g.target - goalSaved(g)); }
