(function(){
  const config=window.KARADA_SUPABASE||{},enabled=/^https:\/\/.+\.supabase\.co$/.test(config.url||'')&&(config.anonKey||'').length>40;
  if(!enabled){document.documentElement.dataset.cloud='demo';return}
  const db=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,detectSessionInUrl:true}});let session=null,timer=null,loading=false;
  const gate=`<div id="coachGate" class="coach-gate"><section><div class="gate-brand">K</div><span>KARADA COACHPORTAAL</span><h1>Alleen voor coaches</h1><p>Log in met het e-mailadres dat in Supabase als coach is geactiveerd.</p><form id="coachGateForm"><label>E-mailadres<input id="coachGateEmail" type="email" required autocomplete="email"></label><button>Stuur veilige inloglink</button></form><div id="coachGateStatus"></div></section></div>`;
  function showGate(message=''){if(!$('#coachGate'))document.body.insertAdjacentHTML('beforeend',gate);$('#coachGateStatus').textContent=message;$('#coachGateForm').onsubmit=signIn}
  function hideGate(){$('#coachGate')?.remove()}
  async function signIn(event){event.preventDefault();const status=$('#coachGateStatus'),email=$('#coachGateEmail').value.trim().toLowerCase();status.textContent='Inloglink wordt verstuurd…';const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});status.textContent=error?'Inloggen lukte niet. Probeer opnieuw.':'Open de beveiligde link in je e-mail.'}
  async function loadCloud(){
    loading=true;const {data:coach}=await db.from('coach_profiles').select('id').maybeSingle();if(!coach){loading=false;await db.auth.signOut();showGate('Dit account heeft geen coachrechten.');return}
    const [{data:clients},{data:plans},{data:assignments},{data:nutrition},{data:schedules},{data:goals}]=await Promise.all([
      db.from('clients').select('*').order('created_at'),db.from('training_plans').select('*').order('created_at'),db.from('client_plan_assignments').select('*'),db.from('nutrition_plans').select('*'),db.from('client_schedules').select('*'),db.from('client_goals').select('*')
    ]);
    state.clients=(clients||[]).map(x=>({id:x.id,name:x.name,email:x.email,goal:x.goal||'',active:x.active}));
    state.plans=(plans||[]).map(x=>({id:x.id,title:x.title,description:x.description||'',sessions:x.data?.sessions||[]}));
    state.assignments=Object.fromEntries((assignments||[]).map(x=>[x.client_id,x.training_plan_id]));state.nutrition=Object.fromEntries((nutrition||[]).map(x=>[x.client_id,x.data]));state.schedules=Object.fromEntries((schedules||[]).map(x=>[x.client_id,x.data]));state.goals=Object.fromEntries((goals||[]).map(x=>[x.client_id,x.data]));
    if(!state.clients.some(x=>x.id===state.clientId))state.clientId=state.clients[0]?.id||'';if(!state.plans.some(x=>x.id===state.editingPlanId))state.editingPlanId=state.plans[0]?.id||'';
    loading=false;persist();syncClientSelect();hideGate();render();
  }
  async function sync(snapshot){
    if(!session||loading)return;const coachId=session.user.id;
    const clients=snapshot.clients.map(x=>({id:x.id,coach_id:coachId,name:x.name,email:x.email.toLowerCase(),goal:x.goal||'',active:x.active!==false}));
    if(clients.length)await db.from('clients').upsert(clients);
    const cloudClients=await db.from('clients').select('id');const liveIds=new Set(snapshot.clients.map(x=>x.id));const removed=(cloudClients.data||[]).map(x=>x.id).filter(id=>!liveIds.has(id));if(removed.length)await db.from('clients').delete().in('id',removed);
    const plans=snapshot.plans.map(x=>({id:x.id,coach_id:coachId,title:x.title,description:x.description||'',data:{sessions:x.sessions||[]}}));if(plans.length)await db.from('training_plans').upsert(plans);
    const rows=Object.entries(snapshot.assignments).map(([client_id,training_plan_id])=>({client_id,training_plan_id}));const clientIds=snapshot.clients.map(x=>x.id);if(clientIds.length)await db.from('client_plan_assignments').delete().in('client_id',clientIds);if(rows.length)await db.from('client_plan_assignments').upsert(rows);
    const upsertData=async(table,map)=>{const records=Object.entries(map).filter(([id])=>liveIds.has(id)).map(([client_id,data])=>({client_id,data}));if(records.length)await db.from(table).upsert(records)};
    await Promise.all([upsertData('nutrition_plans',snapshot.nutrition),upsertData('client_schedules',snapshot.schedules),upsertData('client_goals',snapshot.goals)]);
  }
  function scheduleSync(snapshot){clearTimeout(timer);timer=setTimeout(()=>sync(snapshot).catch(()=>toast('Cloudopslag is tijdelijk niet bereikbaar')),350)}
  async function start(){const result=await db.auth.getSession();session=result.data.session;if(session)await loadCloud();else showGate();db.auth.onAuthStateChange(async(_event,next)=>{session=next;if(next)await loadCloud();else showGate()})}
  window.KaradaCoachCloud={scheduleSync,start,signOut:()=>db.auth.signOut()};start().catch(()=>showGate('De beveiligde coachomgeving kon niet starten.'));
})();
