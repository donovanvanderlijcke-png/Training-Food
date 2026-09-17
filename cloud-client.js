(function(){
  const config=window.KARADA_SUPABASE||{},enabled=/^https:\/\/.+\.supabase\.co$/.test(config.url||'')&&(config.anonKey||'').length>40;
  if(!enabled){document.documentElement.dataset.cloud='demo';return}
  const db=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,detectSessionInUrl:true}});
  const html=`<div id="clientGate" class="client-gate"><section><div class="gate-brand">K</div><span>KARADA PERFORMANCE</span><h1>Open jouw persoonlijke app</h1><p>Gebruik hetzelfde e-mailadres dat je coach aan jouw klantprofiel heeft gekoppeld.</p><form id="clientGateForm"><label>E-mailadres<input id="clientGateEmail" type="email" autocomplete="email" required placeholder="naam@voorbeeld.nl"></label><button>Stuur veilige inloglink</button></form><div id="clientGateStatus"></div><small>Staat jouw e-mailadres nog niet in het coachportaal? Vraag je coach om je eerst toe te voegen.</small></section></div>`;
  function showGate(message=''){if(!document.querySelector('#clientGate'))document.body.insertAdjacentHTML('beforeend',html);document.querySelector('#clientGateStatus').textContent=message;document.querySelector('#clientGateForm').onsubmit=signIn}
  function hideGate(){document.querySelector('#clientGate')?.remove()}
  async function signIn(event){event.preventDefault();const email=document.querySelector('#clientGateEmail').value.trim().toLowerCase(),status=document.querySelector('#clientGateStatus');status.textContent='Inloglink wordt verstuurd…';const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});status.textContent=error?'De link kon niet worden verstuurd. Probeer opnieuw.':'Controleer je e-mail en open de inloglink op dit apparaat.'}
  async function hydrate(session){
    const email=session.user.email?.toLowerCase();
    const {data:profile,error}=await db.from('clients').select('*').eq('email',email).eq('active',true).maybeSingle();
    if(error||!profile){await db.auth.signOut();showGate('Dit e-mailadres is nog niet door een coach geactiveerd.');return}
    const [{data:assignment},{data:nutrition},{data:schedule},{data:goals}]=await Promise.all([
      db.from('client_plan_assignments').select('training_plan_id').eq('client_id',profile.id).maybeSingle(),
      db.from('nutrition_plans').select('data').eq('client_id',profile.id).maybeSingle(),
      db.from('client_schedules').select('data').eq('client_id',profile.id).maybeSingle(),
      db.from('client_goals').select('data').eq('client_id',profile.id).maybeSingle()
    ]);
    let plan=null;if(assignment?.training_plan_id){const result=await db.from('training_plans').select('*').eq('id',assignment.training_plan_id).maybeSingle();plan=result.data}
    state.activeClientId=profile.id;state.profile={...state.profile,name:profile.name};store.set('activeClientId',profile.id);store.set('profile',state.profile);
    if(plan){const localPlan={id:plan.id,title:plan.title,description:plan.description||'',sessions:plan.data?.sessions||[]};state.trainingPlans=[localPlan];state.clientPlanAssignments={[profile.id]:localPlan.id};store.set('trainingPlans',state.trainingPlans);store.set('clientPlanAssignments',state.clientPlanAssignments)}else{state.trainingPlans=[];state.clientPlanAssignments={};store.set('trainingPlans',[]);store.set('clientPlanAssignments',{})}
    if(nutrition?.data){state.coachNutritionPlans={[profile.id]:nutrition.data};store.set('coachNutritionPlans',state.coachNutritionPlans)}
    if(schedule?.data){state.coachSchedules={[profile.id]:schedule.data};store.set('coachSchedules',state.coachSchedules)}
    if(goals?.data){state.coachGoals={[profile.id]:goals.data};store.set('coachGoals',state.coachGoals)}
    hideGate();render();
  }
  async function start(){const {data:{session}}=await db.auth.getSession();if(session)await hydrate(session);else showGate();db.auth.onAuthStateChange((_event,next)=>{if(next)hydrate(next);else showGate()})}
  window.KaradaCloudClient={start,signOut:()=>db.auth.signOut()};
  start().catch(()=>showGate('De beveiligde verbinding kon niet worden gestart. Probeer de pagina opnieuw te laden.'));
})();
