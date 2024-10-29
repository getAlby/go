import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link, useFocusEffect } from "expo-router";
import { useBalance } from "hooks/useBalance";
import React, { useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { ChevronUp, Settings2 } from "~/components/Icons";
import { Text } from "~/components/ui/text";

import { LinearGradient } from "expo-linear-gradient";
import { SvgProps } from "react-native-svg";
import AlbyBanner from "~/components/AlbyBanner";
import LargeArrowDown from "~/components/icons/LargeArrowDown";
import LargeArrowUp from "~/components/icons/LargeArrowUp";
import Screen from "~/components/Screen";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";

dayjs.extend(relativeTime);

enum BalanceState {
  SATS = 1,
  FIAT = 2,
  HIDDEN = 3,
}

export function Home() {
  const { data: balance, mutate: reloadBalance } = useBalance();
  const getFiatAmount = useGetFiatAmount();
  const [balanceState, setBalanceState] = useState<BalanceState>(
    BalanceState.SATS,
  );

  useFocusEffect(() => {
    reloadBalance();
  });

  function switchBalanceState(): void {
    if (balanceState === BalanceState.SATS) {
      setBalanceState(BalanceState.FIAT);
    } else if (balanceState === BalanceState.FIAT) {
      setBalanceState(BalanceState.HIDDEN);
    } else {
      setBalanceState(BalanceState.SATS);
    }
  }

  return (
    <>
      <Screen
        title=""
        right={() => (
          <Link href="/settings" asChild>
            <TouchableOpacity>
              <Settings2 className="text-foreground" />
            </TouchableOpacity>
          </Link>
        )}
      />
      <View className="h-full flex p-6">
        <View className="grow flex flex-col items-center justify-center gap-4">
          <TouchableOpacity
            onPress={switchBalanceState}
            className="w-full flex flex-col items-center justify-center gap-4"
          >
            <View className="w-full flex flex-row justify-center items-center gap-2">
              {balance ? (
                <>
                  <Text className="text-foreground text-5xl font-bold2">
                    {balanceState === BalanceState.SATS &&
                      new Intl.NumberFormat().format(
                        Math.floor(balance.balance / 1000),
                      )}
                    {balanceState === BalanceState.FIAT &&
                      getFiatAmount &&
                      getFiatAmount(Math.floor(balance.balance / 1000))}
                    {balanceState === BalanceState.HIDDEN && "****"}
                  </Text>
                  <Text className="text-muted-foreground text-3xl font-semibold2">
                    {balanceState === BalanceState.SATS && "sats"}
                  </Text>
                </>
              ) : (
                <Skeleton className="w-48 h-12" />
              )}
            </View>
            <View className="flex justify-center items-center">
              {balance ? (
                <Text className="text-center text-3xl text-muted-foreground font-semibold2">
                  {balanceState === BalanceState.SATS &&
                    getFiatAmount &&
                    getFiatAmount(Math.floor(balance.balance / 1000))}
                  {balanceState === BalanceState.FIAT &&
                    new Intl.NumberFormat().format(
                      Math.floor(balance.balance / 1000),
                    ) + " sats"}
                </Text>
              ) : (
                <Skeleton className="w-32 h-10" />
              )}
            </View>
          </TouchableOpacity>
          {new Date().getDate() === 21 && <AlbyBanner />}
        </View>
        <View className="flex items-center justify-center">
          <Link href="/transactions" asChild>
            <Button
              variant="secondary"
              className="p-10 rounded-full aspect-square"
            >
              <ChevronUp className="text-muted-foreground" size={32} />
            </Button>
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
          style={shadows.large}
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
              elevation: 2,
              justifyContent: "center",
              alignItems: "center",
              ...(pressed
                ? {
                    transform: "scale(0.98)",
                  }
                : {}),
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

// NOTE: only applies on iOS
const shadows = StyleSheet.create({
  large: {
    // TODO: check dark mode
    shadowColor: "black",
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowRadius: 4,
  },
});
