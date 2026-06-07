/**
 * WorkoutEditorScreen — compact layout, session times, empty save allowed.
 */
import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useWorkoutStore} from '../store';
import ExercisePickerModal from '../components/ExercisePickerModal';
import NumberPicker from '../components/NumberPicker';
import SetRowEditor from '../components/SetRowEditor';
import TimeRangeEditor from '../components/TimeRangeEditor';
import {
  cloneRecord,
  emptyEditorRecord,
  parseTimeOnDate,
  isoToHHmm,
} from '../utils/workoutStats';
import {formatBodyPartsLabel} from '../constants/bodyParts';
import {animateLayout} from '../utils/animations';
import {COLORS, SPACING, RADIUS} from '../theme';

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function WorkoutEditorScreen({route, navigation}) {
  const {date, mode} = route.params;
  const loadDayData = useWorkoutStore(s => s.loadDayData);
  const saveDayData = useWorkoutStore(s => s.saveDayData);
  const loadWorkoutByDate = useWorkoutStore(s => s.loadWorkoutByDate);
  const getDefaultWeight = useWorkoutStore(s => s.getDefaultWeight);
  const getDefaultReps = useWorkoutStore(s => s.getDefaultReps);

  const dayData = useMemo(() => loadDayData(date), [date, loadDayData]);

  const initialBlocks = useMemo(() => {
    if (mode === 'edit') {
      const records = dayData.records;
      return records.length > 0 ? records.map(cloneRecord) : [emptyEditorRecord()];
    }
    return [emptyEditorRecord()];
  }, [mode, dayData.records]);

  const [blocks, setBlocks] = useState(initialBlocks);
  const [startTime, setStartTime] = useState(isoToHHmm(dayData.startedAt));
  const [endTime, setEndTime] = useState(isoToHHmm(dayData.endedAt));
  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);
  const [draftWeight, setDraftWeight] = useState(20);
  const [draftReps, setDraftReps] = useState(getDefaultReps());

  const syncDraftFromBlock = (block, exerciseId) => {
    const last = block.sets[block.sets.length - 1];
    if (last) {
      setDraftWeight(last.weight);
      setDraftReps(last.reps);
    } else if (exerciseId) {
      setDraftWeight(getDefaultWeight(exerciseId));
      setDraftReps(getDefaultReps());
    }
  };

  const openPicker = idx => {
    setActiveBlockIdx(idx);
    syncDraftFromBlock(blocks[idx], blocks[idx].exerciseId);
    setPickerVisible(true);
  };

  const handleSelectExercise = exercise => {
    animateLayout('spring');
    setBlocks(prev =>
      prev.map((b, i) =>
        i === activeBlockIdx
          ? {
              ...b,
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              bodyParts: exercise.bodyParts,
            }
          : b,
      ),
    );
    setDraftWeight(getDefaultWeight(exercise.id));
    setDraftReps(getDefaultReps());
  };

  const addSetToBlock = idx => {
    animateLayout('spring');
    setBlocks(prev =>
      prev.map((b, i) =>
        i === idx
          ? {...b, sets: [...b.sets, {weight: draftWeight, reps: draftReps}]}
          : b,
      ),
    );
  };

  const updateSet = (blockIdx, setIdx, patch) => {
    setBlocks(prev =>
      prev.map((b, i) =>
        i === blockIdx
          ? {
              ...b,
              sets: b.sets.map((s, si) =>
                si === setIdx ? {...s, ...patch} : s,
              ),
            }
          : b,
      ),
    );
  };

  const removeSet = (blockIdx, setIdx) => {
    animateLayout('quick');
    setBlocks(prev =>
      prev.map((b, i) =>
        i === blockIdx
          ? {...b, sets: b.sets.filter((_, si) => si !== setIdx)}
          : b,
      ),
    );
  };

  const removeBlock = idx => {
    animateLayout('spring');
    if (blocks.length <= 1) {
      setBlocks([emptyEditorRecord()]);
      return;
    }
    setBlocks(prev => prev.filter((_, i) => i !== idx));
    if (activeBlockIdx >= idx) {
      setActiveBlockIdx(Math.max(0, activeBlockIdx - 1));
    }
  };

  const addBlock = () => {
    animateLayout('spring');
    setBlocks(prev => [...prev, emptyEditorRecord()]);
    setActiveBlockIdx(blocks.length);
  };

  const handleSave = useCallback(() => {
    const valid = blocks
      .filter(b => b.exerciseId && b.sets.length > 0)
      .map(b => ({
        id: b.id ?? makeId(),
        exerciseId: b.exerciseId,
        exerciseName: b.exerciseName,
        bodyParts: b.bodyParts,
        sets: b.sets,
      }));

    const startedAt = parseTimeOnDate(date, startTime);
    const endedAt = parseTimeOnDate(date, endTime);

    if (mode === 'edit') {
      saveDayData(date, {records: valid, startedAt, endedAt});
    } else if (valid.length > 0 || startedAt || endedAt) {
      const existing = loadWorkoutByDate(date);
      saveDayData(date, {
        records: [...existing, ...valid],
        startedAt: startedAt ?? dayData.startedAt,
        endedAt: endedAt ?? dayData.endedAt,
      });
    }

    navigation.goBack();
  }, [
    blocks,
    mode,
    date,
    startTime,
    endTime,
    saveDayData,
    loadWorkoutByDate,
    dayData.startedAt,
    dayData.endedAt,
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>취소</Text>
        </Pressable>
        <Text style={styles.title}>
          {mode === 'edit' ? '운동 수정' : '운동 기록'}
        </Text>
        <Pressable onPress={handleSave} hitSlop={12}>
          <Text style={styles.save}>저장</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dateLabel}>{date}</Text>

        <TimeRangeEditor
          startTime={startTime}
          endTime={endTime}
          onChangeStart={setStartTime}
          onChangeEnd={setEndTime}
        />

        {blocks.map((block, blockIdx) => (
          <View key={blockIdx} style={styles.block}>
            <View style={styles.blockHeader}>
              <Text style={styles.blockLabel}>종목 {blockIdx + 1}</Text>
              <Pressable onPress={() => removeBlock(blockIdx)}>
                <Text style={styles.removeBlock}>삭제</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.exerciseBtn}
              onPress={() => openPicker(blockIdx)}>
              <Text style={styles.exerciseName}>
                {block.exerciseName ?? '종목 선택'}
              </Text>
              {block.bodyParts?.length > 0 ? (
                <Text style={styles.exercisePart}>
                  {formatBodyPartsLabel(block.bodyParts)}
                </Text>
              ) : null}
            </Pressable>

            {block.exerciseId ? (
              <>
                <View style={styles.draftRow}>
                  <View style={styles.draftCol}>
                    <NumberPicker
                      compact
                      label="무게 kg"
                      value={draftWeight}
                      onChange={setDraftWeight}
                      stepSmall={1}
                      stepLarge={5}
                      min={0}
                      max={500}
                      allowDecimal
                    />
                  </View>
                  <View style={styles.draftCol}>
                    <NumberPicker
                      compact
                      label="횟수"
                      value={draftReps}
                      onChange={setDraftReps}
                      stepSmall={1}
                      stepLarge={5}
                      min={1}
                      max={100}
                    />
                  </View>
                </View>
                <Pressable
                  style={({pressed}) => [
                    styles.addSetBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => addSetToBlock(blockIdx)}>
                  <Text style={styles.addSetText}>+ 세트 추가</Text>
                </Pressable>

                {block.sets.map((s, setIdx) => (
                  <SetRowEditor
                    key={setIdx}
                    index={setIdx}
                    set={s}
                    onChange={patch => updateSet(blockIdx, setIdx, patch)}
                    onRemove={() => removeSet(blockIdx, setIdx)}
                  />
                ))}
              </>
            ) : null}
          </View>
        ))}

        <Pressable style={styles.addBlockBtn} onPress={addBlock}>
          <Text style={styles.addBlockText}>+ 종목 추가</Text>
        </Pressable>

        <Text style={styles.hint}>
          종목·세트 없이 저장하면 해당 날짜 기록이 비워집니다.
        </Text>
      </ScrollView>

      <ExercisePickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.beige},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBrown,
  },
  back: {color: COLORS.brownMuted, width: 40, fontSize: 13},
  title: {fontSize: 15, fontWeight: '700', color: COLORS.darkBrown},
  save: {color: COLORS.indigo, fontWeight: '700', width: 40, textAlign: 'right', fontSize: 13},
  scroll: {padding: SPACING.sm, paddingBottom: SPACING.xl},
  dateLabel: {
    fontSize: 12,
    color: COLORS.brownMuted,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  block: {
    backgroundColor: COLORS.beigeSoft,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  blockLabel: {fontSize: 12, fontWeight: '700', color: COLORS.darkBrown},
  removeBlock: {color: COLORS.danger, fontSize: 11},
  exerciseBtn: {
    borderWidth: 1,
    borderColor: COLORS.indigo,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    marginBottom: 6,
  },
  exerciseName: {fontSize: 14, fontWeight: '700', color: COLORS.darkBrown},
  exercisePart: {fontSize: 10, color: COLORS.indigo, marginTop: 2},
  draftRow: {flexDirection: 'row', gap: SPACING.xs},
  draftCol: {flex: 1},
  addSetBtn: {
    backgroundColor: COLORS.indigo,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginBottom: 4,
  },
  addSetText: {color: COLORS.white, fontWeight: '700', fontSize: 12},
  addBlockBtn: {
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  addBlockText: {color: COLORS.darkBrown, fontWeight: '700', fontSize: 13},
  hint: {
    fontSize: 11,
    color: COLORS.brownMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  pressed: {opacity: 0.7},
});
