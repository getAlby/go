import React from "react";
import { Platform, View } from "react-native";
import Alert from "~/components/Alert";
import { TriangleAlertIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { IS_EXPO_GO } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { clearWidgetSnapshot, writeWidgetSnapshot, buildWidgetSnapshotFromState } from "~/lib/widgets";

export function Widgets() {
  const isWidgetsEnabled = useAppStore((store) => store.isWidgetsEnabled);
  const hideWidgetAmounts = useAppStore((store) => store.hideWidgetAmounts);
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);

  const isSupported = Platform.OS === "ios" && !IS_EXPO_GO;

  const handleWidgetsEnabledChange = async (enabled: boolean) => {
    useAppStore.getState().setWidgetsEnabled(enabled);
    
    if (!enabled) {
      // Clear widget data when disabled
      await clearWidgetSnapshot();
    } else {
      // Write current snapshot when enabled
      // The WidgetSync hook will handle subsequent updates
      const snapshot = buildWidgetSnapshotFromState({
        widgetsEnabled: true,
        hideAmounts: hideWidgetAmounts,
        fiatCurrency,
        // Balance and transactions will be populated by WidgetSync
        balanceMsats: undefined,
        fiatRate: undefined,
        lastTransaction: undefined,
      });
      await writeWidgetSnapshot(snapshot);
    }
  };

  const handleHideAmountsChange = async (hide: boolean) => {
    useAppStore.getState().setHideWidgetAmounts(hide);
    // WidgetSync will handle updating the snapshot
  };

  return (
    <View className="flex-1 p-6">
      <Screen title="Widgets" />
      
      {!isSupported && (
        <Alert
          type="info"
          title="Widgets Not Available"
          description={
            IS_EXPO_GO
              ? "Widgets are not available in Expo Go. Please use a development or production build."
              : "Home screen widgets are only available on iOS."
          }
          icon={TriangleAlertIcon}
        />
      )}

      <View className="flex-1 gap-6">
        {/* Enable Widgets Toggle */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">
            <Label
              nativeID="widgets-enabled"
              disabled={!isSupported}
              onPress={() => handleWidgetsEnabledChange(!isWidgetsEnabled)}
            >
              <Text className="text-lg font-medium2">Enable home screen widgets</Text>
            </Label>
            <Text className="text-muted-foreground text-sm mt-1">
              Show wallet info on your home screen
            </Text>
          </View>
          <Switch
            checked={isWidgetsEnabled}
            disabled={!isSupported}
            onCheckedChange={handleWidgetsEnabledChange}
            nativeID="widgets-enabled"
          />
        </View>

        {/* Hide Amounts Toggle */}
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">
            <Label
              nativeID="hide-amounts"
              disabled={!isSupported || !isWidgetsEnabled}
              onPress={() => handleHideAmountsChange(!hideWidgetAmounts)}
            >
              <Text className="text-lg font-medium2">Hide amounts</Text>
            </Label>
            <Text className="text-muted-foreground text-sm mt-1">
              Show "Hidden" instead of balances and amounts
            </Text>
          </View>
          <Switch
            checked={hideWidgetAmounts}
            disabled={!isSupported || !isWidgetsEnabled}
            onCheckedChange={handleHideAmountsChange}
            nativeID="hide-amounts"
          />
        </View>

        {/* Widget Instructions */}
        {isSupported && (
          <View className="mt-4 p-4 bg-muted rounded-lg">
            <Text className="text-foreground font-medium2 mb-2">
              How to add widgets
            </Text>
            <Text className="text-muted-foreground text-sm">
              1. Long press on your home screen{"\n"}
              2. Tap the "+" button in the top corner{"\n"}
              3. Search for "Alby Go"{"\n"}
              4. Choose a widget and tap "Add Widget"
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}


