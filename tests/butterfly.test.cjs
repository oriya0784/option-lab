const assert = require('node:assert/strict');
const E = require('../dist/engine.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<.06,`${a} != ${b}`);
const quantities=s=>s.positions.slice().sort((a,b)=>a.strike-b.strike).map(p=>p.qty);
const bodyKey='call:1000:30';
const audit=s=>{const a=E.account(s);near(a.equity,E.INITIAL+s.realized+s.positions.reduce((n,p)=>n+E.positionPnl(s,p),0));near(a.available,a.equity-a.reserve-a.pendingReserve);};

// Three strikes, four contracts per group. The middle quote must supply TWO contracts.
let s=E.create(883),legs=E.strategyLegs(s,'butterfly',1000,40,30,3);
assert.deepEqual(legs.map(l=>[l.side,l.strike,l.qty]),[['buy',960,3],['sell',1000,6],['buy',1040,3]]);
let v=E.previewStrategy(s,legs);
assert.equal(v.groups,3);assert.deepEqual(v.ratios,[1,2,1]);assert.equal(v.fees,180);
assert.equal(v.depth,Math.min(E.quote(s,'call',960,30).askSize,Math.floor(E.quote(s,'call',1000,30).bidSize/2),E.quote(s,'call',1040,30).askSize));
const bid=E.quote(s,'call',1000,30).bidSize;
s.used[bodyKey]={buy:0,sell:bid-5};
let r=E.openStrategy(s,legs,'butterfly');
assert.equal(r.filled,2);assert.equal(r.remaining,1);assert.deepEqual(quantities(s),[2,4,2]);assert.equal(s.fees,120);audit(s);
assert.equal(s.used[bodyKey].sell,bid-1);

// One available middle contract cannot fill a group; no wing may be opened alone.
s=E.create(883);s.used[bodyKey]={buy:0,sell:E.quote(s,'call',1000,30).bidSize-1};
let before=E.clone(s);assert.throws(()=>E.openStrategy(s,E.strategyLegs(s,'butterfly',1000,40,30,1),'butterfly'),/完整比例/);assert.deepEqual(s,before);

// Closing is also atomic and ratio-aware, including partial fills and save round trips.
s=E.create(883);r=E.openStrategy(s,E.strategyLegs(s,'butterfly',1000,40,30,3),'butterfly');assert.equal(r.filled,3);
s=E.restore(E.clone(s));assert.deepEqual(quantities(s),[3,6,3]);
let ask=E.quote(s,'call',1000,30).askSize;s.used[bodyKey].buy=ask-1;
before=E.clone(s);assert.throws(()=>E.closeGroup(s,r.group),/比例/);assert.deepEqual(s,before);
s.used[bodyKey].buy=ask-5;
let closed=E.closeGroup(s,r.group);assert.equal(closed.qty,2);assert.equal(closed.remaining,1);assert.deepEqual(quantities(s),[1,2,1]);audit(s);
s.used={};closed=E.closeGroup(s,r.group);assert.equal(closed.qty,1);assert.equal(s.positions.length,0);assert.equal(s.fees,360);audit(s);

// Actual bid/ask entry costs and all four opening fees are included in expiry P/L.
for(const spot of [800,960,975,1000,1020,1040,1200]){
  s=E.create(883);E.openStrategy(s,E.strategyLegs(s,'butterfly',1000,40,30,1),'butterfly');
  const entry=s.cash-E.INITIAL;s.spot=spot;
  const intrinsic=(Math.max(spot-960,0)-2*Math.max(spot-1000,0)+Math.max(spot-1040,0))*50;
  const result=E.stress(s,0,0,30);near(result.value,intrinsic);near(result.equity,E.INITIAL+entry+intrinsic);
  assert.equal(s.fees,60);assert.ok(intrinsic>=0&&intrinsic<=2000);
}
s=E.create(883);const opened=E.openStrategy(s,E.strategyLegs(s,'butterfly',1000,40,1,1),'butterfly');const cash=s.cash;
E.advance(s,1);const settled=s.trades.filter(t=>t.action==='settle');assert.equal(settled.length,3);assert.equal(settled.reduce((n,t)=>n+t.qty,0),4);assert.equal(s.positions.length,0);near(s.cash,cash+(Math.max(s.spot-960,0)-2*Math.max(s.spot-1000,0)+Math.max(s.spot-1040,0))*50);audit(s);

// Repeated entries at the same contract share depth rather than double-counting it.
s=E.create(883);legs=E.strategyLegs(s,'butterfly',1000,40,30,1);legs=[legs[0],{...legs[1],qty:1},{...legs[1],qty:1},legs[2]];
assert.equal(E.previewStrategy(s,legs).depth,Math.min(E.quote(s,'call',960,30).askSize,Math.floor(E.quote(s,'call',1000,30).bidSize/2),E.quote(s,'call',1040,30).askSize));
r=E.openStrategy(s,legs,'duplicate-body');assert.deepEqual(quantities(s),[1,2,1]);assert.equal(s.fees,60);audit(s);

// If the user has dismantled one contract, close the remaining proportions atomically.
s=E.create(883);r=E.openStrategy(s,E.strategyLegs(s,'butterfly',1000,40,30,2),'butterfly');const body=s.positions.find(p=>p.side==='sell');E.close(s,body.id,1);assert.deepEqual(quantities(s),[2,3,2]);s.used={};E.closeGroup(s,r.group);assert.equal(s.positions.length,0);audit(s);
s=E.create(883);assert.throws(()=>E.strategyLegs(s,'butterfly',1000,40,30,51),/1～100/);assert.equal(s.positions.length,0);
console.log('PASS: butterfly 1:2:1 quantities, shared depth, partial/atomic opens and closes, fees, expiry payoff, settlement, save compatibility and dismantled groups.');
