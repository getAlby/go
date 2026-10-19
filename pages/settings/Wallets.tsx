import { Link, router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Platform, TouchableOpacity, View } from "react-native";
import { SettingsIcon, WalletIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";

import Toast from "react-native-toast-message";
import NWCIcon from "~/components/icons/NWCIcon";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Wallets() {
  const { t } = useTranslation();
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <>
      <Screen title={t("wallets.manage.title")} />
      <View className="flex-1">
        <FlatList
          className="flex flex-col pt-4 px-6"
          data={wallets}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={(item) => {
            const active = item.index === selectedWalletId;

            return (
              <TouchableOpacity
                onPress={() => {
                  if (item.index !== selectedWalletId) {
                    useAppStore.getState().setSelectedWalletId(item.index);
                    router.dismissAll();
                    router.navigate("/");
                    Toast.show({
                      type: "success",
                      text1: t("wallets.manage.switched"),
                      text2: t("wallets.manage.currentWalletSet", {
                        name: item.item.name || t("wallets.common.defaultName"),
                      }),
                      position: "top",
                    });
                  }
                }}
                className={cn(
                  "flex flex-row items-center justify-between px-6 py-4 mb-2 rounded-2xl border-[3px] bg-transparent",
                  active ? "border-primary" : "border-transparent",
                )}
              >
                <View className="flex flex-row gap-4 items-center flex-shrink">
                  <WalletIcon
                    className={cn(
                      active
                        ? "text-secondary-foreground"
                        : "text-muted-foreground",
                    )}
                    width={24}
                    height={24}
                  />
                  <Text
                    className={cn(
                      Platform.select({
                        ios: "ios:text-lg ios:sm:text-xl",
                        android: "android:text-lg",
                      }),
                      "pr-16",
                      active ? "font-semibold2" : "font-medium2",
                    )}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.item.name || t("wallets.common.defaultName")}
                  </Text>
                </View>
                <Link
                  href={`/settings/wallets/${item.index}`}
                  className="absolute right-0"
                  asChild
                >
                  <TouchableOpacity className="p-6">
                    <SettingsIcon
                      className="text-muted-foreground"
                      width={16}
                      height={16}
                    />
                  </TouchableOpacity>
                </Link>
              </TouchableOpacity>
            );
          }}
        />
        <View className="p-6">
          <Button
            variant="secondary"
            size="lg"
            onPress={() => {
              router.dismissAll();
              router.navigate("/settings/wallets/setup");
            }}
            className="flex flex-row gap-2"
          >
            <NWCIcon />
            <Text className="text-secondary-foreground">
              {t("wallets.manage.connectWallet")}
            </Text>
          </Button>
        </View>
      </View>
    </>
  );
}
