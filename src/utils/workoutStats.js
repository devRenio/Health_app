/**
 * Pure helpers for calendar summaries and editor defaults.
 */
import {
  normalizeBodyParts,
  formatBodyPartsLabel,
  isCardioExercise,
} from '../constants/bodyParts';
import {formatTime} from './dateUtils';

export const isCardioRecord = record =>
  isCardioExercise(record.bodyParts ?? record.bodyPart);

export const calcSetVolume = set => {
  if (set.minutes != null) {
    return 0;
  }
  return (set.weight || 0) * (set.reps || 0);
};

export const calcRecordVolume = record =>
  (record.sets ?? []).reduce((sum, s) => sum + calcSetVolume(s), 0);

export const calcDayVolume = records =>
  records.reduce((sum, r) => sum + calcRecordVolume(r), 0);

export const getDayBodyParts = records => {
  const parts = new Set();
  records.forEach(r => {
    normalizeBodyParts(r.bodyParts ?? r.bodyPart).forEach(p => parts.add(p));
  });
  return [...parts];
};

export const formatTimeRange = (startedAt, endedAt) => {
  const start = startedAt ? formatTime(startedAt) : '';
  const end = endedAt ? formatTime(endedAt) : '';
  if (start && end) {
    return `${start}–${end}`;
  }
  return start || end || '';
};

export const formatVolume = volume => {
  if (volume <= 0) {
    return '';
  }
  return `${Math.round(volume).toLocaleString('ko-KR')}kg`;
};

export const formatBodyParts = parts => formatBodyPartsLabel(parts);

export const cloneRecord = record => {
  const cardio = isCardioRecord(record);
  return {
    id: record.id,
    exerciseId: record.exerciseId,
    exerciseName: record.exerciseName,
    bodyParts: normalizeBodyParts(record.bodyParts ?? record.bodyPart),
    sets: (record.sets ?? []).map(s =>
      cardio || s.minutes != null
        ? {minutes: s.minutes ?? 0}
        : {weight: s.weight ?? 0, reps: s.reps ?? 1},
    ),
  };
};

export const formatSetSummary = (set, cardio) =>
  cardio ? `${set.minutes ?? 0}분` : `무게 ${set.weight} · 횟수 ${set.reps}`;

export const emptyEditorRecord = () => ({
  id: null,
  exerciseId: null,
  exerciseName: null,
  bodyParts: [],
  sets: [],
});

/** Parse "HH:mm" → ISO string on given date, or null if invalid. */
export const parseTimeOnDate = (dateStr, hhmm) => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm.trim())) {
    return null;
  }
  const [h, m] = hhmm.trim().split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

/** ISO → "HH:mm" for editor fields. */
export const isoToHHmm = iso => (iso ? formatTime(iso) : '');

/** Resolve session times; 00:00–00:00 means "not set". */
export const resolveSessionTimes = (dateStr, startTime, endTime) => {
  if (startTime === '00:00' && endTime === '00:00') {
    return {startedAt: null, endedAt: null};
  }
  return {
    startedAt: parseTimeOnDate(dateStr, startTime),
    endedAt: parseTimeOnDate(dateStr, endTime),
  };
};
