import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { XIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";
import { ALBY_LIGHTNING_ADDRESS } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { Button } from "./ui/button";

function AlbyBanner() {
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
    <View className="border bg-card border-muted rounded-2xl mt-5 flex flex-col gap-3 p-5 relative">
      <TouchableOpacity
        onPress={() => setShowBanner(false)}
        className="absolute right-0 p-4"
      >
        <XIcon className="text-muted-foreground" />
      </TouchableOpacity>
      <Text className="font-semibold2 text-center">✨ Enjoying Alby Go?</Text>
      <Text className="text-muted-foreground text-center">
        Help us grow and improve by supporting our development.
      </Text>
      <View className="flex flex-row gap-3 mt-3">
        {amounts.map(({ value, label, emoji }) => (
          <Button
            key={value}
            variant="secondary"
            size="sm"
            className="flex-1"
            onPress={() => {
              router.navigate({
                pathname: "/send",
                params: {
                  url: ALBY_LIGHTNING_ADDRESS,
                  amount: value,
                },
              });
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
