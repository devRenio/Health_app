/**
 * DayDetailScreen — day summary with start/end times + edit always available.
 */
import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {useWorkoutStore} from '../store';
import WorkoutRecordCard from '../components/WorkoutRecordCard';
import Fab from '../components/Fab';
import {
  calcDayVolume,
  formatVolume,
  formatBodyParts,
  getDayBodyParts,
  formatTimeRange,
} from '../utils/workoutStats';
import {isToday} from '../utils/dateUtils';
import {COLORS, SPACING} from '../theme';

export default function DayDetailScreen({route, navigation}) {
  const {date} = route.params;
  const loadDayData = useWorkoutStore(s => s.loadDayData);
  const [dayData, setDayData] = useState({records: [], startedAt: null, endedAt: null});

  useFocusEffect(
    useCallback(() => {
      setDayData(loadDayData(date));
    }, [date, loadDayData]),
  );

  const {records, startedAt, endedAt} = dayData;
  const volume = calcDayVolume(records);
  const parts = getDayBodyParts(records);
  const timeRange = formatTimeRange(startedAt, endedAt);
  const hasAny = records.length > 0 || startedAt || endedAt;

  const renderItem = useCallback(
    ({item}) => <WorkoutRecordCard record={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>‹ 캘린더</Text>
        </Pressable>
        <Text style={styles.dateTitle}>{date}</Text>
        <Pressable
          onPress={() =>
            navigation.navigate('WorkoutEditor', {date, mode: 'edit'})
          }>
          <Text style={styles.editBtn}>수정</Text>
        </Pressable>
      </View>

      {hasAny ? (
        <View style={styles.daySummary}>
          {timeRange ? (
            <Text style={styles.summaryLine}>운동 {timeRange}</Text>
          ) : null}
          {volume > 0 || parts.length > 0 ? (
            <Text style={styles.summaryLine}>
              {volume > 0 ? `총 볼륨 ${formatVolume(volume)}` : ''}
              {volume > 0 && parts.length > 0 ? ' · ' : ''}
              {parts.length > 0 ? formatBodyParts(parts) : ''}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.listWrap}>
        <FlashList
          data={records}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          estimatedItemSize={100}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>기록 없음</Text>
              <Text style={styles.emptySub}>
                {isToday(date)
                  ? '오른쪽 아래 버튼으로 운동을 추가하세요.'
                  : '수정에서 시간만 기록하거나 운동을 추가할 수 있습니다.'}
              </Text>
            </View>
          }
        />
      </View>

      {(isToday(date) || !hasAny) && (
        <Fab
          label={isToday(date) ? '+ 오늘 운동' : '+ 운동 추가'}
          onPress={() =>
            navigation.navigate('WorkoutEditor', {date, mode: 'add'})
          }
        />
      )}
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
  back: {color: COLORS.indigo, fontWeight: '600', width: 72},
  dateTitle: {fontSize: 18, fontWeight: '700', color: COLORS.darkBrown},
  editBtn: {color: COLORS.indigo, fontWeight: '700', width: 72, textAlign: 'right'},
  daySummary: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.brownMuted,
  },
  summaryLine: {fontSize: 13, color: COLORS.brownMuted},
  listWrap: {flex: 1},
  listContent: {padding: SPACING.lg, paddingBottom: 80},
  empty: {alignItems: 'center', marginTop: SPACING.xl * 2},
  emptyTitle: {fontSize: 16, fontWeight: '700', color: COLORS.darkBrown},
  emptySub: {
    fontSize: 13,
    color: COLORS.brownMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
