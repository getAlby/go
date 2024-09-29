import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "./ui/button";
import { router } from "expo-router";
import { useAppStore } from "~/lib/state/appStore";
import { ALBY_LIGHTNING_ADDRESS } from "~/lib/constants";

function AlbyBanner() {
    const lastPayment = useAppStore
        .getState()
        .getLastAlbyPayment();
    const showAlbyBanner = isPaymentOlderThan24Hours(lastPayment);
    const amounts = [
        { value: 1000, emoji: '🧡' },
        { value: 5000, emoji: '🔥' },
        { value: 10000, emoji: '🚀' }
    ];

    function isPaymentOlderThan24Hours(paymentDate: Date | undefined) {
        if (!paymentDate) return true;

        const currentDate = new Date();
        const millisecondsIn24Hours = 24 * 60 * 60 * 1000; // 24 hours 

        return (currentDate.getTime() - paymentDate.getTime()) > millisecondsIn24Hours;
    }

    if (!showAlbyBanner) {
        return null;
    }

    return (
        <View className="border bg-card border-muted rounded mt-5 flex flex-col gap-3 p-5">
            <Text className="font-semibold2 text-center">✨ Enjoying Alby Go?</Text>
            <Text className="text-muted-foreground text-center">Help us grow and improve by supporting our development.</Text>
            <View className="flex flex-row gap-3 mt-3">
                {amounts.map(({ value, emoji }) => (
                    <Button
                        key={value}
                        variant="secondary"
                        size="sm"
                        onPress={() => {
                            router.navigate({
                                pathname: "/send",
                                params: {
                                    url: ALBY_LIGHTNING_ADDRESS,
                                    amount: value
                                },
                            });
                        }}
                    >
                        <Text>{emoji} {new Intl.NumberFormat().format(value)}</Text>
                    </Button>
                ))}
            </View>
        </View>
    );
}

export default AlbyBanner;
