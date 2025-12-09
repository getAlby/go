import * as SwitchPrimitives from "@rn-primitives/switch";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { cn } from "~/lib/utils";

function Switch({
  className,
  ...props
}: SwitchPrimitives.RootProps & {
  ref?: React.RefObject<SwitchPrimitives.RootRef>;
}) {
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
      colors={props.checked ? ["#FFE951", "#FFC453"] : ["#E4E6EA", "#F9FAFB"]}
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
              "h-[20px] w-[20px] rounded-full bg-background border-primary shadow-sm bottom-[1]",
              props.checked
                ? "border-secondary shadow-muted-foreground"
                : "border-muted shadow-muted-foreground",
            )}
          />
        </Animated.View>
      </SwitchPrimitives.Root>
    </LinearGradient>
  );
}

export { Switch };
