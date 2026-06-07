/**
 * CalendarScreen — animated month grid with session time range on each day.
 */
import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useWorkoutStore, formatDate} from '../store';
import {
  getMonthGrid,
  formatMonthTitle,
  shiftMonth,
  isToday,
} from '../utils/dateUtils';
import {formatVolume, formatBodyParts} from '../utils/workoutStats';
import {useFadeSlide, animateLayout} from '../utils/animations';
import {COLORS, SPACING, RADIUS} from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarScreen({navigation}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [summaries, setSummaries] = useState({});

  const monthKey = `${year}-${month}`;
  const {opacity, translateY} = useFadeSlide(monthKey);

  const getMonthSummaries = useWorkoutStore(s => s.getMonthSummaries);

  useFocusEffect(
    useCallback(() => {
      setSummaries(getMonthSummaries(year, month));
    }, [year, month, getMonthSummaries]),
  );

  const cells = useMemo(() => getMonthGrid(year, month), [year, month]);

  const changeMonth = delta => {
    animateLayout('ease');
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  };

  const openDay = dateStr => {
    navigation.navigate('DayDetail', {date: dateStr});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => changeMonth(-1)} hitSlop={12}>
          <Text style={styles.navBtn}>‹</Text>
        </Pressable>
        <Text style={styles.title}>{formatMonthTitle(year, month)}</Text>
        <Pressable onPress={() => changeMonth(1)} hitSlop={12}>
          <Text style={styles.navBtn}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map(w => (
          <Text key={w} style={styles.weekLabel}>
            {w}
          </Text>
        ))}
      </View>

      <Animated.View
        style={[styles.grid, {opacity, transform: [{translateY}]}]}
        key={monthKey}>
        {cells.map((dateStr, idx) => {
          if (!dateStr) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }

          const dayNum = parseInt(dateStr.split('-')[2], 10);
          const summary = summaries[dateStr];
          const today = isToday(dateStr);

          return (
            <Pressable
              key={dateStr}
              style={({pressed}) => [
                styles.cell,
                today && styles.cellToday,
                pressed && styles.pressed,
              ]}
              onPress={() => openDay(dateStr)}>
              <Text style={[styles.dayNum, today && styles.dayNumToday]}>
                {dayNum}
              </Text>
              {summary ? (
                <View style={styles.summary}>
                  {summary.timeRange ? (
                    <Text style={styles.summaryTime} numberOfLines={1}>
                      {summary.timeRange}
                    </Text>
                  ) : null}
                  {summary.volume > 0 ? (
                    <Text style={styles.summaryVol} numberOfLines={1}>
                      {formatVolume(summary.volume)}
                    </Text>
                  ) : null}
                  {summary.bodyParts.length > 0 ? (
                    <Text style={styles.summaryParts} numberOfLines={2}>
                      {formatBodyParts(summary.bodyParts)}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </Animated.View>

      <Pressable
        style={styles.todayBtn}
        onPress={() => openDay(formatDate(new Date()))}>
        <Text style={styles.todayBtnText}>오늘 보기</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.beige},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBrown,
  },
  navBtn: {fontSize: 28, color: COLORS.darkBrown, width: 40, textAlign: 'center'},
  title: {fontSize: 20, fontWeight: '700', color: COLORS.darkBrown},
  weekRow: {flexDirection: 'row', paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm},
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brownMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    flex: 1,
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 88,
    padding: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.brownMuted,
  },
  cellToday: {backgroundColor: COLORS.beigeSoft},
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkBrown,
    marginBottom: 2,
  },
  dayNumToday: {color: COLORS.indigo},
  summary: {flex: 1},
  summaryTime: {fontSize: 8, color: COLORS.brownMuted, fontWeight: '600'},
  summaryVol: {fontSize: 9, fontWeight: '700', color: COLORS.indigo},
  summaryParts: {fontSize: 8, color: COLORS.darkBrown, lineHeight: 11},
  todayBtn: {
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.indigo,
    alignItems: 'center',
  },
  todayBtnText: {color: COLORS.indigo, fontWeight: '700'},
  pressed: {opacity: 0.6},
});
