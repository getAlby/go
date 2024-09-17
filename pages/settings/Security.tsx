import React from "react";
import { View, Text } from "react-native";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import Screen from "~/components/Screen";
import { useAppStore } from "~/lib/state/appStore";
import { TriangleAlert } from "~/components/Icons";
import { cn } from "~/lib/utils";

export function Security() {
  const isEnabled = useAppStore((store) => store.isSecurityEnabled);
  const isSupported = useAppStore((store) => store.isBiometricSupported);
  return (
    <View className="flex-1 p-6">
      <Screen title="Security" />
      {!isSupported && (
        <View className="flex-row items-center border border-muted-foreground rounded-lg p-3 mb-4 gap-3">
          <TriangleAlert className="text-foreground" />
          <View className="flex-col">
            <Text className="font-bold text-base">Can't add security</Text>
            <Text className="text-sm">
              Add phone lock in device settings to secure access
            </Text>
          </View>
        </View>
      )}
      <View className="flex-1">
        <View className='flex-row items-center justify-between gap-2'>
          <Label
            className={cn('text-2xl', !isSupported && 'opacity-50')}
            nativeID='security'
          >
            <Text className="text-lg">Require phone lock to access</Text>
          </Label>
          <Switch
            checked={isEnabled}
            disabled={!isSupported}
            onCheckedChange={() => {
              useAppStore.getState().setSecurityEnabled(!isEnabled);
            }}
            nativeID='security' />
        </View>
      </View>
    </View>
  );
}
