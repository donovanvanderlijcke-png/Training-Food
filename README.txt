KARADA PERFORMANCE DASHBOARD

SNEL TESTEN MET GITHUB PAGES
1. Maak een nieuwe GitHub-repository.
2. Upload alle bestanden uit deze map naar de hoofdmap van de repository.
3. Open Settings > Pages.
4. Kies bij Source: Deploy from a branch.
5. Selecteer main en / (root), en klik Save.
6. Open de URL die GitHub Pages toont.
7. Test het aparte coachportaal via dezelfde URL met /coach-portal/ erachter.

Er is geen build-stap nodig. De app bestaat uit HTML, CSS en JavaScript.

BELANGRIJK
- Gegevens worden in deze testversie lokaal in de browser opgeslagen.
- Open Food Facts wordt gebruikt voor product- en barcodegegevens.
- De algemene receptenbibliotheek gebruikt TheMealDB.
- HelloFresh, Picnic en Albert Heijn blijven officiële externe receptbronnen; hun volledige databases mogen niet zonder toestemming worden gekopieerd.
- Het coachportaal staat voor deze GitHub-test in de map /coach-portal/. GitHub Pages biedt zelf geen beveiligde toegangscontrole.
- Voor productie horen coach- en klantaccounts achter een beveiligde login en delen zij gegevens via een backend/database.
- Foto- en PDF-analyse in Longevity gebruikt browserbibliotheken via internet.
- Medische uitleg is informatief en stelt geen diagnose.

BELANGRIJKSTE ONDERDELEN
- Home: gewicht, trainingsplan, voeding, leeromgeving, Longevity en check-in.
- Training: persoonlijk weekschema en workouts.
- Voeding: zes eetmomenten, vrije maaltijdinvoer, automatische macroberekening, productzoeker, barcodescan en recepten.
- Planning: kalender, hersteladvies en coachdoelen.
- Check-in: gewicht, voortgangsfoto's en huidplooimeting.
- Longevity: rapportupload, uitleg in gewone taal, plan van aanpak, trends en vergelijking.
- Coachportaal: apart scherm voor voeding, weekplanning en trainingsschema's per klant.

BESTANDEN
- index.html: pagina en navigatie.
- styles.css: volledige vormgeving.
- app.js: dashboard, voeding, planning, check-in en Longevity.
- training.js en training-data.js: workouts en trainingslogica.
- data.js en nl-recipes.js: voorbeelddata en receptenondersteuning.
- coach-portal/: afzonderlijk coachportaal voor de GitHub-test.
