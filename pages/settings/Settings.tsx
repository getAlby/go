import { Link, router } from "expo-router";
import { Alert, TouchableOpacity, View } from "react-native";
import { Bitcoin, Egg, Fingerprint, LogOut, Palette, Power, Wallet2 } from "~/components/Icons";

import { DEFAULT_CURRENCY, DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { Text } from "~/components/ui/text";
import React from "react";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { useColorScheme } from "~/lib/useColorScheme";
import Screen from "~/components/Screen";
import AlbyBanner from "~/components/AlbyBanner";
import { useSession } from "~/hooks/useSession";

export function Settings() {
  const wallet = useAppStore((store) => store.wallets[store.selectedWalletId]);
  const [developerCounter, setDeveloperCounter] = React.useState(0);
  const [developerMode, setDeveloperMode] = React.useState(__DEV__);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const { signOut } = useSession();

  return (
    <View className="flex-1 p-6 ">
      <Screen title="Settings" />
      <View className="flex-1 flex flex-col gap-6">
        <Link href="/settings/wallets" asChild>
          <TouchableOpacity className="flex flex-row items-center gap-4">
            <Wallet2 className="text-foreground" />
            <Text className="font-medium2 text-xl text-foreground">Wallets</Text>
            <Text className="text-muted-foreground text-xl flex-shrink" numberOfLines={1} ellipsizeMode="tail">
              ({wallet.name || DEFAULT_WALLET_NAME})
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings/fiat-currency" asChild>
          <TouchableOpacity className="flex flex-row gap-4">
            <Bitcoin className="text-foreground" />
            <Text className="text-foreground font-medium2 text-xl">
              Fiat Currency
            </Text>
            <Text className="text-muted-foreground text-xl">
              ({fiatCurrency || DEFAULT_CURRENCY})
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings/security" asChild>
          <TouchableOpacity className="flex flex-row gap-4">
            <Fingerprint className="text-foreground" />
            <Text className="text-foreground font-medium2 text-xl">
              Security
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          className="flex flex-row gap-4"
          onPress={toggleColorScheme}
        >
          <Palette className="text-foreground" />
          <Text className="text-foreground font-medium2 text-xl">Theme</Text>
          <Text className="text-muted-foreground text-xl">
            ({colorScheme.charAt(0).toUpperCase() + colorScheme.substring(1)})
          </Text>
        </TouchableOpacity>

        {developerMode && (
          <>
            <View className="mt-5 flex flex-col gap-6">
              <Text className="text-muted-foreground uppercase">
                Developer mode
              </Text>
              <TouchableOpacity
                className="flex flex-row gap-4"
                onPress={() => {
                  signOut();
                }}
              >
                <LogOut className="text-foreground" />
                <Text className="font-medium2 text-xl">Sign out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row gap-4"
                onPress={() => {
                  router.dismissAll();
                  useAppStore.getState().setOnboarded(false);
                }}
              >
                <Egg className="text-foreground" />
                <Text className="font-medium2 text-xl">Open Onboarding</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row gap-4"
                onPress={() => {
                  Alert.alert(
                    "Reset",
                    "Are you sure you want to reset? You will be signed out of all your wallets. Your connection secrets and address book will be lost.",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Confirm",
                        onPress: () => {
                          router.dismissAll();
                          useAppStore.getState().reset();
                        },
                      },
                    ],
                  );
                }}
              >
                <Power className="text-destructive" />
                <Text className="text-destructive font-medium2 text-xl">
                  Reset Wallet
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <View className="flex flex-col gap-6">
        <AlbyBanner />
        <TouchableOpacity
          onPress={() => {
            const newCounter = developerCounter + 1;
            setDeveloperCounter(newCounter);

            if (newCounter === 5) {
              setDeveloperMode(true);
              Toast.show({
                text1: "You are now a developer",
              });
            } else if (newCounter > 1 && newCounter < 5) {
              Toast.show({
                text1: `Tap ${5 - newCounter} more times`,
              });
            }
          }}
        >
          <View className="flex flex-col items-center justify-end">
            <Text className="text-foreground">
              Alby Go v{Constants.expoConfig?.version}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
