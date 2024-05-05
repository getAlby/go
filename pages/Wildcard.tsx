import { usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Text } from "~/components/ui/text";

export function Wildcard() {
  const pathname = usePathname();

  return (
    <View className="flex-1 justify-center items-center flex flex-col gap-3">
      <ActivityIndicator />
      <Text>Loading {pathname}</Text>
    </View>
  );
}
