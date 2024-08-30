import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import Loading from "~/components/Loading";
import { Text } from "~/components/ui/text";
import { useHandleLinking } from "~/hooks/useHandleLinking";

export function Wildcard() {
  const pathname = usePathname();
  useHandleLinking();

  return (
    <View className="flex-1 justify-center items-center flex flex-col gap-3">
      <Stack.Screen
        options={{
          title: "",
          header: () => null, // hide header completely
        }}
      />
      <Loading />
      <Text>Loading {pathname}</Text>
    </View>
  );
}
