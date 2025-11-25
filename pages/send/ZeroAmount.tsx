import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";

export function ZeroAmount() {
  const { invoice, comment } = useLocalSearchParams() as {
    invoice: string;
    comment: string;
  };
  const [isLoading, setLoading] = React.useState(false);
  const [amount, setAmount] = React.useState("");

  async function submit() {
    setLoading(true);
    try {
      router.push({
        pathname: "/send/confirm",
        params: {
          invoice,
          amount,
        },
      });
    } catch (error) {
      console.error(error);
      errorToast(error);
    }
    setLoading(false);
  }

  return (
    <>
      <Screen title="Send" />
      <View className="flex flex-1 flex-col">
        <DualCurrencyInput
          amount={amount}
          setAmount={setAmount}
          description={comment}
          min={1}
          readOnly
        />
        <View className="p-6">
          <Button
            size="lg"
            className="flex flex-row gap-2"
            onPress={submit}
            disabled={!+amount || isLoading}
          >
            {isLoading && <Loading className="text-primary-foreground" />}
            <Text>Next</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
