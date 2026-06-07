import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import {COLORS, SPACING, RADIUS} from '../theme';

export default function Fab({label, onPress}) {
  return (
    <Pressable
      style={({pressed}) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    backgroundColor: COLORS.indigo,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 4,
    shadowColor: COLORS.darkBrown,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  text: {color: COLORS.white, fontWeight: '700', fontSize: 15},
  pressed: {backgroundColor: COLORS.indigoPressed},
});
