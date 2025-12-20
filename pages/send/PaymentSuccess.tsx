import { router, useLocalSearchParams } from "expo-router";
import { type LNURLPaymentSuccessAction } from "lib/lnurl";
import React from "react";
import { Platform, View } from "react-native";
import { Tick } from "~/animations/Tick";
import AlbyGo from "~/components/icons/AlbyGo";
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
  const { amount, successAction } = useLocalSearchParams() as {
    amount: string;
    successAction: string;
  };

  const lnurlSuccessAction: LNURLPaymentSuccessAction = successAction
    ? JSON.parse(successAction)
    : undefined;

  const displayCharacterCount = React.useMemo(
    () =>
      new Intl.NumberFormat().format(Math.ceil(+amount)).length +
      (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [amount, bitcoinDisplayFormat],
  );

  return (
    <>
      <Screen title="Success" />
      <View className="flex flex-1 items-center gap-6 sm:gap-10 justify-center px-6">
        <Tick />
        <View className="flex items-center gap-2">
          <View className="flex flex-row items-center justify-evenly gap-2">
            <Text
              className={cn(
                Platform.select({
                  ios: cn(
                    displayCharacterCount > 11
                      ? "ios:text-4xl"
                      : "ios:text-5xl",
                    displayCharacterCount <= 14 &&
                      displayCharacterCount >= 11 &&
                      "ios:sm:text-5xl",
                  ),
                  android: cn(
                    displayCharacterCount > 11
                      ? "android:text-3xl"
                      : "android:text-[42px]",
                    displayCharacterCount <= 14 &&
                      displayCharacterCount >= 11 &&
                      "sm:android:text-[42px]",
                  ),
                }),
                "text-secondary-foreground !leading-[1.5] font-bold2",
              )}
            >
              -{bitcoinDisplayFormat === "bip177" && " ₿"}
            </Text>
            <Text
              className={cn(
                Platform.select({
                  ios: cn(
                    displayCharacterCount > 11
                      ? "ios:text-4xl"
                      : "ios:text-5xl",
                    displayCharacterCount <= 14 &&
                      displayCharacterCount >= 11 &&
                      "ios:sm:text-5xl",
                  ),
                  android: cn(
                    displayCharacterCount > 11
                      ? "android:text-3xl"
                      : "android:text-[42px]",
                    displayCharacterCount <= 14 &&
                      displayCharacterCount >= 11 &&
                      "sm:android:text-[42px]",
                  ),
                }),
                "!leading-[1.5] font-bold2",
              )}
            >
              {new Intl.NumberFormat().format(Math.ceil(+amount))}
              {bitcoinDisplayFormat === "sats" && (
                <Text
                  className={cn(
                    Platform.select({
                      ios: cn(
                        displayCharacterCount > 11
                          ? "ios:text-4xl"
                          : "ios:text-5xl",
                        displayCharacterCount <= 14 &&
                          displayCharacterCount >= 11 &&
                          "ios:sm:text-5xl",
                      ),
                      android: cn(
                        displayCharacterCount > 11
                          ? "android:text-3xl"
                          : "android:text-[42px]",
                        displayCharacterCount <= 14 &&
                          displayCharacterCount >= 11 &&
                          "sm:android:text-[42px]",
                      ),
                    }),
                    "text-secondary-foreground font-semibold2",
                  )}
                >
                  {" "}
                  sats
                </Text>
              )}
            </Text>
          </View>
          {getFiatAmount && (
            <Text className="text-center text-secondary-foreground ios:text-3xl android:text-2xl font-semibold2">
              {"- "}
              {getFiatAmount(+amount)}
            </Text>
          )}
        </View>
        <SuccessMessage lnurlSuccessAction={lnurlSuccessAction} />
      </View>
      <View className="p-6 bg-background">
        <Button
          size="lg"
          onPress={() => {
            router.replace("/");
          }}
        >
          <Text>Close</Text>
        </Button>
        <View className="mt-6 flex items-center">
          <AlbyGo width={80} height={20} />
        </View>
      </View>
    </>
  );
}
