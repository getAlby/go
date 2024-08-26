import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Stack, router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export function Onboarding() {

    async function finish() {
        await AsyncStorage.setItem("hasOnboarded", "true");
        router.push("/");
    }

    return (
        <View className="flex-1 flex flex-col p-6 gap-3">
            <Stack.Screen
                options={{
                    title: "Onboarding",
                    headerShown: false,
                }}
            />
            <View className="flex-1">

            </View>
            <Link href="/home" asChild >
                <Button size="lg" onPress={finish}>
                    <Text>Finish</Text>
                </Button>
            </Link>
        </View>
    );
}
