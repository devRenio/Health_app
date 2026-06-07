/**
 * store.js — MMKV (sync) + Zustand (React mirror)
 *
 * Day key `YYYY-MM-DD`:
 *   { startedAt, endedAt, records: [{ id, exerciseId, exerciseName, bodyParts, sets }] }
 */
import {create} from 'zustand';
import {MMKV} from 'react-native-mmkv';
import {
  DEFAULT_EXERCISES,
  DEFAULT_WEIGHT_BY_ID,
  DEFAULT_REPS,
} from './data/defaultExercises';
import {normalizeBodyParts} from './constants/bodyParts';
import {formatDate} from './utils/dateUtils';
import {
  calcDayVolume,
  getDayBodyParts,
  formatTimeRange,
} from './utils/workoutStats';

export const storage = new MMKV({id: 'workout-storage'});

const EXERCISES_KEY = 'meta:exercises';
const STATS_KEY = 'meta:exercise-stats';
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const readJson = (key, fallback) => {
  const raw = storage.getString(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => storage.set(key, JSON.stringify(value));

const normalizeExercise = raw => ({
  ...raw,
  bodyParts: normalizeBodyParts(raw.bodyParts ?? raw.bodyPart),
});

const normalizeRecord = (raw, exercises) => {
  if (raw.exerciseId && raw.exerciseName) {
    return {
      ...raw,
      bodyParts: normalizeBodyParts(
        raw.bodyParts ?? raw.bodyPart ?? exercises.find(e => e.id === raw.exerciseId)?.bodyParts,
      ),
      sets: raw.sets ?? [],
    };
  }
  const name = raw.exercise ?? raw.exerciseName ?? 'Unknown';
  const match = exercises.find(e => e.name === name);
  return {
    id: raw.id ?? makeId(),
    exerciseId: match?.id ?? makeId(),
    exerciseName: name,
    bodyParts: normalizeBodyParts(
      raw.bodyParts ?? raw.bodyPart ?? match?.bodyParts ?? ['기타'],
    ),
    sets: raw.sets ?? [],
  };
};

const readExercises = () => {
  const stored = readJson(EXERCISES_KEY, null);
  if (!stored || stored.length === 0) {
    const seeded = DEFAULT_EXERCISES.map(normalizeExercise);
    writeJson(EXERCISES_KEY, seeded);
    return seeded;
  }
  return stored.map(normalizeExercise);
};

/** Read full day payload (records + session times). */
export const readDayData = date => {
  const exercises = readExercises();
  const raw = readJson(date, null);
  if (!raw) {
    return {records: [], startedAt: null, endedAt: null};
  }
  if (Array.isArray(raw)) {
    return {
      records: raw.map(r => normalizeRecord(r, exercises)),
      startedAt: null,
      endedAt: null,
    };
  }
  return {
    records: (raw.records ?? []).map(r => normalizeRecord(r, exercises)),
    startedAt: raw.startedAt ?? null,
    endedAt: raw.endedAt ?? null,
  };
};

const writeDayData = (date, {records, startedAt, endedAt}) => {
  const hasContent =
    records.length > 0 || startedAt || endedAt;
  if (!hasContent) {
    storage.delete(date);
    return;
  }
  writeJson(date, {records, startedAt, endedAt});
};

const readStats = () => readJson(STATS_KEY, {});

const writeStats = stats => writeJson(STATS_KEY, stats);

const updateStatsFromRecords = (records, date) => {
  const stats = readStats();
  records.forEach(rec => {
    const lastSet = rec.sets?.[rec.sets.length - 1];
    if (!lastSet || !rec.exerciseId) {
      return;
    }
    stats[rec.exerciseId] = {
      lastWeight: lastSet.weight,
      lastReps: lastSet.reps,
      lastDate: date,
    };
  });
  writeStats(stats);
};

export const useWorkoutStore = create((set, get) => ({
  exercises: readExercises(),
  exerciseStats: readStats(),

  getExercises: () => readExercises(),

  addExercise: ({name, bodyParts}) => {
    const trimmed = name.trim();
    const parts = normalizeBodyParts(bodyParts);
    if (!trimmed || parts.length === 0) {
      return null;
    }
    const next = [
      ...readExercises(),
      {id: makeId(), name: trimmed, bodyParts: parts, isDefault: false},
    ];
    writeJson(EXERCISES_KEY, next);
    set({exercises: next});
    return next[next.length - 1];
  },

  updateExercise: (id, patch) => {
    const next = readExercises().map(e =>
      e.id === id
        ? {
            ...e,
            ...patch,
            id: e.id,
            bodyParts: patch.bodyParts
              ? normalizeBodyParts(patch.bodyParts)
              : e.bodyParts,
          }
        : e,
    );
    writeJson(EXERCISES_KEY, next);
    set({exercises: next});
  },

  removeExercise: id => {
    const next = readExercises().filter(e => e.id !== id);
    writeJson(EXERCISES_KEY, next);
    set({exercises: next});
  },

  getExerciseStats: exerciseId => readStats()[exerciseId] ?? null,

  getDefaultWeight: exerciseId => {
    const stat = readStats()[exerciseId];
    if (stat?.lastWeight != null) {
      return stat.lastWeight;
    }
    return DEFAULT_WEIGHT_BY_ID[exerciseId] ?? 20;
  },

  getDefaultReps: () => DEFAULT_REPS,

  loadDayData: date => readDayData(date),

  loadWorkoutByDate: date => readDayData(date).records,

  saveDayData: (date, {records, startedAt, endedAt}) => {
    const stamped = records.map(r => ({
      ...r,
      id: r.id ?? makeId(),
      bodyParts: normalizeBodyParts(r.bodyParts),
      sets: r.sets ?? [],
    }));
    writeDayData(date, {
      records: stamped,
      startedAt: startedAt ?? null,
      endedAt: endedAt ?? null,
    });
    if (stamped.length > 0) {
      updateStatsFromRecords(stamped, date);
    }
    set({exerciseStats: readStats()});
    return {records: stamped, startedAt, endedAt};
  },

  replaceDayRecords: (date, records, session = {}) => {
    const existing = readDayData(date);
    return get().saveDayData(date, {
      records,
      startedAt: session.startedAt ?? existing.startedAt,
      endedAt: session.endedAt ?? existing.endedAt,
    });
  },

  appendDayRecords: (date, newRecords, session = {}) => {
    const existing = readDayData(date);
    const merged = [
      ...existing.records,
      ...newRecords.map(r => ({
        ...r,
        id: r.id ?? makeId(),
        bodyParts: normalizeBodyParts(r.bodyParts),
        sets: r.sets ?? [],
      })),
    ];
    return get().saveDayData(date, {
      records: merged,
      startedAt: session.startedAt ?? existing.startedAt,
      endedAt: session.endedAt ?? existing.endedAt,
    });
  },

  getDaySummary: date => {
    const {records, startedAt, endedAt} = readDayData(date);
    const hasContent =
      records.length > 0 || startedAt || endedAt;
    if (!hasContent) {
      return null;
    }
    return {
      volume: calcDayVolume(records),
      bodyParts: getDayBodyParts(records),
      timeRange: formatTimeRange(startedAt, endedAt),
      startedAt,
      endedAt,
      recordCount: records.length,
    };
  },

  getMonthSummaries: (year, month) => {
    const summaries = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = formatDate(new Date(year, month, d));
      const summary = get().getDaySummary(date);
      if (summary) {
        summaries[date] = summary;
      }
    }
    return summaries;
  },

  getAllWorkoutDates: () =>
    storage
      .getAllKeys()
      .filter(k => {
        if (!DATE_KEY_RE.test(k)) {
          return false;
        }
        const {records, startedAt, endedAt} = readDayData(k);
        return records.length > 0 || startedAt || endedAt;
      })
      .sort(),
}));

export {formatDate} from './utils/dateUtils';
