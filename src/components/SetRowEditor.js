/** Compact set row — strength (weight/reps) or cardio (minutes). */
import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import NumberPicker from './NumberPicker';
import {COLORS, SPACING, RADIUS} from '../theme';

export default function SetRowEditor({set, cardio, onChange, onRemove}) {
  if (cardio) {
    return (
      <View style={styles.row}>
        <View style={styles.pickWrap}>
          <NumberPicker
            mini
            label="시간"
            value={set.minutes ?? 0}
            onChange={v => onChange({minutes: v})}
            stepSmall={1}
            stepLarge={5}
            min={1}
            max={300}
          />
        </View>
        <Text style={styles.unit}>분</Text>
        <Pressable hitSlop={8} onPress={onRemove} style={styles.del}>
          <Text style={styles.delText}>✕</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={styles.pickWrap}>
        <NumberPicker
          mini
          label="무게"
          value={set.weight}
          onChange={v => onChange({weight: v})}
          stepSmall={1}
          stepLarge={5}
          min={0}
          max={500}
          allowDecimal
        />
      </View>
      <View style={styles.pickWrap}>
        <NumberPicker
          mini
          label="횟수"
          value={set.reps}
          onChange={v => onChange({reps: v})}
          stepSmall={1}
          stepLarge={5}
          min={1}
          max={100}
        />
      </View>
      <Pressable hitSlop={8} onPress={onRemove} style={styles.del}>
        <Text style={styles.delText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.beige,
    borderRadius: RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.brownMuted,
    gap: 4,
  },
  pickWrap: {flex: 1, minWidth: 0},
  unit: {
    fontSize: 13,
    color: COLORS.brownMuted,
    fontWeight: '600',
    marginBottom: 8,
    marginRight: 4,
  },
  del: {padding: 4, marginBottom: 6},
  delText: {color: COLORS.danger, fontSize: 13, fontWeight: '700'},
});
