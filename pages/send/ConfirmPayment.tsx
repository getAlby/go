import { Invoice } from "@getalby/lightning-tools";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ZapIcon } from "~/components/Icons";
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
          <View className="flex-1 justify-center items-center gap-6">
            <View className="flex flex-col gap-2">
              <Text className="text-4xl font-bold text-center">{decodedInvoice.satoshi} sats</Text>
              {getFiatAmount && (
                <Text className="text-center text-muted-foreground">{getFiatAmount(decodedInvoice.satoshi)}</Text>
              )}
            </View>
            {decodedInvoice.description && (
              <Text className="text-center">{decodedInvoice.description}</Text>
            )}
            <View className="flex flex-col gap-2">
              <Text className="text-sm text-muted-foreground text-center">to</Text>
              <Text className="text-foreground font-bold text-xl text-center">
                {originalText}
              </Text>
            </View>
          </View>
          <View className="p-6">
            <Button size="lg" onPress={pay} className="flex flex-row gap-2">
              <ZapIcon className="text-gray-600" />
              <Text>Send</Text>
            </Button>
          </View>
        </>
      )}
    </>
  );
}
