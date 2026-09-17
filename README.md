# Karada Performance – testversie

Deze map bevat twee strikt gescheiden websites:

- Klantenapp: `/app/`
- Coachportaal: `/coach/`

De klantenapp bevat nergens een link of knop naar het coachportaal. Zodra Supabase is ingesteld, kunnen klanten alleen inloggen met een e-mailadres dat de coach eerst onder **Klanten** heeft toegevoegd. Het coachportaal controleert daarnaast of het ingelogde account coachrechten heeft.

## Snel testen via GitHub Pages

1. Upload de volledige inhoud van deze map naar de hoofdmap van je GitHub-repository.
2. Open in GitHub **Settings → Pages**.
3. Kies **Deploy from a branch**, selecteer `main` en map `/ (root)`.
4. Open de Pages-link. De hoofdlink stuurt automatisch door naar de klantenapp.
5. Het coachportaal staat op dezelfde link met `/coach/` erachter.

Zonder Supabase-gegevens draait de interface bewust in lokale demomodus. Gegevens blijven dan alleen in de browser waarin je ze invoert. Voor echte koppeling tussen laptop en telefoon volg je de stappen hieronder.

## Supabase één keer instellen

1. Open de SQL Editor in je Supabase-project en voer `supabase/schema.sql` uit.
2. Kopieer bij **Project settings → API** de Project URL en de publieke anon key.
3. Vul die twee waarden in bij:
   - `app/supabase-config.js`
   - `coach/supabase-config.js`
4. Zet in Supabase bij **Authentication → URL Configuration** je GitHub Pages-adres bij Site URL en Redirect URLs. Voeg zowel `/app/` als `/coach/` toe.
5. Open het coachportaal en vraag één keer een inloglink aan met jouw coach-e-mailadres.
6. Vervang het e-mailadres in `supabase/activate-coach.sql` en voer dat bestand uit in de SQL Editor.
7. Log opnieuw in op `/coach/`, voeg een klant toe en wijs een schema of voedingsplan toe.
8. De klant opent `/app/` en gebruikt exact het e-mailadres dat in het coachportaal staat.

Gebruik nooit een `service_role` key in deze bestanden. Alleen de publieke anon key hoort in de browser; de beveiliging staat in de meegeleverde RLS-regels.

## Controle uitvoeren

Met Node.js 18 of nieuwer:

```bash
node tests/smoke.mjs
```

De controle test onder meer de zes eetmomenten, de voorbeeldzin voor voeding, rapportdatums, de gescheiden coachroute en de aanwezigheid van de cloudkoppeling.

De voedingsinvoer ondersteunt ook aantallen, porties en merknamen, bijvoorbeeld `3 eieren`, `2 sneetjes volkorenbrood`, `1 scoop whey` en `30 g MyProtein Impact Whey`. Een gevonden product wordt altijd eerst ter controle getoond voordat de macro’s worden toegevoegd.
