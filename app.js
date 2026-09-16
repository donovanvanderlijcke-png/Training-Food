
const DATA=window.APP_DATA;
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const localISO=(date=new Date())=>{const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`};
let state={tab:'diary',date:localISO(),week:1,choices:store.get('choices',{}),shopping:store.get('shopping',[]),chat:store.get('chat',[{role:'ai',text:'Hoi! Ik ken je trainingsschema, voedingsplan en recepten. Vraag bijvoorbeeld wat je vandaag moet eten, welk diner past bij een kracht- of conditiedag, of hoeveel eiwit je vandaag nodig hebt.'}]),profile:store.get('profile',{name:'Klant',weight:82,height:180,target:80}),weights:store.get('weights',[82])};
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const planner=DATA.planner; if(!planner.some(d=>d.date===state.date))state.date=planner[0].date;
const day=()=>planner.find(d=>d.date===state.date)||planner[0];
const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
const key=(m)=>state.date+'-'+m;
function toast(t){let e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function optionsFor(daytype,moment){let xs=DATA.mealOptions.filter(x=>x.daytype===daytype);return xs.find(x=>x.moment.toLowerCase().includes(moment))||xs[0]}
const pics={havermout:'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=300&q=80',kwark:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',brood:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',wrap:'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80',rijst:'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80',pasta:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=300&q=80',banaan:'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=300&q=80',fruit:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80',noten:'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=300&q=80',shake:'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=300&q=80',default:'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80'};
function pic(s){s=s.toLowerCase();for(const k in pics)if(s.includes(k))return pics[k];return pics.default}
const mealPhotoRules=[[/havermout|oat/,'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=700&q=85'],[/kwark|skyr|yoghurt|drinkyoghurt/,'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85'],[/granola|muesli|cornflakes/,'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=700&q=85'],[/omelet|\bei\b|eieren/,'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=85'],[/bagel/,'https://images.unsplash.com/photo-1585445490387-f47934b73b54?auto=format&fit=crop&w=700&q=85'],[/boterham|brood|krentenbol|broodje/,'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=85'],[/wrap|fajita/,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=85'],[/pasta|gnocchi|spaghetti/,'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=85'],[/rijst|rice|bowl/,'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=85'],[/quinoa|couscous|salade/,'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=85'],[/aardappel|puree/,'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85'],[/zalm|tonijn|vis/,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=85'],[/kip|chicken/,'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=700&q=85'],[/tofu|vegetar/,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85'],[/smoothie|shake|hersteldrank|chocolademelk|warme melk|sportdrank/,'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=85'],[/banaan/,'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=700&q=85'],[/fruit|appel|rood fruit/,'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=85'],[/noten|pindakaas/,'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=700&q=85'],[/rijstwafel|mueslireep|energiereep|chews|gel/,'https://images.unsplash.com/photo-1579722821273-0f6c1ddde163?auto=format&fit=crop&w=700&q=85']];
function mealImage(option,moment=''){const text=String(option||'').toLowerCase();if(state&&state.recipeDb&&state.recipeDb.length){const words=text.replace(/\b\d+[–-]?\d*\s*(g|ml|el|tl|min|personen|kh|uur)\b/g,' ').split(/[^a-zà-ÿ]+/).filter(w=>w.length>4&&!['kies','recept','grote','runner','addon'].includes(w));let best=null,bestScore=0;for(const r of state.recipeDb){const hay=(r.name+' '+r.ingredients.join(' ')).toLowerCase();const score=words.reduce((n,w)=>n+(hay.includes(w)?1:0),0);if(score>bestScore){best=r;bestScore=score}}if(best&&bestScore>=2)return best.photo}for(const [rx,url] of mealPhotoRules)if(rx.test(text))return url;return moment==='breakfast'?DATA.photos.breakfast:moment==='lunch'?DATA.photos.lunch:moment==='snack'?DATA.photos.snack:pics.default}
function selectedMacros(d){let base={cal:Math.round((d.carbs||350)*4+(d.protein||151)*4+75*9),carbs:d.carbs||350,protein:d.protein||151,fat:75};let count=['breakfast','lunch','snack','dinner'].filter(m=>state.choices[key(m)]!=null).length;let ratio=count/4;return {...base,eaten:Math.round(base.cal*ratio),ratio}}
function mealSection(title,moment,row,sub){if(!row)return'';let chosen=state.choices[key(moment)];return `<section><div class="section-head"><div><h2>${title}</h2><p>${sub||'Kies één optie'} · tik nogmaals om te deselecteren</p></div><button class="add-btn" aria-label="Selectie wissen" onclick="clearMeal('${moment}')">×</button></div><div class="meal-card">${row.options.map((o,i)=>`<div class="meal-option ${chosen===i?'selected':''}" onclick="chooseMeal('${moment}',${i})"><img src="${mealImage(o,moment)}" alt="Foto van ${esc(o.split('•')[0])}" loading="lazy"><div><h4>${esc(o.split('•')[0])}</h4><p>${esc(o)}</p></div><span class="check">${chosen===i?'✓':''}</span></div>`).join('')}</div></section>`}
function diary(){let d=day(),m=selectedMacros(d),b=optionsFor(d.daytype,'ontbijt'),l=optionsFor(d.daytype,'lunch'),s=optionsFor(d.daytype,'snack')||optionsFor(d.daytype,'tussendoor');let dinnerOpts=d.dinners.map(code=>{let r=DATA.recipes.find(x=>x.code===code);return r?`${r.name} • ${r.time} • voor 2 personen`:code});return `<div class="hero"><div class="hero-row"><input class="date-control" type="date" value="${d.date}" min="${planner[0].date}" max="${planner.at(-1).date}" onchange="changeDate(this.value)"><span class="training-chip">${esc(d.training)}</span></div><div class="remaining">Je kunt nog <strong>${Math.max(0,m.cal-m.eaten).toLocaleString('nl-NL')}</strong> calorieën eten</div><div class="progress"><i style="width:${m.ratio*100}%"></i></div><div class="progress-label"><span>${m.eaten.toLocaleString('nl-NL')} gegeten</span><span>Doel: ${m.cal.toLocaleString('nl-NL')}</span></div></div><div class="macro-grid">${macro('Koolhydraten',Math.round(m.carbs*m.ratio),m.carbs,'var(--pink)')}${macro('Eiwitten',Math.round(m.protein*m.ratio),m.protein,'var(--blue)')}${macro('Vetten',Math.round(m.fat*m.ratio),m.fat,'var(--orange)')}</div><div class="tip"><b>Focus vandaag:</b> ${esc(d.focus)}<br><b>Training:</b> ${esc(d.fuel)}</div>${mealSection('Ontbijt','breakfast',b)}${mealSection('Lunch','lunch',l)}${mealSection('Snack','snack',s)}${mealSection('Avondeten samen','dinner',{options:dinnerOpts},'3 receptsuggesties voor vanavond')}<div class="section-head"><div><h2>Receptdetails</h2><p>Avondmaaltijden voor twee</p></div></div>${d.dinners.map(c=>recipeCard(DATA.recipes.find(r=>r.code===c))).join('')}`}
function macro(name,val,total,color){let p=Math.min(100,Math.round(val/total*100)||0);return `<div class="macro"><h3>${name}</h3><div class="ring" style="--p:${p};--c:${color}"><b>${p}%</b></div><small><b>${val}</b> / ${Math.round(total)} g</small></div>`}
function recipeCard(r){if(!r)return'';return `<article class="recipe-card"><img class="recipe-hero" src="${r.photo}" alt="${esc(r.name)}"><div class="recipe-body"><h3>${esc(r.name)}</h3><div class="tags"><span class="tag">${esc(r.time)}</span><span class="tag">Voor 2 personen</span><span class="tag">${esc(r.type)}</span></div><p class="ingredients"><b>Ingrediënten:</b> ${esc(r.ingredients)}<br><br><b>Bereiding:</b> ${esc(r.prep)}<br><br><b>Jouw extra portie:</b> ${esc(r.addon)}</p><button class="primary" onclick="addRecipe('${r.code}')">Voeg toe aan boodschappen</button></div></article>`}
function weeks(){let weeks=[...new Set(planner.map(x=>x.week))];let ds=planner.filter(x=>x.week===state.week);return `<div class="week-selector">${weeks.map(w=>`<button class="${w===state.week?'active':''}" onclick="state.week=${w};render()">Week ${w}</button>`).join('')}</div>${ds.map(d=>`<div class="day-card" onclick="state.date='${d.date}';state.tab='diary';render()"><div class="row"><div><b>${fmt(d.date)}</b><div style="color:var(--muted);margin-top:4px">${esc(d.daytype)}</div></div><span class="km">${esc(d.training)}</span></div><div style="margin-top:10px;color:var(--muted);font-size:13px">${Math.round(d.carbs)} g koolhydraten · ${Math.round(d.protein)} g eiwit</div></div>`).join('')}`}
function addRecipe(code){let r=DATA.recipes.find(x=>x.code===code);if(!r)return;let parts=r.ingredients.split(';').map(s=>s.trim()).filter(Boolean);parts.forEach(t=>{if(!state.shopping.some(x=>x.name===t))state.shopping.push({name:t,done:false,img:pic(t)})});store.set('shopping',state.shopping);toast('Ingrediënten toegevoegd')}
function generateWeekShopping(){state.shopping=[];planner.filter(d=>d.week===state.week).forEach(d=>{let chosen=state.choices[d.date+'-dinner'];let code=d.dinners[chosen??0];let r=DATA.recipes.find(x=>x.code===code);if(r)r.ingredients.split(';').map(s=>s.trim()).filter(Boolean).forEach(t=>{if(!state.shopping.some(x=>x.name===t))state.shopping.push({name:t,done:false,img:pic(t)})})});store.set('shopping',state.shopping);render();toast('Weeklijst gemaakt')}
function shopping(){return `<div class="shop-actions"><button class="action-card" onclick="generateWeekShopping()">▣<br>Importeer week ${state.week}</button><button class="action-card green" onclick="addCustom()">＋<br>Product toevoegen</button></div><div class="section-head"><div><h2>Boodschappen</h2><p>${state.shopping.length} items</p></div><button class="add-btn" onclick="clearShopping()">⋮</button></div><div class="list-card">${state.shopping.length?state.shopping.map((x,i)=>`<div class="shop-item ${x.done?'done':''}" onclick="toggleShop(${i})"><span class="small-check"></span><img src="${x.img||pic(x.name)}" alt=""><div><b>${esc(x.name)}</b></div></div>`).join(''):'<div class="empty">Nog geen producten. Importeer een week of voeg een product toe.</div>'}</div>`}
function coach(){return `<div class="quick-prompts"><button onclick="ask('Wat moet ik vandaag eten?')">Vandaag eten</button><button onclick="ask('Wat moet ik morgen eten?')">Morgen eten</button><button onclick="ask('Wat eet ik rond een zware trainingsdag?')">Sportvoeding</button><button onclick="ask('Geef een recept voor vanavond')">Dinerrecept</button><button onclick="ask('Tips voor een zware conditietraining')">Conditietraining</button></div><div class="chat-card"><div class="messages" id="messages">${state.chat.map(m=>`<div class="bubble ${m.role}">${esc(m.text)}</div>`).join('')}</div></div><form class="chat-input" onsubmit="sendChat(event)"><input id="chatText" placeholder="Vraag iets over voeding of recepten…"><button>↑</button></form>`}
function addDays(iso,n){let x=new Date(iso+'T12:00:00');x.setDate(x.getDate()+n);return localISO(x)}
function planDay(iso){return planner.find(x=>x.date===iso)||null}
function baseDateForQuestion(){let now=localISO();return planDay(now)?now:state.date}
function resolveQuestionDate(q){
  let t=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  let base=baseDateForQuestion();
  if(/overmorgen/.test(t))return addDays(base,2);
  if(/morgen/.test(t))return addDays(base,1);
  if(/gisteren/.test(t))return addDays(base,-1);
  if(/vandaag|vanavond|deze dag/.test(t))return base;
  const months={januari:1,februari:2,maart:3,april:4,mei:5,juni:6,juli:7,augustus:8,september:9,oktober:10,november:11,december:12};
  let md=t.match(/\b(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\b/);
  if(md){let y=2026,m=String(months[md[2]]).padStart(2,'0'),d=String(+md[1]).padStart(2,'0');return `${y}-${m}-${d}`}
  let numeric=t.match(/\b(\d{1,2})[-\/.](\d{1,2})(?:[-\/.](\d{2,4}))?\b/);
  if(numeric){let y=numeric[3]?+(numeric[3].length===2?'20'+numeric[3]:numeric[3]):2026;return `${y}-${String(+numeric[2]).padStart(2,'0')}-${String(+numeric[1]).padStart(2,'0')}`}
  const weekdays={zondag:0,maandag:1,dinsdag:2,woensdag:3,donderdag:4,vrijdag:5,zaterdag:6};
  for(const [name,target] of Object.entries(weekdays))if(new RegExp('\\b'+name+'\\b').test(t)){
    let x=new Date(base+'T12:00:00'),delta=(target-x.getDay()+7)%7;
    if(delta===0 && /volgende/.test(t))delta=7;
    return addDays(base,delta);
  }
  return state.date;
}
function dayMealPlan(d){
  let b=optionsFor(d.daytype,'ontbijt'),l=optionsFor(d.daytype,'lunch'),sn=optionsFor(d.daytype,'snack')||optionsFor(d.daytype,'tussendoor');
  let rs=d.dinners.map(c=>DATA.recipes.find(r=>r.code===c)).filter(Boolean);
  return {b,l,sn,rs};
}
function describeDay(d){let p=dayMealPlan(d),r=p.rs[0];return `${fmt(d.date)} staat ${d.training} gepland. Ontbijt: ${p.b?.options[0]||'volgens plan'}. Lunch: ${p.l?.options[0]||'volgens plan'}. Snack: ${p.sn?.options[0]||'volgens plan'}. Avondeten: ${r?.name||'een passende maaltijd uit je plan'}. Dagdoel: circa ${Math.round(d.carbs)} g koolhydraten en ${Math.round(d.protein)} g eiwit.`}
function aiAnswer(q){
  let t=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  let targetDate=resolveQuestionDate(q),d=planDay(targetDate);
  if(!d)return `Voor ${new Date(targetDate+'T12:00:00').toLocaleDateString('nl-NL',{day:'numeric',month:'long'})} staat geen dag in je 12-wekenplan. Het plan loopt van ${fmt(planner[0].date)} tot ${fmt(planner.at(-1).date)}.`;
  if(/wat.*eten|moet.*eten|eetplan|menu|maaltijd|vandaag|morgen|overmorgen|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag/.test(t))return describeDay(d);
  if(/gel|sportvoeding|tijdens/.test(t)){
    if(d.daytype==='Rust'||d.daytype==='Herstel')return `Voor ${fmt(d.date)} (${d.training}) heb je geen extra sportvoeding tijdens de sessie nodig.`;
    return `Voor ${fmt(d.date)} (${d.training}): voldoende aan water tijdens de sessie. Bij een langere of zwaardere training kun je elektrolyten of een sportdrank overwegen, en eet binnen een uur na afloop koolhydraten plus 25–35 g eiwit voor herstel.`;
  }
  if(/recept|avond|diner/.test(t)){
    let rs=dayMealPlan(d).rs;
    return `Voor ${fmt(d.date)} passen deze diners: ${rs.map((r,i)=>`${i+1}. ${r.name} (${r.time})`).join(' ')} Mijn eerste keuze is ${rs[0]?.name}. Ingrediënten: ${rs[0]?.ingredients}`;
  }
  if(/afvallen|gewicht/.test(t))return `Met ${state.profile.weight} kg en dit trainingsschema krijgt prestatie voorrang boven snel afvallen. Houd een eventueel tekort klein op rustdagen en eet op kracht- en conditiedagen voldoende koolhydraten.`;
  if(/vegetar/.test(t)){let rs=DATA.recipes.filter(r=>r.type.toLowerCase().includes('veget'));return `Vegetarische opties zijn onder andere ${rs.slice(0,5).map(r=>r.name).join(', ')}.`}
  return `${describeDay(d)} Vraag bijvoorbeeld: “wat eet ik morgen?”, “welke gels heb ik donderdag nodig?” of “geef het recept voor het diner van zondag”.`;
}
function sendChat(e){e.preventDefault();let input=$('#chatText'),q=input.value.trim();if(!q)return;state.chat.push({role:'user',text:q},{role:'ai',text:aiAnswer(q)});store.set('chat',state.chat);render();setTimeout(()=>{let m=$('#messages');if(m)m.scrollTop=m.scrollHeight},50)}function ask(q){state.chat.push({role:'user',text:q},{role:'ai',text:aiAnswer(q)});store.set('chat',state.chat);render()}
function profile(){let min=Math.min(...state.weights,85),max=Math.max(...state.weights,90);return `<div class="profile-card weight-hero"><h2>Doel ${state.profile.target} kg</h2><p>Prestatiegericht, zonder agressief calorietekort</p><div class="weight-stats">Start: ${state.weights[0]} kg<br>Huidig: ${state.profile.weight} kg<br>Lengte: ${state.profile.height} cm</div></div><div class="section-head"><div><h2>Voortgang</h2><p>Gewichtstrend</p></div></div><div class="profile-card"><div class="weight-log">${state.weights.map(w=>`<i style="height:${20+(w-min)/(max-min||1)*90}px" title="${w} kg"></i>`).join('')}</div></div><div class="section-head"><div><h2>Weergave</h2><p>Kies de stijl van de app</p></div></div><div class="profile-card"><div class="theme-toggle"><button class="${state.theme==='dark'?'active':''}" onclick="setTheme('dark')"><span>☾</span> Donker</button><button class="${state.theme==='light'?'active':''}" onclick="setTheme('light')"><span>☀</span> Licht</button></div></div><div class="section-head"><div><h2>Instellingen</h2></div></div><div class="profile-card"><div class="form-row"><div class="field"><label>Gewicht (kg)</label><input id="weightInput" type="number" step="0.1" value="${state.profile.weight}"></div><div class="field"><label>Doelgewicht (kg)</label><input id="targetInput" type="number" step="0.1" value="${state.profile.target}"></div></div><div class="field"><label>Lengte (cm)</label><input id="heightInput" type="number" value="${state.profile.height}"></div><button class="primary" onclick="saveProfile()">Opslaan</button></div>`}
function chooseMeal(m,i){const k=key(m);if(state.choices[k]===i){delete state.choices[k];store.set('choices',state.choices);render();toast('Maaltijd gedeselecteerd');return}state.choices[k]=i;store.set('choices',state.choices);render();toast('Maaltijd gekozen')}function clearMeal(m){delete state.choices[key(m)];store.set('choices',state.choices);render()}function changeDate(v){state.date=v;render()}function toggleShop(i){state.shopping[i].done=!state.shopping[i].done;store.set('shopping',state.shopping);render()}function addCustom(){let n=prompt('Welk product wil je toevoegen?');if(n){state.shopping.push({name:n,done:false,img:pic(n)});store.set('shopping',state.shopping);render()}}function clearShopping(){if(confirm('Boodschappenlijst leegmaken?')){state.shopping=[];store.set('shopping',[]);render()}}function saveProfile(){let w=parseFloat($('#weightInput').value),h=parseInt($('#heightInput').value),t=parseFloat($('#targetInput').value);if(w>40&&h>130){state.profile={...state.profile,weight:w,height:h,target:t};state.weights.push(w);store.set('profile',state.profile);store.set('weights',state.weights);render();toast('Profiel opgeslagen')}}
function render(){let titles={diary:(state.date===localISO()?'Vandaag':fmt(state.date)),weeks:'Planning',shopping:'Boodschappen',coach:'AI voedingscoach',profile:state.profile.name};$('#pageTitle').textContent=titles[state.tab];$('#view').innerHTML=state.tab==='diary'?diary():state.tab==='weeks'?weeks():state.tab==='shopping'?shopping():state.tab==='coach'?coach():profile();document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));window.scrollTo({top:0,behavior:'instant'})}
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;render()});$('#aiQuick').onclick=()=>{state.tab='coach';render()};if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js');render();

/* Recipe database and personalised dinner modes */
state.dinnerMode=store.get('dinnerMode','together');
state.theme=store.get('theme','dark');
applyTheme(state.theme);
state.recipeDb=store.get('recipeDbNlV5',[]);
state.recipeQuery='';
state.recipeDiet='all';
state.recipePage=0;
state.openRecipe=null;
const MEALDB_BASE='https://www.themealdb.com/api/json/v1/1';
const TR=window.NL_RECIPE_TRANSLATOR;

function normaliseMeal(m){
  const ingredients=[];
  for(let i=1;i<=20;i++){
    const ing=(m['strIngredient'+i]||'').trim(), measure=(m['strMeasure'+i]||'').trim();
    if(ing)ingredients.push(TR.ingredient(`${measure} ${ing}`.trim()));
  }
  const categoryRaw=(m.strCategory||'Overig').trim();
  const category=TR.category(categoryRaw);
  const text=`${m.strMeal||''} ${categoryRaw} ${ingredients.join(' ')}`.toLowerCase();
  const vegetarian=categoryRaw.toLowerCase()==='vegetarian'||categoryRaw.toLowerCase()==='vegan'||/tofu|vegetable|lentil|chickpea|bean|mushroom|eggplant|aubergine|falafel|paneer/.test(text)&&!/chicken|beef|pork|lamb|turkey|fish|salmon|tuna|prawn|shrimp|bacon|ham/.test(text);
  const seafood=categoryRaw.toLowerCase()==='seafood'||/salmon|cod|tuna|fish|prawn|shrimp|mussel/.test(text);
  const meat=!vegetarian&&!seafood;
  const steps=(m.strInstructions||'').split(/(?:\r?\n)+|(?<=\.)\s+(?=[A-Z0-9])/).map(x=>x.trim()).filter(x=>x.length>2);
  return {id:m.idMeal,name:TR.title(m.strMeal||'Naamloos recept'),category,area:TR.area(m.strArea||'Internationaal'),photo:m.strMealThumb||pics.default,ingredients,steps:steps.length?steps.map(TR.instruction):[TR.instruction(m.strInstructions||'Geen bereidingswijze beschikbaar.')],source:m.strSource||'',youtube:m.strYoutube||'',vegetarian,seafood,meat};
}
async function loadRecipeDatabase(force=false){
  if(state.recipeDb.length>=300&&!force)return;
  const status=document.querySelector('#recipeStatus'); if(status)status.textContent='Recepten laden…';
  try{
    const letters='abcdefghijklmnopqrstuvwxyz'.split('');
    const batches=[];
    for(let i=0;i<letters.length;i+=5){
      const chunk=letters.slice(i,i+5);
      const res=await Promise.all(chunk.map(c=>fetch(`${MEALDB_BASE}/search.php?f=${c}`).then(r=>r.ok?r.json():null).catch(()=>null)));
      batches.push(...res);
    }
    const map=new Map();
    batches.forEach(js=>(js?.meals||[]).forEach(m=>map.set(m.idMeal,normaliseMeal(m))));
    const meals=[...map.values()];
    if(meals.length<300)throw new Error(`Slechts ${meals.length} recepten ontvangen`);
    state.recipeDb=meals;
    try{store.set('recipeDbNlV5',meals)}catch(e){console.warn('Recipe cache is too large; database remains available this session.',e)}
    toast(`${meals.length} recepten geladen`);
    render();
  }catch(e){
    console.error(e);
    toast('Receptendatabase kon niet volledig laden');
    if(status)status.textContent='Controleer je internetverbinding en probeer opnieuw.';
  }
}
function applyTheme(theme){
  const value=theme==='light'?'light':'dark';
  document.documentElement.dataset.theme=value;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',value==='light'?'#f4f6f4':'#0a0c0b');
}
function setTheme(theme){
  state.theme=theme==='light'?'light':'dark';
  store.set('theme',state.theme);
  applyTheme(state.theme);
  render();
  toast(state.theme==='light'?'Lichte modus ingeschakeld':'Donkere modus ingeschakeld');
}
function getRecipeById(id){return state.recipeDb.find(x=>String(x.id)===String(id))||suggestedRecipes(day(),50).find(x=>String(x.id)===String(id))}
function recipeShareText(r,chosen=false){
  const intro=chosen?'Deze wil ik vanavond eten 😋':'Zullen we dit vanavond eten?';
  const diet=r.vegetarian?'vegetarisch':r.seafood?'vis':'vlees/kip';
  const ingredients=(r.ingredients||[]).slice(0,12).join(', ');
  return `${intro}

${r.name}
Type: ${diet}
Ingrediënten: ${ingredients}${(r.ingredients||[]).length>12?'…':''}

Foto: ${r.photo}`;
}
async function shareRecipe(id,chosen=false){
  const r=getRecipeById(id); if(!r)return;
  const text=recipeShareText(r,chosen);
  if(navigator.share){
    try{await navigator.share({title:r.name,text});toast('Recept gedeeld');return}catch(e){if(e&&e.name==='AbortError')return}
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank','noopener');
}
function chooseAndShare(id){
  chooseDinnerRecipe(id);
  setTimeout(()=>shareRecipe(id,true),80);
}
function modeLabel(){return state.dinnerMode==='together'?'Samen eten':'Alleen eten'}
function setDinnerMode(mode){state.dinnerMode=mode;store.set('dinnerMode',mode);delete state.choices[key('dinnerRecipe')];render();}
function recipeScore(r,d){
  let score=0;
  if(state.dinnerMode==='together'){
    if(r.vegetarian)score+=100;
    else if(r.seafood)score+=35;
    else score-=30;
  }else{
    if(r.meat)score+=65;
    if(/chicken|turkey/i.test(r.name+' '+r.ingredients.join(' ')))score+=35;
    if(r.vegetarian)score+=5;
  }
  if(/pasta|rice|noodle|potato|couscous|risotto/i.test(r.name+' '+r.ingredients.join(' ')))score+=30;
  if(/lange|tempo|interval|wedstrijd/i.test(d.training))score+=/pasta|rice|noodle|potato/i.test(r.name+' '+r.ingredients.join(' '))?35:0;
  score+=(parseInt(r.id||'0',10)+new Date(d.date+'T12:00:00').getDate())%23;
  return score;
}
function suggestedRecipes(d,count=3){
  if(!state.recipeDb.length)return d.dinners.map(c=>DATA.recipes.find(r=>r.code===c)).filter(Boolean).map(r=>({id:r.code,name:r.name,photo:r.photo,category:r.type,ingredients:r.ingredients.split(';').map(x=>x.trim()),steps:[r.prep],vegetarian:/veget/i.test(r.type),seafood:/vis/i.test(r.type),meat:!/veget|vis/i.test(r.type)}));
  return [...state.recipeDb].sort((a,b)=>recipeScore(b,d)-recipeScore(a,d)).slice(0,count);
}
function detailedRecipeCard(r,compact=false){if(!r)return'';return `<article class="recipe-card database-card"><img class="recipe-hero" src="${r.photo}" alt="${esc(r.name)}" loading="lazy"><div class="recipe-body"><h3>${esc(r.name)}</h3><div class="tags"><span class="tag">${esc(r.category||'Recept')}</span><span class="tag">${r.vegetarian?'Vegetarisch':r.seafood?'Vis':'Vlees'}</span><span class="tag">${state.dinnerMode==='together'?'Voor 2 personen':'Voor 1 persoon'}</span></div>${compact?'':`<h4>Ingrediënten</h4><ul class="ingredient-list">${r.ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4>Bereiding stap voor stap</h4><ol class="step-list">${r.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`}<div class="recipe-actions"><button class="primary" onclick="addDbRecipe('${r.id}')">Voeg ingrediënten toe</button>${compact?`<button class="secondary" onclick="openRecipeDetail('${r.id}')">Bekijk volledig recept</button><button class="secondary whatsapp" onclick="shareRecipe('${r.id}')">Deel via WhatsApp</button>`:`<button class="secondary whatsapp" onclick="shareRecipe('${r.id}')">Deel via WhatsApp</button><button class="secondary choice-share" onclick="chooseAndShare('${r.id}')">Deze wil ik vanavond</button>`}</div></div></article>`}
function dinnerSection(d){
  const suggestions=suggestedRecipes(d,3),chosen=state.choices[key('dinnerRecipe')];
  return `<section><div class="section-head"><div><h2>Avondeten</h2><p>${state.dinnerMode==='together'?'Voornamelijk vegetarische opties, voor samen koken':'Meer kip- en vleesopties, voor als je alleen eet'} · tik nogmaals om te deselecteren</p></div></div><div class="mode-toggle"><button class="${state.dinnerMode==='alone'?'active':''}" onclick="setDinnerMode('alone')">Alleen eten</button><button class="${state.dinnerMode==='together'?'active':''}" onclick="setDinnerMode('together')">Samen eten</button></div><div class="meal-card dinner-choices">${suggestions.map((r,i)=>`<div class="meal-option ${chosen===r.id?'selected':''}" onclick="chooseDinnerRecipe('${r.id}')"><img src="${r.photo}" alt="${esc(r.name)}" loading="lazy"><div><h4>${esc(r.name)}</h4><p>${esc(r.category)} · ${r.vegetarian?'Vegetarisch':r.seafood?'Vis':'Vlees'}</p></div><span class="check">${chosen===r.id?'✓':''}</span></div>`).join('')}</div><div class="section-head"><div><h2>Receptdetails</h2><p>Volledige ingrediënten en bereidingsstappen</p></div></div>${suggestions.map(r=>detailedRecipeCard(r)).join('')}</section>`;
}
function chooseDinnerRecipe(id){const k=key('dinnerRecipe');if(state.choices[k]===id){delete state.choices[k];store.set('choices',state.choices);render();toast('Avondmaaltijd gedeselecteerd');return}state.choices[k]=id;store.set('choices',state.choices);render();toast('Avondmaaltijd gekozen')}
function addDbRecipe(id){
  const r=state.recipeDb.find(x=>x.id===id)||suggestedRecipes(day(),20).find(x=>x.id===id);if(!r)return;
  r.ingredients.forEach(name=>{if(!state.shopping.some(x=>x.name===name))state.shopping.push({name,done:false,img:r.photo})});
  store.set('shopping',state.shopping);toast('Ingrediënten toegevoegd');
}
function openRecipeDetail(id){state.openRecipe=id;render();setTimeout(()=>document.querySelector('.recipe-detail-focus')?.scrollIntoView({behavior:'smooth'}),20)}
function recipeLibrary(){
  if(!state.recipeDb.length)return `<div class="recipe-loading"><h2>Receptendatabase</h2><p id="recipeStatus">De database met minimaal 300 recepten wordt geladen. Elk recept bevat een gerechtfoto, ingrediënten en een stap-voor-stapbereiding.</p><button class="primary" onclick="loadRecipeDatabase(true)">Opnieuw laden</button></div>`;
  let q=state.recipeQuery.toLowerCase().trim();
  let items=state.recipeDb.filter(r=>(!q||`${r.name} ${r.category} ${r.area} ${r.ingredients.join(' ')}`.toLowerCase().includes(q))&&(state.recipeDiet==='all'||state.recipeDiet==='vegetarian'&&r.vegetarian||state.recipeDiet==='seafood'&&r.seafood||state.recipeDiet==='meat'&&r.meat));
  const pageSize=24,start=state.recipePage*pageSize,visible=items.slice(start,start+pageSize),open=state.openRecipe?state.recipeDb.find(r=>r.id===state.openRecipe):null;
  return `<div class="recipe-toolbar"><input value="${esc(state.recipeQuery)}" oninput="setRecipeQuery(this.value)" placeholder="Zoek op gerecht of ingrediënt"><select onchange="setRecipeDiet(this.value)"><option value="all" ${state.recipeDiet==='all'?'selected':''}>Alle recepten</option><option value="vegetarian" ${state.recipeDiet==='vegetarian'?'selected':''}>Vegetarisch</option><option value="seafood" ${state.recipeDiet==='seafood'?'selected':''}>Vis</option><option value="meat" ${state.recipeDiet==='meat'?'selected':''}>Kip en vlees</option></select></div><div class="database-summary"><b>${state.recipeDb.length}</b> volledig Nederlandstalige recepten beschikbaar · <b>${items.length}</b> resultaten</div>${open?`<div class="recipe-detail-focus">${detailedRecipeCard(open)}</div>`:''}<div class="recipe-grid">${visible.map(r=>detailedRecipeCard(r,true)).join('')}</div><div class="pagination"><button ${state.recipePage===0?'disabled':''} onclick="recipePage(-1)">Vorige</button><span>Pagina ${state.recipePage+1} van ${Math.max(1,Math.ceil(items.length/pageSize))}</span><button ${start+pageSize>=items.length?'disabled':''} onclick="recipePage(1)">Volgende</button></div>`;
}
function setRecipeQuery(v){state.recipeQuery=v;state.recipePage=0;render()}
function setRecipeDiet(v){state.recipeDiet=v;state.recipePage=0;render()}
function recipePage(n){state.recipePage=Math.max(0,state.recipePage+n);render()}

const oldDiary=diary;
diary=function(){
  let d=day(),m=selectedMacros(d),b=optionsFor(d.daytype,'ontbijt'),l=optionsFor(d.daytype,'lunch'),s=optionsFor(d.daytype,'snack')||optionsFor(d.daytype,'tussendoor');
  return `<div class="hero"><div class="hero-row"><input class="date-control" type="date" value="${d.date}" min="${planner[0].date}" max="${planner.at(-1).date}" onchange="changeDate(this.value)"><span class="training-chip">${esc(d.training)}</span></div><div class="remaining">Je kunt nog <strong>${Math.max(0,m.cal-m.eaten).toLocaleString('nl-NL')}</strong> calorieën eten</div><div class="progress"><i style="width:${m.ratio*100}%"></i></div><div class="progress-label"><span>${m.eaten.toLocaleString('nl-NL')} gegeten</span><span>Doel: ${m.cal.toLocaleString('nl-NL')}</span></div></div><div class="macro-grid">${macro('Koolhydraten',Math.round(m.carbs*m.ratio),m.carbs,'var(--pink)')}${macro('Eiwitten',Math.round(m.protein*m.ratio),m.protein,'var(--blue)')}${macro('Vetten',Math.round(m.fat*m.ratio),m.fat,'var(--orange)')}</div><div class="tip"><b>Focus vandaag:</b> ${esc(d.focus)}<br><b>Training:</b> ${esc(d.fuel)}</div>${mealSection('Ontbijt','breakfast',b)}${mealSection('Lunch','lunch',l)}${mealSection('Snack','snack',s)}${dinnerSection(d)}`;
}
const oldAiAnswer=aiAnswer;
aiAnswer=function(q){
  const t=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const d=planDay(resolveQuestionDate(q))||day();
  const pool=suggestedRecipes(d,30);
  const wantsVeg=/vegetar|zonder vlees|samen/.test(t),wantsMeat=/kip|vlees|alleen eten/.test(t),wantsRecipe=/recept|ingredient|bereid|maken|koken/.test(t);
  if(wantsRecipe||wantsVeg||wantsMeat){
    let choices=pool.filter(r=>wantsVeg?r.vegetarian:wantsMeat?r.meat:true);
    if(!choices.length)choices=pool;
    const named=state.recipeDb.find(r=>t.includes(r.name.toLowerCase()));
    const r=named||choices[0];
    if(r)return `${r.name} past goed bij ${fmt(d.date)}. ${r.vegetarian?'Dit is vegetarisch en daardoor geschikt om samen te eten.':r.seafood?'Dit is een visgerecht.':'Dit is vooral geschikt wanneer je alleen eet.'} Ingrediënten: ${r.ingredients.join(', ')}. Bereiding: ${r.steps.map((s,i)=>`${i+1}. ${s}`).join(' ')}`;
  }
  return oldAiAnswer(q);
}
coach=function(){return `<div class="quick-prompts"><button onclick="ask('Wat moet ik morgen eten?')">Morgen eten</button><button onclick="ask('Geef een vegetarisch recept om samen te eten')">Samen vegetarisch</button><button onclick="ask('Geef een kiprecept als ik alleen eet')">Alleen met kip</button><button onclick="ask('Wat eet ik rond een zware trainingsdag?')">Sportvoeding</button></div><div class="chat-card"><div class="messages" id="messages">${state.chat.map(m=>`<div class="bubble ${m.role}">${esc(m.text)}</div>`).join('')}</div></div><form class="chat-input" onsubmit="sendChat(event)"><input id="chatText" placeholder="Vraag naar een dag, recept of ingrediënt…"><button>↑</button></form>`}
render=function(){
  let titles={diary:(state.date===localISO()?'Vandaag':fmt(state.date)),weeks:'Planning',shopping:'Boodschappen',recipes:'Recepten',coach:'AI voedingscoach',profile:state.profile.name};
  $('#pageTitle').textContent=titles[state.tab]||'Karada Coaches';
  $('#view').innerHTML=state.tab==='diary'?diary():state.tab==='weeks'?weeks():state.tab==='shopping'?shopping():state.tab==='recipes'?recipeLibrary():state.tab==='coach'?coach():profile();
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));window.scrollTo({top:0,behavior:'instant'});
}
// Rebind because the recipes tab was added to the navigation.
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;render()});
loadRecipeDatabase(false);
render();
