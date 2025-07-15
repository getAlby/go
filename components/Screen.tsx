import { type NativeStackHeaderRightProps } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
import { type StackAnimationTypes } from "react-native-screens";

type ScreenProps = {
  title: string;
  right?: (props: NativeStackHeaderRightProps) => React.ReactNode;
  animation?: StackAnimationTypes;
};

function Screen({ title, animation, right }: ScreenProps) {
  return (
    <Stack.Screen
      options={{
        title,
        animation,
        headerRight: right ? right : undefined,
        headerShadowVisible: false,
      }}
    />
  );
}

export default Screen;
