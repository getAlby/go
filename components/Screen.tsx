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
};

function Screen({ title, animation, right, left }: ScreenProps) {
  const { background } = useThemeColor("background");

  return (
    <Stack.Screen
      options={{
        title,
        animation: animation ? animation : "slide_from_right",
        headerLeft: left
          ? left
          : ({ canGoBack }) => {
              return (
                canGoBack && (
                  <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeftIcon className="text-secondary-foreground p-4 mr-4" />
                  </TouchableOpacity>
                )
              );
            },
        headerTitle: () => (
          <Text
            className={cn(
              Platform.OS === "android" &&
                (right
                  ? "ml-4"
                  : "mr-[42.18]") /* this translates to width of headerLeft button */,
              "text-xl sm:text-2xl text-center font-semibold2",
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
