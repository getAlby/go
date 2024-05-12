import { Invoice } from "@getalby/lightning-tools";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Paid } from "~/animations/Paid";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export function ReceiveSuccess() {
  const { invoice } = useLocalSearchParams() as { invoice: string };
  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  return (
    <View className="flex-1 flex flex-col">
      <Stack.Screen
        options={{
          title: "Payment Successful",
        }}
      />
      <View className="flex-1 justify-center items-center">
        <Paid />
        <Text className="text-lg -mt-24">
          Received {decodedInvoice.satoshi} sats
        </Text>
        {decodedInvoice.description && (
          <Text className="mt-4">{decodedInvoice.description}</Text>
        )}
      </View>
      <View className="flex flex-col flex-shrink-0 gap-3 justify-center items-center px-3 pb-3">
        <Button
          size="lg"
          className="w-full"
          onPress={() => {
            router.replace("/");
            router.push("/receive");
          }}
        >
          <Text className="text-background">Receive Again</Text>
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
