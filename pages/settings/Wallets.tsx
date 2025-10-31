import { Link, router } from "expo-router";
import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SettingsIcon, WalletIcon } from "~/components/Icons";
import { Button } from "~/components/ui/button";

import { Toast } from "toastify-react-native";
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
      <View className="h-full flex px-6">
        <FlatList
          className="flex flex-col"
          data={wallets}
          contentContainerStyle={{ flexGrow: 1 }}
          ListFooterComponentStyle={{ marginTop: "auto" }}
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
                  "flex flex-row items-center justify-between p-6 rounded-2xl border-2",
                  active ? "border-primary" : "border-transparent",
                )}
              >
                <View className="flex flex-row gap-4 items-center flex-shrink">
                  <WalletIcon className="text-muted-foreground" />
                  <Text
                    className={cn("text-xl pr-16", active && "font-semibold2")}
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
                    <SettingsIcon className="text-muted-foreground" />
                  </TouchableOpacity>
                </Link>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <View className="py-6">
              <Button
                size="lg"
                onPress={() => {
                  router.dismissAll();
                  router.push("/settings/wallets/setup");
                }}
              >
                <Text>Connect a Wallet</Text>
              </Button>
            </View>
          }
        />
      </View>
    </>
  );
}
