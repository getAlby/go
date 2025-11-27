import { type NativeStackHeaderItemProps } from "@react-navigation/native-stack";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { type StackAnimationTypes } from "react-native-screens";
import { ChevronLeftIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";

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
          <Text className="text-2xl font-semibold2 text-muted-foreground">
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
