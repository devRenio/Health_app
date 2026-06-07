/**
 * Default "big 3" exercises seeded on first launch.
 */
export const DEFAULT_EXERCISES = [
  {id: 'squat', name: '스쿼트', bodyParts: ['하체'], isDefault: true},
  {id: 'bench', name: '벤치프레스', bodyParts: ['가슴'], isDefault: true},
  {id: 'deadlift', name: '데드리프트', bodyParts: ['등'], isDefault: true},
];

export const DEFAULT_WEIGHT_BY_ID = {
  squat: 60,
  bench: 40,
  deadlift: 80,
};

export const DEFAULT_REPS = 8;

export const DEFAULT_CARDIO_MINUTES = 20;
