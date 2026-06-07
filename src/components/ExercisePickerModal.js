/**
 * ExercisePickerModal — animated sheet; multi body-part selection.
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useWorkoutStore} from '../store';
import {
  BODY_PARTS,
  DEFAULT_BODY_PARTS,
  formatBodyPartsLabel,
  toggleBodyPart,
  normalizeBodyParts,
} from '../constants/bodyParts';
import {COLORS, SPACING, RADIUS} from '../theme';
import {animateLayout, useSheetAnimation} from '../utils/animations';

export default function ExercisePickerModal({visible, onClose, onSelect}) {
  const exercises = useWorkoutStore(s => s.exercises);
  const getExerciseStats = useWorkoutStore(s => s.getExerciseStats);
  const addExercise = useWorkoutStore(s => s.addExercise);
  const updateExercise = useWorkoutStore(s => s.updateExercise);
  const removeExercise = useWorkoutStore(s => s.removeExercise);

  const {translateY, backdrop} = useSheetAnimation(visible);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newParts, setNewParts] = useState(DEFAULT_BODY_PARTS);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editParts, setEditParts] = useState(DEFAULT_BODY_PARTS);

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setAdding(false);
    setNewName('');
    setNewParts(DEFAULT_BODY_PARTS);
    setEditId(null);
  };

  const handleSelect = exercise => {
    onSelect(exercise);
    resetForm();
    onClose();
  };

  const handleAdd = () => {
    if (normalizeBodyParts(newParts).length === 0) {
      return;
    }
    const created = addExercise({name: newName, bodyParts: newParts});
    if (created) {
      animateLayout('spring');
      resetForm();
    }
  };

  const startEdit = ex => {
    animateLayout('quick');
    setEditId(ex.id);
    setEditName(ex.name);
    setEditParts(normalizeBodyParts(ex.bodyParts));
    setAdding(false);
  };

  const saveEdit = () => {
    if (editId && normalizeBodyParts(editParts).length > 0) {
      updateExercise(editId, {name: editName.trim(), bodyParts: editParts});
      animateLayout('spring');
      resetForm();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, {opacity: backdrop}]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheetWrap, {transform: [{translateY}]}]}>
          <SafeAreaView style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>종목 선택</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={styles.close}>닫기</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
              {exercises.map(ex => {
                const stat = getExerciseStats(ex.id);
                const isEditing = editId === ex.id;

                if (isEditing) {
                  return (
                    <View key={ex.id} style={styles.editBox}>
                      <TextInput
                        style={styles.textInput}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="종목명"
                        placeholderTextColor={COLORS.brownMuted}
                      />
                      <PartChips
                        selected={editParts}
                        onToggle={p => {
                          animateLayout('quick');
                          setEditParts(toggleBodyPart(editParts, p));
                        }}
                      />
                      <View style={styles.editActions}>
                        <Pressable style={styles.saveChip} onPress={saveEdit}>
                          <Text style={styles.saveChipText}>저장</Text>
                        </Pressable>
                        <Pressable onPress={resetForm}>
                          <Text style={styles.cancelText}>취소</Text>
                        </Pressable>
                        {!ex.isDefault ? (
                          <Pressable
                            onPress={() => {
                              animateLayout('spring');
                              removeExercise(ex.id);
                              resetForm();
                            }}>
                            <Text style={styles.deleteText}>삭제</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                }

                return (
                  <Pressable
                    key={ex.id}
                    style={({pressed}) => [styles.row, pressed && styles.pressed]}
                    onPress={() => handleSelect(ex)}
                    onLongPress={() => startEdit(ex)}>
                    <View style={styles.rowMain}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      <Text style={styles.exPart}>
                        {formatBodyPartsLabel(ex.bodyParts)}
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      {stat ? (
                        <Text style={styles.lastStat}>
                          직전 {stat.lastWeight}kg × {stat.lastReps}
                        </Text>
                      ) : (
                        <Text style={styles.noStat}>기록 없음</Text>
                      )}
                      <Pressable hitSlop={8} onPress={() => startEdit(ex)}>
                        <Text style={styles.editLink}>편집</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {adding ? (
              <View style={styles.addBox}>
                <TextInput
                  style={styles.textInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="새 종목명"
                  placeholderTextColor={COLORS.brownMuted}
                />
                <PartChips
                  selected={newParts}
                  onToggle={p => {
                    animateLayout('quick');
                    setNewParts(toggleBodyPart(newParts, p));
                  }}
                />
                <Pressable style={styles.addConfirm} onPress={handleAdd}>
                  <Text style={styles.addConfirmText}>추가</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.addBtn}
                onPress={() => {
                  animateLayout('spring');
                  setAdding(true);
                }}>
                <Text style={styles.addBtnText}>+ 종목 추가</Text>
              </Pressable>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function PartChips({selected, onToggle}) {
  const list = normalizeBodyParts(selected);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
      {BODY_PARTS.map(p => {
        const active = list.includes(p);
        return (
          <Pressable
            key={p}
            onPress={() => onToggle(p)}
            style={[styles.chip, active && styles.chipActive]}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(62,44,35,0.45)',
  },
  sheetWrap: {maxHeight: '85%'},
  sheet: {
    backgroundColor: COLORS.beigeSoft,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBrown,
  },
  title: {fontSize: 16, fontWeight: '700', color: COLORS.darkBrown},
  close: {color: COLORS.indigo, fontWeight: '600'},
  list: {padding: SPACING.md},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.brownMuted,
  },
  rowMain: {flex: 1},
  exName: {fontSize: 15, fontWeight: '700', color: COLORS.darkBrown},
  exPart: {fontSize: 11, color: COLORS.brownMuted, marginTop: 2},
  rowRight: {alignItems: 'flex-end'},
  lastStat: {fontSize: 11, color: COLORS.indigo, fontWeight: '600'},
  noStat: {fontSize: 11, color: COLORS.brownMuted},
  editLink: {fontSize: 11, color: COLORS.brownMuted, marginTop: 2},
  addBtn: {
    margin: SPACING.md,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.indigo,
    alignItems: 'center',
  },
  addBtnText: {color: COLORS.indigo, fontWeight: '700', fontSize: 13},
  addBox: {padding: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.darkBrown},
  editBox: {
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.beige,
    borderRadius: RADIUS.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 14,
    color: COLORS.darkBrown,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.xs,
  },
  chips: {marginBottom: SPACING.xs},
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.darkBrown,
    marginRight: SPACING.xs,
  },
  chipActive: {backgroundColor: COLORS.indigo, borderColor: COLORS.indigo},
  chipText: {fontSize: 11, fontWeight: '600', color: COLORS.darkBrown},
  chipTextActive: {color: COLORS.white},
  addConfirm: {
    backgroundColor: COLORS.indigo,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  addConfirmText: {color: COLORS.white, fontWeight: '700'},
  editActions: {flexDirection: 'row', gap: SPACING.md, alignItems: 'center'},
  saveChip: {
    backgroundColor: COLORS.indigo,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  saveChipText: {color: COLORS.white, fontWeight: '600', fontSize: 12},
  cancelText: {color: COLORS.brownMuted, fontSize: 12},
  deleteText: {color: COLORS.danger, fontWeight: '600', fontSize: 12},
  pressed: {opacity: 0.6},
});
