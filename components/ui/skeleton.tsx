import * as React from "react";
import { Animated, Easing, TextProps } from "react-native";
import { cn } from "~/lib/utils";

const duration = 1000;

function Skeleton({ className, ...props }: Omit<TextProps, "style">) {
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.Text
      style={{ opacity }}
      className={cn("rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
