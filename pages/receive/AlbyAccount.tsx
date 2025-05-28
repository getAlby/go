import { openURL } from "expo-linking";
import React from "react";
import { Dimensions, Image, ScrollView, View } from "react-native";
import { LinkIcon } from "~/components/Icons";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

export function AlbyAccount() {
  const dimensions = Dimensions.get("window");
  const imageWidth = Math.round((dimensions.width * 3) / 5);

  return (
    <View className="flex-1 flex flex-col">
      <Screen title="Get Alby Account" />
      <ScrollView contentContainerClassName="flex items-center gap-3 p-6">
        <Image
          source={require("../../assets/alby-account.png")}
          className="my-4"
          style={{ width: imageWidth, height: imageWidth }}
        />
        <View className="flex-1 flex mt-4 gap-6">
          <Text className="font-semibold2 text-3xl text-center text-foreground">
            Get your lightning address with Alby Account
          </Text>
          <View className="flex flex-col gap-2 mb-4">
            <Text className="text-xl text-foreground">
              {"\u2022 "}Lightning address & Nostr identifier,
            </Text>
            <Text className="text-xl text-foreground">
              {"\u2022 "}Personal tipping page,
            </Text>
            <Text className="text-xl text-foreground">
              {"\u2022 "}Access to podcasting 2.0 apps,
            </Text>
            <Text className="text-xl text-foreground">
              {"\u2022 "}Buy bitcoin directly to your wallet,
            </Text>
            <Text className="text-xl text-foreground">
              {"\u2022 "}Useful email wallet notifications,
            </Text>
            <Text className="text-xl text-foreground">
              {"\u2022 "}Priority support.
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
          <Text>Get Alby Account</Text>
          <LinkIcon className="text-primary-foreground" />
        </Button>
      </View>
    </View>
  );
}
