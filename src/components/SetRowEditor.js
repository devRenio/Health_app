/** Compact inline row for one set (weight × reps + delete). */
import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import NumberPicker from './NumberPicker';
import {COLORS, SPACING, RADIUS} from '../theme';

export default function SetRowEditor({index, set, onChange, onRemove}) {
  return (
    <View style={styles.row}>
      <Text style={styles.idx}>#{index + 1}</Text>
      <View style={styles.pickWrap}>
        <NumberPicker
          compact
          label="kg"
          value={set.weight}
          onChange={v => onChange({weight: v})}
          stepSmall={1}
          stepLarge={5}
          min={0}
          max={500}
          allowDecimal
        />
      </View>
      <Text style={styles.times}>×</Text>
      <View style={styles.pickWrap}>
        <NumberPicker
          compact
          label="reps"
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
    alignItems: 'center',
    backgroundColor: COLORS.beige,
    borderRadius: RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: SPACING.xs,
    marginBottom: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.brownMuted,
  },
  idx: {
    width: 22,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brownMuted,
  },
  pickWrap: {flex: 1},
  times: {fontSize: 12, color: COLORS.darkBrown, marginHorizontal: 2},
  del: {padding: 4},
  delText: {color: COLORS.danger, fontSize: 14, fontWeight: '700'},
});
