import {test} from 'node:test';
import assert from 'node:assert/strict';
import {records,aggregate,pct} from '../src/data.js';
test('October keeps the illustrative totals and calculates the median from closure dates',()=>{
 const a=aggregate(records.filter(r=>r.period==='october'));
 assert.equal(a.hires,10);assert.equal(a.plan,12);assert.equal(a.planRate,83);
 assert.equal(a.hr,240);assert.equal(a.tech,96);assert.equal(a.final,48);
 assert.equal(a.offers,15);assert.equal(a.accepted,12);assert.equal(a.acceptRate,80);
 assert.equal(a.cph,145000);assert.equal(a.quality,80);assert.equal(a.ttf,23);
 assert.equal(a.retained,9);assert.equal(a.matched,8);
});
test('Cohorts stay internally consistent for every filter and period',()=>{
 for(const r of records){assert.ok(r.hr>=r.tech&&r.tech>=r.final&&r.final>=r.offers&&r.offers>=r.accepted);assert.ok(r.hires<=r.plan);assert.ok(r.goals<=r.assessed&&r.retained<=r.assessed&&r.matched<=r.assessed);}
 const a=aggregate(records.filter(r=>r.period==='october'&&r.direction==='ML'));
 assert.equal(a.hires,3);assert.equal(a.plan,3);assert.equal(a.hr,80);
});
test('Empty slices never manufacture rates or costs',()=>{const a=aggregate([]);assert.equal(a.planRate,null);assert.equal(a.cph,null);assert.equal(a.ttf,null);assert.equal(a.quality,null);assert.equal(pct(0,0),null)});

test('First-stage conversion and refusal reasons reconcile under people filters',async()=>{
 const {selectRecords,recruiters,managers,rejectionGroups}=await import('../src/data.js');
 const all=aggregate(selectRecords());assert.equal(all.initial,600);assert.equal(all.screenRate,40);assert.equal(all.rejected,3);
 for(const period of ['october','september','august'])for(const recruiter of ['all',...recruiters])for(const manager of ['all',...managers]){
  const rows=selectRecords({period,recruiter,manager});const a=aggregate(rows);
  assert.equal(rejectionGroups.reduce((n,g)=>n+a.rejections[g.id],0),a.offers-a.accepted);
  for(const r of rows){assert.ok(r.initial>=r.hr);assert.ok(recruiter==='all'||r.recruiter===recruiter);assert.ok(manager==='all'||r.manager===manager);}
 }
 const parts=recruiters.map(recruiter=>aggregate(selectRecords({recruiter})));
 assert.equal(parts.reduce((n,p)=>n+p.initial,0),all.initial);
 assert.equal(parts.reduce((n,p)=>n+p.rejected,0),all.rejected);
 assert.equal(aggregate([]).screenRate,null);
});

test('TTF uses all closed vacancies, independently of monthly employee starts',async()=>{
 const {selectRecords,workingDays,median}=await import('../src/data.js');
 assert.equal(median([1,2,100]),2);assert.equal(median([1,2,3,100]),2.5);assert.equal(median([]),null);
 const row=selectRecords()[0];
 const rows=[{...row,hires:100,closureEvents:[{opened:'2026-10-01',accepted:'2026-10-02'}]},
 {...row,hires:0,closureEvents:[{opened:'2026-10-01',accepted:'2026-10-05'},{opened:'2026-10-01',accepted:'2026-10-06'}]}];
 assert.equal(aggregate(rows).ttf,2);assert.equal(aggregate(rows).closed,3);
 assert.equal(aggregate([{...row,hires:5,closureEvents:[]}]).ttf,null);
 assert.equal(workingDays('2026-10-02','2026-10-05'),1);
 assert.equal(workingDays('2026-10-05','2026-10-05'),0);
 assert.equal(workingDays('2026-10-02','2026-10-05',{holidays:['2026-10-05']}),0);
 assert.equal(workingDays('2026-10-02','2026-10-05',{workingDates:['2026-10-03']}),2);
 assert.throws(()=>workingDays('2026-10-05','2026-10-02'));
});
test('Feedback pools individual durations rather than averaging group medians',async()=>{
 const {selectRecords}=await import('../src/data.js');const row=selectRecords()[0];
 const a=aggregate([{...row,stageSamples:{...row.stageSamples,feedback:[1,100]}},{...row,stageSamples:{...row.stageSamples,feedback:[2,3,4]}}]);
 assert.equal(a.feedback,3);assert.equal(a.feedbackTotal,5);assert.equal(a.feedbackLate,3);
});
test('Sources remain additive, bounded by previous stages and independent of filter grouping',async()=>{
 const {selectRecords,recruiters}=await import('../src/data.js');
 for(const period of ['october','september','august']){
  const rows=selectRecords({period}),a=aggregate(rows);
  for(const r of rows){
   for(const s of r.sources)assert.ok(s.hr>=s.offers&&s.offers>=s.accepted&&s.accepted>=s.hires);
   assert.equal(r.sources.reduce((n,s)=>n+s.hr,0),r.hr);
   assert.equal(r.sources.reduce((n,s)=>n+s.hires,0),r.funnelHires);
  }
  for(const source of a.sources)for(const key of ['hr','offers','accepted','hires'])assert.equal(source[key],recruiters.reduce((n,recruiter)=>n+aggregate(selectRecords({period,recruiter})).sources.find(s=>s.name===source.name)[key],0));
 }
 const a=aggregate(selectRecords());assert.equal(a.hires,10);assert.equal(a.funnelHires,9);
});
test('Early departures are ONLY probation exits, using each employee’s actual probation dates',async()=>{
 const {isProbationExit,reviewQuality}=await import('../src/data.js');
 const person={joined:'2026-04-10',probationEnd:'2026-07-10',reviewDue:'2026-10-10',assessedOn:null,goalsMet:false,surveyAnswered:false};
 assert.equal(isProbationExit({...person,left:'2026-07-09'}),true);
 assert.equal(isProbationExit({...person,left:'2026-07-10'}),true);
 assert.equal(isProbationExit({...person,left:'2026-07-11'}),false);
 assert.equal(isProbationExit({...person,left:'2026-05-01',probationEnd:null}),false);
 assert.equal(isProbationExit({...person,left:null}),false);
 assert.equal(isProbationExit({...person,probationEnd:'2026-10-10',left:'2026-08-10'}),true); // individual six-month IS
 const people=[{...person,left:'2026-07-01'},{...person,left:'2026-08-01'},
 {...person,left:null,assessedOn:'2026-10-12',goalsMet:true,surveyAnswered:true,expectationsMet:true}];
 const q=reviewQuality(people,'2026-10-31');
 assert.equal(q.earlyLeavers,1);assert.equal(q.retained,1);assert.equal(q.qualityDue,3);assert.equal(q.goals,1);assert.equal(q.qualityPending,0);
 const pending=reviewQuality([{...person,left:null}], '2026-10-31');assert.equal(pending.qualityPending,1);
});
test('Quality includes probation departures and does not equate missing reviews with failures',async()=>{
 const {selectRecords}=await import('../src/data.js');const row=selectRecords()[0];const a=aggregate(selectRecords());
 assert.equal(a.qualityDue,10);assert.equal(a.assessed,9);assert.equal(a.earlyLeavers,1);assert.equal(a.quality,80);assert.equal(a.matchRate,89);
 assert.equal(aggregate([{...row,qualityPending:1}]).quality,null);
 assert.equal(aggregate([{...row,hires:0}]).cph,null);
});
