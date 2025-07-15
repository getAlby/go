import * as React from "react";
import { Text, View } from "react-native";
import { type TextRef, type ViewRef } from "~/components/primitives/types";
import { TextClassContext } from "~/components/ui/text";
import { cn } from "~/lib/utils";

const Card = React.forwardRef<
  ViewRef,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      "rounded-2xl border border-border bg-card shadow-sm shadow-foreground/10",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  ViewRef,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  TextRef,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    role="heading"
    aria-level={3}
    ref={ref}
    ellipsizeMode="tail"
    className={cn(
      "text-xl text-card-foreground font-semibold2 leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  TextRef,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn("mt-1 text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  ViewRef,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-card-foreground">
    <View ref={ref} className={cn("p-5", className)} {...props} />
  </TextClassContext.Provider>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  ViewRef,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex flex-row items-center p-5", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
