import { Invoice } from "@getalby/lightning-tools/bolt11";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Tick } from "~/animations/Tick";
import AlbyGoLogo from "~/components/AlbyGoLogo";
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
  return (
    <View className="flex-1 flex flex-col">
      <Screen title="" animation="slide_from_left" />
      <View className="flex-1 gap-8">
        <AlbyGoLogo className="w-52 h-16 mx-auto" />
        <View className="flex-1 flex justify-center items-center">
          <Tick />
        </View>
        <View className="flex-1 flex flex-col gap-5 justify-center items-center">
          <Text className="text-4xl font-bold2 text-muted-foreground">
            Received
          </Text>
          <View className="flex flex-col items-center justify-center gap-2">
            <View className="flex flex-row items-end">
              <Text
                className={cn(
                  "text-5xl gap-2 font-semibold2 text-receive",
                  bitcoinDisplayFormat === "bip177" && "leading-[1.5]",
                )}
              >
                +{bitcoinDisplayFormat === "bip177" && " ₿"}{" "}
                {new Intl.NumberFormat().format(+decodedInvoice.satoshi)}
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
                {getFiatAmount(+decodedInvoice.satoshi)}
              </Text>
            )}
          </View>
        </View>
        {decodedInvoice.description && (
          <View className="flex flex-col gap-2 items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Description
            </Text>
            <Text className="text-foreground text-center text-xl font-medium2">
              {decodedInvoice.description}
            </Text>
          </View>
        )}
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
