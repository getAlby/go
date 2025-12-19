import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link, router, useFocusEffect } from "expo-router";
import { useBalance } from "hooks/useBalance";
import React, { type JSX, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ChevronUpIcon,
  MapLineIcon,
  SettingsLineIcon,
} from "~/components/Icons";
import { Text } from "~/components/ui/text";

import { type SvgProps } from "react-native-svg";
import AlbyBanner from "~/components/AlbyBanner";
import LargeArrowDown from "~/components/icons/LargeArrowDown";
import LargeArrowUp from "~/components/icons/LargeArrowUp";
import { LinearGradient } from "~/components/LinearGradient";
import Screen from "~/components/Screen";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";
import { useThemeColor } from "~/lib/useThemeColor";
import { cn, formatBitcoinAmount } from "~/lib/utils";

dayjs.extend(relativeTime);

export function Home() {
  const { data: balance, mutate: reloadBalance } = useBalance();
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const balanceDisplayMode = useAppStore((store) => store.balanceDisplayMode);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const fiatCurrency = useAppStore((store) => store.fiatCurrency);
  const bitcoinDisplayFormat = useAppStore(
    (store) => store.bitcoinDisplayFormat,
  );
  const getFiatAmount = useGetFiatAmount();

  useFocusEffect(() => {
    reloadBalance();
  });

  const refreshBalance = async () => {
    setRefreshingBalance(true);
    await reloadBalance();
    setRefreshingBalance(false);
  };

  function switchBalanceState(): void {
    switch (balanceDisplayMode) {
      case "sats":
        useAppStore
          .getState()
          .setBalanceDisplayMode(!fiatCurrency ? "hidden" : "fiat");
        break;
      case "fiat":
        useAppStore.getState().setBalanceDisplayMode("hidden");
        break;
      default:
        useAppStore.getState().setBalanceDisplayMode("sats");
        break;
    }
  }

  const symbol = React.useMemo(() => {
    if (!fiatCurrency) {
      return "";
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: fiatCurrency,
      currencyDisplay: "narrowSymbol",
    })
      .format(0)
      .replace(/[0-9.,\s]/g, "");
  }, [fiatCurrency]);

  const displayCharacterCount = React.useMemo(
    () =>
      Math.floor((balance?.balance || 0) / 1000).toString().length +
      (bitcoinDisplayFormat === "bip177" ? 1 : 4),
    [bitcoinDisplayFormat, balance?.balance],
  );

  return (
    <>
      <Screen
        title=""
        left={() => (
          <TouchableOpacity
            onPressIn={() => {
              router.navigate("/settings");
            }}
            className="-ml-4 py-2 px-6"
          >
            <SettingsLineIcon
              className="text-secondary-foreground"
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
        right={() => (
          <TouchableOpacity
            onPressIn={() => {
              router.navigate("/bitcoin-map");
            }}
            className="-mr-4 px-6"
          >
            <MapLineIcon
              className="text-secondary-foreground"
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
      />
      <View className="flex-1">
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshingBalance}
              onRefresh={refreshBalance}
              progressViewOffset={128}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-1 px-6"
        >
          <View className="flex-1 justify-center gap-4 sm:gap-8">
            <View className="flex items-center justify-center gap-2">
              {wallets.length > 1 && (
                <TouchableOpacity
                  className="w-full"
                  onPress={() => {
                    router.navigate("/settings/wallets");
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-center text-muted-foreground font-medium2 text-lg sm:text-xl px-4"
                  >
                    {wallets[selectedWalletId].name || DEFAULT_WALLET_NAME}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={switchBalanceState}
                className="w-full flex flex-col items-center justify-center gap-2"
              >
                <View className="w-full flex flex-row justify-center items-center gap-2">
                  {balance &&
                  !refreshingBalance &&
                  (balanceDisplayMode === "fiat" ? getFiatAmount : true) ? (
                    <>
                      <Text
                        className={cn(
                          displayCharacterCount > 8 ? "text-4xl" : "text-5xl",
                          displayCharacterCount <= 10 &&
                            displayCharacterCount >= 8 &&
                            "sm:text-5xl",
                          "text-secondary-foreground !leading-[1.5] font-bold2",
                          (balanceDisplayMode === "hidden" ||
                            (balanceDisplayMode === "sats" &&
                              bitcoinDisplayFormat === "sats")) &&
                            "hidden",
                        )}
                      >
                        {balanceDisplayMode === "sats" && "₿"}
                        {balanceDisplayMode === "fiat" && symbol}
                      </Text>
                      <Text
                        className={cn(
                          displayCharacterCount > 8 ? "text-4xl" : "text-5xl",
                          displayCharacterCount <= 10 &&
                            displayCharacterCount >= 8 &&
                            "sm:text-5xl",
                          "!leading-[1.5] font-bold2",
                        )}
                      >
                        {balanceDisplayMode === "sats" &&
                          new Intl.NumberFormat().format(
                            Math.floor(balance.balance / 1000),
                          )}
                        {balanceDisplayMode === "fiat" &&
                          getFiatAmount?.(
                            Math.floor(balance.balance / 1000),
                            false,
                          )}
                        {balanceDisplayMode === "hidden" && "******"}
                      </Text>
                      {balanceDisplayMode === "sats" &&
                        bitcoinDisplayFormat === "sats" && (
                          <Text
                            className={cn(
                              displayCharacterCount > 8
                                ? "text-4xl"
                                : "text-5xl",
                              displayCharacterCount <= 10 &&
                                displayCharacterCount >= 8 &&
                                "sm:text-5xl",
                              "text-secondary-foreground !leading-[1.5] font-bold2",
                            )}
                          >
                            sats
                          </Text>
                        )}
                    </>
                  ) : (
                    <Skeleton className="w-48 text-5xl my-2.5" />
                  )}
                </View>
                {/* Hide conversion if fiat currency is not selected */}
                {fiatCurrency && (
                  <View className="flex justify-center items-center">
                    {balance &&
                    !refreshingBalance &&
                    (balanceDisplayMode === "sats" ? getFiatAmount : true) ? (
                      <Text className="text-center text-3xl text-secondary-foreground font-semibold2">
                        {balanceDisplayMode === "sats" &&
                          getFiatAmount?.(Math.floor(balance.balance / 1000))}
                        {balanceDisplayMode === "fiat" &&
                          formatBitcoinAmount(
                            Math.floor(balance.balance / 1000),
                            bitcoinDisplayFormat,
                          )}
                        {balanceDisplayMode === "hidden" && " "}
                      </Text>
                    ) : (
                      <Skeleton className="w-32 text-3xl" />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {new Date().getDate() === 21 && <AlbyBanner />}
          </View>
        </ScrollView>
        <View className="flex items-center justify-center">
          <Link href="/transactions" asChild>
            <TouchableOpacity className="p-4">
              <ChevronUpIcon
                className="text-muted-foreground"
                width={32}
                height={32}
              />
            </TouchableOpacity>
          </Link>
        </View>
        <View className="flex flex-row gap-6 p-6">
          <MainButton title="Receive" href="/receive" Icon={LargeArrowDown} />
          <MainButton title="Send" href="/send" Icon={LargeArrowUp} />
        </View>
      </View>
    </>
  );
}

function MainButton({
  title,
  href,
  Icon,
}: {
  title: string;
  href: string;
  Icon: (props: SvgProps) => React.JSX.Element;
}): JSX.Element {
  const [pressed, setPressed] = React.useState(false);
  const { primary, secondary, shadow } = useThemeColor(
    "primary",
    "secondary",
    "shadow",
  );

  return (
    <>
      <Link href={href} className="flex flex-1" asChild>
        <Pressable
          className="bg-background flex-1 aspect-square rounded-3xl flex"
          style={{
            ...(pressed && { transform: "scale(0.98)" }),
            ...Platform.select({
              // make sure bg color is applied to avoid RCTView errors
              ios: {
                shadowColor: shadow,
                shadowOpacity: 0.4,
                shadowOffset: {
                  width: 1.5,
                  height: 1.5,
                },
                shadowRadius: 2,
              },
              android: {
                shadowColor: shadow,
                elevation: 3,
              },
            }),
          }}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
        >
          <LinearGradient
            className="flex-1 p-6 border justify-center items-center border-secondary rounded-3xl bg-primary"
            colors={[secondary, primary]}
            start={[0, 0]}
            end={[1, 1]}
          >
            <View className="flex flex-col justify-center items-center gap-4">
              <Icon />
              <Text className="font-bold2 text-2xl sm:text-3xl text-primary-foreground">
                {title}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Link>
    </>
  );
}
