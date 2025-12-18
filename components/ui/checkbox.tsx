import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { TouchableOpacity } from "react-native";
import CheckIcon from "~/components/icons/CheckIcon";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

type CheckboxProps = React.ComponentProps<typeof TouchableOpacity> & {
  isChecked: boolean;
};

function Checkbox({ className, isChecked, children, ...props }: CheckboxProps) {
  const { primary, secondary, muted, background } = useThemeColor(
    "primary",
    "secondary",
    "muted",
    "background",
  );

  return (
    <TouchableOpacity
      className={cn("flex flex-row items-center gap-4", className)}
      {...props}
    >
      {isChecked ? (
        <LinearGradient
          className="px-[4px] rounded-lg aspect-square flex items-center justify-center border-secondary border"
          colors={[secondary, primary]}
          start={[0, 0]}
          end={[1, 1]}
        >
          <CheckIcon width={14} height={14} />
        </LinearGradient>
      ) : (
        <LinearGradient
          className="px-[11px] rounded-lg aspect-square flex items-center justify-center border-muted border"
          colors={[background, muted]}
          start={[0, 0]}
          end={[1, 1]}
        />
      )}
      {children}
    </TouchableOpacity>
  );
}

export { Checkbox };
