/* Training tab: workout library, execution with progressie/regressie-wissels, rusttimer en geschiedenis. */
(function () {
  const T = window.TRAINING_DATA;
  const LEVELS = T.levels;
  const weeklyTarget = 5;
  let restTimerHandle = null;

  state.training = {
    view: 'plan',
    selectedId: null,
    filter: 'Alles',
    exerciseIdx: 0,
    logs: {},
    swaps: {},
    swapPickerFor: null,
    showInfo: false,
    noteOpen: false,
    notes: {},
    restActive: false,
    restLeft: 0,
    restTotal: 0,
    activeCustomWorkout: null,
    builderRows: store.get('workoutBuilderRows',[{exerciseId:'w1e1',sets:4,reps:6,weight:60}]),
    generatorText: store.get('trainingGeneratorText','Ik wil een trainingsschema maken van 4 dagen: maandag upper, dinsdag lower, woensdag rust, donderdag upper, vrijdag lower en zaterdag en zondag rust.'),
    generatorEquipment: store.get('trainingGeneratorEquipment',['dumbbell','plate','pin','barbell']),
    generatorVolumeTarget: store.get('trainingGeneratorVolumeTarget',10),
    generatedPlan: null,
    weeklyDone: store.get('trainingWeeklyDone', 3)
  };

  const EQUIPMENT={dumbbell:'Dumbbells',barbell:'Barbells',plate:'Plate loaded',pin:'Pin loaded',cable:'Kabels',bodyweight:'Lichaamsgewicht'};
  const MOVES={
    chestPress:{barbell:['Barbell bench press','Barbells'],dumbbell:['Dumbbell bench press','Dumbbells'],plate:['Plate-loaded chest press','Plate loaded'],pin:['Chest press machine','Pin loaded'],bodyweight:['Push-up','Lichaamsgewicht']},
    inclinePress:{dumbbell:['Incline dumbbell press','Dumbbells'],barbell:['Incline barbell press','Barbells'],plate:['Incline plate-loaded press','Plate loaded'],pin:['Incline chest press machine','Pin loaded']},
    chestFly:{cable:['Cable fly','Kabels'],pin:['Pec deck','Pin loaded'],dumbbell:['Dumbbell fly','Dumbbells']},
    row:{dumbbell:['One-arm dumbbell row','Dumbbells'],barbell:['Barbell row','Barbells'],plate:['Plate-loaded row','Plate loaded'],pin:['Seated row machine','Pin loaded'],cable:['Seated cable row','Kabels']},
    pull:{pin:['Lat pulldown','Pin loaded'],plate:['Plate-loaded pulldown','Plate loaded'],cable:['Cable pulldown','Kabels'],bodyweight:['Pull-up','Lichaamsgewicht']},
    shoulderPress:{dumbbell:['Dumbbell shoulder press','Dumbbells'],barbell:['Barbell overhead press','Barbells'],plate:['Plate-loaded shoulder press','Plate loaded'],pin:['Shoulder press machine','Pin loaded']},
    lateral:{dumbbell:['Dumbbell lateral raise','Dumbbells'],cable:['Cable lateral raise','Kabels'],pin:['Lateral raise machine','Pin loaded']},
    curl:{dumbbell:['Dumbbell curl','Dumbbells'],barbell:['Barbell curl','Barbells'],cable:['Cable curl','Kabels'],pin:['Biceps curl machine','Pin loaded']},
    triceps:{cable:['Triceps pushdown','Kabels'],dumbbell:['Dumbbell overhead extension','Dumbbells'],barbell:['Close-grip bench press','Barbells'],pin:['Triceps extension machine','Pin loaded']},
    squat:{barbell:['Barbell squat','Barbells'],dumbbell:['Goblet squat','Dumbbells'],plate:['Plate-loaded hack squat','Plate loaded'],pin:['Leg press machine','Pin loaded'],bodyweight:['Tempo squat','Lichaamsgewicht']},
    hinge:{barbell:['Romanian deadlift','Barbells'],dumbbell:['Dumbbell Romanian deadlift','Dumbbells'],plate:['Plate-loaded hip hinge','Plate loaded'],pin:['Back extension machine','Pin loaded']},
    legCurl:{pin:['Seated leg curl','Pin loaded'],plate:['Plate-loaded leg curl','Plate loaded'],cable:['Cable leg curl','Kabels'],bodyweight:['Slider leg curl','Lichaamsgewicht']},
    splitSquat:{dumbbell:['Bulgarian split squat','Dumbbells'],barbell:['Barbell split squat','Barbells'],plate:['Plate-loaded lunge','Plate loaded'],bodyweight:['Reverse lunge','Lichaamsgewicht']},
    calf:{pin:['Calf raise machine','Pin loaded'],plate:['Plate-loaded calf raise','Plate loaded'],dumbbell:['Dumbbell calf raise','Dumbbells'],barbell:['Barbell calf raise','Barbells']}
  };
  function tPickMove(key,offset=0){const choices=MOVES[key],allowed=state.training.generatorEquipment.filter(x=>choices[x]),keys=allowed.length?allowed:Object.keys(choices),picked=keys[offset%keys.length],v=choices[picked];return {name:v[0],equipment:v[1]}}
  function tVariants(key,move){const choices=MOVES[key],others=Object.entries(choices).filter(([,v])=>v[0]!==move.name).slice(0,2);return others.map(([k,v],i)=>({id:`${key}-${k}`,name:v[0],type:i?'progressie':'regressie',targetReps:i?8:12,targetWeight:0,restSec:90,level:i?'Gevorderd':'Beginner'}))}
  function tGeneratedExercise(key,sets,reps,offset=0,muscles={}){const move=tPickMove(key,offset);return {...move,key,sets,reps,method:'normal',muscles,alternatives:tVariants(key,move)}}
  function tParseWeek(text){const lower=String(text||'').toLowerCase(),days=[['Maandag','maandag'],['Dinsdag','dinsdag'],['Woensdag','woensdag'],['Donderdag','donderdag'],['Vrijdag','vrijdag'],['Zaterdag','zaterdag'],['Zondag','zondag']];const week=days.map(([day,needle])=>{const start=lower.indexOf(needle),next=days.map(([,d])=>lower.indexOf(d,start+needle.length)).filter(i=>i>start).sort((a,b)=>a-b)[0],part=start<0?'':lower.slice(start,next||start+55);return {day,type:/\bupper\b/.test(part)?'upper':/\blower\b/.test(part)?'lower':/\brust|vrij\b/.test(part)?'rest':null}});if(week.filter(x=>x.type==='upper'||x.type==='lower').length<2)return days.map(([day],i)=>({day,type:i===0||i===3?'upper':i===1||i===4?'lower':'rest'}));return week.map(x=>({...x,type:x.type||'rest'}))}
  function tGeneratePlan(){
    if(!state.training.generatorEquipment.length){toast('Kies minimaal één type materiaal');return}
    const week=tParseWeek(state.training.generatorText),counters={upper:0,lower:0},sessions=[];
    week.forEach(({day,type})=>{if(type==='rest')return;const n=counters[type]++;let ex;if(type==='upper'){ex=n%2===0?[
      tGeneratedExercise('chestPress',4,'6–10',n,{Borst:4}),tGeneratedExercise('row',3,'8–12',n,{Rug:3}),tGeneratedExercise('pull',2,'10–12',n+1,{Rug:2}),tGeneratedExercise('shoulderPress',3,'8–12',n,{Schouders:3}),tGeneratedExercise('lateral',2,'12–15',n+1,{Schouders:2}),tGeneratedExercise('curl',2,'10–15',n,{Biceps:2}),tGeneratedExercise('triceps',2,'10–15',n,{Triceps:2})
    ]:[
      tGeneratedExercise('inclinePress',4,'8–12',n,{Borst:4}),tGeneratedExercise('chestFly',2,'12–15',n,{Borst:2}),tGeneratedExercise('row',3,'8–12',n,{Rug:3}),tGeneratedExercise('pull',2,'10–12',n+1,{Rug:2}),tGeneratedExercise('shoulderPress',3,'8–12',n,{Schouders:3}),tGeneratedExercise('lateral',2,'12–15',n+1,{Schouders:2}),tGeneratedExercise('curl',2,'10–15',n,{Biceps:2}),tGeneratedExercise('triceps',2,'10–15',n,{Triceps:2})
    ]}else{ex=n%2===0?[
      tGeneratedExercise('squat',4,'6–10',n,{Quadriceps:4,Bilspieren:2}),tGeneratedExercise('hinge',3,'8–12',n,{Hamstrings:3,Bilspieren:3}),tGeneratedExercise('legCurl',2,'10–15',n,{Hamstrings:2}),tGeneratedExercise('splitSquat',3,'8–12 per been',n,{Quadriceps:3,Bilspieren:3}),tGeneratedExercise('calf',3,'10–15',n,{Kuiten:3})
    ]:[
      tGeneratedExercise('squat',3,'8–12',n,{Quadriceps:3,Bilspieren:2}),tGeneratedExercise('hinge',3,'8–12',n,{Hamstrings:3,Bilspieren:3}),tGeneratedExercise('legCurl',2,'10–15',n,{Hamstrings:2}),tGeneratedExercise('calf',3,'10–15',n,{Kuiten:3})
    ]}sessions.push({day,title:`${type==='upper'?'Upper':'Lower'} ${n+1}`,exercises:ex})});
    const volume={};sessions.flatMap(s=>s.exercises).forEach(e=>Object.entries(e.muscles||{}).forEach(([m,v])=>volume[m]=(volume[m]||0)+v));
    state.training.generatedPlan={id:`self-plan-${Date.now()}`,source:'self',title:`Mijn ${sessions.length}-daagse ${sessions.some(s=>s.title.includes('Upper'))?'upper/lower ':''}schema`,description:'Automatisch opgebouwd uit jouw weekindeling en materiaalkeuze. Pas belasting en techniek aan op je niveau.',volumeTarget:state.training.generatorVolumeTarget,week,sessions,volume};
    store.set('trainingGeneratorText',state.training.generatorText);store.set('trainingGeneratorEquipment',state.training.generatorEquipment);render();
  }
  window.tSetGeneratorText=function(value){state.training.generatorText=value};
  window.tToggleEquipment=function(key,checked){state.training.generatorEquipment=checked?[...new Set([...state.training.generatorEquipment,key])]:state.training.generatorEquipment.filter(x=>x!==key);store.set('trainingGeneratorEquipment',state.training.generatorEquipment)};
  window.tGeneratePlan=tGeneratePlan;
  window.tSaveGeneratedPlan=function(){if(!state.training.generatedPlan)tGeneratePlan();if(!state.training.generatedPlan)return;state.selfTrainingPlan=state.training.generatedPlan;store.set('selfTrainingPlan',state.selfTrainingPlan);state.training.view='plan';state.planSessionIdx=null;render();toast('Weekschema opgeslagen in Mijn plan')};

  function tFormatTarget(e) { if (e.unitOverride === 'sec') return `${e.targetReps} sec`; if (e.unitOverride === 'm') return `${e.targetReps} m`; return `${e.targetReps} reps`; }
  function tFormatWeight(w) { return w === 0 ? 'Lichaamsgewicht' : `${w} kg`; }
  function tMetricLabel(ex) { if (ex.targetWeight > 0) return 'Max gewicht'; if (ex.unitOverride === 'sec') return 'Langste hold'; if (ex.unitOverride === 'm') return 'Verste afstand'; return 'Meeste reps'; }
  function tFormatMetricValue(ex, v) { if (ex.targetWeight > 0) return `${v} kg`; if (ex.unitOverride === 'sec') return `${v} sec`; if (ex.unitOverride === 'm') return `${v} m`; return `${v} reps`; }
  function tAltLabel(type) { if (type === 'progressie') return 'Progressie'; if (type === 'regressie') return 'Regressie'; return 'Variant'; }
  function tAltClass(type) { if (type === 'progressie') return 'alt-progressie'; if (type === 'regressie') return 'alt-regressie'; return 'alt-variant'; }
  function tLevelForAlt(origLevel, altType) { const idx = LEVELS.indexOf(origLevel); if (altType === 'regressie') return LEVELS[Math.max(0, idx - 1)]; if (altType === 'progressie') return LEVELS[Math.min(2, idx + 1)]; return origLevel; }
  function tBuildFromAlt(orig, alt) {
    return { id: `${orig.id}-${alt.id}`, name: alt.name, altType: alt.type, level: alt.level || tLevelForAlt(orig.level, alt.type),
      setsCount: alt.setsCount != null ? alt.setsCount : orig.setsCount, targetReps: alt.targetReps, targetWeight: alt.targetWeight,
      restSec: alt.restSec != null ? alt.restSec : orig.restSec, unitOverride: alt.unitOverride };
  }
  function tResolveExercise(orig) { const altId = state.training.swaps[orig.id]; if (!altId || !orig.alternatives) return orig; const alt = orig.alternatives.find(a => a.id === altId); return alt ? tBuildFromAlt(orig, alt) : orig; }
  const tExerciseCatalog=()=>{const seen=new Set();return T.workouts.flatMap(w=>w.exercises).filter(e=>!seen.has(e.name.toLowerCase())&&seen.add(e.name.toLowerCase()))};
  function tWorkout() { return state.training.activeCustomWorkout?.id===state.training.selectedId?state.training.activeCustomWorkout:T.workouts.find(w => w.id === state.training.selectedId) || null; }
  function tFeatured() { return T.workouts.find(w => w.featured); }
  function tCurrentExercise() { const w = tWorkout(); if (state.training.view !== 'active' || !w) return null; return tResolveExercise(w.exercises[state.training.exerciseIdx]); }
  function tAltBadge(type) { if (!type) return ''; return `<span class="alt-badge ${tAltClass(type)}">${tAltLabel(type)}</span>`; }
  function tLevelBars(level) { const idx = LEVELS.indexOf(level); let bars = ''; for (let i = 0; i < 3; i++) bars += `<i class="${i <= idx ? 'on' : ''}"></i>`; return `<span class="level-bars">${bars}</span>`; }
  function tHistoryBars(values) { const max = Math.max(...values, 1); return `<div class="history-bars">${values.map((v, i) => `<i style="height:${Math.max(6, (v / max) * 56)}px" class="${i === values.length - 1 ? 'last' : ''}"></i>`).join('')}</div>`; }
  function tGenericTip(category) { if (category === 'Kracht') return 'Voer de beweging gecontroleerd uit en bewaak je vorm boven het gewicht.'; if (category === 'Conditie') return 'Houd een tempo aan dat je de volledige set kunt volhouden zonder je vorm te verliezen.'; return 'Beweeg rustig en blijf ademhalen. Forceer nooit door pijn heen.'; }

  /* Acties */
  window.tOpenWorkout = function (id) { state.training.selectedId = id; state.training.swaps = {}; state.training.view = 'detail'; render(); };
  window.tOpenLibrary = function(){state.training.view='library';state.training.selectedId=null;render()};
  window.tOpenBuilder = function(){state.training.view='builder';state.training.selectedId=null;render()};
  window.tBackToLibrary = function () { state.training.view = 'plan'; state.training.selectedId = null; state.training.swaps = {}; state.training.swapPickerFor = null; state.training.showInfo = false; state.training.noteOpen = false; render(); };
  window.tSetFilter = function (cat) { state.training.filter = cat; render(); };
  window.tStartWorkout = function () {
    const w = tWorkout(); const logs = {};
    w.exercises.forEach(orig => { const ex = tResolveExercise(orig); logs[ex.id] = Array.from({ length: ex.setsCount }, () => ({ weight: ex.targetWeight, completed: false })); });
    state.training.logs = logs; state.training.exerciseIdx = 0; state.training.view = 'active'; render();
  };
  window.tOpenSwap = function (slotId) { state.training.swapPickerFor = slotId; render(); };
  window.tCloseSwap = function () { state.training.swapPickerFor = null; render(); };
  window.tChooseAlt = function (slotId, altId) {
    if (altId) state.training.swaps[slotId] = altId; else delete state.training.swaps[slotId];
    state.training.swapPickerFor = null;
    if (state.training.view === 'active') {
      const w = tWorkout(); const orig = w.exercises.find(ex => ex.id === slotId); const currentOriginal = w.exercises[state.training.exerciseIdx];
      if (orig && currentOriginal && orig.id === currentOriginal.id) {
        const newEx = altId ? tBuildFromAlt(orig, orig.alternatives.find(a => a.id === altId)) : orig;
        state.training.logs[newEx.id] = Array.from({ length: newEx.setsCount }, () => ({ weight: newEx.targetWeight, completed: false }));
      }
    }
    render();
  };
  window.tToggleSet = function (exId, idx) {
    const ex = tCurrentExercise(); const arr = state.training.logs[exId]; const nowCompleted = !arr[idx].completed;
    arr[idx] = Object.assign({}, arr[idx], { completed: nowCompleted });
    render();
    if (nowCompleted && ex.restSec > 0) tStartRest(ex.restSec);
  };
  window.tAdjustWeight = function (exId, idx, delta) { const arr = state.training.logs[exId]; arr[idx].weight = Math.max(0, (arr[idx].weight || 0) + delta); render(); };
  window.tAddSet = function (exId) { const arr = state.training.logs[exId] || []; const last = arr.length ? arr[arr.length - 1].weight : ((tCurrentExercise() || {}).targetWeight || 0); arr.push({ weight: last, completed: false }); state.training.logs[exId] = arr; render(); };
  window.tNextExercise = function () {
    const w = tWorkout();
    if (state.training.exerciseIdx < w.exercises.length - 1) { state.training.exerciseIdx++; state.training.showInfo = false; state.training.noteOpen = false; render(); }
    else { state.training.weeklyDone = Math.min(state.training.weeklyDone + 1, weeklyTarget); store.set('trainingWeeklyDone', state.training.weeklyDone); state.training.view = 'complete'; render(); }
  };
  window.tPrevExercise = function () { if (state.training.exerciseIdx > 0) { state.training.exerciseIdx--; state.training.showInfo = false; state.training.noteOpen = false; render(); } };
  window.tToggleInfo = function () { state.training.showInfo = !state.training.showInfo; render(); };
  window.tToggleNote = function () { state.training.noteOpen = !state.training.noteOpen; render(); };
  window.tSetNote = function (exId, val) { state.training.notes[exId] = val; };
  function tStartRest(sec) {
    state.training.restTotal = sec; state.training.restLeft = sec; state.training.restActive = true;
    render();
    if (restTimerHandle) clearInterval(restTimerHandle);
    restTimerHandle = setInterval(() => {
      state.training.restLeft--;
      if (state.training.restLeft <= 0) { clearInterval(restTimerHandle); restTimerHandle = null; state.training.restActive = false; render(); return; }
      const numEl = document.getElementById('restCountdownNum'), ringEl = document.getElementById('restRing');
      if (numEl) numEl.textContent = state.training.restLeft;
      if (ringEl) ringEl.style.setProperty('--p', Math.round((1 - state.training.restLeft / state.training.restTotal) * 100));
    }, 1000);
  }
  window.tSkipRest = function () { if (restTimerHandle) { clearInterval(restTimerHandle); restTimerHandle = null; } state.training.restActive = false; render(); };
  window.trainingVariantsFor=function(name){const target=String(name).toLowerCase(),match=tExerciseCatalog().find(e=>e.name.toLowerCase()===target)||tExerciseCatalog().find(e=>target.includes(e.name.toLowerCase())||e.name.toLowerCase().includes(target));return match?.alternatives||[]};
  window.tAddBuilderRow=function(){state.training.builderRows.push({exerciseId:tExerciseCatalog()[0]?.id||'',sets:3,reps:10,weight:0});render()};
  window.tRemoveBuilderRow=function(index){state.training.builderRows.splice(index,1);if(!state.training.builderRows.length)state.training.builderRows.push({exerciseId:tExerciseCatalog()[0]?.id||'',sets:3,reps:10,weight:0});render()};
  window.tUpdateBuilderRow=function(index,key,value){state.training.builderRows[index][key]=key==='exerciseId'?value:Math.max(0,+value||0);store.set('workoutBuilderRows',state.training.builderRows)};
  window.tSaveBuilder=function(){const catalog=tExerciseCatalog(),exercises=state.training.builderRows.map((row,i)=>{const source=catalog.find(x=>x.id===row.exerciseId)||catalog[0];return {...source,id:`custom-${Date.now()}-${i}`,setsCount:Math.max(1,row.sets||3),targetReps:Math.max(1,row.reps||10),targetWeight:Math.max(0,row.weight||0),alternatives:source.alternatives||[]}});if(!exercises.length)return;state.training.activeCustomWorkout={id:'my-workout',title:'Mijn eigen training',category:'Kracht',duration:Math.max(20,exercises.length*8),phase:'Zelf samengesteld',coachNote:'Pas tijdens de training een progressie of regressie toe wanneer dat beter past.',exercises};state.training.selectedId='my-workout';state.training.swaps={};state.training.view='detail';store.set('workoutBuilderRows',state.training.builderRows);render()};
  window.tStartCoachSession=function(index){const plan=assignedTrainingPlan(),session=plan?.sessions?.[index];if(!session)return;const catalog=tExerciseCatalog(),exercises=session.exercises.map((item,i)=>{const source=catalog.find(x=>x.name.toLowerCase()===String(item.name).toLowerCase())||catalog.find(x=>String(item.name).toLowerCase().includes(x.name.toLowerCase())||x.name.toLowerCase().includes(String(item.name).toLowerCase()));const base=source||{};return {...base,id:`plan-${index}-${i}`,name:item.name,setsCount:Math.max(1,+item.sets||3),targetReps:Math.max(1,parseInt(item.reps)||10),targetWeight:base.targetWeight||0,restSec:base.restSec||90,level:base.level||'Gemiddeld',alternatives:item.alternatives||base.alternatives||[]}});state.training.activeCustomWorkout={id:'coach-session',title:session.title,category:'Kracht',duration:Math.max(20,exercises.length*8),phase:`${session.day} · ${plan.source==='self'?'zelf samengesteld':'van je coach'}`,coachNote:plan.description,exercises};state.training.selectedId='coach-session';state.training.view='detail';state.training.swaps={};state.planSessionIdx=null;render()};

  /* Render */
  function trainingLibrary() {
    const featured = tFeatured();
    const categories = ['Alles', 'Kracht', 'Conditie', 'Herstel'];
    const others = T.workouts.filter(w => !w.featured && (state.training.filter === 'Alles' || w.category === state.training.filter));
    const todayLabel = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    return `
      <div class="t-header-row">
        <div><h2 style="margin:0">Trainingen</h2><p style="color:var(--muted);margin:2px 0 0">${todayLabel}</p></div>
        <div class="ring" style="--p:${Math.round(state.training.weeklyDone / weeklyTarget * 100)};--c:var(--green);width:56px;height:56px"><b style="font-size:13px">${state.training.weeklyDone}/${weeklyTarget}</b></div>
      </div>
      ${featured ? `<div class="t-featured" onclick="tOpenWorkout('${featured.id}')">
        <p class="t-eyebrow">Vandaag van je coach</p>
        <h3 style="margin:6px 0 2px">${esc(featured.title)}</h3>
        <p style="color:var(--muted);margin:0 0 10px">${esc(featured.phase || '')}</p>
        <div style="display:flex;gap:16px;margin-bottom:10px"><span>⏱ ${featured.duration} min</span><span>◈ ${featured.exercises.length} oefeningen</span></div>
        ${featured.coachNote ? `<p style="color:var(--muted);font-size:13px;line-height:1.5">${esc(featured.coachNote)}</p>` : ''}
        <span class="pill" style="background:var(--green);color:#071008">Bekijk training</span>
      </div>` : ''}
      <div class="week-selector" style="margin-top:18px">${categories.map(c => `<button class="${state.training.filter === c ? 'active' : ''}" onclick="tSetFilter('${c}')">${c}</button>`).join('')}</div>
      <div class="section-head"><div><h2 style="font-size:18px">Deze week</h2></div></div>
      <div class="list-card">
        ${others.map(w => `<div class="t-row" onclick="tOpenWorkout('${w.id}')">
          <div class="t-row-icon">${w.category === 'Kracht' ? '🏋' : w.category === 'Conditie' ? '🔥' : '♻'}</div>
          <div style="flex:1"><b>${esc(w.title)}</b><div style="color:var(--muted);font-size:13px;margin-top:2px">${w.duration} min · ${w.exercises.length} oefeningen</div></div>
          <span style="color:var(--muted)">›</span>
        </div>`).join('') || `<div class="empty">Geen trainingen in deze categorie.</div>`}
      </div>`;
  }

  function trainingBuilder(){const catalog=tExerciseCatalog(),plan=state.training.generatedPlan;return `<button class="t-back" onclick="tBackToLibrary()">‹ Mijn plan</button><section class="builder-hero"><span class="t-eyebrow">Slimme schema-builder</span><h2>Beschrijf je trainingsweek</h2><p>Schrijf welke dagen je upper, lower of rust wilt. De app maakt een voorstel rond ongeveer ${state.training.generatorVolumeTarget} werksets per grote spiergroep.</p></section><section class="smart-plan-builder"><label>Jouw beschrijving<textarea oninput="tSetGeneratorText(this.value)">${esc(state.training.generatorText)}</textarea></label><div><b>Beschikbaar materiaal</b><div class="equipment-checks">${Object.entries(EQUIPMENT).map(([key,label])=>`<label><input type="checkbox" ${state.training.generatorEquipment.includes(key)?'checked':''} onchange="tToggleEquipment('${key}',this.checked)"><span>${label}</span></label>`).join('')}</div></div><button class="primary" onclick="tGeneratePlan()">Maak trainingsschema</button></section>${plan?`<section class="generated-plan"><div class="section-head"><div><span class="card-label">Voorstel</span><h2>${esc(plan.title)}</h2><p>Controleer het schema voordat je het opslaat.</p></div></div><div class="generated-week">${plan.week.map(d=>`<div class="${d.type}"><b>${esc(d.day.slice(0,2))}</b><span>${d.type==='rest'?'Rust':d.type}</span></div>`).join('')}</div><div class="volume-summary">${Object.entries(plan.volume).filter(([m])=>!['Biceps','Triceps','Kuiten'].includes(m)).map(([m,v])=>`<div><span>${esc(m)}</span><b>${v} sets</b><i style="--w:${Math.min(100,v/plan.volumeTarget*100)}%"></i></div>`).join('')}</div>${plan.sessions.map(s=>`<article><h3>${esc(s.day)} · ${esc(s.title)}</h3>${s.exercises.map(e=>`<div><span>${esc(e.name)} <small>${esc(e.equipment)}</small></span><b>${e.sets} × ${esc(e.reps)}</b></div>`).join('')}</article>`).join('')}<button class="primary" onclick="tSaveGeneratedPlan()">Opslaan in Mijn plan</button></section>`:''}<div class="builder-divider"><span>of maak één losse workout</span></div><div class="workout-builder-list">${state.training.builderRows.map((row,i)=>{const current=catalog.find(x=>x.id===row.exerciseId)||catalog[0],variants=current?.alternatives||[];return `<article><div class="builder-row-head"><b>Oefening ${i+1}</b><button onclick="tRemoveBuilderRow(${i})">×</button></div><select onchange="tUpdateBuilderRow(${i},'exerciseId',this.value)">${catalog.map(e=>`<option value="${e.id}" ${e.id===row.exerciseId?'selected':''}>${esc(e.name)}</option>`).join('')}</select><div class="builder-numbers"><label>Sets<input type="number" min="1" value="${row.sets}" oninput="tUpdateBuilderRow(${i},'sets',this.value)"></label><label>Reps<input type="number" min="1" value="${row.reps}" oninput="tUpdateBuilderRow(${i},'reps',this.value)"></label><label>Gewicht<input type="number" min="0" step="0.5" value="${row.weight}" oninput="tUpdateBuilderRow(${i},'weight',this.value)"></label></div>${variants.length?`<div class="builder-variants">${variants.map(v=>`<span class="${tAltClass(v.type)}"><b>${tAltLabel(v.type)}</b>${esc(v.name)}</span>`).join('')}</div>`:'<small>Voor deze oefening zijn nog geen variaties toegevoegd.</small>'}</article>`}).join('')}</div><button class="secondary builder-add-row" onclick="tAddBuilderRow()">＋ Oefening toevoegen</button><button class="primary" onclick="tSaveBuilder()">Training bekijken en starten</button>`}

  function trainingDetail() {
    const w = tWorkout();
    return `
      <button class="t-back" onclick="tBackToLibrary()">‹ Trainingen</button>
      <h2 style="margin:10px 0 0">${esc(w.title)}</h2>
      ${w.phase ? `<p style="color:var(--green);margin:2px 0 10px">${esc(w.phase)}</p>` : '<div style="margin-bottom:10px"></div>'}
      <div style="display:flex;gap:16px;margin-bottom:14px"><span>⏱ ${w.duration} min</span><span>◈ ${w.exercises.length} oefeningen</span></div>
      ${w.coachNote ? `<div class="tip">💬 <b>Notitie van je coach:</b><br>${esc(w.coachNote)}</div>` : ''}
      <p class="t-eyebrow" style="margin-top:18px">Oefeningen · tik op ⇄ om te wisselen</p>
      <div class="list-card">
        ${w.exercises.map((orig, i) => { const shown = tResolveExercise(orig); return `<div class="t-row">
          <span style="color:var(--muted);width:16px">${i + 1}</span>
          <div style="flex:1"><b>${esc(shown.name)}</b> ${tAltBadge(shown.altType)}</div>
          <div style="text-align:right;margin-right:8px">
            <div>${shown.setsCount} × ${tFormatTarget(shown)}</div>
            ${(shown.targetWeight > 0 || w.category === 'Kracht') ? `<div style="color:var(--muted);font-size:12px">${tFormatWeight(shown.targetWeight)}</div>` : ''}
          </div>
          ${orig.alternatives && orig.alternatives.length ? `<button class="t-swap-btn" onclick="tOpenSwap('${orig.id}')">⇄</button>` : ''}
        </div>`; }).join('')}
      </div>
      <button class="primary" style="margin-top:16px" onclick="tStartWorkout()">Start training</button>`;
  }

  function trainingActive() {
    const w = tWorkout(), e = tCurrentExercise(), origCurrent = w.exercises[state.training.exerciseIdx];
    const setsLog = state.training.logs[e.id] || [];
    const allDone = setsLog.length > 0 && setsLog.every(s => s.completed);
    const isLast = state.training.exerciseIdx === w.exercises.length - 1;
    const tip = origCurrent.tip || tGenericTip(w.category);
    return `
      <div class="t-active-header">
        <button class="t-icon-btn" onclick="tBackToLibrary()">✕</button>
        <div style="flex:1;text-align:center"><b>${esc(e.name)}</b></div>
        <button class="t-icon-btn" onclick="tToggleInfo()">ⓘ</button>
      </div>
      <p style="text-align:center;color:var(--muted);font-size:13px;margin:4px 0 0">Oefening ${state.training.exerciseIdx + 1} van ${w.exercises.length} — ${esc(w.title)}</p>
      ${e.altType ? `<div style="text-align:center;margin-top:6px">${tAltBadge(e.altType)}</div>` : ''}
      ${state.training.showInfo ? `<div class="tip" style="margin-top:12px">${esc(tip)}</div>` : ''}
      <div class="t-hero">
        <div class="t-hero-icon">${w.category === 'Kracht' ? '🏋' : w.category === 'Conditie' ? '🔥' : '♻'}</div>
      </div>
      <div class="t-level-row">
        <div>${tLevelBars(e.level)}<span style="margin-left:8px;color:var(--muted);font-size:13px">${e.level}</span></div>
        ${origCurrent.alternatives && origCurrent.alternatives.length ? `<button class="t-link" onclick="tOpenSwap('${origCurrent.id}')">⇄ Wissel</button>` : ''}
      </div>
      <div class="set-grid">
        ${setsLog.map((s, idx) => `
          <div class="set-col">
            <div class="set-cell ${s.completed ? 'done' : ''}">
              <span class="reps">${tFormatTarget(e)}</span>
              ${e.targetWeight > 0 ? `<div class="weight-stepper">
                <button onclick="tAdjustWeight('${e.id}',${idx},-2.5)">−</button>
                <b>${s.weight}</b>
                <button onclick="tAdjustWeight('${e.id}',${idx},2.5)">+</button>
              </div>` : ''}
              <button class="set-check ${s.completed ? 'done' : ''}" onclick="tToggleSet('${e.id}',${idx})">${s.completed ? '✓' : ''}</button>
            </div>
            <div class="set-rest">⏱ ${e.restSec}s</div>
          </div>`).join('')}
        <button class="set-add" onclick="tAddSet('${e.id}')">+</button>
      </div>
      <p style="color:var(--muted);font-size:12px;margin:6px 2px 0">Tik op − of + om het gewicht per set aan te passen, en op de ronde knop om af te vinken.</p>
      <button class="t-note-toggle" onclick="tToggleNote()">📝 ${state.training.notes[e.id] ? 'Notitie bewerken' : 'Notitie toevoegen'}</button>
      ${state.training.noteOpen ? `<textarea class="t-note" placeholder="Bijvoorbeeld: voelde zwaar vandaag." oninput="tSetNote('${e.id}', this.value)">${esc(state.training.notes[e.id] || '')}</textarea>` : ''}
      <div class="section-head"><div><h2 style="font-size:17px">Geschiedenis</h2></div><span style="color:var(--muted);font-size:13px">${tMetricLabel(origCurrent)}</span></div>
      ${e.altType ? `<p style="color:var(--muted);font-size:13px">Nog geen geschiedenis voor deze ${tAltLabel(e.altType).toLowerCase()}. Dit is de eerste keer dat je hem doet.</p>` :
        `<p style="color:var(--muted);font-size:13px;margin-bottom:10px">Gebaseerd op je laatste vijf trainingen met deze oefening.</p>
         ${tHistoryBars(origCurrent.history)}
         <div class="t-pr-row"><span>Persoonlijk record</span><b>🏆 ${tFormatMetricValue(origCurrent, Math.max.apply(null, origCurrent.history))}</b></div>`}
      <div class="t-nav-row">
        <button class="t-icon-btn big" ${state.training.exerciseIdx === 0 ? 'disabled' : ''} onclick="tPrevExercise()">‹</button>
        <button class="primary ${allDone ? '' : 'muted'}" onclick="tNextExercise()">${isLast ? 'Training voltooien' : 'Volgende oefening'} ›</button>
      </div>`;
  }

  function trainingComplete() {
    return `<div style="text-align:center;padding:60px 20px 20px">
      <div class="ring" style="--p:100;--c:var(--green);width:100px;height:100px;margin:0 auto"><b style="font-size:28px">✓</b></div>
      <h2 style="margin:20px 0 8px">Training voltooid</h2>
      <p style="color:var(--muted);max-width:280px;margin:0 auto">Goed werk. Je coach ziet je voortgang automatisch terug in je overzicht.</p>
      <button class="primary" style="max-width:220px;margin:20px auto 0" onclick="tBackToLibrary()">Terug naar overzicht</button>
    </div>`;
  }

  function trainingSwapSheet() {
    if (!state.training.swapPickerFor) return '';
    const w = tWorkout(); if (!w) return '';
    const orig = w.exercises.find(e => e.id === state.training.swapPickerFor); if (!orig) return '';
    const activeAltId = state.training.swaps[state.training.swapPickerFor] || null;
    const options = [{ altId: null, name: orig.name, type: null, setsCount: orig.setsCount, targetReps: orig.targetReps, targetWeight: orig.targetWeight, unitOverride: orig.unitOverride }]
      .concat(orig.alternatives.map(a => ({ altId: a.id, name: a.name, type: a.type, setsCount: a.setsCount || orig.setsCount, targetReps: a.targetReps, targetWeight: a.targetWeight, unitOverride: a.unitOverride })));
    return `<div class="t-overlay" onclick="tCloseSwap()">
      <div class="t-sheet" onclick="event.stopPropagation()">
        <div class="t-sheet-head"><b>Wissel oefening</b><button class="t-icon-btn" onclick="tCloseSwap()">✕</button></div>
        <p style="color:var(--muted);font-size:13px;margin:0 0 14px">Voor ${esc(orig.name)}</p>
        ${options.map(opt => `<div class="t-opt ${opt.altId === activeAltId ? 'active' : ''}" onclick="tChooseAlt('${orig.id}', ${opt.altId ? `'${opt.altId}'` : 'null'})">
          <div><b>${esc(opt.name)}</b> ${tAltBadge(opt.type)}
            <div style="color:var(--muted);font-size:13px;margin-top:2px">${opt.setsCount} × ${tFormatTarget(opt)}${opt.targetWeight > 0 ? ` · ${opt.targetWeight} kg` : ''}</div>
          </div>
          ${opt.altId === activeAltId ? '<span style="color:var(--green)">✓</span>' : ''}
        </div>`).join('')}
      </div>
    </div>`;
  }

  function trainingRestOverlay() {
    if (!state.training.restActive) return '';
    const p = Math.round((1 - state.training.restLeft / state.training.restTotal) * 100);
    const e = tCurrentExercise();
    return `<div class="t-overlay t-rest-overlay">
      <div style="text-align:center">
        <div id="restRing" class="ring" style="--p:${p};--c:var(--orange);width:140px;height:140px;margin:0 auto"><b id="restCountdownNum" style="font-size:34px">${state.training.restLeft}</b></div>
        <p style="margin:14px 0 2px;font-weight:700">Rust</p>
        <p style="color:var(--muted);font-size:13px">Volgende set: ${e ? esc(e.name) : ''}</p>
        <button class="secondary" style="max-width:160px;margin:14px auto 0" onclick="tSkipRest()">Overslaan</button>
      </div>
    </div>`;
  }

  window.trainingView = function () {
    let body = state.training.view === 'plan' ? window.trainingPlanHome()
      : state.training.view === 'library' ? trainingLibrary()
      : state.training.view === 'builder' ? trainingBuilder()
      : state.training.view === 'detail' ? trainingDetail()
      : state.training.view === 'active' ? trainingActive()
      : state.training.view === 'complete' ? trainingComplete() : trainingLibrary();
    return body + trainingSwapSheet() + trainingRestOverlay();
  };

  /* Hook de training-tab in de bestaande render-dispatcher. */
  render = function () {
    let titles = { home: 'Home', diary: 'Voeding', weeks: 'Planning', checkin: 'Check-in', longevity: 'Longevity', courses: 'Mijn leeromgeving', shopping: 'Boodschappen', training: 'Mijn plan', profile: 'Profiel' };
    $('#pageTitle').textContent = titles[state.tab] || 'Karada Coaches';
    $('#view').innerHTML = state.tab === 'home' ? dashboard() : state.tab === 'diary' ? nutritionHub() : state.tab === 'weeks' ? weeks() : state.tab === 'checkin' ? checkIn() : state.tab === 'longevity' ? longevity() : state.tab === 'courses' ? courses() : state.tab === 'shopping' ? shopping() : state.tab === 'training' ? window.trainingView() : profile();
    syncNav();
    finishRenderScroll();
  };
  render();
})();
