import { Stack, router } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function NewWallet() {
  const [name, setName] = React.useState("");
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 flex flex-col p-3 gap-3">
        <Stack.Screen
          options={{
            title: "Connect Wallet",
          }}
        />

        <Label nativeID="name" className="self-start justify-self-start">
          Wallet name
        </Label>
        <Input
          autoFocus
          className="w-full"
          value={name}
          onChangeText={setName}
          aria-labelledbyledBy="name"
        // aria-errormessage="inputError"
        />
        <Button
          onPress={() => {
            useAppStore.getState().addWallet({ name });
            Toast.show({
              type: "success",
              text1: "New wallet added",
              text2: "Please configure your wallet connection",
            });
            router.dismissAll();
          }}
        >
          <Text>Continue</Text>
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
