/**
 * Animation helpers — LayoutAnimation + Animated (no extra native deps).
 */
import {
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import {useEffect, useRef} from 'react';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const animateLayout = (preset = 'ease') => {
  const presets = {
    ease: LayoutAnimation.Presets.easeInEaseOut,
    spring: LayoutAnimation.create(
      280,
      LayoutAnimation.Types.spring,
      LayoutAnimation.Properties.opacity,
    ),
    quick: LayoutAnimation.create(
      180,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity,
    ),
  };
  LayoutAnimation.configureNext(presets[preset] ?? presets.ease);
};

/** Brief scale pulse when `value` changes (number pickers). */
export function useValuePulse(value) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.12,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, scale]);

  return scale;
}

/** Fade + slight slide for calendar month swaps. */
export function useFadeSlide(key) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 9,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [key, opacity, translateY]);

  return {opacity, translateY};
}

/** Slide-up sheet for modals. */
export function useSheetAnimation(visible) {
  const translateY = useRef(new Animated.Value(400)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdrop]);

  return {translateY, backdrop};
}
