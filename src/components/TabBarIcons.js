/** Bottom tab icons — pure View (no icon font dependency). */
import React from 'react';
import {View, StyleSheet} from 'react-native';

const SIZE = 22;

export function CalendarTabIcon({color, focused}) {
  const c = color;
  const w = focused ? 2 : 1.5;
  return (
    <View style={styles.wrap}>
      <View style={[styles.calHeader, {backgroundColor: c, height: 5}]} />
      <View style={[styles.calRing, {borderColor: c, borderWidth: w}]}>
        <View style={styles.calGrid}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={[
                styles.calCell,
                i === 2 && focused ? {backgroundColor: c} : null,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export function StatsTabIcon({color, focused}) {
  const c = color;
  const w = focused ? 2 : 1.5;
  const heights = [0.35, 0.55, 0.75, 0.45];
  return (
    <View style={[styles.bars, {borderColor: c, borderBottomWidth: w}]}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: SIZE * h,
              backgroundColor: c,
              opacity: focused && i === 2 ? 1 : 0.75,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {width: SIZE, height: SIZE, alignItems: 'center'},
  calHeader: {
    width: SIZE,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calRing: {
    width: SIZE,
    flex: 1,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    padding: 2,
  },
  calGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    alignContent: 'center',
  },
  calCell: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  bars: {
    width: SIZE,
    height: SIZE,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
  },
  bar: {
    width: 4,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
});
