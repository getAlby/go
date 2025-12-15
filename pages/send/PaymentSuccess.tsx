import { router, useLocalSearchParams } from "expo-router";
import { type LNURLPaymentSuccessAction } from "lib/lnurl";
import React from "react";
import { View } from "react-native";
import { Tick } from "~/animations/Tick";
import AlbyGoLogo from "~/components/AlbyGoLogo";
import Screen from "~/components/Screen";
import { SuccessMessage } from "~/components/SuccessMessage";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function PaymentSuccess() {
  const getFiatAmount = useGetFiatAmount();
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
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
    <View className="flex-1">
      <Screen title="Success" />
      <View className="flex-1">
        <AlbyGoLogo className="w-52 h-16 mx-auto my-4" />
        <View className="flex-1 gap-6">
          <View className="flex-[0.45] flex justify-center items-center">
            <Tick />
          </View>
          <View className="flex-[0.55] flex flex-col justify-center items-center gap-4">
            {receiver && (
              <View className="flex">
                <Text className="text-2xl text-muted-foreground text-center font-semibold2">
                  Sent to
                </Text>
                <Text className="text-center text-2xl font-semibold2">
                  {receiver.toLowerCase().replace("lightning:", "")}
                </Text>
              </View>
            )}
            <View className="flex items-center">
              <View className="flex flex-row items-end">
                <Text
                  className={cn(
                    "text-5xl gap-2 font-semibold2 text-muted-foreground",
                    bitcoinDisplayFormat === "bip177" && "leading-[1.5]",
                  )}
                >
                  -{bitcoinDisplayFormat === "bip177" && " ₿"}{" "}
                </Text>
                <Text
                  className={cn(
                    "text-5xl gap-2 font-semibold2",
                    bitcoinDisplayFormat === "bip177" && "leading-[1.5]",
                  )}
                >
                  {new Intl.NumberFormat().format(Math.ceil(+amount))}
                </Text>
                {bitcoinDisplayFormat === "sats" && (
                  <Text className="text-3xl font-semibold2 text-muted-foreground mb-1">
                    {" "}
                    sats
                  </Text>
                )}
              </View>
              {getFiatAmount && (
                <Text className="text-3xl font-semibold2 text-muted-foreground">
                  {getFiatAmount(+amount)}
                </Text>
              )}
            </View>
            <SuccessMessage lnurlSuccessAction={lnurlSuccessAction} />
          </View>
        </View>
      </View>
      <View className="p-6">
        <Button
          size="lg"
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
