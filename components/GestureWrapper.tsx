import { useFocusEffect } from "expo-router";
import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface GestureWrapperProps {
  children: React.ReactNode;
  onSwipe: (direction: "left" | "right") => void;
  shouldWiggle?: boolean;
}

export function GestureWrapper({
  children,
  onSwipe,
  shouldWiggle,
}: GestureWrapperProps) {
  const wiggle = useSharedValue(0);

  useFocusEffect(
    React.useCallback(() => {
      if (shouldWiggle) {
        wiggle.value = withDelay(
          500,
          withSequence(
            withTiming(-10, { duration: 150 }),
            withTiming(10, { duration: 300 }),
            withTiming(0, { duration: 150 }),
          ),
        );
      }
    }, [shouldWiggle, wiggle]),
  );

  const gesture = Gesture.Pan().onEnd((evt) => {
    const threshold = 50;
    if (evt.translationX < -threshold) {
      runOnJS(onSwipe)("left");
    } else if (evt.translationX > threshold) {
      runOnJS(onSwipe)("right");
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wiggle.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </GestureDetector>
  );
}
