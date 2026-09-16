/* Training tab: workout library, execution with progressie/regressie-wissels, rusttimer en geschiedenis. */
(function () {
  const T = window.TRAINING_DATA;
  const LEVELS = T.levels;
  const weeklyTarget = 5;
  let restTimerHandle = null;

  state.training = {
    view: 'library',
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
    weeklyDone: store.get('trainingWeeklyDone', 3)
  };

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
  function tWorkout() { return T.workouts.find(w => w.id === state.training.selectedId) || null; }
  function tFeatured() { return T.workouts.find(w => w.featured); }
  function tCurrentExercise() { const w = tWorkout(); if (state.training.view !== 'active' || !w) return null; return tResolveExercise(w.exercises[state.training.exerciseIdx]); }
  function tAltBadge(type) { if (!type) return ''; return `<span class="alt-badge ${tAltClass(type)}">${tAltLabel(type)}</span>`; }
  function tLevelBars(level) { const idx = LEVELS.indexOf(level); let bars = ''; for (let i = 0; i < 3; i++) bars += `<i class="${i <= idx ? 'on' : ''}"></i>`; return `<span class="level-bars">${bars}</span>`; }
  function tHistoryBars(values) { const max = Math.max(...values, 1); return `<div class="history-bars">${values.map((v, i) => `<i style="height:${Math.max(6, (v / max) * 56)}px" class="${i === values.length - 1 ? 'last' : ''}"></i>`).join('')}</div>`; }
  function tGenericTip(category) { if (category === 'Kracht') return 'Voer de beweging gecontroleerd uit en bewaak je vorm boven het gewicht.'; if (category === 'Conditie') return 'Houd een tempo aan dat je de volledige set kunt volhouden zonder je vorm te verliezen.'; return 'Beweeg rustig en blijf ademhalen. Forceer nooit door pijn heen.'; }

  /* Acties */
  window.tOpenWorkout = function (id) { state.training.selectedId = id; state.training.swaps = {}; state.training.view = 'detail'; render(); };
  window.tBackToLibrary = function () { state.training.view = 'library'; state.training.selectedId = null; state.training.swaps = {}; state.training.swapPickerFor = null; state.training.showInfo = false; state.training.noteOpen = false; render(); };
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
    let body = state.training.view === 'library' ? trainingLibrary()
      : state.training.view === 'detail' ? trainingDetail()
      : state.training.view === 'active' ? trainingActive()
      : state.training.view === 'complete' ? trainingComplete() : trainingLibrary();
    return body + trainingSwapSheet() + trainingRestOverlay();
  };

  /* Hook de training-tab in de bestaande render-dispatcher. */
  render = function () {
    let titles = { diary: (state.date === localISO() ? 'Vandaag' : fmt(state.date)), weeks: 'Planning', shopping: 'Boodschappen', recipes: 'Recepten', training: 'Trainingen', coach: 'AI voedingscoach', profile: state.profile.name };
    $('#pageTitle').textContent = titles[state.tab] || 'Karada Coaches';
    $('#view').innerHTML = state.tab === 'diary' ? diary() : state.tab === 'weeks' ? weeks() : state.tab === 'shopping' ? shopping() : state.tab === 'recipes' ? recipeLibrary() : state.tab === 'training' ? window.trainingView() : state.tab === 'coach' ? coach() : profile();
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  render();
})();
