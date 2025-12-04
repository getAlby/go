import { type NativeStackHeaderItemProps } from "@react-navigation/native-stack";
import { router, Stack } from "expo-router";
import { Platform, TouchableOpacity } from "react-native";
import { type StackAnimationTypes } from "react-native-screens";
import { ChevronLeftIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

type ScreenProps = {
  title: string;
  left?: (props: NativeStackHeaderItemProps) => React.ReactNode;
  right?: (props: NativeStackHeaderItemProps) => React.ReactNode;
  animation?: StackAnimationTypes;
};

function Screen({ title, animation, right, left }: ScreenProps) {
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
                    <ChevronLeftIcon className="text-muted-foreground p-4 mr-4" />
                  </TouchableOpacity>
                )
              );
            },
        headerTitle: () => (
          <Text
            className={cn(
              Platform.OS === "android" && "mr-[42.18]", // this translates to width of headerLeft button
              "text-2xl text-center font-semibold2 text-muted-foreground",
            )}
          >
            {title}
          </Text>
        ),
        headerRight: right ? right : undefined,
        headerShadowVisible: false,
      }}
    />
  );
}

export default Screen;
