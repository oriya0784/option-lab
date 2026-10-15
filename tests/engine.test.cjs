const assert=require('node:assert/strict');
const E=require('../dist/engine.js');
const near=(a,b,e=.06)=>assert.ok(Math.abs(a-b)<=e,`${a} != ${b}`);
const order=(s,side='buy',type='call',k=1000,qty=1,term=30)=>({side,type,strike:k,qty,expiry:s.day+term});
function audit(s){const a=E.account(s);Object.values(a).forEach(x=>assert.ok(Number.isFinite(x),'finite account'));near(a.equity,E.INITIAL+s.realized+s.positions.reduce((v,p)=>v+E.positionPnl(s,p),0),.25);near(a.available,a.equity-a.reserve-a.pendingReserve);assert.ok(s.positions.every(p=>p.qty>0&&p.fees>=0));}
// Price parity, expiry, Greeks and deterministic pure quotations.
for(const iv of [.1,.24,.8])for(const d of [1,30,365])for(const k of [700,1000,1300]){const c=E.theoretical(1000,k,d,iv,'call'),p=E.theoretical(1000,k,d,iv,'put');near(c-p,1000-k*Math.exp(-.02*d/252),.001);}
let s=E.create(43),o=order(s),rng=s.rng;for(let i=0;i<100;i++)E.preview(s,o);assert.equal(s.rng,rng);const q=E.quote(s,'call',1000,30);assert.ok(q.bid<q.ask&&q.delta>0&&q.theta<0&&q.vega>0&&q.gamma>0);
// Paid spread and entry/exit fees, partial closes and economic identity.
let r=E.submit(s,{...o,qty:2});assert.equal(r.filled,2);near(s.cash,E.INITIAL-q.ask*100-30);audit(s);const p=s.positions[0];const closeQ=E.quote(s,'call',1000,30);r=E.close(s,p.id,1);assert.equal(r.filled,1);near(s.realized,(closeQ.bid-q.ask)*50-30);audit(s);E.close(s,p.id);assert.equal(s.positions.length,0);near(s.cash,E.INITIAL+s.realized);audit(s);
// Short cash income never removes the liability. Limits reserve, cancel and DAY expiry.
s=E.create(77);q2=E.quote(s,'put',1000,30);E.submit(s,order(s,'sell','put'));assert.ok(s.cash>E.INITIAL);assert.ok(E.account(s).equity<E.INITIAL);audit(s);
let lim=E.submit(s,{...order(s),orderType:'limit',limit:.01,tif:'GTC'});assert.equal(lim.status,'working');assert.ok(E.account(s).pendingReserve>0);E.cancel(s,lim.id);assert.equal(E.account(s).pendingReserve,0);audit(s);
lim=E.submit(s,{...order(s),orderType:'limit',limit:.01,tif:'DAY'});E.advance(s,1);assert.equal(lim.status,'expired');audit(s);
// IOC cancellation, depth consumption, multi-round partial limit fills, and limit protection.
s=E.create(1);let depth=E.quote(s,'call',1000,30).askSize;r=E.submit(s,{...order(s),qty:20});assert.equal(r.filled,depth);assert.equal(r.status,'cancelled-partial');assert.equal(E.quote(s,'call',1000,30).askSize,0);audit(s);
s=E.create(11);lim=E.submit(s,{...order(s),qty:20,orderType:'limit',limit:60,tif:'GTC'});assert.ok(lim.filled<20);E.step(s,5);assert.equal(lim.filled,20);assert.equal(lim.status,'filled');s.trades.forEach(t=>assert.ok(t.price<=60));audit(s);
// Settlement is independent and synchronous for matched long/short cash flows.
s=E.create(2);E.submit(s,order(s,'buy','call',990,1,1));E.submit(s,order(s,'sell','call',990,1,1));E.submit(s,order(s,'buy','put',1000,1,30));E.advance(s,1);assert.equal(s.positions.length,1);assert.equal(s.trades.filter(t=>t.action==='settle').length,2);assert.ok(!s.ended);audit(s);E.advance(s,20);assert.equal(s.day,21);assert.ok(!s.ended);E.submit(s,order(s));audit(s);
// Defined-risk spreads net margin and atomic processing, including all six templates.
for(const name of ['bull-call','bull-put','bear-call','bear-put','straddle','condor']){s=E.create(9);const legs=E.strategyLegs(s,name,1000,30,30,1),v=E.previewStrategy(s,legs);assert.ok(!v.error);r=E.openStrategy(s,legs,name);assert.equal(s.positions.length,legs.length);if(name==='bull-put'||name==='bear-call')assert.ok(E.account(s).reserve<1500);audit(s);E.closeGroup(s,r.group);assert.equal(s.positions.length,0);audit(s);}
// Close quantities and duplicate queued close protection.
s=E.create(56);E.submit(s,order(s));const id=s.positions[0].id;E.submit(s,{intent:'close',positionId:id,qty:1,orderType:'limit',limit:999,tif:'GTC'});assert.throws(()=>E.close(s,id,1));assert.throws(()=>E.close(s,id,2));audit(s);
// Protective stop: option-price trigger, market IOC, no guaranteed execution price.
s=E.create(5);E.submit(s,order(s));let stop=E.submit(s,{intent:'close',positionId:s.positions[0].id,qty:1,orderType:'stop',limit:.01,tif:'GTC'});assert.equal(stop.status,'working');E.cancel(s,stop.id);stop=E.submit(s,{intent:'close',positionId:s.positions[0].id,qty:1,orderType:'stop',limit:100,tif:'GTC'});assert.equal(stop.status,'filled');audit(s);
// Input rejection and serialization restore.
s=E.create(2);for(const bad of [{qty:0},{qty:1.5},{strike:0},{expiry:0},{side:'bad'},{orderType:'limit',limit:-1}])assert.throws(()=>E.submit(s,{...order(s),...bad}));assert.deepEqual(E.restore(E.clone(s)),s);assert.throws(()=>E.restore({version:2}));
// Pathwise account invariants under many seeded trades/strategies and margin events.
let forced=0;
for(let seed=1;seed<=100;seed++){s=E.create(seed,seed%4===0?'storm':'balanced');for(let day=0;day<45&&!s.ended;day++){try{if(day%7===0)E.openStrategy(s,E.strategyLegs(s,'bull-put',E.round(s.spot),20,s.day+5,1),'spread');else E.submit(s,order(s,day%3===0?'sell':'buy',day%2?'call':'put',E.round(s.spot+(day%5-2)*10),day%3+1,day%13+1));}catch{}if(day%4===0&&s.positions.length){try{E.close(s,s.positions[0].id,1);}catch{}}E.advance(s,1);audit(s);}forced+=s.trades.filter(t=>t.action==='liquidate').length;}
s=E.create(88);E.submit(s,order(s,'sell','call'));s.spot=5000;E.step(s);assert.ok(s.ended);assert.ok(s.cash<0);assert.equal(s.positions.length,0);assert.ok(s.trades.some(t=>t.action==='liquidate'));audit(s);
s=E.create(3);E.submit(s,order(s,'sell','put',1000,7));s.iv=.85;s.spot=850;E.step(s);assert.ok(s.trades.some(t=>t.action==='liquidate'));audit(s);
s=E.create(4);s.cash=5000;r=E.openStrategy(s,E.strategyLegs(s,'bull-put',1000,30,30,2),'spread');const before=E.clone(s),hedge=s.positions.find(p=>p.side==='buy');const rejection=E.close(s,hedge.id,2);assert.equal(rejection.status,'rejected');assert.deepEqual(s.positions,before.positions);assert.equal(s.cash,before.cash);
const malformed=E.create(1);malformed.orders=[{status:'working'}];assert.throws(()=>E.restore(malformed));const restored=E.restore(E.clone(before));assert.deepEqual(restored,before);
console.log('PASS: pricing, accounting, fees, depth, orders, stops, settlement, spreads, bankruptcy, margin liquidation, restore, and 100 x 45-day paths; random forced legs:',forced);
