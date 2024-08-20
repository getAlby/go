import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { Paid } from "~/animations/Paid";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { Copy } from "~/components/Icons";

export function PaymentSuccess() {
  const { preimage, originalText } = useLocalSearchParams() as {
    preimage: string;
    originalText: string;
  };
  return (
    <View className="flex-1 flex flex-col">
      <Stack.Screen
        options={{
          title: "Success",
        }}
      />
      <View className="flex-1 justify-center items-center">
        <Paid />
        <Text className="text-muted-foreground text-center text-xl font-bold">
          Sent to {originalText}
        </Text>
      </View>
      <View className="p-6">
        <Button
          size="lg"
          className="w-full"
          onPress={() => {
            router.replace("/");
          }}
        >
          <Text>Close</Text>
        </Button>
      </View>
    </View>
  );
}
