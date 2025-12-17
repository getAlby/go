import { cva, type VariantProps } from "class-variance-authority";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Platform, Pressable, View } from "react-native";
import { TextClassContext } from "~/components/ui/text";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group flex items-center justify-center active:opacity-80",
  {
    variants: {
      variant: {
        default: "",
        secondary: "bg-background dark:bg-muted",
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

const buttonTextVariants = cva("", {
  variants: {
    variant: {
      default: "font-bold2 text-primary-foreground",
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
  const { primary, secondary, shadow } = useThemeColor(
    "primary",
    "secondary",
    "shadow",
  );
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
            size === "lg" ? "rounded-2xl" : "rounded-xl flex-1",
          )}
          style={{
            ...(pressed && { transform: "scale(0.98)" }),
            ...Platform.select({
              // make sure bg color is applied to avoid RCTView errors
              ios: {
                shadowColor: shadow,
                shadowOpacity: 0.4,
                shadowOffset: {
                  width: 1.5,
                  height: 1.5,
                },
                shadowRadius: 2,
              },
              android: {
                shadowColor: shadow,
                elevation: 3,
              },
            }),
          }}
        >
          <LinearGradient
            colors={[secondary, primary]}
            start={[0, 0]}
            end={[1, 1]}
            className={cn(
              "border border-secondary",
              size === "lg" ? "rounded-2xl" : "rounded-xl",
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
            ...Platform.select({
              // make sure bg color is applied to avoid RCTView errors
              ios: {
                shadowColor: shadow,
                shadowOpacity: 0.4,
                shadowOffset: {
                  width: 1.5,
                  height: 1.5,
                },
                shadowRadius: 2,
              },
              android: {
                shadowColor: shadow,
                elevation: 3,
              },
            }),
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
