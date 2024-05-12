import { Stack, router } from "expo-router";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function NewAddressBookEntry() {
  const [name, setName] = React.useState("");
  const [lightningAddress, setLightningAddress] = React.useState("");
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View className="flex-1 flex flex-col p-3 gap-3">
        <Stack.Screen
          options={{
            title: "New Address Book Entry",
          }}
        />
        <Label nativeID="name" className="self-start justify-self-start">
          Recipient name
        </Label>
        <Input
          autoFocus
          placeholder="Satoshi"
          className="w-full"
          value={name}
          onChangeText={setName}
          aria-labelledbyledBy="name"
          // aria-errormessage="inputError"
        />
        <Label
          nativeID="lightningAddress"
          className="self-start justify-self-start"
        >
          Recipient lightning address
        </Label>
        <Input
          className="w-full"
          value={lightningAddress}
          placeholder="satoshin@gmx.com"
          onChangeText={setLightningAddress}
          aria-labelledbyledBy="lightningAddress"
          // aria-errormessage="inputError"
        />

        <Button
          onPress={() => {
            useAppStore
              .getState()
              .addAddressBookEntry({ name, lightningAddress });
            Toast.show({
              type: "success",
              text1: "New address book entry entry added",
            });
            router.back();
          }}
        >
          <Text>Add Recipient</Text>
        </Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
