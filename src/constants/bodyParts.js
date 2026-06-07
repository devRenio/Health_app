/** Body-part labels — multi-select supported. */
export const BODY_PARTS = ['가슴', '등', '하체', '어깨', '팔', '코어', '기타'];

export const DEFAULT_BODY_PARTS = ['가슴'];

/** Normalize legacy string or array to string[]. */
export const normalizeBodyParts = value => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'string' && value) {
    return [value];
  }
  return [];
};

export const formatBodyPartsLabel = parts => normalizeBodyParts(parts).join(' · ');

export const toggleBodyPart = (selected, part) => {
  const list = normalizeBodyParts(selected);
  if (list.includes(part)) {
    return list.filter(p => p !== part);
  }
  return [...list, part];
};
