/**
 * NumberPicker — compact / mini sizes; labels fixed to 무게·횟수.
 */
import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet, Animated} from 'react-native';
import {COLORS, SPACING, RADIUS} from '../theme';
import {useValuePulse} from '../utils/animations';

export default function NumberPicker({
  label,
  value,
  onChange,
  stepSmall = 1,
  stepLarge = 5,
  min = 0,
  max = 999,
  allowDecimal = false,
  compact = false,
  mini = false,
}) {
  const [text, setText] = useState(String(value));
  const pulse = useValuePulse(value);
  const s = mini ? miniStyles : compact ? compactStyles : styles;

  const commit = useCallback(
    next => {
      let n = allowDecimal ? parseFloat(next) : parseInt(next, 10);
      if (Number.isNaN(n)) {
        n = min;
      }
      n = Math.min(max, Math.max(min, n));
      if (!allowDecimal) {
        n = Math.round(n);
      }
      setText(String(n));
      onChange(n);
    },
    [allowDecimal, max, min, onChange],
  );

  const bump = delta => commit(value + delta);

  React.useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <View style={s.wrap}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.row}>
        <Pressable
          style={({pressed}) => [s.btn, pressed && s.pressed]}
          onPress={() => bump(-stepLarge)}>
          <Text style={s.btnText}>-{stepLarge}</Text>
        </Pressable>
        <Pressable
          style={({pressed}) => [s.btn, pressed && s.pressed]}
          onPress={() => bump(-stepSmall)}>
          <Text style={s.btnText}>-{stepSmall}</Text>
        </Pressable>
        <Animated.View style={{transform: [{scale: pulse}]}}>
          <TextInput
            style={s.input}
            value={text}
            keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
            onChangeText={setText}
            onBlur={() => commit(text)}
            onSubmitEditing={() => commit(text)}
            selectTextOnFocus
          />
        </Animated.View>
        <Pressable
          style={({pressed}) => [s.btn, pressed && s.pressed]}
          onPress={() => bump(stepSmall)}>
          <Text style={s.btnText}>+{stepSmall}</Text>
        </Pressable>
        <Pressable
          style={({pressed}) => [s.btn, pressed && s.pressed]}
          onPress={() => bump(stepLarge)}>
          <Text style={s.btnText}>+{stepLarge}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginVertical: SPACING.sm},
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brownMuted,
    marginBottom: SPACING.xs,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flex: 1},
  btn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    minWidth: 44,
    alignItems: 'center',
  },
  btnText: {fontSize: 13, fontWeight: '700', color: COLORS.darkBrown},
  input: {
    width: 56,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.darkBrown,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
  },
  pressed: {opacity: 0.5},
});

const compactStyles = StyleSheet.create({
  wrap: {marginVertical: 2, flex: 1},
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.brownMuted,
    marginBottom: 1,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1},
  btn: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    minWidth: 28,
    alignItems: 'center',
  },
  btnText: {fontSize: 10, fontWeight: '700', color: COLORS.darkBrown},
  input: {
    width: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkBrown,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: 4,
    paddingVertical: 2,
  },
  pressed: {opacity: 0.5},
});

const miniStyles = StyleSheet.create({
  wrap: {marginVertical: 0, flex: 1},
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.brownMuted,
    marginBottom: 1,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 1, flex: 1},
  btn: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    minWidth: 22,
    alignItems: 'center',
  },
  btnText: {fontSize: 8, fontWeight: '700', color: COLORS.darkBrown},
  input: {
    width: 34,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkBrown,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: 3,
    paddingVertical: 1,
  },
  pressed: {opacity: 0.5},
});
