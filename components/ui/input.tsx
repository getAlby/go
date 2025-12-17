import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

function Input({
  className,
  placeholderClassName,
  ref,
  ...props
}: TextInputProps & {
  ref?: React.RefObject<TextInput | null>;
}) {
  const { primary } = useThemeColor("primary");
  return (
    <TextInput
      ref={ref}
      className={cn(
        "min-h-12 rounded-2xl border border-input bg-background px-3 text-foreground placeholder:text-muted",
        props.editable === false && "opacity-50 cursor-not-allowed",
        className,
      )}
      selectionColor={primary}
      placeholderClassName={cn("text-muted", placeholderClassName)}
      {...props}
    />
  );
}

export { Input };
