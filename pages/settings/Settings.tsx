import { Link, router } from "expo-router";
import {
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AddressBookIcon,
  BitcoinIcon,
  ChevronRightIcon,
  FingerprintIcon,
  GlobeIcon,
  NotificationIcon,
  OnboardingIcon,
  ResetIcon,
  SignOutIcon,
  ThemeIcon,
  WalletIcon,
} from "~/components/Icons";

import Constants from "expo-constants";
import React from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import AlbyBanner from "~/components/AlbyBanner";
import AlbyGo from "~/components/icons/AlbyGo";
import Screen from "~/components/Screen";
import { Text } from "~/components/ui/text";
import { useSession } from "~/hooks/useSession";
import { IS_EXPO_GO } from "~/lib/constants";
import { errorToast } from "~/lib/errorToast";
import { deregisterWalletNotifications } from "~/lib/notifications";
import { useAppStore } from "~/lib/state/appStore";
import { useColorScheme } from "~/lib/useColorScheme";
import { cn } from "~/lib/utils";

export function Settings() {
  const wallets = useAppStore((store) => store.wallets);
  const [developerCounter, setDeveloperCounter] = React.useState(0);
  const [developerMode, setDeveloperMode] = React.useState(__DEV__);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const { signOut } = useSession();
  const { t } = useTranslation();

  return (
    <>
      <Screen title={t("settings.main.title")} />
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          // keep the last rows reachable above the Alby banner
          contentContainerClassName="pb-64"
        >
          <View className="flex-1 flex flex-col mt-4">
            <Link href="/settings/wallets" asChild>
              <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
                <WalletIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-lg ios:sm:text-xl",
                      android: "android:text-lg",
                    }),
                    "font-medium2",
                  )}
                >
                  {t("settings.main.wallets")}
                </Text>
                <ChevronRightIcon
                  className="ml-auto text-muted-foreground"
                  width={16}
                  height={16}
                />
              </TouchableOpacity>
            </Link>

            <Link href="/settings/address-book" asChild>
              <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
                <AddressBookIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-lg ios:sm:text-xl",
                      android: "android:text-lg",
                    }),
                    "font-medium2",
                  )}
                >
                  {t("settings.addressBook.title")}
                </Text>
                <ChevronRightIcon
                  className="ml-auto text-muted-foreground"
                  width={16}
                  height={16}
                />
              </TouchableOpacity>
            </Link>

            <Link href="/settings/units-and-currency" asChild>
              <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
                <BitcoinIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-lg ios:sm:text-xl",
                      android: "android:text-lg",
                    }),
                    "font-medium2",
                  )}
                >
                  {t("settings.unitsAndCurrency.title")}
                </Text>
                <ChevronRightIcon
                  className="ml-auto text-muted-foreground"
                  width={16}
                  height={16}
                />
              </TouchableOpacity>
            </Link>

            {!IS_EXPO_GO && (
              <Link href="/settings/notifications" asChild>
                <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
                  <NotificationIcon
                    className="text-muted-foreground"
                    width={24}
                    height={24}
                  />
                  <Text
                    className={cn(
                      Platform.select({
                        ios: "ios:text-lg ios:sm:text-xl",
                        android: "android:text-lg",
                      }),
                      "font-medium2",
                    )}
                  >
                    {t("settings.notifications.title")}
                  </Text>
                  <ChevronRightIcon
                    className="ml-auto text-muted-foreground"
                    width={16}
                    height={16}
                  />
                </TouchableOpacity>
              </Link>
            )}

            <Link href="/settings/security" asChild>
              <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
                <FingerprintIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-lg ios:sm:text-xl",
                      android: "android:text-lg",
                    }),
                    "font-medium2",
                  )}
                >
                  {t("settings.security.title")}
                </Text>
                <ChevronRightIcon
                  className="ml-auto text-muted-foreground"
                  width={16}
                  height={16}
                />
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              className="flex flex-row items-center gap-4 px-6 py-4"
              onPress={toggleColorScheme}
            >
              <ThemeIcon
                className="text-muted-foreground"
                width={24}
                height={24}
              />
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-lg ios:sm:text-xl",
                    android: "android:text-lg",
                  }),
                  "font-medium2",
                )}
              >
                {t("settings.theme.title")}
              </Text>
              <Text
                className={cn(
                  Platform.select({
                    ios: "ios:text-lg ios:sm:text-xl",
                    android: "android:text-lg",
                  }),
                  "text-secondary-foreground",
                )}
              >
                (
                {colorScheme === "dark"
                  ? t("settings.theme.dark")
                  : t("settings.theme.light")}
                )
              </Text>
            </TouchableOpacity>

            <Link href="/settings/language" asChild>
              <TouchableOpacity className="flex flex-row items-center gap-4 px-6 py-4">
                <GlobeIcon
                  className="text-muted-foreground"
                  width={24}
                  height={24}
                />
                <Text
                  className={cn(
                    Platform.select({
                      ios: "ios:text-lg ios:sm:text-xl",
                      android: "android:text-lg",
                    }),
                    "font-medium2",
                  )}
                >
                  {t("settings.language.title")}
                </Text>
                <ChevronRightIcon
                  className="ml-auto text-muted-foreground"
                  width={16}
                  height={16}
                />
              </TouchableOpacity>
            </Link>

            {developerMode && (
              <>
                <View className="mt-2 flex flex-col">
                  <Text className="uppercase px-6 py-3">
                    {t("settings.developer.title")}
                  </Text>
                  <TouchableOpacity
                    className="flex flex-row items-center gap-4 px-6 py-4"
                    onPress={() => {
                      signOut();
                    }}
                  >
                    <SignOutIcon
                      className="text-muted-foreground"
                      width={24}
                      height={24}
                    />
                    <Text
                      className={cn(
                        Platform.select({
                          ios: "ios:text-lg ios:sm:text-xl",
                          android: "android:text-lg",
                        }),
                        "font-medium2",
                      )}
                    >
                      {t("settings.developer.signOut")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex flex-row items-center gap-4 px-6 py-4"
                    onPress={() => {
                      router.dismissAll();
                      useAppStore.getState().setOnboarded(false);
                    }}
                  >
                    <OnboardingIcon
                      className="text-muted-foreground"
                      width={24}
                      height={24}
                    />
                    <Text
                      className={cn(
                        Platform.select({
                          ios: "ios:text-lg ios:sm:text-xl",
                          android: "android:text-lg",
                        }),
                        "font-medium2",
                      )}
                    >
                      {t("settings.developer.openOnboarding")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex flex-row items-center gap-4 px-6 py-4"
                    onPress={() => {
                      Alert.alert(
                        t("settings.developer.resetTitle"),
                        t("settings.developer.resetMessage"),
                        [
                          {
                            text: t("common.cancel"),
                            style: "cancel",
                          },
                          {
                            text: t("common.confirm"),
                            onPress: async () => {
                              if (!IS_EXPO_GO) {
                                try {
                                  for (const [
                                    id,
                                    wallet,
                                  ] of wallets.entries()) {
                                    // clears each wallet's remote push
                                    // subscription and local notification
                                    // data; reset() below also clears any
                                    // remaining native notification data
                                    await deregisterWalletNotifications(
                                      wallet,
                                      id,
                                    );
                                  }
                                } catch (error) {
                                  errorToast(
                                    error,
                                    t(
                                      "settings.notifications.deregisterFailed",
                                    ),
                                  );
                                  return;
                                }
                              }
                              router.dismissAll();
                              await useAppStore.getState().reset();
                            },
                          },
                        ],
                      );
                    }}
                  >
                    <ResetIcon
                      className="text-destructive"
                      width={24}
                      height={24}
                    />
                    <Text
                      className={cn(
                        Platform.select({
                          ios: "ios:text-lg ios:sm:text-xl",
                          android: "android:text-lg",
                        }),
                        "text-destructive font-medium2",
                      )}
                    >
                      {t("settings.developer.resetWallet")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
        <View>
          <AlbyBanner className="mx-6 absolute bottom-16" />
          <View className="flex flex-col p-4 gap-4">
            <TouchableOpacity
              onPress={() => {
                const newCounter = developerCounter + 1;
                setDeveloperCounter(newCounter);

                if (newCounter === 5) {
                  setDeveloperMode(true);
                  Toast.show({
                    text1: t("settings.developer.nowDeveloper"),
                  });
                } else if (newCounter > 1 && newCounter < 5) {
                  Toast.show({
                    text1: t("settings.developer.tapMore", {
                      remaining: 5 - newCounter,
                    }),
                  });
                }
              }}
            >
              <View className="flex flex-row items-center justify-center gap-2">
                <AlbyGo width={82} height={20} />
                <View className="border-muted-foreground border-[0.5px] py-2" />
                <Text className="text-muted-foreground font-medium2 ios:text-sm android:text-xs">
                  v{Constants.expoConfig?.version}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
