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
      paidAt: payment ? (payment.createdAt || null) : null,
      paymentId: payment ? payment.id : null,
      overdue: !payment && dueDateStr < todayStr
    });
  }
  return schedule;
}

function goalSaved(g){ return (g.initialSaved||0) + (g.contributions||[]).reduce((s,c)=>s+c.amount,0); }
function goalRemaining(g){ return Math.max(0, g.target - goalSaved(g)); }

// In-app calculator (round "calculator"). The one shared rounding convention every stored/
// displayed money value in this app already uses - 2 decimal places - centralized here so the
// calculator rounds results exactly the same way a transaction amount does, rather than the UI
// layer reimplementing its own (potentially inconsistent) rounding, and so nothing calling into
// this file ever needs plain floating-point arithmetic or eval() for a user-facing number.
// Number.EPSILON guards the classic float case where e.g. 1.005*100 evaluates to
// 100.49999999999999 rather than 100.5, which would otherwise round DOWN to 1.00 instead of the
// mathematically correct 1.01.
function roundMoney(n){
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
// Basic arithmetic for the Quick tab. Division by zero returns null (not Infinity/NaN) so the
// caller can show an error state instead of a garbage number. calcPercent computes "b% of a" -
// the same "X + 10% = X plus 10% of X" convention as a standard calculator's % key, not a bare
// division by 100 - e.g. calcPercent(200, 10) = 20, meant to be combined with a preceding +/-/
// x// operator by the caller, matching how every physical/phone calculator's % key behaves.
function calcApplyOp(a, op, b){
  switch(op){
    case '+': return roundMoney(a + b);
    case '-': return roundMoney(a - b);
    case '*': return roundMoney(a * b);
    case '/': return b === 0 ? null : roundMoney(a / b);
    default: return null;
  }
}
function calcPercent(a, b){
  return roundMoney(a * (b / 100));
}
// EMI Planner - standard reducing-balance (annuity) amortization formula, the same one every
// bank/EMI calculator uses: EMI = P x r x (1+r)^n / ((1+r)^n - 1), where r is the MONTHLY interest
// rate (annualRatePct/12/100) and n is the tenure in months. Falls back to a flat P/n split when
// the rate is zero (the formula above divides by zero at r=0, but a 0%-interest EMI is just the
// principal spread evenly). Returns null for invalid inputs (principal/tenure must be positive)
// rather than NaN/Infinity, so the caller can show an error state.
function calcEmi(principal, annualRatePct, tenureMonths){
  if(!(principal>0) || !(tenureMonths>0) || !Number.isFinite(tenureMonths)) return null;
  const monthlyRate = (annualRatePct||0) / 12 / 100;
  let rawEmi;
  if(monthlyRate <= 0){
    rawEmi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1+monthlyRate, tenureMonths);
    rawEmi = principal * monthlyRate * factor / (factor - 1);
  }
  const monthlyPayment = roundMoney(rawEmi);
  const totalPayment = roundMoney(monthlyPayment * tenureMonths);
  const totalInterest = roundMoney(totalPayment - principal);
  return { monthlyPayment, totalInterest, totalPayment };
}
