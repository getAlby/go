import {
  View,
  Image,
  Pressable,
} from "react-native";
import React from "react";
import { useBalance } from "hooks/useBalance";
import { useAppStore } from "lib/state/appStore";
import { WalletConnection } from "~/pages/settings/wallets/WalletConnection";
import { useTransactions } from "hooks/useTransactions";
import { Link, Stack, useFocusEffect } from "expo-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Text } from "~/components/ui/text";
import { Settings2, MoveDown, MoveUp, ChevronDown } from "~/components/Icons";

import { Skeleton } from "~/components/ui/skeleton";
import { Nip47Transaction } from "@getalby/sdk/dist/NWCClient";
import { useGetFiatAmount } from "~/hooks/useGetFiatAmount";
import { LucideIcon } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

dayjs.extend(relativeTime);

export function Home() {
  const nwcClient = useAppStore((store) => store.nwcClient);
  const { data: balance, mutate: reloadBalance } = useBalance();
  const getFiatAmount = useGetFiatAmount();

  if (!nwcClient) {
    return <WalletConnection />;
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
            <Link href="/settings">
              <View className="flex justify-center items-center">
                <Settings2 className="text-primary" />
              </View>
            </Link>
          ),
        }}
      />
      <View className="h-full flex">
        <View className="grow flex flex-col items-center justify-center">
          <View className="w-full pt-12 flex flex-row justify-center items-center gap-2">
            {balance ? (
              <>
                <Text className="text-gray-600 text-5xl font-bold">
                  {new Intl.NumberFormat().format(Math.floor(balance.balance / 1000))}
                </Text>
                <Text className="text-gray-400 text-5xl font-bold">
                  sats
                </Text>
              </>
            ) : (
              <Skeleton className="w-48 h-12" />
            )}
          </View>
          <View className="w-full pt-2 pb-8 flex justify-center items-center">
            {getFiatAmount && balance ? (
              <Text className="text-center text-3xl text-muted-foreground font-bold text-gray-400">
                {getFiatAmount(Math.floor(balance.balance / 1000))}
              </Text>
            ) : (
              <Skeleton className="w-32 h-10" />
            )}
          </View>
        </View>
        <View className="flex items-center justify-center">
          <Link href="/transactions" asChild>
            <ChevronDown className="text-gray-400" />
          </Link>
        </View>
        <View>
          <View className="flex flex-row gap-6 p-6">
            <MainButton title="Receive" href="/receive" Icon={MoveDown} />
            <MainButton title="Send" href="/send" Icon={MoveUp} />
          </View>
        </View>
      </View>
    </>
  );
}

function MainButton({ title, href, Icon }: { title: string, href: string, Icon: LucideIcon, }): JSX.Element {
  return (
    <>
      <Link href={href} className="flex-1" asChild>
        <Pressable className="flex-1 aspect-square rounded-xl flex items-center justify-center">
          <LinearGradient
            className="flex-1 w-full p-6 "
            colors={['#FFC453', '#FFE951']}
            start={[0, 1]}
            end={[1, 0]}
            style={{ flex: 1, padding: 6, borderRadius: 15, elevation: 2, justifyContent: 'center', alignItems: 'center' }}
          >
            <View className="flex flex-col justify-center items-center gap-4">
              <Icon className="text-gray-600 w-24 h-24" />
              <Text className="font-bold text-3xl text-gray-600">{title}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </Link>
    </>);
}

