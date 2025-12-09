import { cva, type VariantProps } from "class-variance-authority";
import { LinearGradient } from "expo-linear-gradient";
import * as React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { TextClassContext } from "~/components/ui/text";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "group flex items-center justify-center rounded-lg web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "web:hover:opacity-90 active:opacity-90",
        destructive: "bg-destructive web:hover:opacity-90 active:opacity-90",
        outline:
          "border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        secondary: "bg-background web:hover:opacity-80 active:opacity-80",
        ghost:
          "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
        link: "web:underline-offset-4 web:hover:underline web:focus:underline",
      },
      size: {
        default: "min-h-10 px-4 py-2 native:min-h-12 native:px-3 native:py-3",
        sm: "min-h-9 rounded-md px-3",
        lg: "rounded-2xl px-8 py-4",
        icon: "min-h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap text-foreground web:transition-colors leading-6",
  {
    variants: {
      variant: {
        default: "font-bold2",
        destructive: "text-destructive-foreground",
        outline: "group-active:text-accent-foreground",
        secondary: "text-foreground group-active:text-secondary-foreground",
        ghost: "group-active:text-accent-foreground",
        link: "text-primary group-active:underline",
      },
      size: {
        default: "font-medium2",
        sm: "",
        lg: "text-xl sm:text-2xl font-bold2",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ ref, className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider
      value={buttonTextVariants({
        variant,
        size,
        className: "web:pointer-events-none",
      })}
    >
      {!variant || variant === "default" ? (
        <View
          style={[
            {
              borderRadius: size === "lg" ? 16 : 4,
              backgroundColor: "white",
            },
            shadows.small,
          ]}
        >
          <LinearGradient
            colors={["#FFE951", "#FFC453"]}
            start={[0, 0]}
            end={[1, 1]}
            style={{ borderRadius: size === "lg" ? 16 : 4 }}
            className="border border-secondary"
          >
            <Pressable
              className={cn(
                props.disabled && "opacity-50 web:pointer-events-none",
                buttonVariants({ variant, size, className }),
              )}
              ref={ref}
              role="button"
              {...props}
            />
          </LinearGradient>
        </View>
      ) : (
        <Pressable
          className={cn(
            props.disabled && "opacity-50 web:pointer-events-none",
            buttonVariants({ variant, size, className }),
          )}
          style={[variant === "ghost" ? {} : shadows.small]}
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

const shadows = StyleSheet.create({
  small: {
    ...Platform.select({
      // make sure bg color is applied to avoid RCTView errors
      ios: {
        shadowColor: "#6F8CB0",
        shadowOpacity: 0.4,
        shadowOffset: {
          width: 1.5,
          height: 1.5,
        },
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
