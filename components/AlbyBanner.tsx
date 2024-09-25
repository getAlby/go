import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "./ui/button";
import { router } from "expo-router";

function AlbyBanner() {
    const showAlbyBanner = new Date().getDate() === 21;
    const amounts = [
        { value: 1000, emoji: '🧡' },
        { value: 5000, emoji: '🔥' },
        { value: 10000, emoji: '🚀' }
    ];

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
                                    url: "hello@getalby.com",
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
