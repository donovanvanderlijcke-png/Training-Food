window.TRAINING_DATA = {
  levels: ['Beginner', 'Gemiddeld', 'Gevorderd'],
  workouts: [
    {
      id: 'w1', title: 'Onderlichaam kracht', phase: 'Fase 2 — Opbouw', category: 'Kracht', duration: 50, featured: true,
      coachNote: 'Verhoog de back squat met 2,5 kg ten opzichte van vorige week. Focus op een gecontroleerde afdaling.',
      exercises: [
        { id: 'w1e1', name: 'Back squat', setsCount: 4, targetReps: 6, targetWeight: 80, restSec: 150, level: 'Gevorderd',
          history: [67.5, 70, 72.5, 75, 77.5],
          tip: 'Houd je borst hoog en zak door je heupen en knieën tegelijk. Adem in tijdens de afdaling, adem uit bij het opdrukken.',
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Goblet squat', targetReps: 10, targetWeight: 20, restSec: 90 },
            { id: 'progressie1', type: 'progressie', name: 'Front squat', targetReps: 5, targetWeight: 55, restSec: 150 },
            { id: 'variant1', type: 'variant', name: 'Safety bar squat', targetReps: 6, targetWeight: 70, restSec: 150 }
          ] },
        { id: 'w1e2', name: 'Romanian deadlift', setsCount: 3, targetReps: 8, targetWeight: 60, restSec: 120, level: 'Gemiddeld',
          history: [50, 52.5, 55, 57.5, 60],
          tip: 'Houd een lichte buiging in de knieën en beweeg vanuit de heup. Voel de stretch in de hamstrings, niet in de onderrug.',
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Hip thrust', targetReps: 10, targetWeight: 60, restSec: 90 },
            { id: 'progressie1', type: 'progressie', name: 'Single-leg Romanian deadlift', targetReps: 8, targetWeight: 24, restSec: 120 },
            { id: 'variant1', type: 'variant', name: 'Bulgaarse split squat', targetReps: 10, targetWeight: 20, restSec: 90 }
          ] },
        { id: 'w1e3', name: 'Bulgaarse split squat', setsCount: 3, targetReps: 10, targetWeight: 20, restSec: 90, level: 'Gemiddeld',
          history: [14, 16, 16, 18, 20],
          tip: 'Zet je achterste voet stabiel op de bank. Laat je voorste knie in lijn met je voet zakken.',
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Reverse lunge', targetReps: 10, targetWeight: 16, restSec: 90 },
            { id: 'progressie1', type: 'progressie', name: 'Pistol squat naar box', targetReps: 6, targetWeight: 0, restSec: 90 },
            { id: 'variant1', type: 'variant', name: 'Step-up', targetReps: 10, targetWeight: 16, restSec: 90 }
          ] },
        { id: 'w1e4', name: 'Leg press', setsCount: 3, targetReps: 12, targetWeight: 120, restSec: 90, level: 'Beginner',
          history: [100, 105, 110, 115, 120],
          tip: 'Plaats je voeten op schouderbreedte en duw door je hielen. Vermijd het volledig strekken van de knieën.',
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Leg extensie', targetReps: 12, targetWeight: 40, restSec: 90 },
            { id: 'progressie1', type: 'progressie', name: 'Hack squat', targetReps: 10, targetWeight: 100, restSec: 120 }
          ] },
        { id: 'w1e5', name: 'Kabel rows', setsCount: 3, targetReps: 12, targetWeight: 45, restSec: 60, level: 'Beginner',
          history: [35, 38, 40, 42, 45],
          tip: 'Trek je schouderbladen naar elkaar toe voordat je je ellebogen buigt.',
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Geassisteerde rug row', targetReps: 12, targetWeight: 30, restSec: 60 },
            { id: 'progressie1', type: 'progressie', name: 'Barbell row', targetReps: 8, targetWeight: 50, restSec: 90 }
          ] },
        { id: 'w1e6', name: 'Plank', setsCount: 3, targetReps: 45, targetWeight: 0, restSec: 60, unitOverride: 'sec', level: 'Beginner',
          history: [30, 35, 35, 40, 45],
          tip: 'Houd een rechte lijn van hoofd tot hiel. Span je bilspieren en buik actief aan.',
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Plank op de knieën', targetReps: 30, targetWeight: 0, restSec: 45, unitOverride: 'sec' },
            { id: 'progressie1', type: 'progressie', name: 'Plank met gewichtsschijf', targetReps: 45, targetWeight: 5, restSec: 60, unitOverride: 'sec' }
          ] }
      ]
    },
    {
      id: 'w2', title: 'Bovenlichaam push', phase: 'Fase 2 — Opbouw', category: 'Kracht', duration: 45,
      exercises: [
        { id: 'w2e1', name: 'Bench press', setsCount: 4, targetReps: 6, targetWeight: 65, restSec: 150, level: 'Gemiddeld',
          history: [55, 57.5, 60, 62.5, 65],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Dumbbell chest press', targetReps: 8, targetWeight: 22, restSec: 120 },
            { id: 'progressie1', type: 'progressie', name: 'Close-grip bench press', targetReps: 5, targetWeight: 55, restSec: 150 }
          ] },
        { id: 'w2e2', name: 'Overhead press', setsCount: 3, targetReps: 8, targetWeight: 35, restSec: 120, level: 'Gemiddeld',
          history: [28, 30, 32, 32, 35],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Zittende dumbbell shoulder press', targetReps: 10, targetWeight: 14, restSec: 90 },
            { id: 'progressie1', type: 'progressie', name: 'Push press', targetReps: 5, targetWeight: 40, restSec: 120 }
          ] },
        { id: 'w2e3', name: 'Incline dumbbell press', setsCount: 3, targetReps: 10, targetWeight: 22, restSec: 90, level: 'Beginner',
          history: [18, 18, 20, 20, 22],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Push-up op de knieën', targetReps: 12, targetWeight: 0, restSec: 60 },
            { id: 'variant1', type: 'variant', name: 'Machine chest press', targetReps: 10, targetWeight: 40, restSec: 90 }
          ] },
        { id: 'w2e4', name: 'Triceps dips', setsCount: 3, targetReps: 12, targetWeight: 0, restSec: 60, level: 'Gemiddeld',
          history: [8, 9, 10, 11, 12],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Triceps kickback', targetReps: 15, targetWeight: 6, restSec: 45 },
            { id: 'progressie1', type: 'progressie', name: 'Dips met extra gewicht', targetReps: 10, targetWeight: 10, restSec: 60 }
          ] },
        { id: 'w2e5', name: 'Lateral raises', setsCount: 3, targetReps: 15, targetWeight: 8, restSec: 60, level: 'Beginner',
          history: [6, 6, 7, 8, 8],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Kabel lateral raise', targetReps: 15, targetWeight: 5, restSec: 45 },
            { id: 'progressie1', type: 'progressie', name: 'Lu raises', targetReps: 12, targetWeight: 8, restSec: 60 }
          ] }
      ]
    },
    {
      id: 'w3', title: 'Tempo intervallen', category: 'Conditie', duration: 30,
      exercises: [
        { id: 'w3e1', name: 'Airbike sprint', setsCount: 6, targetReps: 30, targetWeight: 0, restSec: 90, unitOverride: 'sec', level: 'Beginner',
          history: [20, 22, 25, 28, 30],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Fietsergometer sprint', targetReps: 30, targetWeight: 0, restSec: 90, unitOverride: 'sec' },
            { id: 'variant1', type: 'variant', name: 'Row erg sprint', targetReps: 30, targetWeight: 0, restSec: 90, unitOverride: 'sec' }
          ] },
        { id: 'w3e2', name: 'Row erg', setsCount: 4, targetReps: 500, targetWeight: 0, restSec: 120, unitOverride: 'm', level: 'Beginner',
          history: [400, 425, 450, 475, 500],
          alternatives: [
            { id: 'variant1', type: 'variant', name: 'Ski erg', targetReps: 500, targetWeight: 0, restSec: 120, unitOverride: 'm' }
          ] },
        { id: 'w3e3', name: 'Kettlebell swing', setsCount: 4, targetReps: 20, targetWeight: 16, restSec: 60, level: 'Gemiddeld',
          history: [12, 14, 14, 16, 16],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Kettlebell deadlift', targetReps: 15, targetWeight: 16, restSec: 60 },
            { id: 'progressie1', type: 'progressie', name: 'Zware kettlebell swing', targetReps: 20, targetWeight: 24, restSec: 60 }
          ] },
        { id: 'w3e4', name: 'Burpees', setsCount: 3, targetReps: 15, targetWeight: 0, restSec: 60, level: 'Gemiddeld',
          history: [10, 11, 12, 13, 15],
          alternatives: [
            { id: 'regressie1', type: 'regressie', name: 'Step-back burpee', targetReps: 15, targetWeight: 0, restSec: 60 },
            { id: 'progressie1', type: 'progressie', name: 'Burpee met pull-up', targetReps: 10, targetWeight: 0, restSec: 75 }
          ] }
      ]
    },
    {
      id: 'w4', title: 'Mobiliteit en herstel', category: 'Herstel', duration: 20,
      exercises: [
        { id: 'w4e1', name: 'Hip flexor stretch', setsCount: 2, targetReps: 60, targetWeight: 0, restSec: 20, unitOverride: 'sec', level: 'Beginner',
          history: [30, 40, 45, 50, 60],
          alternatives: [{ id: 'variant1', type: 'variant', name: 'Couch stretch', targetReps: 60, targetWeight: 0, restSec: 20, unitOverride: 'sec' }] },
        { id: 'w4e2', name: 'Thoracale rotaties', setsCount: 2, targetReps: 10, targetWeight: 0, restSec: 20, level: 'Beginner',
          history: [6, 8, 8, 10, 10],
          alternatives: [{ id: 'variant1', type: 'variant', name: 'Cat-cow', targetReps: 10, targetWeight: 0, restSec: 20 }] },
        { id: 'w4e3', name: 'Foam roll quadriceps', setsCount: 2, targetReps: 45, targetWeight: 0, restSec: 15, unitOverride: 'sec', level: 'Beginner',
          history: [30, 30, 35, 40, 45],
          alternatives: [{ id: 'variant1', type: 'variant', name: 'Foam roll hamstrings', targetReps: 45, targetWeight: 0, restSec: 15, unitOverride: 'sec' }] },
        { id: 'w4e4', name: 'Band pull-aparts', setsCount: 2, targetReps: 15, targetWeight: 0, restSec: 20, level: 'Beginner',
          history: [10, 10, 12, 12, 15],
          alternatives: [{ id: 'variant1', type: 'variant', name: 'Face pulls', targetReps: 15, targetWeight: 5, restSec: 20 }] },
        { id: 'w4e5', name: 'Diepe squat hold', setsCount: 2, targetReps: 60, targetWeight: 0, restSec: 20, unitOverride: 'sec', level: 'Beginner',
          history: [30, 35, 40, 45, 60],
          alternatives: [{ id: 'regressie1', type: 'regressie', name: 'Ondersteunde diepe squat hold', targetReps: 45, targetWeight: 0, restSec: 20, unitOverride: 'sec' }] }
      ]
    }
  ]
};
