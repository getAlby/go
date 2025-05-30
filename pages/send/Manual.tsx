import React, { useState } from "react";
import { View } from "react-native";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { errorToast } from "~/lib/errorToast";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";

export function Manual() {
  const [keyboardText, setKeyboardText] = useState("");

  const submitKeyboardText = async () => {
    try {
      await initiatePaymentFlow(keyboardText, "");
    } catch (error) {
      console.error("Payment failed:", error);
      errorToast(error);
    }
  };

  return (
    <>
      <Screen title="Manual" />
      <DismissableKeyboardView>
        <View className="flex-1 h-full flex flex-col gap-5 p-6">
          <View className="flex-1 flex items-center justify-center">
            <Text className="text-muted-foreground text-center">
              Type or paste a Lightning Address, lightning invoice or LNURL.
            </Text>
            <Input
              className="w-full text-center mt-6 border-transparent bg-transparent native:text-2xl font-semibold2"
              placeholder="hello@getalby.com"
              value={keyboardText}
              onChangeText={setKeyboardText}
              inputMode="email"
              autoFocus
              returnKeyType="done"
            />
          </View>
          <Button
            onPress={submitKeyboardText}
            disabled={!keyboardText}
            size="lg"
          >
            <Text>Next</Text>
          </Button>
        </View>
      </DismissableKeyboardView>
    </>
  );
}
