import {test} from 'node:test';
import assert from 'node:assert/strict';
import {records,aggregate,pct} from '../src/data.js';
test('October reproduces the supplied demo KPIs',()=>{
 const a=aggregate(records.filter(r=>r.period==='october'));
 assert.equal(a.hires,10);assert.equal(a.plan,12);assert.equal(a.planRate,83);
 assert.equal(a.hr,240);assert.equal(a.tech,96);assert.equal(a.final,48);
 assert.equal(a.offers,15);assert.equal(a.accepted,12);assert.equal(a.acceptRate,80);
 assert.equal(a.cph,145000);assert.equal(a.quality,80);assert.equal(a.ttf,24);
 assert.equal(a.retained,9);assert.equal(a.matched,8);
});
test('Cohorts stay internally consistent for every filter and period',()=>{
 for(const r of records){assert.ok(r.hr>=r.tech&&r.tech>=r.final&&r.final>=r.offers&&r.offers>=r.accepted);assert.ok(r.hires<=r.plan);assert.ok(r.goals<=r.assessed&&r.retained<=r.assessed&&r.matched<=r.assessed);}
 const a=aggregate(records.filter(r=>r.period==='october'&&r.direction==='ML'));
 assert.equal(a.hires,3);assert.equal(a.plan,3);assert.equal(a.hr,80);
});
test('Empty slices never manufacture rates or costs',()=>{const a=aggregate([]);assert.equal(a.planRate,null);assert.equal(a.cph,null);assert.equal(a.ttf,null);assert.equal(a.quality,null);assert.equal(pct(0,0),null)});
