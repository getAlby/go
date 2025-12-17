import { openURL } from "expo-linking";
import { Link, Stack, router } from "expo-router";
import React from "react";
import { View } from "react-native";
import AlbyGoLogomark from "~/components/AlbyGoLogomark";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";

export function Onboarding() {
  async function finish() {
    useAppStore.getState().setOnboarded(true);
    router.replace("/");
  }

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: "Onboarding",
          headerShown: false,
        }}
      />
      <View className="flex-1 flex items-center justify-center gap-6">
        <AlbyGoLogomark className="mb-10 w-48 h-48" />
        <Text className="font-semibold2 text-4xl sm:text-5xl sm:leading-[1.5] text-center">
          Hello there 👋
        </Text>
        <Text className="font-medium2 text-lg sm:text-xl text-center">
          <Text className="font-bold2 text-lg sm:text-xl">Alby Go</Text> is a
          simple mobile wallet interface for your Alby Hub or other lightning
          nodes and wallets.
        </Text>
      </View>
      <Link href="/" asChild>
        <Button size="lg" onPress={finish}>
          <Text>Connect Wallet</Text>
        </Button>
      </Link>
      <Button
        variant="secondary"
        size="lg"
        onPress={() => openURL("https://albyhub.com/")}
      >
        <Text>Learn more</Text>
      </Button>
    </View>
  );
}
