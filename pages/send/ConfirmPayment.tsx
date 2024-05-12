import { Invoice } from "@getalby/lightning-tools";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import Loading from "~/components/Loading";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { errorToast } from "~/lib/errorToast";
import { useAppStore } from "~/lib/state/appStore";

export function ConfirmPayment() {
  const { invoice, originalText } = useLocalSearchParams() as {
    invoice: string;
    originalText: string;
  };
  const getFiatAmount = useGetFiatAmount();
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

      console.log("payInvoice Response", response);

      router.dismissAll();
      router.replace({
        pathname: "/send/success",
        params: { preimage: response.preimage, originalText },
      });
    } catch (error) {
      console.error(error);
      errorToast(error as Error);
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
          <Loading />
        </View>
      )}

      {!isLoading && (
        <>
          <View className="flex-1 justify-center items-center gap-3">
            <Text className="">Confirm Payment</Text>
            <Text className="text-4xl">{decodedInvoice.satoshi} sats</Text>
            {getFiatAmount && (
              <Text>{getFiatAmount(decodedInvoice.satoshi)}</Text>
            )}

            {decodedInvoice.description && (
              <Text className="">{decodedInvoice.description}</Text>
            )}

            <Text className="text-sm text-muted-foreground">to</Text>
            <Text className="text-sm max-w-sm text-muted-foreground">
              {originalText}
            </Text>
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
