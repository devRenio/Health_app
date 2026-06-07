/**
 * Aggregate workout data for the statistics screen.
 */
import {
  CARDIO_PART,
  STRENGTH_BODY_PARTS,
  normalizeBodyParts,
} from '../constants/bodyParts';
import {calcRecordVolume, formatVolume, isCardioRecord} from './workoutStats';

const dayHasContent = data =>
  data.records.length > 0 || data.startedAt || data.endedAt;

const sessionMinutes = (startedAt, endedAt) => {
  if (!startedAt || !endedAt) {
    return null;
  }
  const ms = new Date(endedAt) - new Date(startedAt);
  if (ms <= 0) {
    return null;
  }
  return Math.round(ms / 60000);
};

/** Scale a count to an average per 7-day week. */
const toWeeklyRate = (count, daySpan) => {
  if (daySpan <= 0) {
    return 0;
  }
  return Math.round((count / daySpan) * 7 * 10) / 10;
};

const addBodyPartVolume = (map, parts, volume) => {
  const list = normalizeBodyParts(parts).filter(p => p !== CARDIO_PART);
  if (list.length === 0) {
    return;
  }
  const share = volume / list.length;
  list.forEach(p => {
    map[p] = (map[p] ?? 0) + share;
  });
};

/** Each strength set counts toward every tagged body part (excludes cardio). */
const addBodyPartSet = (map, parts) => {
  normalizeBodyParts(parts)
    .filter(p => p !== CARDIO_PART)
    .forEach(p => {
      map[p] = (map[p] ?? 0) + 1;
    });
};

const buildBodyPartSetsList = bodyPartSets =>
  STRENGTH_BODY_PARTS.map(part => ({
    part,
    sets: bodyPartSets[part] ?? 0,
  }));

export const aggregateMonthStats = (year, month, readDayData, formatDateFn) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workoutDays = 0;
  let totalVolume = 0;
  let totalSets = 0;
  let totalCardioMinutes = 0;
  let totalRecords = 0;
  let durationSum = 0;
  let durationCount = 0;

  const bodyPartVolume = {};
  const bodyPartSets = {};
  const exerciseVolume = {};
  const exerciseSets = {};
  const personalRecords = {};

  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = formatDateFn(new Date(year, month, d));
    const data = readDayData(date);
    if (!dayHasContent(data)) {
      continue;
    }

    workoutDays += 1;
    const mins = sessionMinutes(data.startedAt, data.endedAt);
    if (mins != null) {
      durationSum += mins;
      durationCount += 1;
    }

    data.records.forEach(rec => {
      totalRecords += 1;
      const cardio = isCardioRecord(rec);
      const recVol = calcRecordVolume(rec);
      totalVolume += recVol;

      const name = rec.exerciseName ?? 'Unknown';
      exerciseVolume[name] = (exerciseVolume[name] ?? 0) + recVol;
      exerciseSets[name] = (exerciseSets[name] ?? 0) + (rec.sets?.length ?? 0);

      if (!cardio) {
        addBodyPartVolume(bodyPartVolume, rec.bodyParts ?? rec.bodyPart, recVol);
      }

      (rec.sets ?? []).forEach(set => {
        if (cardio) {
          totalCardioMinutes += set.minutes ?? 0;
          return;
        }

        totalSets += 1;
        addBodyPartSet(bodyPartSets, rec.bodyParts ?? rec.bodyPart);

        const w = set.weight ?? 0;
        const prev = personalRecords[name];
        if (!prev || w > prev.maxWeight) {
          personalRecords[name] = {maxWeight: w, reps: set.reps, date};
        }
      });
    });
  }

  const avgWorkoutsPerWeek = toWeeklyRate(workoutDays, daysInMonth);
  const avgSetsPerWeek = toWeeklyRate(totalSets, daysInMonth);
  const avgVolumePerDay =
    workoutDays > 0 ? Math.round(totalVolume / workoutDays) : 0;

  const topExercises = Object.entries(exerciseVolume)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, vol]) => ({name, volume: vol, sets: exerciseSets[name] ?? 0}));

  const bodyParts = Object.entries(bodyPartVolume)
    .sort((a, b) => b[1] - a[1])
    .map(([part, vol]) => ({part, volume: vol}));

  const prList = Object.entries(personalRecords)
    .sort((a, b) => b[1].maxWeight - a[1].maxWeight)
    .slice(0, 8)
    .map(([name, pr]) => ({name, ...pr}));

  return {
    daysInMonth,
    workoutDays,
    avgWorkoutsPerWeek,
    totalVolume,
    avgVolumePerDay,
    totalSets,
    avgSetsPerWeek,
    totalCardioMinutes,
    totalRecords,
    avgDurationMin: durationCount > 0 ? Math.round(durationSum / durationCount) : null,
    bodyPartSets: buildBodyPartSetsList(bodyPartSets),
    topExercises,
    bodyParts,
    prList,
    formatVolume,
  };
};

export const aggregateAllTimeStats = (readDayData, getAllDates) => {
  let workoutDays = 0;
  let totalVolume = 0;
  let totalSets = 0;
  let totalCardioMinutes = 0;
  const bodyPartSets = {};
  const exerciseVolume = {};
  const dates = getAllDates();

  dates.forEach(date => {
    const data = readDayData(date);
    if (!dayHasContent(data)) {
      return;
    }
    workoutDays += 1;
    data.records.forEach(rec => {
      const cardio = isCardioRecord(rec);
      const recVol = calcRecordVolume(rec);
      totalVolume += recVol;
      (rec.sets ?? []).forEach(set => {
        if (cardio) {
          totalCardioMinutes += set.minutes ?? 0;
          return;
        }
        totalSets += 1;
        addBodyPartSet(bodyPartSets, rec.bodyParts ?? rec.bodyPart);
      });
      const name = rec.exerciseName ?? 'Unknown';
      exerciseVolume[name] = (exerciseVolume[name] ?? 0) + recVol;
    });
  });

  const first = dates[0];
  const last = dates[dates.length - 1] ?? first;
  let spanDays = 1;
  if (first && last) {
    spanDays = Math.max(
      1,
      Math.round(
        (new Date(`${last}T00:00:00`) - new Date(`${first}T00:00:00`)) /
          86400000,
      ) + 1,
    );
  }

  const avgWorkoutsPerWeek = toWeeklyRate(workoutDays, spanDays);
  const avgSetsPerWeek = toWeeklyRate(totalSets, spanDays);
  const avgVolumePerDay =
    workoutDays > 0 ? Math.round(totalVolume / workoutDays) : 0;

  const favoriteExercise =
    Object.entries(exerciseVolume).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    workoutDays,
    totalVolume,
    avgVolumePerDay,
    totalSets,
    totalCardioMinutes,
    avgWorkoutsPerWeek,
    avgSetsPerWeek,
    bodyPartSets: buildBodyPartSetsList(bodyPartSets),
    favoriteExercise,
    spanDays,
  };
};
