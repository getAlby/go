import { Invoice } from "@getalby/lightning-tools";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function ConfirmPayment() {
  const { invoice } = useLocalSearchParams() as { invoice: string };
  const [isLoading, setLoading] = React.useState(false);

  async function pay() {
    setLoading(true);
    try {
      const nwcClient = useAppStore.getState().nwcClient;
      if (!nwcClient) {
        throw new Error("NWC client not connected");
      }
      const response = await nwcClient.payInvoice({
        invoice,
      });

      router.dismissAll();
      router.replace({
        pathname: "/send/success",
        params: { primage: response.preimage },
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  return (
    <>
      <Stack.Screen
        options={{
          title: "Confirm Payment",
        }}
      />
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
      )}

      {!isLoading && (
        <>
          <View className="flex-1 justify-center items-center">
            {!isLoading && <></>}
            <Text className="">Confirm Payment</Text>
            <Text className="text-4xl">{decodedInvoice.satoshi} sats</Text>
            {decodedInvoice.description && (
              <Text className="">{decodedInvoice.description}</Text>
            )}
          </View>
          <View className="flex flex-row gap-3 justify-center items-center px-3 pb-3">
            <Button
              className="flex-1"
              size="lg"
              variant="ghost"
              onPress={router.back}
            >
              <Text className="text-foreground">Cancel</Text>
            </Button>
            <Button className="flex-1" size="lg" onPress={pay}>
              <Text className="text-background">Pay</Text>
            </Button>
          </View>
        </>
      )}
    </>
  );
}
