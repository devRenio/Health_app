/**
 * MonthYearHeader — prev/next arrows + tappable year/month pickers.
 */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {COLORS, SPACING, RADIUS} from '../theme';
import {animateLayout} from '../utils/animations';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WHEEL_ITEM_H = 44;
const WHEEL_VISIBLE = 5;

function YearWheelPicker({years, selected, onSelect}) {
  const scrollRef = useRef(null);
  const selectedIdx = Math.max(0, years.indexOf(selected));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: selectedIdx * WHEEL_ITEM_H,
        animated: false,
      });
    }
  }, [selectedIdx, years]);

  const handleScrollEnd = offsetY => {
    const idx = Math.max(0, Math.min(years.length - 1, Math.round(offsetY / WHEEL_ITEM_H)));
    const next = years[idx];
    if (next !== selected) {
      onSelect(next);
    }
  };

  return (
    <View style={styles.wheelWrap}>
      <View style={styles.wheelHighlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        style={styles.wheelScroll}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
        }}
        onMomentumScrollEnd={e =>
          handleScrollEnd(e.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={e => handleScrollEnd(e.nativeEvent.contentOffset.y)}>
        {years.map(y => (
          <Pressable
            key={y}
            style={styles.wheelItem}
            onPress={() => onSelect(y)}>
            <Text
              style={[
                styles.wheelText,
                y === selected && styles.wheelTextActive,
              ]}>
              {y}년
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default function MonthYearHeader({
  year,
  month,
  yearRange,
  onChange,
  onPrev,
  onNext,
}) {
  const [picker, setPicker] = useState(null);

  const years =
    yearRange?.length > 0
      ? yearRange
      : [new Date().getFullYear(), new Date().getFullYear() + 1];

  const pickYear = y => {
    animateLayout('quick');
    onChange(y, month);
  };

  const pickMonth = m => {
    animateLayout('quick');
    onChange(year, m - 1);
    setPicker(null);
  };

  return (
    <>
      <View style={styles.header}>
        <Pressable onPress={onPrev} hitSlop={12} style={styles.arrow}>
          <Text style={styles.navBtn}>‹</Text>
        </Pressable>

        <View style={styles.titleRow}>
          <Pressable onPress={() => setPicker('year')} hitSlop={8}>
            <Text style={styles.titleText}>{year}년</Text>
          </Pressable>
          <Pressable onPress={() => setPicker('month')} hitSlop={8}>
            <Text style={styles.titleText}>{month + 1}월</Text>
          </Pressable>
        </View>

        <Pressable onPress={onNext} hitSlop={12} style={styles.arrow}>
          <Text style={styles.navBtn}>›</Text>
        </Pressable>
      </View>

      <Modal
        visible={picker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}>
        <Pressable style={styles.overlay} onPress={() => setPicker(null)}>
          <SafeAreaView style={styles.sheetWrap}>
            <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
              <Text style={styles.sheetTitle}>
                {picker === 'year' ? '연도 선택' : '월 선택'}
              </Text>
              {picker === 'year' ? (
                <YearWheelPicker
                  years={years}
                  selected={year}
                  onSelect={pickYear}
                />
              ) : (
                <View style={styles.monthGrid}>
                  {MONTHS.map(m => (
                    <Pressable
                      key={m}
                      onPress={() => pickMonth(m)}
                      style={[
                        styles.monthCell,
                        m === month + 1 && styles.cellActive,
                      ]}>
                      <Text
                        style={[
                          styles.cellText,
                          m === month + 1 && styles.cellTextActive,
                        ]}>
                        {m}월
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <Pressable style={styles.closeBtn} onPress={() => setPicker(null)}>
                <Text style={styles.closeText}>닫기</Text>
              </Pressable>
            </Pressable>
          </SafeAreaView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBrown,
  },
  arrow: {width: 40, alignItems: 'center'},
  navBtn: {fontSize: 28, color: COLORS.darkBrown, lineHeight: 30},
  titleRow: {flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm},
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.darkBrown,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(62,44,35,0.45)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  sheetWrap: {flex: 1, justifyContent: 'center'},
  sheet: {
    backgroundColor: COLORS.beigeSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkBrown,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  wheelWrap: {
    height: WHEEL_ITEM_H * WHEEL_VISIBLE,
    position: 'relative',
    overflow: 'hidden',
  },
  wheelScroll: {flex: 1},
  wheelHighlight: {
    position: 'absolute',
    top: WHEEL_ITEM_H * Math.floor(WHEEL_VISIBLE / 2),
    left: 0,
    right: 0,
    height: WHEEL_ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.indigo,
    backgroundColor: 'rgba(75,63,114,0.08)',
    zIndex: 1,
  },
  wheelItem: {
    height: WHEEL_ITEM_H,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.brownMuted,
  },
  wheelTextActive: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkBrown,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  monthCell: {
    width: '30%',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    alignItems: 'center',
  },
  cellActive: {backgroundColor: COLORS.indigo, borderColor: COLORS.indigo},
  cellText: {fontSize: 15, fontWeight: '600', color: COLORS.darkBrown},
  cellTextActive: {color: COLORS.white},
  closeBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  closeText: {color: COLORS.brownMuted, fontWeight: '600'},
});
