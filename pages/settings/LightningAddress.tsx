import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function LightningAddress() {
  const [lightningAddress, setlightningAddress] = React.useState(
    useAppStore.getState().lightningAddress
  );
  return (
    <View className="flex-1 flex flex-col p-3 gap-3">
      <Stack.Screen
        options={{
          title: "Lightning Address",
        }}
      />
      <Input
        autoFocus
        className="w-full text-center mt-6"
        placeholder="hello@getalby.com"
        value={lightningAddress}
        onChangeText={setlightningAddress}
        aria-labelledbyledBy="lightningAddress"
        // aria-errormessage="inputError"
      />
      <Button
        onPress={() =>
          useAppStore.getState().setLightningAddress(lightningAddress)
        }
      >
        <Text>Update Lightning Address</Text>
      </Button>
    </View>
  );
}
