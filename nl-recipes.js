window.NL_RECIPE_TRANSLATOR=(()=>{
  const wordMap={
    chicken:'kip',beef:'rundvlees',pork:'varkensvlees',lamb:'lamsvlees',turkey:'kalkoen',duck:'eend',salmon:'zalm',tuna:'tonijn',cod:'kabeljauw',fish:'vis',prawn:'garnaal',prawns:'garnalen',shrimp:'garnaal',shrimps:'garnalen',mussels:'mosselen',bacon:'spek',ham:'ham',sausage:'worst',sausages:'worsten',meat:'vlees',minced:'gehakt',ground:'gehakt',steak:'biefstuk',breast:'filet',thigh:'dij',fillet:'filet',fillets:'filets',egg:'ei',eggs:'eieren',milk:'melk',cream:'room',cheese:'kaas',butter:'boter',yogurt:'yoghurt',yoghurt:'yoghurt',rice:'rijst',pasta:'pasta',noodles:'noedels',potato:'aardappel',potatoes:'aardappelen',bread:'brood',flour:'bloem',oats:'havermout',oatmeal:'havermout',quinoa:'quinoa',couscous:'couscous',beans:'bonen',bean:'boon',lentils:'linzen',lentil:'linze',chickpeas:'kikkererwten',chickpea:'kikkererwt',tofu:'tofu',tempeh:'tempeh',tomato:'tomaat',tomatoes:'tomaten',onion:'ui',onions:'uien',garlic:'knoflook',pepper:'peper',peppers:'paprika',carrot:'wortel',carrots:'wortelen',mushroom:'champignon',mushrooms:'champignons',spinach:'spinazie',broccoli:'broccoli',cauliflower:'bloemkool',cabbage:'kool',courgette:'courgette',zucchini:'courgette',aubergine:'aubergine',eggplant:'aubergine',peas:'erwten',corn:'maïs',sweetcorn:'maïs',cucumber:'komkommer',lettuce:'sla',avocado:'avocado',lemon:'citroen',lime:'limoen',apple:'appel',banana:'banaan',orange:'sinaasappel',strawberry:'aardbei',strawberries:'aardbeien',blueberries:'blauwe bessen',blueberry:'blauwe bes',honey:'honing',sugar:'suiker',salt:'zout',oil:'olie',olive:'olijf',vinegar:'azijn',mustard:'mosterd',mayonnaise:'mayonaise',soy:'soja',ginger:'gember',curry:'curry',paprika:'paprikapoeder',cumin:'komijn',coriander:'koriander',parsley:'peterselie',basil:'basilicum',oregano:'oregano',thyme:'tijm',rosemary:'rozemarijn',chives:'bieslook',cinnamon:'kaneel',vanilla:'vanille',chocolate:'chocolade',coconut:'kokos',almonds:'amandelen',walnuts:'walnoten',peanuts:'pinda\'s',cashews:'cashewnoten',stock:'bouillon',broth:'bouillon',water:'water',wine:'wijn',beer:'bier',sauce:'saus',soup:'soep',salad:'salade',pie:'taart',cake:'cake',cookies:'koekjes',pancakes:'pannenkoeken',pancake:'pannenkoek',omelette:'omelet',sandwich:'sandwich',wrap:'wrap',bowl:'bowl',burger:'burger',stew:'stoofpot',roast:'gebraad',grilled:'gegrild',baked:'gebakken',fried:'gebakken',vegetable:'groente',vegetables:'groenten',vegetarian:'vegetarisch',vegan:'veganistisch',seafood:'vis en zeevruchten',dessert:'dessert',breakfast:'ontbijt',starter:'voorgerecht',side:'bijgerecht',miscellaneous:'overig'
  };
  const phrases=[
    [/preheat the oven to/gi,'verwarm de oven voor op'],[/heat the oven to/gi,'verwarm de oven tot'],[/bring to the boil/gi,'breng aan de kook'],[/bring to a boil/gi,'breng aan de kook'],[/reduce the heat/gi,'zet het vuur lager'],[/simmer for/gi,'laat zachtjes koken gedurende'],[/cook for/gi,'kook gedurende'],[/bake for/gi,'bak in de oven gedurende'],[/fry for/gi,'bak gedurende'],[/stir in/gi,'roer erdoor'],[/stir well/gi,'roer goed door'],[/mix well/gi,'meng goed'],[/mix together/gi,'meng samen'],[/add the/gi,'voeg de'],[/add/gi,'voeg toe'],[/season with salt and pepper/gi,'breng op smaak met zout en peper'],[/season to taste/gi,'breng op smaak'],[/serve immediately/gi,'serveer direct'],[/serve hot/gi,'serveer warm'],[/set aside/gi,'zet apart'],[/leave to cool/gi,'laat afkoelen'],[/allow to cool/gi,'laat afkoelen'],[/chop finely/gi,'snijd fijn'],[/finely chop/gi,'snijd fijn'],[/roughly chop/gi,'snijd grof'],[/slice thinly/gi,'snijd in dunne plakjes'],[/cut into/gi,'snijd in'],[/peel and chop/gi,'schil en snijd'],[/drain and rinse/gi,'giet af en spoel'],[/drain/gi,'giet af'],[/rinse/gi,'spoel af'],[/whisk together/gi,'klop samen'],[/whisk/gi,'klop'],[/fold in/gi,'spatel erdoor'],[/pour into/gi,'giet in'],[/place in/gi,'leg in'],[/place the/gi,'leg de'],[/cover and cook/gi,'dek af en kook'],[/until golden brown/gi,'tot goudbruin'],[/until tender/gi,'tot gaar'],[/until soft/gi,'tot zacht'],[/over medium heat/gi,'op middelhoog vuur'],[/over low heat/gi,'op laag vuur'],[/over high heat/gi,'op hoog vuur'],[/in a large pan/gi,'in een grote pan'],[/in a bowl/gi,'in een kom'],[/with a wooden spoon/gi,'met een houten lepel'],[/for 10 minutes/gi,'gedurende 10 minuten'],[/for 15 minutes/gi,'gedurende 15 minuten'],[/for 20 minutes/gi,'gedurende 20 minuten'],[/for 30 minutes/gi,'gedurende 30 minuten'],[/for 1 hour/gi,'gedurende 1 uur']
  ];
  const units={tbsp:'el',tablespoon:'eetlepel',tablespoons:'eetlepels',tsp:'tl',teaspoon:'theelepel',teaspoons:'theelepels',cup:'kop',cups:'koppen',oz:'g',lb:'g',lbs:'g',pinch:'snufje',clove:'teen',cloves:'tenen',can:'blik',cans:'blikken',packet:'pakje',packets:'pakjes'};
  const titleCase=s=>s.replace(/\b\w/g,c=>c.toUpperCase());
  function words(text){
    if(!text)return'';
    return text.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g,w=>{
      const k=w.toLowerCase();const v=wordMap[k]||units[k];
      if(!v)return w;
      return /^[A-Z]/.test(w)?v.charAt(0).toUpperCase()+v.slice(1):v;
    });
  }
  function title(text){
    let s=words(text);
    s=s.replace(/\bwith\b/gi,'met').replace(/\band\b/gi,'en').replace(/\bin\b/gi,'in').replace(/\bof\b/gi,'van').replace(/\bthe\b/gi,'de').replace(/\bstyle\b/gi,'stijl');
    return titleCase(s.toLowerCase()).replace(/\bEn\b/g,'en').replace(/\bMet\b/g,'met').replace(/\bVan\b/g,'van');
  }
  function ingredient(text){
    let s=words(text);
    s=s.replace(/\bof\b/gi,'of').replace(/\bto taste\b/gi,'naar smaak').replace(/\bdivided\b/gi,'verdeeld').replace(/\bchopped\b/gi,'fijngesneden').replace(/\bdiced\b/gi,'in blokjes').replace(/\bsliced\b/gi,'in plakjes').replace(/\bgrated\b/gi,'geraspt').replace(/\bmelted\b/gi,'gesmolten').replace(/\boptional\b/gi,'optioneel').replace(/\bfresh\b/gi,'vers').replace(/\bdried\b/gi,'gedroogd');
    return s.replace(/\s+/g,' ').trim();
  }
  function instruction(text){
    let s=text||'';phrases.forEach(([a,b])=>s=s.replace(a,b));s=words(s);
    s=s.replace(/\bthen\b/gi,'daarna').replace(/\band\b/gi,'en').replace(/\buntil\b/gi,'tot').replace(/\bminutes\b/gi,'minuten').replace(/\bminute\b/gi,'minuut').replace(/\bhours\b/gi,'uur').replace(/\bhour\b/gi,'uur').replace(/\bthe mixture\b/gi,'het mengsel').replace(/\bthe pan\b/gi,'de pan').replace(/\bthe oven\b/gi,'de oven').replace(/\bthe bowl\b/gi,'de kom').replace(/\bthe sauce\b/gi,'de saus').replace(/\bthe dough\b/gi,'het deeg');
    return s.replace(/\s+/g,' ').trim();
  }
  function category(s){return title(s||'Overig')}
  function area(s){const m={American:'Amerikaans',British:'Brits',Canadian:'Canadees',Chinese:'Chinees',Croatian:'Kroatisch',Dutch:'Nederlands',Egyptian:'Egyptisch',Filipino:'Filipijns',French:'Frans',Greek:'Grieks',Indian:'Indiaas',Irish:'Iers',Italian:'Italiaans',Jamaican:'Jamaicaans',Japanese:'Japans',Kenyan:'Keniaans',Malaysian:'Maleisisch',Mexican:'Mexicaans',Moroccan:'Marokkaans',Polish:'Pools',Portuguese:'Portugees',Russian:'Russisch',Spanish:'Spaans',Thai:'Thais',Tunisian:'Tunesisch',Turkish:'Turks',Vietnamese:'Vietnamees'};return m[s]||s||'Internationaal'}
  return {title,ingredient,instruction,category,area};
})();
