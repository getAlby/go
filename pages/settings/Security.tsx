import React from "react";
import { View, Text } from "react-native";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import Screen from "~/components/Screen";
import { useAppStore } from "~/lib/state/appStore";
import { TriangleAlert } from "~/components/Icons";
import { cn } from "~/lib/utils";
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function Security() {
  const isEnabled = useAppStore((store) => store.isSecurityEnabled);
  const isSupported = false;
  return (
    <View className="flex-1 p-6">
      <Screen title="Security" />
      {!isSupported && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-row gap-3 items-center">
              <TriangleAlert size={16} className="text-foreground" />
              <Text>{" "}Setup Device Security</Text>
            </CardTitle>
            <CardDescription>
              To protect your wallet, please set up a phone lock in your device settings first.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Label
            className={cn("text-2xl", !isSupported && "text-muted-foreground")}
            nativeID="security"
            disabled={isSupported}
          >
            <Text className="text-lg">Require phone lock to access</Text>
          </Label>
          <Switch
            checked={isEnabled}
            disabled={!isSupported}
            onCheckedChange={() => {
              useAppStore.getState().setSecurityEnabled(!isEnabled);
            }}
            nativeID="security" />
        </View>
      </View>
    </View>
  );
}
