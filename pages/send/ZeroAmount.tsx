import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import { DualCurrencyInput } from "~/components/DualCurrencyInput";
import Loading from "~/components/Loading";
import { Receiver } from "~/components/Receiver";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";

export function ZeroAmount() {
  const { invoice, receiver, comment } = useLocalSearchParams() as unknown as {
    invoice: string;
    receiver: string;
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
          receiver,
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
      <DismissableKeyboardView>
        <View className="flex-1 flex flex-col">
          <View className="flex-1 justify-center items-center p-6 gap-6">
            <DualCurrencyInput
              amount={amount}
              setAmount={setAmount}
              autoFocus
              min={1}
            />
            <View className="w-full">
              <Text className="text-muted-foreground text-center font-semibold2"></Text>
            </View>
            {comment && (
              <View className="w-full">
                <Text className="text-muted-foreground text-center font-semibold2">
                  Comment
                </Text>
                <Text className="w-full text-center text-2xl font-semibold2 mt-2">
                  {comment}
                </Text>
              </View>
            )}
            <Receiver name={receiver} />
          </View>
          <View className="p-6">
            <Button
              size="lg"
              className="flex flex-row gap-2"
              onPress={submit}
              disabled={isLoading}
            >
              {isLoading && <Loading className="text-primary-foreground" />}
              <Text>Next</Text>
            </Button>
          </View>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
