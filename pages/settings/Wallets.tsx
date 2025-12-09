import { Link, router } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SettingsIcon, WalletIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";

import Toast from "react-native-toast-message";
import NWCIcon from "~/components/icons/NWCIcon";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { cn } from "~/lib/utils";

export function Wallets() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const wallets = useAppStore((store) => store.wallets);
  return (
    <>
      <Screen title="Manage Wallets" />
      <View className="h-full flex bg-background">
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
                      text1: `Switched wallet to ${item.item.name || DEFAULT_WALLET_NAME}`,
                      position: "top",
                    });
                  }
                }}
                className={cn(
                  "flex flex-row items-center justify-between px-6 py-4 sm:mb-2 rounded-2xl border-[3px] bg-transparent",
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
                      "text-lg sm:text-xl pr-16 text-foreground",
                      active ? "font-semibold2" : "font-medium2",
                    )}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.item.name || DEFAULT_WALLET_NAME}
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
              router.push("/settings/wallets/setup");
            }}
            className="flex flex-row gap-2"
          >
            <NWCIcon />
            <Text className="text-secondary-foreground">Connect a Wallet</Text>
          </Button>
        </View>
      </View>
    </>
  );
}
