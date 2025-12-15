import { cva, type VariantProps } from "class-variance-authority";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Pressable, View } from "react-native";
import { TextClassContext } from "~/components/ui/text";
import { SHADOWS } from "~/lib/constants";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group flex items-center justify-center active:opacity-80",
  {
    variants: {
      variant: {
        default: "",
        secondary: "bg-background",
      },
      size: {
        default: "rounded-xl p-3",
        sm: "rounded-md px-3 py-2",
        lg: "rounded-2xl px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-primary-foreground", {
  variants: {
    variant: {
      default: "font-bold2",
      secondary: "group-active:text-secondary-foreground",
    },
    size: {
      default: "font-medium2",
      sm: "",
      lg: "text-xl sm:text-2xl font-bold2",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    size?: "default" | "sm" | "lg";
  };

function Button({ ref, className, variant, size, ...props }: ButtonProps) {
  const { primary, secondary } = useThemeColor("primary", "secondary");
  const [pressed, setPressed] = React.useState(false);
  return (
    <TextClassContext.Provider
      value={buttonTextVariants({
        variant,
        size,
      })}
    >
      {!variant || variant === "default" ? (
        <View
          className={cn(
            "bg-background",
            size === "lg" ? "rounded-2xl" : "rounded",
          )}
          style={{
            ...(pressed && { transform: "scale(0.98)" }),
            ...SHADOWS.small,
          }}
        >
          <LinearGradient
            colors={[secondary, primary]}
            start={[0, 0]}
            end={[1, 1]}
            className={cn(
              "border border-secondary",
              size === "lg" ? "rounded-2xl" : "rounded",
            )}
          >
            <Pressable
              className={cn(
                props.disabled && "opacity-50",
                buttonVariants({ variant, size, className }),
              )}
              ref={ref}
              role="button"
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
              {...props}
            />
          </LinearGradient>
        </View>
      ) : (
        <Pressable
          className={cn(
            props.disabled && "opacity-50",
            buttonVariants({ variant, size, className }),
          )}
          style={{
            ...(pressed && { transform: "scale(0.98)" }),
            ...SHADOWS.small,
          }}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          ref={ref}
          role="button"
          {...props}
        />
      )}
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
