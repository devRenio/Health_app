/**
 * Animation helpers — LayoutAnimation + Animated (no extra native deps).
 */
import {
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import {useCallback, useEffect, useRef, useState} from 'react';

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

/**
 * Sheet modal: stays mounted until close animation finishes.
 * Call `requestClose(cb)` instead of toggling visible off immediately.
 */
export function useAnimatedSheet(visible) {
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(400)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(400);
      backdrop.setValue(0);
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
    }
  }, [visible, translateY, backdrop]);

  const requestClose = useCallback(
    onDone => {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 400,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) {
          setMounted(false);
        }
        onDone?.();
      });
    },
    [translateY, backdrop],
  );

  return {mounted, translateY, backdrop, requestClose};
}

/** @deprecated use useAnimatedSheet */
export function useSheetAnimation(visible) {
  return useAnimatedSheet(visible);
}
