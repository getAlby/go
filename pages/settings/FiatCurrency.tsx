import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import Screen from "~/components/Screen";
import DismissableKeyboardView from "~/components/DismissableKeyboardView";

export function FiatCurrency() {
  const [fiatCurrency, setFiatCurrency] = React.useState(
    useAppStore.getState().fiatCurrency,
  );
  return (
    <DismissableKeyboardView>
      <View className="flex-1 p-6">
        <Screen title="Units & Currency" />
        <View className="flex-1 flex flex-col">
          <View className="flex-1">
            <Input
              autoFocus
              className="w-full text-center"
              placeholder="USD"
              value={fiatCurrency}
              onChangeText={setFiatCurrency}
              returnKeyType="done"
            // aria-errormessage="inputError"
            />
          </View>
          <Button
            size="lg"
            onPress={() => {
              useAppStore.getState().setFiatCurrency(fiatCurrency);
              Toast.show({
                type: "success",
                text1: "Fiat currency updated",
              });
              router.back();
            }}
          >
            <Text>Save</Text>
          </Button>
        </View>
      </View>
    </DismissableKeyboardView>
  );
}
