import { openURL } from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { type LNURLPaymentSuccessAction } from "lib/lnurl";
import React from "react";
import { ScrollView, View } from "react-native";
import { Tick } from "~/animations/Tick";
import AlbyGoLogo from "~/components/AlbyGoLogo";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";

export function PaymentSuccess() {
  const getFiatAmount = useGetFiatAmount();
  const { receiver, amount, successAction } = useLocalSearchParams() as {
    preimage: string;
    receiver: string;
    amount: string;
    successAction: string;
  };

  const lnurlSuccessAction: LNURLPaymentSuccessAction = successAction
    ? JSON.parse(successAction)
    : undefined;

  return (
    <View className="flex-1 flex flex-col">
      <Screen title="" />
      <ScrollView contentContainerClassName="flex justify-center items-center gap-8 p-6">
        <AlbyGoLogo className="w-52 h-16 mx-auto" />
        <View className="flex-1 w-full">
          <Tick />
        </View>
        <View className="flex flex-col items-center gap-2">
          <View className="flex flex-row items-end justify-center">
            <Text className="text-3xl text-foreground font-semibold2">
              {new Intl.NumberFormat().format(Math.ceil(+amount))}{" "}
            </Text>
            <Text className="text-2xl text-muted-foreground font-semibold2">
              sats
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-2xl text-muted-foreground font-semibold2">
              {getFiatAmount(+amount)}
            </Text>
          )}
        </View>
        <Receiver lightningAddress={receiver} />
        {lnurlSuccessAction && (
          <View className="flex flex-col gap-2 items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Message From Receiver
            </Text>
            {lnurlSuccessAction.tag === "message" && (
              <Text className="text-foreground text-center text-2xl font-medium2">
                {lnurlSuccessAction.message}
              </Text>
            )}
            {lnurlSuccessAction.tag === "url" && (
              <>
                {lnurlSuccessAction.description && (
                  <Text className="text-foreground text-center text-2xl font-medium2">
                    {lnurlSuccessAction.description}
                  </Text>
                )}
                {lnurlSuccessAction.url && (
                  <Button
                    variant="secondary"
                    onPress={() => openURL(lnurlSuccessAction.url ?? "")}
                  >
                    <Text>Open Link</Text>
                  </Button>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
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
