import React, {memo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, SPACING, RADIUS} from '../theme';
import {calcRecordVolume} from '../utils/workoutStats';
import {formatBodyPartsLabel} from '../constants/bodyParts';

function WorkoutRecordCard({record}) {
  const volume = calcRecordVolume(record);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{record.exerciseName}</Text>
        <Text style={styles.part}>
          {formatBodyPartsLabel(record.bodyParts ?? record.bodyPart)}
        </Text>
      </View>
      {record.sets.map((s, i) => (
        <View key={i} style={styles.setRow}>
          <Text style={styles.setIdx}>#{i + 1}</Text>
          <Text style={styles.setText}>
            {s.weight} kg × {s.reps}
          </Text>
        </View>
      ))}
      <Text style={styles.volume}>
        볼륨 {Math.round(volume).toLocaleString('ko-KR')}kg
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.beigeSoft,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  name: {fontSize: 17, fontWeight: '700', color: COLORS.darkBrown},
  part: {fontSize: 13, color: COLORS.brownMuted},
  setRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.brownMuted,
  },
  setIdx: {width: 32, color: COLORS.brownMuted, fontWeight: '600'},
  setText: {color: COLORS.darkBrown, fontSize: 15},
  volume: {
    marginTop: SPACING.sm,
    fontSize: 12,
    color: COLORS.indigo,
    fontWeight: '600',
    textAlign: 'right',
  },
});

export default memo(WorkoutRecordCard);
