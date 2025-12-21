import { useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { ALBY_LIGHTNING_ADDRESS } from "~/lib/constants";
import { initiatePaymentFlow } from "~/lib/initiatePaymentFlow";
import { useAppStore } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

function AlbyBanner({ className }: { className?: string }) {
  const { shadow } = useThemeColor("shadow");
  const lastPayment = useAppStore.getState().getLastAlbyPayment();
  const [showBanner, setShowBanner] = useState(
    isPaymentOlderThan24Hours(lastPayment),
  );
  const amounts = [
    { value: 1000, label: "1k", emoji: "🧡" },
    { value: 5000, label: "5k", emoji: "🔥" },
    { value: 10000, label: "10k", emoji: "🚀" },
  ];

  function isPaymentOlderThan24Hours(paymentDate: Date | null) {
    if (!paymentDate) {
      return true;
    }

    const currentDate = new Date();
    const millisecondsIn24Hours = 24 * 60 * 60 * 1000; // 24 hours

    return (
      currentDate.getTime() - paymentDate.getTime() > millisecondsIn24Hours
    );
  }

  if (!showBanner) {
    return null;
  }

  return (
    <View
      className={cn(
        "bg-background dark:bg-muted rounded-2xl flex flex-col gap-3 p-4 relative",
        className,
      )}
      style={{
        ...Platform.select({
          // make sure bg color is applied to avoid RCTView errors
          ios: {
            shadowColor: shadow,
            shadowOpacity: 0.4,
            shadowOffset: {
              width: 1.5,
              height: 1.5,
            },
            shadowRadius: 2,
          },
          android: {
            shadowColor: shadow,
            elevation: 3,
          },
        }),
      }}
    >
      <TouchableOpacity
        onPress={() => setShowBanner(false)}
        className="absolute z-10 right-0 p-4"
      >
        <XIcon className="text-muted-foreground" />
      </TouchableOpacity>
      <Text className="font-semibold2 text-center ios:text-lg android:text-base">
        ✨ Enjoying Alby Go?
      </Text>
      <Text className="text-secondary-foreground text-center">
        Help us grow and improve by supporting our development.
      </Text>
      <View className="flex flex-row gap-3 mt-3">
        {amounts.map(({ value, label, emoji }) => (
          <Button
            key={value}
            size="sm"
            onPress={async () => {
              await initiatePaymentFlow(
                ALBY_LIGHTNING_ADDRESS,
                value.toString(),
              );
            }}
          >
            <Text>
              {emoji} {label}
            </Text>
          </Button>
        ))}
      </View>
    </View>
  );
}

export default AlbyBanner;
