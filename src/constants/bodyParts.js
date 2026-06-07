/** Body-part labels — multi-select supported. */
export const BODY_PARTS = [
  '가슴',
  '등',
  '하체',
  '어깨',
  '팔',
  '코어',
  '유산소',
  '기타',
];

/** Strength stats grid order (excludes cardio). */
export const STRENGTH_BODY_PARTS = [
  '등',
  '어깨',
  '가슴',
  '팔',
  '코어',
  '하체',
  '기타',
];

export const CARDIO_PART = '유산소';

export const DEFAULT_BODY_PARTS = ['가슴'];

export const normalizeBodyParts = value => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string' && value) {
    return [value];
  }
  return [];
};

export const isCardioExercise = parts =>
  normalizeBodyParts(parts).includes(CARDIO_PART);

export const formatBodyPartsLabel = parts => normalizeBodyParts(parts).join(' · ');

export const toggleBodyPart = (selected, part) => {
  const list = normalizeBodyParts(selected);
  if (list.includes(part)) {
    return list.filter(p => p !== part);
  }
  return [...list, part];
};
