-- Vervang eerst het e-mailadres. Voer dit uit nadat je één keer via het coachportaal
-- een magic link hebt aangevraagd, zodat de gebruiker in auth.users bestaat.
insert into public.coach_profiles (id,email,name)
select id,lower(email),'Karada Coach'
from auth.users
where lower(email)=lower('VUL-HIER-JOUW-COACH-EMAIL-IN')
on conflict (id) do update set email=excluded.email;
