import { Link, router } from "expo-router";
import { Alert, TouchableOpacity, View } from "react-native";
import {
  BitcoinIcon,
  FingerprintIcon,
  NotificationIcon,
  OnboardingIcon,
  PinIcon,
  ResetIcon,
  SignOutIcon,
  ThemeIcon,
  WalletIcon,
} from "~/components/Icons";

import Constants from "expo-constants";
import React from "react";
import Toast from "react-native-toast-message";
import AlbyBanner from "~/components/AlbyBanner";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useSession } from "~/hooks/useSession";
import {
  DEFAULT_CURRENCY,
  DEFAULT_WALLET_NAME,
  IS_EXPO_GO,
} from "~/lib/constants";
import { deregisterWalletNotifications } from "~/lib/notifications";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";
import { removeAllInfo } from "~/lib/walletInfo";

export function Settings() {
  const wallets = useAppStore((store) => store.wallets);
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
            <WalletIcon className="text-muted-foreground" />
            <Text className="font-medium2 text-xl text-foreground">
              Wallets
            </Text>
            <Text
              className="text-muted-foreground text-xl flex-shrink"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              ({wallet.name || DEFAULT_WALLET_NAME})
            </Text>
          </TouchableOpacity>
        </Link>

        <Link href="/settings/fiat-currency" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center">
            <BitcoinIcon className="text-muted-foreground" />
            <Text className="text-foreground font-medium2 text-xl">
              Fiat Currency
            </Text>
            <Text className="text-muted-foreground text-xl">
              ({fiatCurrency || DEFAULT_CURRENCY})
            </Text>
          </TouchableOpacity>
        </Link>

        {!IS_EXPO_GO && (
          <Link href="/settings/notifications" asChild>
            <TouchableOpacity className="flex flex-row gap-4 items-center">
              <NotificationIcon className="text-muted-foreground" />
              <Text className="text-foreground font-medium2 text-xl">
                Notifications
              </Text>
            </TouchableOpacity>
          </Link>
        )}

        <Link href="/settings/security" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center">
            <FingerprintIcon className="text-muted-foreground" />
            <Text className="text-foreground font-medium2 text-xl">
              Security
            </Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          className="flex flex-row gap-4 items-center"
          onPress={toggleColorScheme}
        >
          <ThemeIcon className="text-muted-foreground" />
          <Text className="text-foreground font-medium2 text-xl">Theme</Text>
          <Text className="text-muted-foreground text-xl">
            ({colorScheme.charAt(0).toUpperCase() + colorScheme.substring(1)})
          </Text>
        </TouchableOpacity>

        <Link href="/settings/bitcoin-map" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center">
            <PinIcon className="text-muted-foreground" />
            <Text className="text-foreground font-medium2 text-xl">
              Bitcoin Map
            </Text>
          </TouchableOpacity>
        </Link>

        {developerMode && (
          <>
            <View className="mt-5 flex flex-col gap-6">
              <Text className="text-muted-foreground uppercase">
                Developer mode
              </Text>
              <TouchableOpacity
                className="flex flex-row gap-4 items-center"
                onPress={() => {
                  signOut();
                }}
              >
                <SignOutIcon className="text-muted-foreground" />
                <Text className="font-medium2 text-xl">Sign out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row gap-4 items-center"
                onPress={() => {
                  router.dismissAll();
                  useAppStore.getState().setOnboarded(false);
                }}
              >
                <OnboardingIcon className="text-muted-foreground" />
                <Text className="font-medium2 text-xl">Open Onboarding</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row gap-4 items-center"
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
                        onPress: async () => {
                          if (!IS_EXPO_GO) {
                            for (const [id, wallet] of wallets.entries()) {
                              await deregisterWalletNotifications(wallet, id);
                            }
                            await removeAllInfo();
                          }
                          router.dismissAll();
                          useAppStore.getState().reset();
                        },
                      },
                    ],
                  );
                }}
              >
                <ResetIcon className="text-destructive" />
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
