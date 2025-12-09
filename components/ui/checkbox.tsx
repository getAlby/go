import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Text, TouchableOpacity } from "react-native";
import { CheckIcon } from "~/components/Icons";
import { cn } from "~/lib/utils";

type CheckboxProps = React.ComponentProps<typeof TouchableOpacity> & {
  isChecked: boolean;
  text?: string;
};

function Checkbox({
  className,
  isChecked,
  text,
  children,
  ...props
}: CheckboxProps) {
  return (
    <TouchableOpacity
      className={cn("flex flex-row items-center gap-4", className)}
      {...props}
    >
      {isChecked ? (
        <LinearGradient
          className="px-1 rounded-lg aspect-square flex items-center justify-center border-secondary border"
          colors={["#FFE951", "#FFC453"]}
          start={[0, 0]}
          end={[1, 1]}
        >
          <CheckIcon width={14} height={14} />
        </LinearGradient>
      ) : (
        <LinearGradient
          className="px-3 rounded-lg aspect-square flex items-center justify-center border-muted border"
          colors={["#E4E6EA", "#F9FAFB"]}
          start={[0, 0]}
          end={[1, 1]}
        />
      )}
      {children
        ? children
        : text && (
            <Text className="text-lg font-semibold2 text-secondary-foreground">
              {text}
            </Text>
          )}
    </TouchableOpacity>
  );
}

export { Checkbox };
