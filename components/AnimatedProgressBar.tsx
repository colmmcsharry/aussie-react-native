/**
 * Smoothly animating progress bar using Reanimated (NativeMotion-style).
 * Progress is driven by prop changes; useEffect runs withTiming so the bar animates on iOS/Android.
 * @see https://nativemotion.dev/docs/components/progress-bar
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';

type Props = {
  progress: number; // 0 to 1
  width: number;
  height: number;
  color?: string;
  trackColor?: string;
  borderRadius?: number;
  animationDuration?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedProgressBar({
  progress,
  width,
  height,
  color = 'rgb(40, 164, 40)',
  trackColor = 'rgba(128,128,128,0.2)',
  borderRadius = 10,
  animationDuration = 400,
  style,
}: Props) {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    progressValue.value = withTiming(clamped, {
      duration: animationDuration,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.Never,
    });
  }, [progress, animationDuration, progressValue]);

  const animatedFillStyle = useAnimatedStyle(() => ({
    width: progressValue.value * width,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          width,
          height,
          borderRadius,
          backgroundColor: trackColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius,
            backgroundColor: color,
          },
          animatedFillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
