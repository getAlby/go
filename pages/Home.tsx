import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LinearGradient } from "expo-linear-gradient";
import {
  Link,
  router,
  Stack,
  useFocusEffect,
  useRootNavigationState,
} from "expo-router";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import React, { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { SvgProps } from "react-native-svg";
import { ChevronUp, Settings2 } from "~/components/Icons";
import LargeArrowDown from "~/components/icons/LargeArrowDown";
import LargeArrowUp from "~/components/icons/LargeArrowUp";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { SHADOWS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { WalletConnection } from "~/pages/settings/wallets/WalletConnection";

dayjs.extend(relativeTime);

enum BalanceState {
  SATS = 1,
  FIAT = 2,
  HIDDEN = 3,
}

export function Home() {
  const selectedWalletId = useAppStore((store) => store.selectedWalletId);
  const nwcClient = useAppStore((store) => store.nwcClient);
  const { data: balance, mutate: reloadBalance } = useBalance();
  const getFiatAmount = useGetFiatAmount();
  const [balanceState, setBalanceState] = useState<BalanceState>(
    BalanceState.SATS
  );
  const [pressed, setPressed] = React.useState(false);
  const rootNavigationState = useRootNavigationState();

  useFocusEffect(() => {
    reloadBalance();
  });

  let hasNavigationState = !!rootNavigationState?.key;
  const hasNwcClient = !!nwcClient;
  React.useEffect(() => {
    if (hasNavigationState && !hasNwcClient) {
      router.replace(`/settings/wallets/${selectedWalletId}/wallet-connection`);
    }
  }, [hasNwcClient, hasNavigationState]);
  if (!nwcClient) {
    return <WalletConnection />;
  }

  function switchBalanceState(): void {
    if (balanceState == BalanceState.SATS) {
      setBalanceState(BalanceState.FIAT);
    } else if (balanceState == BalanceState.FIAT) {
      setBalanceState(BalanceState.HIDDEN);
    } else {
      setBalanceState(BalanceState.SATS);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Home",
          headerTitle: () => (
            <Image
              className="w-12 h-12"
              source={require("../assets/adaptive-icon.png")}
            />
          ),
          headerRight: () => (
            <Link href="/settings" asChild className="absolute -right-4">
              <Button variant="link">
                <Settings2 className="text-foreground" />
              </Button>
            </Link>
          ),
        }}
      />
      <View className="h-full flex">
        <View className="grow flex flex-col items-center justify-center gap-4">
          <Pressable
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={{
              ...(pressed
                ? {
                    transform: "scale(0.98)",
                  }
                : []),
            }}
            onPress={switchBalanceState}
            className="w-full flex flex-col items-center justify-center gap-4"
          >
            <View className="w-full flex flex-row justify-center items-center gap-2">
              {balance ? (
                <>
                  <Text className="text-foreground text-5xl font-bold2">
                    {balanceState == BalanceState.SATS &&
                      new Intl.NumberFormat().format(
                        Math.floor(balance.balance / 1000)
                      )}
                    {balanceState == BalanceState.FIAT &&
                      getFiatAmount &&
                      getFiatAmount(Math.floor(balance.balance / 1000))}
                    {balanceState == BalanceState.HIDDEN && "****"}
                  </Text>
                  <Text className="text-muted-foreground text-3xl font-bold2">
                    {balanceState == BalanceState.SATS && "sats"}
                  </Text>
                </>
              ) : (
                <Skeleton className="w-48 h-12" />
              )}
            </View>
            <View className="flex justify-center items-center">
              {balance ? (
                <Text className="text-center text-3xl text-muted-foreground font-semibold2">
                  {balanceState == BalanceState.SATS &&
                    getFiatAmount &&
                    getFiatAmount(Math.floor(balance.balance / 1000))}
                  {balanceState == BalanceState.FIAT &&
                    new Intl.NumberFormat().format(
                      Math.floor(balance.balance / 1000)
                    ) + " sats"}
                </Text>
              ) : (
                <Skeleton className="w-32 h-10" />
              )}
            </View>
          </Pressable>
        </View>
        <View className="flex items-center justify-center my-5">
          <Link href="/transactions" asChild>
            <Button variant="ghost" className="p-10 rounded-full aspect-square">
              <ChevronUp className="text-foreground" size={32} />
            </Button>
          </Link>
        </View>
        <View>
          <View className="flex flex-row gap-6 p-6 pt-2">
            <MainButton title="Receive" href="/receive" Icon={LargeArrowDown} />
            <MainButton title="Send" href="/send" Icon={LargeArrowUp} />
          </View>
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
          className="flex-1 aspect-square rounded-2xl flex"
          style={SHADOWS.large}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
        >
          <LinearGradient
            className={cn("flex-1 rounded-2xl items-center justify-center")}
            colors={["#FFE951", "#FFC453"]}
            start={[0, 0]}
            end={[1, 1]}
            style={
              pressed && {
                transform: "scale(0.98)",
              }
            }
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
