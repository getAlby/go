import { Stack, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Paid } from "~/animations/Paid";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import * as Clipboard from "expo-clipboard";

export function PaymentSuccess() {
  const { preimage } = useLocalSearchParams() as { preimage: string };
  return (
    <View className="flex-1 flex flex-col">
      <Stack.Screen
        options={{
          title: "Payment Successful",
        }}
      />
      <View className="flex-1 justify-center items-center">
        <Paid />
        <Text className="font-mono text-sm max-w-sm">Preimage: {preimage}</Text>
      </View>
      <View className="flex flex-col flex-shrink-0 gap-3 justify-center items-center px-3 pb-3">
        <Button
          size="lg"
          className="w-full"
          onPress={() => {
            router.replace("/");
            router.push("/send");
          }}
        >
          <Text className="text-background">Pay Again</Text>
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="w-full"
          onPress={() => {
            router.replace("/");
          }}
        >
          <Text className="text-foreground">Home</Text>
        </Button>
      </View>
    </View>
  );
}
