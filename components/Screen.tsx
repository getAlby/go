import { type NativeStackHeaderItemProps } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
import { type StackAnimationTypes } from "react-native-screens";

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
        animation,
        headerLeft: left ? left : undefined,
        headerRight: right ? right : undefined,
        headerShadowVisible: false,
      }}
    />
  );
}

export default Screen;
