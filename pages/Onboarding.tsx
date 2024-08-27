import { Link, Stack, router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { secureStorage } from "~/lib/secureStorage";
import { CameraIcon } from "lucide-react-native";

export function Onboarding() {

    async function finish() {
        secureStorage.setItem("hasOnboarded", "true");
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
                <CameraIcon />
                <Text className="font-semibold2 text-2xl">Title</Text>
                <Text className="font-medium2 text-xl text-muted-foreground">Description</Text>
            </View>
            <Link href="/home" asChild >
                <Button size="lg" onPress={finish}>
                    <Text>Finish</Text>
                </Button>
            </Link>
        </View>
    );
}
