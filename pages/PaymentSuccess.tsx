import { Stack, router, useLocalSearchParams } from "expo-router";
import { Pressable, View } from "react-native";
import { Paid } from "~/animations/Paid";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { Copy } from "~/components/Icons";

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
        <Pressable
          onPress={() => {
            Clipboard.setStringAsync(preimage);
            Toast.show({
              type: "success",
              text1: "Preimage copied",
              text2: "You can use this to prove your payment",
            });
          }}
        >
          <View className="flex flex-row items-center justify-center gap-3">
            <Copy className="text-muted-foreground" width={16} height={16} />
            <Text className="text-muted-foreground text-sm max-w-sm">
              Preimage: {preimage}
            </Text>
          </View>
        </Pressable>
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
          <Text className="text-background">Do Another Payment</Text>
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
