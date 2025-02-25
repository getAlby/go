import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link, router, useFocusEffect } from "expo-router";
import { useBalance } from "hooks/useBalance";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronUpIcon, SettingsIcon } from "~/components/Icons";
import { Text } from "~/components/ui/text";

import { LinearGradient } from "expo-linear-gradient";
import { SvgProps } from "react-native-svg";
import AlbyBanner from "~/components/AlbyBanner";
import LargeArrowDown from "~/components/icons/LargeArrowDown";
import LargeArrowUp from "~/components/icons/LargeArrowUp";
import Screen from "~/components/Screen";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { DEFAULT_WALLET_NAME } from "~/lib/constants";
import { useAppStore } from "~/lib/state/appStore";

dayjs.extend(relativeTime);

export function Home() {
  const { data: balance, mutate: reloadBalance } = useBalance();
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const getFiatAmount = useGetFiatAmount();
  const balanceDisplayMode = useAppStore((store) => store.balanceDisplayMode);
  const wallets = useAppStore((store) => store.wallets);
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);

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
        useAppStore.getState().setBalanceDisplayMode("fiat");
        break;
      case "fiat":
        useAppStore.getState().setBalanceDisplayMode("hidden");
        break;
      default:
        useAppStore.getState().setBalanceDisplayMode("sats");
        break;
    }
  }

  return (
    <>
      <Screen
        title=""
        right={() => (
          <TouchableOpacity
            onPressIn={() => {
              router.push("/settings");
            }}
            className="-mr-4 px-6"
          >
            <SettingsIcon
              className="text-muted-foreground"
              width={24}
              height={24}
            />
          </TouchableOpacity>
        )}
      />
      <View className="h-full flex p-6">
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshingBalance}
              onRefresh={refreshBalance}
              progressViewOffset={128}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-1"
        >
          <View className="grow flex flex-col items-center justify-center gap-4">
            <TouchableOpacity
              onPress={switchBalanceState}
              className="w-full flex flex-col items-center justify-center gap-4"
            >
              {wallets.length > 1 && (
                <TouchableOpacity
                  className="w-full"
                  onPress={() => {
                    router.push("/settings/wallets");
                  }}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-center text-muted-foreground font-medium2 text-xl px-4 mb-2"
                  >
                    {wallets[selectedWalletId].name || DEFAULT_WALLET_NAME}
                  </Text>
                </TouchableOpacity>
              )}
              <View className="w-full flex flex-row justify-center items-center gap-2">
                {balance && !refreshingBalance ? (
                  <>
                    <Text className="text-foreground text-5xl font-bold2">
                      {balanceDisplayMode === "sats" &&
                        new Intl.NumberFormat().format(
                          Math.floor(balance.balance / 1000),
                        )}
                      {balanceDisplayMode === "fiat" &&
                        getFiatAmount &&
                        getFiatAmount(Math.floor(balance.balance / 1000))}
                      {balanceDisplayMode === "hidden" && "****"}
                    </Text>
                    {balanceDisplayMode === "sats" && (
                      <Text className="text-muted-foreground text-3xl font-semibold2">
                        sats
                      </Text>
                    )}
                  </>
                ) : (
                  <Skeleton className="w-48 h-[48px]" />
                )}
              </View>
              <View className="flex justify-center items-center">
                {balance && !refreshingBalance ? (
                  <Text className="text-center text-3xl text-muted-foreground font-semibold2">
                    {balanceDisplayMode === "sats" &&
                      getFiatAmount &&
                      getFiatAmount(Math.floor(balance.balance / 1000))}
                    {balanceDisplayMode === "fiat" &&
                      new Intl.NumberFormat().format(
                        Math.floor(balance.balance / 1000),
                      ) + " sats"}
                  </Text>
                ) : (
                  <Skeleton className="w-32 h-[30px]" />
                )}
              </View>
            </TouchableOpacity>
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
        <View className="flex flex-row gap-6 mt-10">
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
  return (
    <>
      <Link href={href} className="flex flex-1" asChild>
        <Pressable
          className="flex-1 aspect-square rounded-xl flex"
          style={{
            ...shadows.large,
            ...(pressed
              ? {
                  transform: "scale(0.98)",
                }
              : {}),
          }}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
        >
          <LinearGradient
            className="flex-1 p-6"
            colors={["#FFE951", "#FFC453"]}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              flex: 1,
              padding: 6,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View className="flex flex-col justify-center items-center gap-4">
              <Icon />
              <Text className="font-bold2 text-3xl text-primary-foreground">
                {title}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Link>
    </>
  );
}

const shadows = StyleSheet.create({
  large: {
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOpacity: 0.15,
        shadowOffset: {
          width: 5,
          height: 5,
        },
        shadowRadius: 4,
        borderRadius: 24,
        backgroundColor: "white",
      },
      android: {
        borderRadius: 24,
        elevation: 2,
      },
    }),
  },
});
