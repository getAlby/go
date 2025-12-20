import { Invoice } from "@getalby/lightning-tools/bolt11";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { Tick } from "~/animations/Tick";
import AlbyGo from "~/components/icons/AlbyGo";
import { LongTextBottomSheet } from "~/components/LongTextBottomSheet";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function ReceiveSuccess() {
  const { invoice } = useLocalSearchParams() as { invoice: string };
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
  const getFiatAmount = useGetFiatAmount();
  const decodedInvoice = new Invoice({
    pr: invoice,
  });

  const displayCharacterCount = React.useMemo(
    () =>
      new Intl.NumberFormat().format(decodedInvoice.satoshi).length +
      (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [decodedInvoice.satoshi, bitcoinDisplayFormat],
  );

  return (
    <>
      <Screen title="Success" animation="slide_from_left" />
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
                "text-receive !leading-[1.5] font-bold2",
              )}
            >
              +{bitcoinDisplayFormat === "bip177" && " ₿"}
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
                "text-receive !leading-[1.5] font-bold2",
              )}
            >
              {new Intl.NumberFormat().format(+decodedInvoice.satoshi)}
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
                    "text-receive font-semibold2",
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
              {"+ "}
              {getFiatAmount(+decodedInvoice.satoshi)}
            </Text>
          )}
        </View>
        {decodedInvoice.description && (
          <LongTextBottomSheet
            title="Description"
            content={decodedInvoice.description}
          />
        )}
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
