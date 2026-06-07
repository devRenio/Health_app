/**
 * StatsScreen — monthly + all-time workout statistics.
 */
import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useWorkoutStore} from '../store';
import {shiftMonth} from '../utils/dateUtils';
import {formatVolume} from '../utils/workoutStats';
import {useFadeSlide, animateLayout} from '../utils/animations';
import MonthYearHeader from '../components/MonthYearHeader';
import {COLORS, SPACING, RADIUS} from '../theme';

function StatCard({label, value, sub, wide}) {
  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  );
}

function BodyPartSetsGrid({items}) {
  return (
    <View style={styles.setsGrid}>
      {items.map(({part, sets}) => (
        <View key={part} style={styles.setsCell}>
          <Text style={styles.setsPart}>{part}</Text>
          <Text style={styles.setsCount}>
            {sets}
            <Text style={styles.setsUnit}>세트</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

function BarRow({label, value, max, suffix}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, {width: `${pct}%`}]} />
      </View>
      <Text style={styles.barVal}>{suffix ?? value}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const getMonthStats = useWorkoutStore(s => s.getMonthStats);
  const getAllTimeStats = useWorkoutStore(s => s.getAllTimeStats);
  const getYearRange = useWorkoutStore(s => s.getYearRange);

  const [monthStats, setMonthStats] = useState(null);
  const [allTime, setAllTime] = useState(null);
  const yearRange = useMemo(() => getYearRange(), [getYearRange]);

  const monthKey = `${year}-${month}`;
  const {opacity, translateY} = useFadeSlide(monthKey);

  useFocusEffect(
    useCallback(() => {
      setMonthStats(getMonthStats(year, month));
      setAllTime(getAllTimeStats());
    }, [year, month, getMonthStats, getAllTimeStats]),
  );

  const maxBodyVol = useMemo(
    () => Math.max(0, ...(monthStats?.bodyParts.map(b => b.volume) ?? [0])),
    [monthStats],
  );

  const changeMonth = delta => {
    animateLayout('ease');
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  };

  const daysInMonth = monthStats?.daysInMonth ?? new Date(year, month + 1, 0).getDate();
  const avgVolumeSub = `운동일 평균 ${
    formatVolume(monthStats?.avgVolumePerDay ?? 0) || '0kg'
  }`;

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.screenTitle}>통계</Text>

      <MonthYearHeader
        year={year}
        month={month}
        yearRange={yearRange}
        onChange={(y, m) => {
          animateLayout('ease');
          setYear(y);
          setMonth(m);
        }}
        onPrev={() => changeMonth(-1)}
        onNext={() => changeMonth(1)}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={{opacity, transform: [{translateY}]}}>
          <View style={styles.grid}>
            <StatCard
              wide
              label="운동 일수"
              value={`${monthStats?.workoutDays ?? 0}일`}
              sub={`${daysInMonth}일 중 · ${monthStats?.avgWorkoutsPerWeek ?? 0}회/주`}
            />
            <StatCard
              label="총 볼륨"
              value={formatVolume(monthStats?.totalVolume ?? 0) || '0kg'}
              sub={avgVolumeSub}
            />
            <StatCard
              label="평균 시간"
              value={
                monthStats?.avgDurationMin != null
                  ? `${monthStats.avgDurationMin}분`
                  : '—'
              }
              sub="세션당"
            />
            <StatCard
              wide
              label="총 세트"
              value={`${monthStats?.totalSets ?? 0}세트`}
              sub={`${monthStats?.avgSetsPerWeek ?? 0}세트/주 · 종목 ${monthStats?.totalRecords ?? 0}개`}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>부위별 세트</Text>
            <BodyPartSetsGrid items={monthStats?.bodyPartSets ?? []} />
            {(monthStats?.totalCardioMinutes ?? 0) > 0 ? (
              <Text style={styles.cardioLine}>
                유산소 {monthStats.totalCardioMinutes}분
              </Text>
            ) : null}
          </View>

          {monthStats?.topExercises?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>종목 TOP 5 (볼륨)</Text>
              {monthStats.topExercises.map((ex, i) => (
                <View key={ex.name} style={styles.listRow}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <View style={styles.listMain}>
                    <Text style={styles.listName}>{ex.name}</Text>
                    <Text style={styles.listSub}>
                      {formatVolume(ex.volume)} · {ex.sets}세트
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {monthStats?.bodyParts?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>부위별 볼륨</Text>
              {monthStats.bodyParts.map(b => (
                <BarRow
                  key={b.part}
                  label={b.part}
                  value={b.volume}
                  max={maxBodyVol}
                  suffix={formatVolume(b.volume)}
                />
              ))}
            </View>
          ) : null}

          {monthStats?.prList?.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>최고 중량 (PR)</Text>
              {monthStats.prList.map(pr => (
                <View key={pr.name} style={styles.listRow}>
                  <View style={styles.listMain}>
                    <Text style={styles.listName}>{pr.name}</Text>
                    <Text style={styles.listSub}>
                      무게 {pr.maxWeight} · 횟수 {pr.reps} · {pr.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {monthStats?.workoutDays === 0 ? (
            <Text style={styles.empty}>이 달에는 기록이 없습니다.</Text>
          ) : null}
        </Animated.View>

        <View style={styles.allTime}>
          <Text style={styles.sectionTitle}>전체 누적</Text>
          <Text style={styles.allLine}>
            운동 {allTime?.workoutDays ?? 0}일 ·{' '}
            {formatVolume(allTime?.totalVolume ?? 0) || '0kg'} ·{' '}
            {allTime?.totalSets ?? 0}세트
          </Text>
          <Text style={styles.allSub}>
            {allTime?.avgWorkoutsPerWeek ?? 0}회/주 ·{' '}
            {allTime?.avgSetsPerWeek ?? 0}세트/주 · 운동일 평균{' '}
            {formatVolume(allTime?.avgVolumePerDay ?? 0) || '0kg'}
            {allTime?.spanDays ? ` (${allTime.spanDays}일 기준)` : ''}
          </Text>
          {(allTime?.totalCardioMinutes ?? 0) > 0 ? (
            <Text style={styles.allSub}>유산소 {allTime.totalCardioMinutes}분</Text>
          ) : null}
          <View style={styles.allPartsGrid}>
            {(allTime?.bodyPartSets ?? []).map(b => (
              <Text key={b.part} style={styles.allPartLine}>
                {b.part} {b.sets}세트
              </Text>
            ))}
          </View>
          {allTime?.favoriteExercise ? (
            <Text style={styles.allSub}>최다 종목: {allTime.favoriteExercise}</Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.beige},
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkBrown,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  scroll: {padding: SPACING.lg, paddingBottom: SPACING.xl * 2},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.beigeSoft,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    minHeight: 96,
  },
  cardWide: {width: '100%'},
  cardLabel: {fontSize: 13, color: COLORS.brownMuted, fontWeight: '600'},
  cardValue: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.indigo,
    marginTop: SPACING.sm,
  },
  cardSub: {fontSize: 12, color: COLORS.brownMuted, marginTop: SPACING.xs, lineHeight: 17},
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.beigeSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkBrown,
    marginBottom: SPACING.md,
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  setsCell: {
    width: '47%',
    backgroundColor: COLORS.beige,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.brownMuted,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  setsPart: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkBrown,
    marginBottom: SPACING.xs,
  },
  setsCount: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.indigo,
  },
  setsUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brownMuted,
  },
  cardioLine: {
    marginTop: SPACING.md,
    fontSize: 13,
    color: COLORS.darkBrown,
    fontWeight: '600',
    textAlign: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.brownMuted,
  },
  rank: {
    width: 24,
    fontWeight: '700',
    color: COLORS.indigo,
    fontSize: 14,
  },
  listMain: {flex: 1},
  listName: {fontSize: 15, fontWeight: '600', color: COLORS.darkBrown},
  listSub: {fontSize: 12, color: COLORS.brownMuted, marginTop: 2},
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  barLabel: {width: 40, fontSize: 13, color: COLORS.darkBrown, fontWeight: '600'},
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.beige,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {height: '100%', backgroundColor: COLORS.indigo, borderRadius: 5},
  barVal: {width: 56, fontSize: 12, textAlign: 'right', color: COLORS.brownMuted},
  empty: {
    textAlign: 'center',
    color: COLORS.brownMuted,
    marginVertical: SPACING.lg,
  },
  allTime: {
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBrown,
    paddingTop: SPACING.lg,
  },
  allLine: {fontSize: 15, color: COLORS.darkBrown, fontWeight: '600'},
  allSub: {fontSize: 13, color: COLORS.brownMuted, marginTop: SPACING.sm},
  allPartsGrid: {
    marginTop: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  allPartLine: {
    fontSize: 12,
    color: COLORS.darkBrown,
    backgroundColor: COLORS.beigeSoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
});
