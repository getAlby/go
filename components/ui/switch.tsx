import * as SwitchPrimitives from "@rn-primitives/switch";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

function Switch({
  className,
  ...props
}: SwitchPrimitives.RootProps & {
  ref?: React.RefObject<SwitchPrimitives.RootRef>;
}) {
  const { primary, secondary, muted, background } = useThemeColor(
    "primary",
    "secondary",
    "muted",
    "background",
  );
  const translateX = useDerivedValue(() => (props.checked ? 18 : 2));
  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(translateX.value, { duration: 200 }) },
    ],
  }));
  return (
    <LinearGradient
      className={cn(
        "h-[26px] w-[42px] rounded-full  border",
        props.disabled && "opacity-50",
        props.checked ? "border-secondary" : "border-muted",
      )}
      colors={props.checked ? [secondary, primary] : [muted, background]}
      start={[0, 0]}
      end={[1, 1]}
    >
      <SwitchPrimitives.Root
        className={cn(
          "flex-row h-[26px] w-[42px] shrink-0 items-center rounded-full border-transparent",
          className,
        )}
        {...props}
      >
        <Animated.View style={animatedThumbStyle}>
          <SwitchPrimitives.Thumb
            className={cn(
              "h-[20px] w-[20px] rounded-full bg-background shadow-sm bottom-[1]",
              !props.checked && "dark:bg-muted-foreground",
            )}
          />
        </Animated.View>
      </SwitchPrimitives.Root>
    </LinearGradient>
  );
}

export { Switch };
