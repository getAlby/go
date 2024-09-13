import React from "react";
import { View, Text } from "react-native";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import Screen from "~/components/Screen";
import { useAppStore } from "~/lib/state/appStore";

export function Security() {
  const isEnabled = useAppStore((store) => store.isSecurityEnabled);
  return (
    <View className="flex-1 p-6">
      <Screen title="Security" />
      <View className="flex-1">
        <View className='flex-row items-center justify-between gap-2'>
          <Label
            className="text-2xl"
            nativeID='security'
          >
            <Text className="text-lg">Require phone lock to access</Text>
          </Label>
          <Switch
            checked={isEnabled}
            onCheckedChange={() => {
              useAppStore.getState().setSecurityEnabled(!isEnabled);
            }}
            nativeID='security' />
        </View>
      </View>
    </View>
  );
}
