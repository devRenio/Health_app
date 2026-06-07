/** Start / end time fields (HH:mm). */
import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {COLORS, SPACING, RADIUS} from '../theme';

export default function TimeRangeEditor({startTime, endTime, onChangeStart, onChangeEnd}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>운동 시간</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>시작</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={onChangeStart}
            placeholder="07:00"
            placeholderTextColor={COLORS.brownMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
        <Text style={styles.sep}>→</Text>
        <View style={styles.field}>
          <Text style={styles.label}>종료</Text>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={onChangeEnd}
            placeholder="08:30"
            placeholderTextColor={COLORS.brownMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.beigeSoft,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  title: {fontSize: 12, fontWeight: '700', color: COLORS.darkBrown, marginBottom: SPACING.xs},
  row: {flexDirection: 'row', alignItems: 'center'},
  field: {flex: 1},
  label: {fontSize: 10, color: COLORS.brownMuted, marginBottom: 2},
  input: {
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.darkBrown,
    backgroundColor: COLORS.white,
    textAlign: 'center',
  },
  sep: {marginHorizontal: SPACING.sm, color: COLORS.brownMuted, fontSize: 16},
});
