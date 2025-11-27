import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "~/lib/utils";

function Input({
  className,
  placeholderClassName,
  ref,
  ...props
}: TextInputProps & {
  ref?: React.RefObject<TextInput | null>;
}) {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "web:flex min-h-10 native:min-h-12 web:w-full rounded-2xl border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground/30 web:ring-offset-background file:border-0 file:bg-transparent file:font-medium2 web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 caret-primary",
        props.editable === false && "opacity-50 web:cursor-not-allowed",
        className,
      )}
      selectionColor={"hsl(47 100% 50%)"} // translates to primary
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      {...props}
    />
  );
}

export { Input };
