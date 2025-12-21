import { type NativeStackHeaderItemProps } from "@react-navigation/native-stack";
import { router, Stack } from "expo-router";
import { Platform, TouchableOpacity } from "react-native";
import { type StackAnimationTypes } from "react-native-screens";
import { ChevronLeftIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";

type ScreenProps = {
  title: string;
  left?: (props: NativeStackHeaderItemProps) => React.ReactNode;
  right?: (props: NativeStackHeaderItemProps) => React.ReactNode;
  animation?: StackAnimationTypes;
  className?: string;
};

function Screen({ title, className, animation, right, left }: ScreenProps) {
  const { background } = useThemeColor("background");
  const canGoBack = router.canGoBack();
  return (
    <Stack.Screen
      options={{
        title,
        animation: animation ? animation : "slide_from_right",
        headerLeft: left
          ? left
          : () => {
              return (
                canGoBack && (
                  <TouchableOpacity
                    onPressIn={() => {
                      router.back();
                    }}
                    className="-ml-4 py-2 px-6"
                  >
                    <ChevronLeftIcon
                      className="text-secondary-foreground"
                      width={24}
                      height={24}
                    />
                  </TouchableOpacity>
                )
              );
            },
        headerTitle: () => (
          <Text
            className={cn(
              Platform.OS === "android" &&
                (right
                  ? left || canGoBack
                    ? ""
                    : "ml-[52px]"
                  : left || canGoBack
                    ? "mr-[52px]"
                    : ""),
              Platform.select({
                ios: "ios:text-xl ios:sm:text-2xl",
                android: "android:text-xl",
              }),
              "text-center font-semibold2",
              className,
            )}
          >
            {title}
          </Text>
        ),
        headerRight: right ? right : undefined,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: background,
        },
      }}
    />
  );
}

export default Screen;
