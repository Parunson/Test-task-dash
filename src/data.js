export const directions = ['ML', 'Разработка', 'Коммерция', 'Бэк-офис'];
export const recruiters = ['Анна', 'Мария', 'Елена'];
export const managers = ['Руководитель ML', 'Руководитель разработки', 'Коммерческий директор', 'Руководитель бэк-офиса'];
export const rejectionGroups = [
 {id:'pay',label:'Зарплата и условия оффера',detail:'Не устроили зарплата, бонусы или состав предложения.',action:'Уточнить ожидания по деньгам до финала. Если причина повторяется — сверить вилку с рынком и обсудить бюджет.'},
 {id:'other',label:'Другой оффер или контроффер',detail:'Кандидат выбрал другую компанию или остался у текущего работодателя.',action:'Разобрать, что повлияло на выбор: деньги, задачи, команда или скорость решения. Проверить сроки выдачи офферов.'},
 {id:'role',label:'Задачи и карьерные ожидания',detail:'Роль, задачи или возможности роста не совпали с ожиданиями.',action:'Сверить описание вакансии с реальными задачами. До оффера обсудить с кандидатом, чем он будет заниматься и как сможет расти.'},
 {id:'format',label:'Формат и место работы',detail:'Не подошли офис, график, удалённая работа или переезд.',action:'Обсудить формат на первом разговоре. Заранее уточнить у руководителя, где возможна гибкость.'},
 {id:'personal',label:'Личные причины / не уточнено',detail:'Кандидат изменил планы или не назвал причину отказа.',action:'Деликатно уточнить причину без давления. Если ответа нет — отметить это отдельно, не придумывая объяснение.'}
];
export const grades = ['Junior', 'Middle', 'Senior / Lead'];
export const periods = { october: 'Октябрь 2026', september: 'Сентябрь 2026', august: 'Август 2026' };
// Demo data: independent monthly events, candidate pipeline and six-month review.
// October fixtures preserve the supplied illustration; they are not MWS AI results.
const base = [
 ['ML','Junior',2,2,48,20,10,3,3,24,4,290000,2,2,2,2],
 ['ML','Senior / Lead',1,1,32,12,6,1,0,31,4,210000,1,0,1,1],
 ['Разработка','Junior',2,2,45,18,8,3,3,20,2,240000,2,2,2,2],
 ['Разработка','Middle',2,3,45,18,9,3,3,24,2,280000,2,2,2,2],
 ['Коммерция','Middle',2,2,40,16,9,3,2,26,3,260000,2,1,1,1],
 ['Бэк-офис','Senior / Lead',1,2,30,12,6,2,1,22,1,170000,1,1,1,0],
];
const keys=['direction','grade','hires','plan','hr','tech','final','offers','accepted','ttfSeed','feedbackSeed','cost','qualityDue','goals','retained','matched'];
export const sourceNames=['Прямой поиск','Отклики','Рекомендации'];
// All demo intervals fall in July–October 2026: there are no Russian national
// non-working holidays or transferred working weekends in those months.
export function workingDays(start,end,{holidays=[],workingDates=[]}={}){
 const first=new Date(start+'T00:00:00Z'),last=new Date(end+'T00:00:00Z');
 if(!Number.isFinite(+first)||!Number.isFinite(+last)||first.toISOString().slice(0,10)!==start||last.toISOString().slice(0,10)!==end||last<first)throw new Error('Invalid working-day interval');
 let n=0;const d=new Date(first);
 const daysOff=new Set(holidays),extraWork=new Set(workingDates);
 while(d<last){d.setUTCDate(d.getUTCDate()+1);const date=d.toISOString().slice(0,10);if(extraWork.has(date)||(!daysOff.has(date)&&d.getUTCDay()!==0&&d.getUTCDay()!==6))n++;}
 return n; // Opening day excluded; final day included.
}
function dateBefore(end,days){const d=new Date(end+'T00:00:00Z');for(let n=0;n<days;){d.setUTCDate(d.getUTCDate()-1);if(d.getUTCDay()!==0&&d.getUTCDay()!==6)n++;}return d.toISOString().slice(0,10);}
export function median(values){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b);const mid=Math.floor(sorted.length/2);return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;}
// Allocate whole candidates once per record. Later filters only SUM these facts.
function allocate(total,weights,caps=weights.map(()=>Infinity)){
 const out=weights.map(()=>0),den=weights.reduce((a,b)=>a+b,0);
 if(total>caps.reduce((a,b)=>a+b,0))throw new Error('Source allocation exceeds previous stage');
 for(let n=0;n<total;n++){
  let best=-1;
  for(let i=0;i<out.length;i++)if(out[i]<caps[i]&&(best===-1||weights[i]/den*total-out[i]>weights[best]/den*total-out[best]))best=i;
  out[best]++;
 }
 return out;
}
const closedSamples=[[22,24,26],[],[18,20,22],[22,24,26],[24,28],[22]];
export function isProbationExit(person){return Boolean(person.joined&&person.probationEnd&&person.left&&person.left>=person.joined&&person.left<=person.probationEnd);}
export function reviewQuality(people,asOf){
 const due=people.filter(p=>p.reviewDue<=asOf);
 const assessed=due.filter(p=>p.assessedOn&&p.assessedOn<=asOf);
 const leftBeforeReview=due.filter(p=>p.left&&p.left<=p.reviewDue&&!assessed.includes(p));
 const retained=due.filter(p=>!p.left||p.left>asOf).length;
 const answered=due.filter(p=>p.surveyAnswered);
 return {qualityDue:due.length,assessed:assessed.length,goals:assessed.filter(p=>p.goalsMet).length,retained,earlyLeavers:due.filter(p=>isProbationExit(p)&&p.left<=asOf).length,
  qualityPending:due.length-assessed.length-leftBeforeReview.length,surveyCount:answered.length,matched:answered.filter(p=>p.expectationsMet).length};
}
export const records=Object.keys(periods).flatMap((period,pi)=>base.map((row,i)=>{
 const r=Object.fromEntries(keys.map((k,j)=>[k,row[j]]));
 if(pi){r.plan=pi===1?2:3;r.hires=Math.max(0,r.hires-(i===pi?1:0));r.accepted=Math.max(r.hires,r.accepted);r.feedbackSeed+=i%2;r.hr+=pi*5;r.tech+=pi*2;r.cost+=pi*12000;}
 const initial=r.hr*2+i*8,recruiter=recruiters[i%recruiters.length],manager=managers[directions.indexOf(r.direction)];
 const reasonId=rejectionGroups[(i+pi-1+rejectionGroups.length)%rejectionGroups.length].id;
 const rejections=Object.fromEntries(rejectionGroups.map(g=>[g.id,g.id===reasonId?r.offers-r.accepted:0]));
 const end=['2026-10-26','2026-09-28','2026-08-28'][pi];
 const closureEvents=Array.from({length:r.accepted},(_,j)=>{const duration=(closedSamples[i][j]??r.ttfSeed)+pi*2;return {opened:dateBefore(end,duration),accepted:end};});
 const stageSamples={
  hr:Array.from({length:r.hr},(_,j)=>2+(j%3-1)),
  tech:Array.from({length:r.tech},(_,j)=>5+(j%3-1)),
  final:Array.from({length:r.final},(_,j)=>6+(j%3-1)),
  feedback:Array.from({length:r.tech},(_,j)=>Math.max(0,r.feedbackSeed+(j%3-1)))
 };
 // This candidate group happens to have its offer decisions in the selected
 // month too. Keep its counts separate: that will not hold in a real ATS.
 const funnelOffers=r.offers,funnelAccepted=r.accepted,funnelHires=Math.min(r.hires,funnelAccepted);
 const hrBySource=allocate(r.hr,[.5,.375,.125]);
 const offersBySource=allocate(funnelOffers,[.4,.267,.333],hrBySource);
 const acceptedBySource=allocate(funnelAccepted,[.4,.267,.333],offersBySource);
 const hiresBySource=allocate(funnelHires,[.4,.3,.3],acceptedBySource);
 const sources=sourceNames.map((name,j)=>({name,hr:hrBySource[j],offers:offersBySource[j],accepted:acceptedBySource[j],hires:hiresBySource[j]}));
 const cohortMonth=['04','03','02'][pi],reviewMonth=['10','09','08'][pi],probationMonth=['07','06','05'][pi];
 const qualityPeople=Array.from({length:r.qualityDue},(_,j)=>({
  id:`quality-${period}-${i}-${j}`,joined:`2026-${cohortMonth}-10`,probationEnd:`2026-${probationMonth}-10`,reviewDue:`2026-${reviewMonth}-10`,
  // Explicit departure dates, independently checked against the end of probation.
  left:j>=r.retained?`2026-${cohortMonth}-28`:null,
  assessedOn:j<r.retained?`2026-${reviewMonth}-12`:null,goalsMet:j<r.goals,
  surveyAnswered:j<r.retained,expectationsMet:j<r.matched
 }));
 const qualityFacts=reviewQuality(qualityPeople,new Date(Date.UTC(2026,Number(reviewMonth),0)).toISOString().slice(0,10));
 const {ttfSeed,feedbackSeed,...facts}=r;
 return {...facts,initial,recruiter,manager,rejections,closureEvents,stageSamples,funnelOffers,funnelAccepted,funnelHires,sources,qualityPeople,...qualityFacts,period,id:`${period}-${i}`};
}));
export const pct=(a,b)=>b?Math.round(a/b*100):null;
export const sum=(rows,key)=>rows.reduce((s,r)=>s+r[key],0);
export function aggregate(rows){
 const a=Object.fromEntries(['initial','hires','plan','hr','tech','final','offers','accepted','cost','qualityDue','goals','retained','matched','earlyLeavers','assessed','surveyCount','funnelOffers','funnelAccepted','funnelHires','qualityPending'].map(k=>[k,sum(rows,k)]));
 a.rejected=a.offers-a.accepted;
 a.rejections=Object.fromEntries(rejectionGroups.map(g=>[g.id,rows.reduce((total,r)=>total+r.rejections[g.id],0)]));
 a.screenRate=pct(a.hr,a.initial);
 const closures=rows.flatMap(r=>r.closureEvents);
 a.closed=closures.length;
 a.ttf=median(closures.map(e=>workingDays(e.opened,e.accepted)));
 a.stages=Object.fromEntries(['hr','tech','final','feedback'].map(stage=>[stage,median(rows.flatMap(r=>r.stageSamples[stage]))]));
 a.feedback=a.stages.feedback;
 const feedbackSamples=rows.flatMap(r=>r.stageSamples.feedback);
 a.feedbackTotal=feedbackSamples.length;a.feedbackLate=feedbackSamples.filter(days=>days>2).length;
 a.planRate=pct(a.hires,a.plan);a.acceptRate=pct(a.accepted,a.offers);
 a.quality=a.qualityPending===0?pct(a.goals,a.qualityDue):null;
 a.retentionRate=pct(a.retained,a.qualityDue);a.matchRate=pct(a.matched,a.surveyCount);
 a.cph=a.hires?a.cost/a.hires:null;
 a.sources=sourceNames.map(name=>({name,...Object.fromEntries(['hr','offers','accepted','hires'].map(k=>[k,rows.reduce((total,r)=>total+r.sources.find(s=>s.name===name)[k],0)]))}));
 return a;
}
export const metrics={
 plan:{title:'Выполнение плана найма',formula:'Вышедшие сотрудники / согласованный план выходов × 100%.',source:'ATS + HRIS + согласованный план найма. Выход подтверждаем по кадровой системе.',norm:'100% согласованного плана. Смотрим за месяц, отдельно по направлениям и грейдам.',action:'Руководитель подбора и нанимающий менеджер разбирают отклонение, пересматривают приоритеты и ресурсы. Если есть конфликт за ресурсы — подключают C-level; бюджет и ставки подтверждают финансы.',note:'Принятый оффер ещё не означает выход на работу. Для одного сотрудника или ставки учитываем один выход.'},
 ttf:{title:'Time to Fill',formula:'Медиана рабочих дней от открытия вакансии до принятия оффера. Сначала считаем срок каждой закрытой вакансии, затем находим середину отсортированного списка.',source:'ATS: дата согласованного открытия вакансии и дата принятия оффера. В отчёт за месяц входят вакансии, по которым оффер принят в этом месяце.',norm:'24 рабочих дня — текущий ориентир из задания, где он указан как средний срок. В презентации для управления выбрана медиана: её считаем отдельно и сравниваем по грейдам. Историческую медиану ещё нужно проверить.',action:'Руководитель подбора и рекрутер смотрят, где задержка. Нанимающий менеджер помогает с интервью, обратной связью и решением по кандидату.',note:'Срок не взвешивается по выходам. Нужны даты вакансий, а не дата выхода сотрудника. День открытия не включаем, день принятия включаем. В примере используются даты июля–октября 2026 без праздничных переносов; для других дат в рабочей системе нужен производственный календарь.'},
 funnel:{title:'Конверсии воронки',formula:'Кандидаты, дошедшие до следующего этапа / кандидаты, дошедшие до предыдущего этапа × 100%. Один кандидат на одной вакансии учитывается на каждом этапе один раз.',source:'ATS: история переходов по этапам. Для воронки берём кандидатов, вошедших в подбор в выбранном месяце, и смотрим их движение до конца этого месяца.',norm:'Сравниваем с историей за 3–6 месяцев по ролям и грейдам. Общего порога для всех вакансий нет. Сравнивать нужно одинаковые этапы и одинаковый срок наблюдения.',action:'Рекрутер и нанимающий менеджер проверяют источники, профиль и критерии оценки. Если переходов стало меньше, разбирают причины отказов и кандидатов в ожидании.',note:'Первичный этап — разбор резюме, HR-скрининг — первый разговор с рекрутером. В рабочем отчёте незавершённые этапы отмечаются отдельно: ожидание не означает отказ. Выходы из этой воронки могут отличаться от всех выходов за месяц.'},
 speed:{title:'Скорость этапов',formula:'Медиана рабочих дней на каждом этапе. Ожидание обратной связи считаем отдельно: от завершённого интервью до зафиксированного ответа менеджера.',source:'ATS: даты входа и выхода с этапа, завершения интервью и записи обратной связи. В отчёте — завершённые в выбранном месяце этапы и ответы.',norm:'Обратная связь нанимающего менеджера — до 2 рабочих дней: предлагаемый SLA из презентации. Остальные этапы сравниваем со своей историей.',action:'Рекрутер напоминает о сроках и сообщает кандидатам, когда ждать ответа. Руководитель подбора подключается при задержках. При переносе финалов договариваются о слотах и запасном интервьюере; через 2–3 дня сверяют приоритеты, в том числе со стратегическим партнёром для его вакансий.',note:'Считаем медиану по всем отдельным наблюдениям, а не среднее медиан разных групп. Незавершённые этапы в эту медиану не входят: их текущее ожидание видно в списке вакансий. Складывать медианы этапов в Time to Fill нельзя.'},
 offer:{title:'Offer Acceptance Rate',formula:'Принятые офферы / все офферы с решением × 100%. В знаменателе — принятые и отклонённые кандидатами офферы.',source:'ATS: офферы, по которым кандидат дал окончательное решение в выбранном месяце.',norm:'Не ниже своей исторической базы по направлениям. Сначала нужна история компании; общий процент для всех направлений не задаём.',action:'Рекрутер и руководитель подбора смотрят причины отказов, условия оффера и ожидания кандидатов. Нанимающего менеджера и финансы подключают, если нужно изменить задачи или бюджет.',note:'Офферы, по которым кандидат ещё думает, не входят в знаменатель. Отменённое работодателем предложение — отдельный статус, а не отказ кандидата. На один отказ записываем одну основную причину со слов кандидата.'},
 cost:{title:'Cost per Hire',formula:'Расходы на подбор за месяц / число сотрудников, вышедших в этом месяце.',source:'Финансы + HRIS: расходы на команду подбора, инструменты, размещения, агентства и согласованные услуги; выходы подтверждаем по кадровой системе.',norm:'В рамках согласованного бюджета; сравниваем по функциям. Бюджет согласуют с финансами и HRD; для всех функций одну сумму не задаём.',action:'Руководитель подбора, финансы и HRD разбирают рост затрат и эффективность каналов.',note:'Затраты считаем по одному согласованному составу. Общие расходы заранее распределяем по вакансиям или функциям и не дублируем при фильтрации. Если выходов нет, стоимость одного найма не рассчитываем; это не ноль.'},
 quality:{title:'Quality of Hire',formula:'Достигшие согласованных целей / все сотрудники, которым наступил срок оценки через 3–6 месяцев после выхода × 100%.',source:'HRIS + оценка нанимающего менеджера. Дополнительно — прохождение испытательного срока (ИС), уходы на ИС и ожидания сотрудника.',norm:'Цели согласуются до выхода сотрудника. Проверяем их через 3–6 месяцев; здесь выбран срок 6 месяцев. Ранние уходы — это уходы на ИС. Общий процент нормы нужно согласовать с бизнесом.',action:'Нанимающий менеджер, HRBP и руководитель подбора разбирают качество отбора и критерии найма. Смотрят также адаптацию и совпадение ожиданий.',note:'Ушедших до срока оценки не убираем из общей группы: они остаются в знаменателе. Ранние уходы — только уходы на испытательном сроке (ИС), по последний день ИС конкретного сотрудника включительно. Уход после ИС не считается ранним, даже если прошло меньше шести месяцев. Если по оставшимся сотрудникам оценка ещё не заполнена, итоговый процент не показываем до уточнения данных. Совпадение ожиданий считаем отдельно — среди ответивших на опрос.'}
};
export function selectRecords({period='october',direction='all',grade='all',recruiter='all',manager='all'}={}){
 return records.filter(r=>r.period===period&&(direction==='all'||r.direction===direction)&&(grade==='all'||r.grade===grade)&&(recruiter==='all'||r.recruiter===recruiter)&&(manager==='all'||r.manager===manager));
}
export const vacancies=[
 {id:'08–13',title:'ML-разработчики',direction:'ML',grade:'Middle',count:6,status:'4 финалиста · 2 в поиске',wait:6,priority:'P0',owner:'Руководитель ML',action:'Зарезервировать слоты финалов; назначить запасного интервьюера.'},
 {id:'24',title:'Tech Lead ML',direction:'ML',grade:'Senior / Lead',count:1,status:'Финал переносился дважды',wait:6,priority:'P0',owner:'Руководитель ML',action:'Рекрутер и руководитель подбора бронируют финал и запасного интервьюера. Если за 2–3 дня договорённость не сработала — сверяют приоритеты с партнёром и руководителем ML.'},
 {id:'25–26',title:'ML-инженер · партнёрский проект',direction:'ML',grade:'Middle',count:2,status:'Финалисты ждут решения',wait:4,priority:'P0',owner:'Руководитель ML',action:'Согласовать приоритет партнёрского проекта и дать решение по кандидатам.'},
 {id:'06',title:'Технический лидер',direction:'Разработка',grade:'Senior / Lead',count:1,status:'Профиль изменён · бюджет не сходится',wait:5,priority:'P1',owner:'Нанимающий менеджер + финансы',action:'Понять, какие задачи изменились; показать рынок и согласовать бюджет или требования. Если профиль продолжает меняться — обсудить паузу в поиске.'},
 {id:'16',title:'Менеджер по развитию бизнеса',direction:'Коммерция',grade:'Middle',count:1,status:'Оффер · кандидат думает',wait:2,priority:'P0',owner:'Рекрутер',action:'Уточнить дату решения и открытые вопросы по предложению.'},
 {id:'19',title:'BDM B2G',direction:'Коммерция',grade:'Senior / Lead',count:1,status:'Менеджер не даёт обратную связь',wait:3,priority:'P1',owner:'Коммерческий директор',action:'Втроём с рекрутером и менеджером разобрать 3–5 резюме, записать обратную связь в ATS и выводы в общий чат. Если ответа снова нет — выяснить причину, обсудить другой формат, делегирование или паузу.'},
 {id:'22',title:'Старший юрист',direction:'Бэк-офис',grade:'Senior / Lead',count:1,status:'Проверка СБ',wait:1,priority:'P0',owner:'Рекрутер + СБ',action:'Уточнить срок завершения проверки и обновить кандидата.'}
].map((v,i)=>({...v,recruiter:recruiters[[0,1,0,1,1,2,2][i]],manager:managers[directions.indexOf(v.direction)]}));
