import { Link, router } from "expo-router";
import { Alert, TouchableOpacity, View } from "react-native";
import {
  AddressIcon,
  ChevronRightIcon,
  FingerprintIcon,
  NotificationIcon,
  OnboardingIcon,
  ResetIcon,
  SignOutIcon,
  ThemeIcon,
  WalletIcon,
} from "~/components/Icons";

import Constants from "expo-constants";
import React from "react";
import Toast from "react-native-toast-message";
import AlbyBanner from "~/components/AlbyBanner";
import ShitcoinIcon from "~/components/icons/ShitcoinIcon";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useSession } from "~/hooks/useSession";
import { IS_EXPO_GO } from "~/lib/constants";
import { deregisterWalletNotifications } from "~/lib/notifications";
import { removeAllInfo } from "~/lib/notificationsNativeStorage";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";

export function Settings() {
  const wallets = useAppStore((store) => store.wallets);
  const [developerCounter, setDeveloperCounter] = React.useState(0);
  const [developerMode, setDeveloperMode] = React.useState(__DEV__);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { signOut } = useSession();

  return (
    <View className="flex-1">
      <Screen title="Settings" />
      <View className="flex-1 flex flex-col mt-4">
        <Link href="/settings/wallets" asChild>
          <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-3">
            <WalletIcon
              className="text-muted-foreground"
              width={28}
              height={28}
            />
            <Text className="font-medium2 text-xl text-foreground">
              Wallets
            </Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>

        <Link href="/settings/fiat-currency" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center px-6 py-3">
            <ShitcoinIcon
              className="text-muted-foreground"
              width={28}
              height={28}
            />
            <Text className="text-foreground font-medium2 text-xl">
              Fiat Currency
            </Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>

        {!IS_EXPO_GO && (
          <Link href="/settings/notifications" asChild>
            <TouchableOpacity className="flex flex-row gap-4 items-center px-6 py-3">
              <NotificationIcon
                className="text-muted-foreground"
                width={28}
                height={28}
              />
              <Text className="text-foreground font-medium2 text-xl">
                Notifications
              </Text>
              <ChevronRightIcon
                className="ml-auto text-muted-foreground"
                width={20}
                height={20}
              />
            </TouchableOpacity>
          </Link>
        )}

        <Link href="/settings/security" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center px-6 py-3">
            <FingerprintIcon
              className="text-muted-foreground"
              width={28}
              height={28}
            />
            <Text className="text-foreground font-medium2 text-xl">
              Security
            </Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          className="flex flex-row gap-4 items-center px-6 py-3"
          onPress={toggleColorScheme}
        >
          <ThemeIcon className="text-muted-foreground" width={28} height={28} />
          <Text className="text-foreground font-medium2 text-xl">Theme</Text>
          <Text className="text-muted-foreground text-xl">
            ({colorScheme.charAt(0).toUpperCase() + colorScheme.substring(1)})
          </Text>
        </TouchableOpacity>

        <Link href="/settings/address-book" asChild>
          <TouchableOpacity className="flex flex-row gap-4 items-center px-6 py-3">
            <AddressIcon
              className="text-muted-foreground"
              width={28}
              height={28}
            />
            <Text className="text-foreground font-medium2 text-xl">
              Address Book
            </Text>
            <ChevronRightIcon
              className="ml-auto text-muted-foreground"
              width={20}
              height={20}
            />
          </TouchableOpacity>
        </Link>

        {developerMode && (
          <>
            <View className="mt-2 flex flex-col">
              <Text className="text-muted-foreground uppercase px-6 py-3">
                Developer mode
              </Text>
              <TouchableOpacity
                className="flex flex-row gap-4 items-center px-6 py-3"
                onPress={() => {
                  signOut();
                }}
              >
                <SignOutIcon
                  className="text-muted-foreground"
                  width={28}
                  height={28}
                />
                <Text className="font-medium2 text-xl">Sign out</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row gap-4 items-center px-6 py-3"
                onPress={() => {
                  router.dismissAll();
                  useAppStore.getState().setOnboarded(false);
                }}
              >
                <OnboardingIcon
                  className="text-muted-foreground"
                  width={28}
                  height={28}
                />
                <Text className="font-medium2 text-xl">Open Onboarding</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex flex-row gap-4 items-center px-6 py-3"
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
                <ResetIcon
                  className="text-destructive"
                  width={28}
                  height={28}
                />
                <Text className="text-destructive font-medium2 text-xl">
                  Reset Wallet
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <View className="flex flex-col p-4 gap-6">
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
