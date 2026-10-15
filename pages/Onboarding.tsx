import { openURL } from "expo-linking";
import { Link, Stack, router } from "expo-router";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import AlbyGoLogomark from "~/components/AlbyGoLogomark";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Onboarding() {
  const { t } = useTranslation();

  async function finish() {
    useAppStore.getState().setOnboarded(true);
    router.replace("/");
  }

  return (
    <View className="flex-1 flex flex-col p-6 gap-3">
      <Stack.Screen
        options={{
          title: t("onboarding.title"),
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
          {t("onboarding.greeting")}
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
          <Trans
            i18nKey="onboarding.intro"
            components={{
              bold: (
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-lg ios:sm:text-xl",
                      android: "android:text-lg",
                    }),
                    "font-bold2",
                  )}
                />
              ),
            }}
          />
        </Text>
      </View>
      <Link href="/" asChild>
        <Button size="lg" onPress={finish}>
          <Text>{t("onboarding.connectWallet")}</Text>
        </Button>
      </Link>
      <Button
        variant="secondary"
        size="lg"
        onPress={() => openURL("https://albyhub.com/")}
      >
        <Text>{t("onboarding.learnMore")}</Text>
      </Button>
    </View>
  );
}
