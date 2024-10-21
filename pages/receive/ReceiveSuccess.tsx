import { Invoice } from "@getalby/lightning-tools";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Paid } from "~/animations/Paid";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";

export function ReceiveSuccess() {
  const { invoice } = useLocalSearchParams() as { invoice: string };

  const getFiatAmount = useGetFiatAmount();
  const decodedInvoice = new Invoice({
    pr: invoice,
  });
  return (
    <View className="flex-1 flex flex-col">
      <Screen
        title="Receive successful"
      />
      <ScrollView contentContainerClassName="flex justify-between items-center gap-8 p-6">
        <View className="flex-1 w-full">
          <Paid />
        </View>
        <Text className="text-3xl font-bold2 text-muted-foreground">
          Received
        </Text>
        <View className="flex flex-col items-center gap-2 mt-10">
          <View className="flex flex-row items-end justify-center">
            <Text className="text-3xl text-receive font-semibold2">
              + {new Intl.NumberFormat().format(+decodedInvoice.satoshi)}{" "}
            </Text>
            <Text className="text-2xl text-muted-foreground font-semibold2">sats</Text>
          </View>
          {getFiatAmount &&
            <Text className="text-2xl text-muted-foreground font-semibold2">{getFiatAmount(+decodedInvoice.satoshi)}</Text>
          }
        </View>
        {decodedInvoice.description && (
          <View className="flex flex-col gap-2 items-center">
            <Text className="text-muted-foreground text-center font-semibold2">
              Description
            </Text>
            <Text className="text-foreground text-center text-2xl font-medium2">
              {decodedInvoice.description}
            </Text>
          </View>
        )}
      </ScrollView>
      <View className="flex flex-col gap-3 m-6">
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
