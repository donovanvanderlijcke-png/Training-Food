KARADA COACHES

1. Upload deze hele map naar Netlify Drop, GitHub Pages of Vercel.
2. Open de publieke URL in Safari op je iPhone (of Chrome op Android).
3. Tik op Deel > Zet op beginscherm.

Geen build-stap nodig: alles is losse HTML/CSS/JS. De ingebouwde AI-coach werkt lokaal en beantwoordt vragen op basis van het trainingsschema, de voeding en de recepten. Alle keuzes, boodschappen, chat en gewichtsmetingen worden lokaal op het toestel opgeslagen (localStorage) — er is geen server of database.

TABS
- Dagboek: dagmenu op basis van het type training van die dag (Kracht/Conditie/Rust/Herstel), met macro-doelen die meebewegen.
- Planning: het volledige trainingsschema, week voor week, rollend vanaf vandaag.
- Training: krachttrainingen met sets/reps/gewicht, wisselen naar progressie/regressie, rusttimer en geschiedenis per oefening.
- Boodschappen: lijst opbouwen per recept of per week.
- Recepten: eigen curated dinerrecepten plus een live gekoppelde database van 300+ recepten via TheMealDB, automatisch naar het Nederlands vertaald, deelbaar via WhatsApp.
- AI coach: lokale assistent die vragen beantwoordt over het schema, voeding en recepten.
- Ik: gewicht bijhouden, donker/licht thema, profielinstellingen.

DATA AANPASSEN
- data.js bevat het generieke weekschema (dagtype, macro's, dinerkeuzes) en de dinerrecepten. Dit is nu een sjabloon (Kracht/Conditie/Rust/Herstel) zonder koppeling aan een specifieke klant — pas dit per klant aan, of bouw er een koppeling naar het coach-dashboard op.
- training-data.js bevat de krachttrainingen en oefeningen (los van data.js, makkelijk uit te breiden).
- Voor de openbare productieversie van de Recepten-tab wordt een eigen TheMealDB supporter/API-sleutel aanbevolen.

GESCHIEDENIS
Dit project begon als een persoonlijke marathon-voedingscoach-app (voedingsplan gekoppeld aan hardlooptraining, incl. 12-wekenschema en gelplanning). Die marathon-specifieke inhoud is eruit gehaald; de opzet (PWA, dagboek, boodschappen, receptendatabase, AI-coach, donker/licht thema) vormt nu de basis voor de Karada-klantapp, aangevuld met de Training-tab.
