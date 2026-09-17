import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const app=read('app/app.js'),training=read('app/training.js'),clientCloud=read('app/cloud-client.js'),coach=read('coach/app.js'),coachCloud=read('coach/cloud-coach.js');

for(const [name,source] of [['app',app],['training',training],['client cloud',clientCloud],['coach',coach],['coach cloud',coachCloud]])assert.doesNotThrow(()=>new vm.Script(source),`${name} bevat ongeldige JavaScript`);

function functionSource(source,name){
  const start=source.indexOf(`function ${name}(`);assert.notEqual(start,-1,`${name} ontbreekt`);let brace=source.indexOf('{',start),depth=0;
  for(let i=brace;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&--depth===0)return source.slice(start,i+1)}
  throw new Error(`${name} kon niet worden gelezen`);
}

const context={};vm.createContext(context);vm.runInContext(`const NUMBER_WORDS={een:1,één:1,twee:2,drie:3,vier:4,vijf:5,zes:6,zeven:7,acht:8,negen:9,tien:10,halve:.5,half:.5};function normalizeFoodTerm(value){return value.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/\\b(gekookt|bereid|rauw|ongezoet|gram|gr)\\b/g,' ').replace(/\\s+/g,' ').trim()}${functionSource(app,'amountNumber')}${functionSource(app,'mealIngredientsFromText')}`,context);vm.runInContext(functionSource(app,'reportDateFromText'),context);
const ingredients=JSON.parse(JSON.stringify(context.mealIngredientsFromText('ik heb voor ontbijt 30 gram havermout 30 gram whey proteine en 5g 85% donkere chocola gegeten')));
assert.deepEqual(ingredients.map(x=>[x.amount,x.term]),[[30,'havermout'],[30,'whey proteine'],[5,'85% donkere chocola']]);
const varied=JSON.parse(JSON.stringify(context.mealIngredientsFromText('3 eieren, 2 sneetjes volkorenbrood en 30 g MyProtein Impact Whey Vanille')));
assert.deepEqual(varied.map(x=>[x.amount,x.unit,x.term]),[[3,'stuk','eieren'],[2,'sneetjes','volkorenbrood'],[30,'g','myprotein impact whey vanille']]);
assert.equal(context.reportDateFromText('Afname: 13-05-2026'),'2026-05-13');
assert.equal(context.reportDateFromText('Rapport zonder datum'),'');

assert.match(app,/Ontbijt.*Snack 1.*Lunch.*Snack 2.*Avondeten.*Snack 3/s);
assert.match(app,/state\.photoEntries/);assert.match(app,/state\.skinfoldEntries/);assert.match(app,/checkInDate/);
assert.match(app,/Goedenacht.*Goedemorgen.*Goedemiddag.*Goedenavond/s);
assert.match(training,/trainingBuilder/);assert.match(training,/progressie/);assert.match(training,/regressie/);
assert.match(app,/Jouw uitslag in gewone taal/);assert.match(app,/Plan van aanpak/);
assert.doesNotMatch(read('app/index.html'),/coachportaal/i);
assert.match(read('coach/index.html'),/data-view="clients"/);assert.doesNotMatch(coach,/Sophie de Vries|Daan Jansen|Mila Bakker/);
assert.match(clientCloud,/client_plan_assignments/);assert.match(coachCloud,/coach_profiles/);
assert.ok(fs.existsSync(path.join(root,'supabase/schema.sql')));

console.log('Karada smoke tests: alle controles geslaagd.');
