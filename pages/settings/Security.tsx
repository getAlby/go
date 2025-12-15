import React from "react";
import { Pressable, View } from "react-native";
import Alert from "~/components/Alert";
import { TriangleAlertIcon } from "~/components/Icons";
import Loading from "~/components/Loading";
import Screen from "~/components/Screen";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { isBiometricSupported } from "~/lib/isBiometricSupported";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Security() {
  const [isSupported, setIsSupported] = React.useState<boolean | null>(null);
  const isEnabled = useAppStore((store) => store.isSecurityEnabled);

  React.useEffect(() => {
    async function checkBiometricSupport() {
      const supported = await isBiometricSupported();
      setIsSupported(supported);
    }
    checkBiometricSupport();
  }, []);

  const onChange = () => {
    useAppStore.getState().setSecurityEnabled(!isEnabled);
  };

  return (
    <View className="flex-1 p-6">
      <Screen title="Security" />
      {isSupported === null ? (
        <View className="flex-1 justify-center items-center">
          <Loading />
        </View>
      ) : (
        <>
          {!isSupported && (
            <Alert
              type="info"
              title="Setup Device Security"
              description="To protect your wallet, please set up a phone lock in your device settings first."
              icon={TriangleAlertIcon}
            />
          )}
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-2">
              <Pressable
                onPress={onChange}
                className={cn(!isSupported && "pointer-events-none")}
                disabled={!isSupported}
              >
                <Text className="sm:text-lg font-semibold2">
                  Require phone lock to access
                </Text>
              </Pressable>
              <Switch
                checked={isEnabled}
                disabled={!isSupported}
                onCheckedChange={onChange}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
