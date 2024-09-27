import { router, Stack, useFocusEffect, usePathname } from "expo-router";
import { View } from "react-native";
import Loading from "~/components/Loading";
import { Text } from "~/components/ui/text";

export function Wildcard() {
  const pathname = usePathname();

  // Should a user ever land on this page, redirect them to home
  useFocusEffect(() => {
    router.replace({
      pathname: "/"
    });
  });

  return (
    <View className="flex-1 justify-center items-center flex flex-col gap-3">
      <Stack.Screen
        options={{
          title: "",
          header: () => null, // hide header completely
        }}
      />
      <Loading />
      <Text>Loading</Text>
    </View>
  );
}
