import { openURL } from "expo-linking";
import { Link, Stack, router } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import AlbyGoLogomark from "~/components/AlbyGoLogomark";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

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
        <Text
          className={cn(
            Platform.select({
              ios: "ios:text-4xl ios:sm:text-5xl",
              android: "android:text-4xl sm:android:text-[42px]",
            }),
            "font-semibold2 sm:leading-[1.5] text-center",
          )}
        >
          Hello there 👋
        </Text>
        <Text
          className={cn(
            Platform.select({
              ios: "ios:text-lg ios:sm:text-xl",
              android: "android:text-lg",
            }),
            "font-medium2 text-center",
          )}
        >
          <Text
            className={cn(
              Platform.select({
                ios: "ios:text-lg ios:sm:text-xl",
                android: "android:text-lg",
              }),
              "font-bold2",
            )}
          >
            Alby Go
          </Text>{" "}
          is a simple mobile wallet interface for your Alby Hub or other
          lightning nodes and wallets.
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
