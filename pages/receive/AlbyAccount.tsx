import { openURL } from "expo-linking";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Image, ScrollView, View } from "react-native";
import { LinkIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export function AlbyAccount() {
  const { t } = useTranslation();
  const dimensions = Dimensions.get("window");
  const imageWidth = Math.round((dimensions.width * 3) / 5);

  return (
    <View className="flex-1 flex flex-col">
      <Screen title={t("receive.albyAccount.title")} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex items-center gap-3 p-6"
      >
        <Image
          source={require("../../assets/alby-account.png")}
          className="my-4"
          style={{ width: imageWidth, height: imageWidth }}
        />
        <View className="flex-1 flex mt-4 gap-6">
          <Text className="font-semibold2 ios:text-3xl android:text-2xl text-center">
            {t("receive.albyAccount.heading")}
          </Text>
          <View className="flex flex-col gap-2 mb-4">
            <Text className="ios:text-xl android:text-lg">
              {"• "}
              {t("receive.albyAccount.features.lightningAddress")}
            </Text>
            <Text className="ios:text-xl android:text-lg">
              {"• "}
              {t("receive.albyAccount.features.tippingPage")}
            </Text>
            <Text className="ios:text-xl android:text-lg">
              {"• "}
              {t("receive.albyAccount.features.podcasting")}
            </Text>
            <Text className="ios:text-xl android:text-lg">
              {"• "}
              {t("receive.albyAccount.features.buyBitcoin")}
            </Text>
            <Text className="ios:text-xl android:text-lg">
              {"• "}
              {t("receive.albyAccount.features.emailNotifications")}
            </Text>
            <Text className="ios:text-xl android:text-lg">
              {"• "}
              {t("receive.albyAccount.features.prioritySupport")}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View className="m-6">
        <Button
          size="lg"
          className="flex flex-row gap-2"
          onPress={() => openURL("https://getalby.com/auth/users/new")}
        >
          <Text>{t("receive.albyAccount.getAccountButton")}</Text>
          <LinkIcon className="text-primary-foreground" />
        </Button>
      </View>
    </View>
  );
}
